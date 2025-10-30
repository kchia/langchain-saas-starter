"""Figma API client for design token extraction."""

import os
import re
from typing import Optional, Dict, Any
import httpx

from src.core.logging import get_logger
from src.cache.figma_cache import FigmaCache

logger = get_logger(__name__)


class FigmaClientError(Exception):
    """Base exception for Figma client errors."""

    pass


class FigmaAuthenticationError(FigmaClientError):
    """Exception raised when Figma authentication fails."""

    pass


class FigmaFileNotFoundError(FigmaClientError):
    """Exception raised when Figma file is not found."""

    pass


class FigmaRateLimitError(FigmaClientError):
    """Exception raised when Figma API rate limit is exceeded."""

    pass


class FigmaClient:
    """Client for interacting with Figma API."""

    FIGMA_API_BASE = "https://api.figma.com/v1"
    FILE_URL_PATTERN = r"figma\.com/(?:file|design)/([a-zA-Z0-9]+)"

    def __init__(self, personal_access_token: Optional[str] = None, cache: Optional[FigmaCache] = None):
        """
        Initialize Figma client.

        Args:
            personal_access_token: Figma PAT (if None, uses FIGMA_PAT from env)
            cache: Optional FigmaCache instance for caching responses
        """
        self.pat = personal_access_token or os.getenv("FIGMA_PAT")
        self.cache = cache or FigmaCache()
        self.http_client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        """Async context manager entry."""
        self.http_client = httpx.AsyncClient(
            base_url=self.FIGMA_API_BASE,
            timeout=30.0,
            headers=self._get_headers(),
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.http_client:
            await self.http_client.aclose()

    def _get_headers(self) -> Dict[str, str]:
        """
        Get HTTP headers for Figma API requests.

        Returns:
            Dictionary of headers
        """
        if not self.pat:
            logger.error("Figma PAT not configured")
            raise FigmaAuthenticationError("Figma Personal Access Token not configured")

        # Never log the PAT itself
        logger.debug("Using configured Figma PAT")
        return {
            "X-Figma-Token": self.pat,
            "Content-Type": "application/json",
        }

    async def validate_token(self) -> Dict[str, Any]:
        """
        Validate Figma PAT by calling the /v1/me endpoint.

        Returns:
            User information if token is valid

        Raises:
            FigmaAuthenticationError: If token is invalid
        """
        logger.info("Validating Figma PAT")

        if not self.http_client:
            async with self:
                return await self.validate_token()

        try:
            response = await self.http_client.get("/me")
            response.raise_for_status()
            user_data = response.json()
            logger.info(f"Figma PAT validated successfully for user: {user_data.get('email', 'unknown')}")
            return user_data
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403:
                logger.error("Figma PAT validation failed: Invalid token")
                raise FigmaAuthenticationError("Invalid Figma Personal Access Token")
            logger.error(f"Figma API error: {e.response.status_code}")
            raise FigmaClientError(f"Figma API error: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Network error validating Figma PAT: {e}")
            raise FigmaClientError(f"Network error: {e}")

    @staticmethod
    def extract_file_key(url: str) -> str:
        """
        Extract file key from Figma URL.

        Args:
            url: Figma file URL

        Returns:
            File key

        Raises:
            ValueError: If URL format is invalid
        """
        match = re.search(FigmaClient.FILE_URL_PATTERN, url)
        if not match:
            raise ValueError(
                "Invalid Figma URL format. Expected: https://figma.com/file/{file_key} or https://figma.com/design/{file_key}"
            )
        return match.group(1)

    async def get_file(self, file_key: str, use_cache: bool = True) -> Dict[str, Any]:
        """
        Get Figma file data.

        Args:
            file_key: Figma file key
            use_cache: Whether to use cache (default: True)

        Returns:
            File data from Figma API

        Raises:
            FigmaFileNotFoundError: If file not found
            FigmaRateLimitError: If rate limit exceeded
            FigmaClientError: For other API errors
        """
        # Check cache first
        if use_cache:
            cached = await self.cache.get_file(file_key, endpoint="file")
            if cached:
                logger.info(f"Cache hit for Figma file: {file_key}")
                return cached

        logger.info(f"Fetching Figma file from API: {file_key}")

        if not self.http_client:
            async with self:
                return await self.get_file(file_key, use_cache=False)

        try:
            response = await self.http_client.get(f"/files/{file_key}")
            response.raise_for_status()
            data = response.json()

            # Cache the response
            if use_cache:
                await self.cache.set_file(file_key, data, endpoint="file")

            logger.info(f"Successfully fetched Figma file: {file_key}")
            return data

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.error(f"Figma file not found: {file_key}")
                raise FigmaFileNotFoundError(f"File not found: {file_key}")
            elif e.response.status_code == 429:
                logger.error(f"Figma API rate limit exceeded for file: {file_key}")
                raise FigmaRateLimitError("Figma API rate limit exceeded")
            elif e.response.status_code == 403:
                logger.error(f"Permission denied for Figma file: {file_key}")
                raise FigmaAuthenticationError(f"Permission denied for file: {file_key}")
            logger.error(f"Figma API error: {e.response.status_code}")
            raise FigmaClientError(f"Figma API error: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Network error fetching Figma file {file_key}: {e}")
            raise FigmaClientError(f"Network error: {e}")

    async def get_file_styles(self, file_key: str, use_cache: bool = True) -> Dict[str, Any]:
        """
        Get Figma file styles (color, text, effect styles).

        Args:
            file_key: Figma file key
            use_cache: Whether to use cache (default: True)

        Returns:
            Styles data from Figma API

        Raises:
            FigmaFileNotFoundError: If file not found
            FigmaRateLimitError: If rate limit exceeded
            FigmaClientError: For other API errors
        """
        # Check cache first
        if use_cache:
            cached = await self.cache.get_file(file_key, endpoint="styles")
            if cached:
                logger.info(f"Cache hit for Figma file styles: {file_key}")
                return cached

        logger.info(f"Fetching Figma file styles from API: {file_key}")

        if not self.http_client:
            async with self:
                return await self.get_file_styles(file_key, use_cache=False)

        try:
            response = await self.http_client.get(f"/files/{file_key}/styles")
            response.raise_for_status()
            data = response.json()

            # Cache the response
            if use_cache:
                await self.cache.set_file(file_key, data, endpoint="styles")

            logger.info(f"Successfully fetched Figma file styles: {file_key}")
            return data

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.error(f"Figma file not found: {file_key}")
                raise FigmaFileNotFoundError(f"File not found: {file_key}")
            elif e.response.status_code == 429:
                logger.error(f"Figma API rate limit exceeded for file styles: {file_key}")
                raise FigmaRateLimitError("Figma API rate limit exceeded")
            elif e.response.status_code == 403:
                logger.error(f"Permission denied for Figma file styles: {file_key}")
                raise FigmaAuthenticationError(f"Permission denied for file: {file_key}")
            logger.error(f"Figma API error: {e.response.status_code}")
            raise FigmaClientError(f"Figma API error: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Network error fetching Figma file styles {file_key}: {e}")
            raise FigmaClientError(f"Network error: {e}")

    async def invalidate_cache(self, file_key: str) -> int:
        """
        Invalidate cache for a Figma file.

        Args:
            file_key: Figma file key

        Returns:
            Number of cache entries deleted
        """
        logger.info(f"Invalidating cache for Figma file: {file_key}")
        return await self.cache.invalidate_file(file_key)

    async def get_cache_metrics(self, file_key: str) -> Dict[str, Any]:
        """
        Get cache metrics for a Figma file.

        Args:
            file_key: Figma file key

        Returns:
            Cache metrics dictionary
        """
        return await self.cache.get_hit_rate(file_key)
