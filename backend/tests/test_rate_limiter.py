"""
Tests for Rate Limiter
"""

import pytest
import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from core.rate_limiter import RateLimiter, get_rate_limiter
from core.errors import RateLimitError


class TestRateLimiter:
    """Test cases for RateLimiter."""

    @pytest.mark.asyncio
    async def test_allows_requests_under_limit(self):
        """Test that requests under limit are allowed."""
        limiter = RateLimiter()
        limiter.LIMITS["test"] = 5
        limiter.WINDOWS["test"] = 60

        # Make 5 requests (all should succeed)
        for _ in range(5):
            async with limiter.acquire("test"):
                pass

    @pytest.mark.asyncio
    async def test_blocks_requests_over_limit(self):
        """Test that requests over limit are blocked."""
        limiter = RateLimiter()
        limiter.LIMITS["test"] = 3
        limiter.WINDOWS["test"] = 60

        # Make 3 requests (should succeed)
        for _ in range(3):
            async with limiter.acquire("test"):
                pass

        # 4th request should fail
        with pytest.raises(RateLimitError):
            async with limiter.acquire("test"):
                pass

    @pytest.mark.asyncio
    async def test_window_expiry(self):
        """Test that rate limit window expires."""
        limiter = RateLimiter()
        limiter.LIMITS["test"] = 2
        limiter.WINDOWS["test"] = 0.1  # 100ms window

        # Make 2 requests
        for _ in range(2):
            async with limiter.acquire("test"):
                pass

        # 3rd request should fail immediately
        with pytest.raises(RateLimitError):
            async with limiter.acquire("test"):
                pass

        # Wait for window to expire
        await asyncio.sleep(0.15)

        # Now should be able to make more requests
        async with limiter.acquire("test"):
            pass

    @pytest.mark.asyncio
    async def test_different_services_separate_limits(self):
        """Test that different services have separate limits."""
        limiter = RateLimiter()
        limiter.LIMITS["service1"] = 2
        limiter.LIMITS["service2"] = 2
        limiter.WINDOWS["service1"] = 60
        limiter.WINDOWS["service2"] = 60

        # Use up service1 limit
        for _ in range(2):
            async with limiter.acquire("service1"):
                pass

        # service1 should be blocked
        with pytest.raises(RateLimitError):
            async with limiter.acquire("service1"):
                pass

        # But service2 should still work
        async with limiter.acquire("service2"):
            pass

    @pytest.mark.asyncio
    async def test_get_current_usage(self):
        """Test getting current usage statistics."""
        limiter = RateLimiter()
        limiter.LIMITS["test"] = 10
        limiter.WINDOWS["test"] = 60

        # Make some requests
        for _ in range(3):
            async with limiter.acquire("test"):
                pass

        usage = await limiter.get_current_usage("test")

        assert usage["service"] == "test"
        assert usage["used"] == 3
        assert usage["limit"] == 10
        assert usage["available"] == 7
        assert usage["percentage_used"] == 30.0

    @pytest.mark.asyncio
    async def test_get_current_usage_empty(self):
        """Test getting usage for service with no requests."""
        limiter = RateLimiter()
        limiter.LIMITS["test"] = 100
        limiter.WINDOWS["test"] = 60

        usage = await limiter.get_current_usage("test")

        assert usage["used"] == 0
        assert usage["available"] == 100
        assert usage["percentage_used"] == 0.0

    @pytest.mark.asyncio
    async def test_figma_service_limits(self):
        """Test Figma service has correct limits."""
        limiter = RateLimiter()

        assert limiter.LIMITS["figma"] == 1000
        assert limiter.WINDOWS["figma"] == 3600  # 1 hour

    @pytest.mark.asyncio
    async def test_openai_service_limits(self):
        """Test OpenAI service has correct limits."""
        limiter = RateLimiter()

        assert limiter.LIMITS["openai"] == 10000
        assert limiter.WINDOWS["openai"] == 60  # 1 minute

    @pytest.mark.asyncio
    async def test_concurrent_requests(self):
        """Test rate limiter handles concurrent requests correctly."""
        limiter = RateLimiter()
        limiter.LIMITS["test"] = 5
        limiter.WINDOWS["test"] = 60

        success_count = 0
        error_count = 0

        async def make_request():
            nonlocal success_count, error_count
            try:
                async with limiter.acquire("test"):
                    success_count += 1
            except RateLimitError:
                error_count += 1

        # Try to make 10 concurrent requests
        await asyncio.gather(*[make_request() for _ in range(10)])

        # Should have 5 successes and 5 failures
        assert success_count == 5
        assert error_count == 5

    def test_get_rate_limiter_singleton(self):
        """Test that get_rate_limiter returns singleton instance."""
        limiter1 = get_rate_limiter()
        limiter2 = get_rate_limiter()

        assert limiter1 is limiter2

    @pytest.mark.asyncio
    async def test_rate_limit_error_message(self):
        """Test rate limit error message is informative."""
        limiter = RateLimiter()
        limiter.LIMITS["test"] = 1
        limiter.WINDOWS["test"] = 60

        # Use up limit
        async with limiter.acquire("test"):
            pass

        # Try again
        try:
            async with limiter.acquire("test"):
                pass
        except RateLimitError as e:
            error_msg = str(e)
            assert "test" in error_msg
            assert "rate limit exceeded" in error_msg.lower()
            assert "seconds" in error_msg.lower()
