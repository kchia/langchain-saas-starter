"""Tests for Figma client functionality."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import httpx

from src.services.figma_client import (
    FigmaClient,
    FigmaAuthenticationError,
    FigmaFileNotFoundError,
    FigmaRateLimitError,
    FigmaClientError,
)
from src.cache.figma_cache import FigmaCache


class TestFigmaClientURLParsing:
    """Tests for Figma URL parsing."""

    def test_extract_file_key_from_file_url(self):
        """Test extracting file key from figma.com/file/ URL."""
        url = "https://figma.com/file/abc123xyz/My-Design-File"
        file_key = FigmaClient.extract_file_key(url)
        assert file_key == "abc123xyz"

    def test_extract_file_key_from_design_url(self):
        """Test extracting file key from figma.com/design/ URL."""
        url = "https://figma.com/design/xyz789abc/Design-System"
        file_key = FigmaClient.extract_file_key(url)
        assert file_key == "xyz789abc"

    def test_extract_file_key_invalid_url(self):
        """Test that invalid URL raises ValueError."""
        with pytest.raises(ValueError, match="Invalid Figma URL format"):
            FigmaClient.extract_file_key("https://example.com/not-figma")

    def test_extract_file_key_with_query_params(self):
        """Test extracting file key from URL with query parameters."""
        url = "https://figma.com/file/abc123xyz/File-Name?node-id=1:2"
        file_key = FigmaClient.extract_file_key(url)
        assert file_key == "abc123xyz"


@pytest.mark.asyncio
class TestFigmaClientAuthentication:
    """Tests for Figma authentication."""

    async def test_validate_token_success(self):
        """Test successful token validation."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "id": "123",
            "email": "test@example.com",
            "handle": "testuser",
        }
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock()
            mock_client_class.return_value = mock_client

            client = FigmaClient(personal_access_token="test-token")
            async with client:
                user_data = await client.validate_token()

            assert user_data["email"] == "test@example.com"
            mock_client.get.assert_called_once_with("/me")

    async def test_validate_token_invalid(self):
        """Test token validation with invalid token."""
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Forbidden", request=MagicMock(), response=mock_response
        )

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock()
            mock_client_class.return_value = mock_client

            client = FigmaClient(personal_access_token="invalid-token")
            with pytest.raises(FigmaAuthenticationError, match="Invalid Figma Personal Access Token"):
                async with client:
                    await client.validate_token()

    async def test_validate_token_no_pat_configured(self):
        """Test that missing PAT raises error."""
        client = FigmaClient(personal_access_token=None)
        
        with patch.dict("os.environ", {}, clear=True):
            with pytest.raises(FigmaAuthenticationError, match="not configured"):
                async with client:
                    pass


@pytest.mark.asyncio
class TestFigmaClientFileOperations:
    """Tests for Figma file operations."""

    async def test_get_file_success(self):
        """Test successful file retrieval."""
        mock_file_data = {
            "name": "Test Design",
            "document": {"id": "0:0"},
            "components": {},
        }
        mock_response = MagicMock()
        mock_response.json.return_value = mock_file_data
        mock_response.raise_for_status = MagicMock()

        # Mock cache to return None (cache miss)
        mock_cache = AsyncMock(spec=FigmaCache)
        mock_cache.get_file = AsyncMock(return_value=None)
        mock_cache.set_file = AsyncMock(return_value=True)

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock()
            mock_client_class.return_value = mock_client

            client = FigmaClient(personal_access_token="test-token", cache=mock_cache)
            async with client:
                file_data = await client.get_file("abc123")

            assert file_data["name"] == "Test Design"
            mock_client.get.assert_called_once_with("/files/abc123")
            mock_cache.set_file.assert_called_once()

    async def test_get_file_from_cache(self):
        """Test file retrieval from cache."""
        cached_data = {"name": "Cached Design", "_cached": True}

        mock_cache = AsyncMock(spec=FigmaCache)
        mock_cache.get_file = AsyncMock(return_value=cached_data)

        client = FigmaClient(personal_access_token="test-token", cache=mock_cache)
        file_data = await client.get_file("abc123", use_cache=True)

        assert file_data["name"] == "Cached Design"
        mock_cache.get_file.assert_called_once_with("abc123", endpoint="file")

    async def test_get_file_not_found(self):
        """Test file not found error."""
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Not Found", request=MagicMock(), response=mock_response
        )

        mock_cache = AsyncMock(spec=FigmaCache)
        mock_cache.get_file = AsyncMock(return_value=None)

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock()
            mock_client_class.return_value = mock_client

            client = FigmaClient(personal_access_token="test-token", cache=mock_cache)
            with pytest.raises(FigmaFileNotFoundError, match="File not found"):
                async with client:
                    await client.get_file("nonexistent")

    async def test_get_file_rate_limit(self):
        """Test rate limit error handling."""
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Too Many Requests", request=MagicMock(), response=mock_response
        )

        mock_cache = AsyncMock(spec=FigmaCache)
        mock_cache.get_file = AsyncMock(return_value=None)

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock()
            mock_client_class.return_value = mock_client

            client = FigmaClient(personal_access_token="test-token", cache=mock_cache)
            with pytest.raises(FigmaRateLimitError, match="rate limit exceeded"):
                async with client:
                    await client.get_file("abc123")

    async def test_get_file_styles_success(self):
        """Test successful styles retrieval."""
        mock_styles_data = {
            "meta": {
                "styles": [
                    {"key": "color1", "name": "Primary", "style_type": "FILL"},
                    {"key": "text1", "name": "Heading", "style_type": "TEXT"},
                ]
            }
        }
        mock_response = MagicMock()
        mock_response.json.return_value = mock_styles_data
        mock_response.raise_for_status = MagicMock()

        mock_cache = AsyncMock(spec=FigmaCache)
        mock_cache.get_file = AsyncMock(return_value=None)
        mock_cache.set_file = AsyncMock(return_value=True)

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock()
            mock_client_class.return_value = mock_client

            client = FigmaClient(personal_access_token="test-token", cache=mock_cache)
            async with client:
                styles = await client.get_file_styles("abc123")

            assert "meta" in styles
            assert len(styles["meta"]["styles"]) == 2
            mock_client.get.assert_called_once_with("/files/abc123/styles")


@pytest.mark.asyncio
class TestFigmaClientCacheOperations:
    """Tests for cache operations."""

    async def test_invalidate_cache(self):
        """Test cache invalidation."""
        mock_cache = AsyncMock(spec=FigmaCache)
        mock_cache.invalidate_file = AsyncMock(return_value=3)

        client = FigmaClient(personal_access_token="test-token", cache=mock_cache)
        deleted = await client.invalidate_cache("abc123")

        assert deleted == 3
        mock_cache.invalidate_file.assert_called_once_with("abc123")

    async def test_get_cache_metrics(self):
        """Test retrieving cache metrics."""
        mock_metrics = {
            "file_key": "abc123",
            "hits": 10,
            "misses": 2,
            "total_requests": 12,
            "hit_rate": 0.833,
            "avg_latency_ms": 95.5,
        }

        mock_cache = AsyncMock(spec=FigmaCache)
        mock_cache.get_hit_rate = AsyncMock(return_value=mock_metrics)

        client = FigmaClient(personal_access_token="test-token", cache=mock_cache)
        metrics = await client.get_cache_metrics("abc123")

        assert metrics["hit_rate"] == 0.833
        assert metrics["avg_latency_ms"] == 95.5
        mock_cache.get_hit_rate.assert_called_once_with("abc123")
