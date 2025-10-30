"""
Rate Limiter

Handles API rate limiting for external services (Figma, OpenAI).
"""

import asyncio
import time
from typing import Dict, Optional
import logging

from .errors import RateLimitError

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Token bucket rate limiter for API calls.
    
    Tracks request counts and enforces rate limits for different services.
    
    Example:
        >>> limiter = RateLimiter()
        >>> async with limiter.acquire("figma"):
        ...     # Make Figma API call
        ...     pass
    """
    
    # Rate limits for different services (requests per hour)
    LIMITS = {
        "figma": 1000,      # 1,000 requests/hour
        "openai": 10000,    # 10,000 requests/minute (Tier 2)
        "default": 100,     # Default conservative limit
    }
    
    # Time windows in seconds
    WINDOWS = {
        "figma": 3600,      # 1 hour
        "openai": 60,       # 1 minute
        "default": 60,      # 1 minute
    }
    
    def __init__(self):
        """Initialize rate limiter."""
        # Track requests: {service: [(timestamp, count), ...]}
        self._requests: Dict[str, list] = {}
        self._locks: Dict[str, asyncio.Lock] = {}

    def _get_lock(self, service: str) -> asyncio.Lock:
        """Get or create lock for service."""
        if service not in self._locks:
            self._locks[service] = asyncio.Lock()
        return self._locks[service]

    def acquire(self, service: str) -> "RateLimiterContext":
        """
        Acquire permission to make an API call.
        
        Args:
            service: Service name (figma, openai, etc.)
            
        Returns:
            Context manager for the API call
            
        Raises:
            RateLimitError: If rate limit would be exceeded
        """
        return RateLimiterContext(self, service)

    async def check_and_increment(self, service: str):
        """
        Check if request is allowed and increment counter.
        
        Args:
            service: Service name
            
        Raises:
            RateLimitError: If rate limit exceeded
        """
        async with self._get_lock(service):
            current_time = time.time()
            limit = self.LIMITS.get(service, self.LIMITS["default"])
            window = self.WINDOWS.get(service, self.WINDOWS["default"])
            
            # Initialize if needed
            if service not in self._requests:
                self._requests[service] = []
            
            # Remove old requests outside the window
            cutoff_time = current_time - window
            self._requests[service] = [
                (ts, count) for ts, count in self._requests[service]
                if ts > cutoff_time
            ]
            
            # Count requests in current window
            total_requests = sum(count for _, count in self._requests[service])
            
            # Check if we would exceed limit
            if total_requests >= limit:
                wait_time = self._calculate_wait_time(service, current_time)
                logger.warning(
                    f"Rate limit reached for {service}: "
                    f"{total_requests}/{limit} requests in {window}s window. "
                    f"Wait {wait_time:.1f}s"
                )
                
                # Option 1: Raise error (fail fast)
                raise RateLimitError(
                    f"{service} rate limit exceeded. "
                    f"Try again in {int(wait_time)} seconds."
                )
                
                # Option 2: Wait automatically (uncomment to enable)
                # logger.info(f"Auto-waiting {wait_time:.1f}s for rate limit...")
                # await asyncio.sleep(wait_time)
                # return await self.check_and_increment(service)
            
            # Add this request
            self._requests[service].append((current_time, 1))
            
            logger.debug(
                f"Rate limit check passed for {service}: "
                f"{total_requests + 1}/{limit} requests"
            )

    def _calculate_wait_time(self, service: str, current_time: float) -> float:
        """
        Calculate how long to wait before next request is allowed.
        
        Args:
            service: Service name
            current_time: Current timestamp
            
        Returns:
            Wait time in seconds
        """
        if service not in self._requests or not self._requests[service]:
            return 0.0
        
        window = self.WINDOWS.get(service, self.WINDOWS["default"])
        oldest_request_time = self._requests[service][0][0]
        
        # Wait until the oldest request falls out of the window
        wait_time = oldest_request_time + window - current_time
        return max(0.0, wait_time)

    async def get_current_usage(self, service: str) -> Dict[str, any]:
        """
        Get current rate limit usage statistics.
        
        Args:
            service: Service name
            
        Returns:
            Dictionary with usage statistics
        """
        async with self._get_lock(service):
            current_time = time.time()
            limit = self.LIMITS.get(service, self.LIMITS["default"])
            window = self.WINDOWS.get(service, self.WINDOWS["default"])
            
            if service not in self._requests:
                return {
                    "service": service,
                    "used": 0,
                    "limit": limit,
                    "window_seconds": window,
                    "available": limit,
                    "percentage_used": 0.0,
                }
            
            # Remove old requests
            cutoff_time = current_time - window
            self._requests[service] = [
                (ts, count) for ts, count in self._requests[service]
                if ts > cutoff_time
            ]
            
            used = sum(count for _, count in self._requests[service])
            available = limit - used
            percentage = (used / limit * 100) if limit > 0 else 0
            
            return {
                "service": service,
                "used": used,
                "limit": limit,
                "window_seconds": window,
                "available": available,
                "percentage_used": round(percentage, 2),
            }


class RateLimiterContext:
    """Context manager for rate-limited API calls."""
    
    def __init__(self, limiter: RateLimiter, service: str):
        """
        Initialize context.
        
        Args:
            limiter: RateLimiter instance
            service: Service name
        """
        self.limiter = limiter
        self.service = service

    async def __aenter__(self):
        """Enter context - check rate limit."""
        await self.limiter.check_and_increment(self.service)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Exit context - nothing to do."""
        pass


# Global rate limiter instance
_rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter() -> RateLimiter:
    """
    Get global rate limiter instance.
    
    Returns:
        Singleton RateLimiter instance
    """
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter()
    return _rate_limiter
