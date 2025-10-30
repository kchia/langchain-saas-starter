"""Integration tests for rate limit middleware with FastAPI."""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import Mock

from src.api.middleware.rate_limit_middleware import RateLimitMiddleware
from src.security.rate_limiter import SecurityRateLimiter
from tests.security.test_rate_limiting import MockRedis


@pytest.fixture
def app_with_rate_limiting():
    """Create a FastAPI app with rate limiting middleware."""
    app = FastAPI()
    
    # Create rate limiter with mock Redis
    mock_redis = MockRedis()
    rate_limiter = SecurityRateLimiter(redis_client=mock_redis)
    
    # Add rate limiting middleware
    app.add_middleware(RateLimitMiddleware, rate_limiter=rate_limiter)
    
    # Add test endpoints
    @app.get("/api/v1/tokens/extract/screenshot")
    async def extract():
        return {"message": "Token extraction endpoint"}
    
    @app.get("/api/v1/generation/generate")
    async def generate():
        return {"message": "Generation endpoint"}
    
    @app.get("/api/v1/other/endpoint")
    async def other():
        return {"message": "Non-rate-limited endpoint"}
    
    return app


class TestRateLimitMiddlewareIntegration:
    """Integration tests for rate limit middleware."""
    
    def test_protected_endpoint_allows_requests_under_limit(self, app_with_rate_limiting):
        """Test that protected endpoints allow requests under limit."""
        client = TestClient(app_with_rate_limiting)
        
        # Make 10 requests (free tier limit)
        for i in range(10):
            response = client.get("/api/v1/tokens/extract/screenshot")
            assert response.status_code == 200
            assert "X-RateLimit-Limit" in response.headers
            assert "X-RateLimit-Remaining" in response.headers
            assert "X-RateLimit-Reset" in response.headers
            assert int(response.headers["X-RateLimit-Remaining"]) == 10 - (i + 1)
    
    def test_protected_endpoint_blocks_requests_over_limit(self, app_with_rate_limiting):
        """Test that protected endpoints block requests over limit."""
        client = TestClient(app_with_rate_limiting)
        
        # Make 10 requests (free tier limit)
        for _ in range(10):
            response = client.get("/api/v1/tokens/extract/screenshot")
            assert response.status_code == 200
        
        # 11th request should be rate limited
        response = client.get("/api/v1/tokens/extract/screenshot")
        assert response.status_code == 429
        assert "Retry-After" in response.headers
        assert "Rate limit exceeded" in response.json()["detail"]
    
    def test_multiple_protected_endpoints_have_separate_limits(self, app_with_rate_limiting):
        """Test that different protected endpoints have separate limits."""
        client = TestClient(app_with_rate_limiting)
        
        # Use up limit on extract endpoint
        for _ in range(10):
            response = client.get("/api/v1/tokens/extract/screenshot")
            assert response.status_code == 200
        
        # extract should be blocked
        response = client.get("/api/v1/tokens/extract/screenshot")
        assert response.status_code == 429
        
        # But generate should still work
        response = client.get("/api/v1/generation/generate")
        assert response.status_code == 200
    
    def test_non_protected_endpoint_not_rate_limited(self, app_with_rate_limiting):
        """Test that non-protected endpoints are not rate limited."""
        client = TestClient(app_with_rate_limiting)
        
        # Make many requests to non-protected endpoint
        for _ in range(20):
            response = client.get("/api/v1/other/endpoint")
            assert response.status_code == 200
            # Should not have rate limit headers
            assert "X-RateLimit-Limit" not in response.headers
    
    def test_pro_tier_has_higher_limit(self, app_with_rate_limiting):
        """Test that pro tier users have higher limits."""
        client = TestClient(app_with_rate_limiting)
        
        # Make 60 requests with pro tier header
        for i in range(60):
            response = client.get(
                "/api/v1/tokens/extract/screenshot",
                headers={"X-User-Tier": "pro"}
            )
            assert response.status_code == 200
            assert int(response.headers["X-RateLimit-Limit"]) == 60
        
        # 61st request should be blocked
        response = client.get(
            "/api/v1/tokens/extract/screenshot",
            headers={"X-User-Tier": "pro"}
        )
        assert response.status_code == 429
    
    def test_enterprise_tier_has_highest_limit(self, app_with_rate_limiting):
        """Test that enterprise tier has highest limits."""
        client = TestClient(app_with_rate_limiting)
        
        # Enterprise tier allows 600 requests/min
        # Test a subset to keep test fast
        for i in range(100):
            response = client.get(
                "/api/v1/generation/generate",
                headers={"X-User-Tier": "enterprise"}
            )
            assert response.status_code == 200
            assert int(response.headers["X-RateLimit-Limit"]) == 600
    
    def test_rate_limit_response_includes_metadata(self, app_with_rate_limiting):
        """Test that successful responses include rate limit metadata."""
        client = TestClient(app_with_rate_limiting)
        
        response = client.get("/api/v1/tokens/extract/screenshot")
        
        assert response.status_code == 200
        assert "X-RateLimit-Limit" in response.headers
        assert "X-RateLimit-Remaining" in response.headers
        assert "X-RateLimit-Reset" in response.headers
        
        assert int(response.headers["X-RateLimit-Limit"]) == 10
        assert int(response.headers["X-RateLimit-Remaining"]) == 9
    
    def test_different_ips_have_separate_limits(self, app_with_rate_limiting):
        """Test that different IP addresses have independent limits."""
        client = TestClient(app_with_rate_limiting)
        
        # First IP uses up limit
        for _ in range(10):
            response = client.get(
                "/api/v1/tokens/extract/screenshot",
                headers={"X-Forwarded-For": "192.168.1.1"}
            )
            assert response.status_code == 200
        
        # First IP should be blocked
        response = client.get(
            "/api/v1/tokens/extract/screenshot",
            headers={"X-Forwarded-For": "192.168.1.1"}
        )
        assert response.status_code == 429
        
        # Different IP should still work
        response = client.get(
            "/api/v1/tokens/extract/screenshot",
            headers={"X-Forwarded-For": "192.168.1.2"}
        )
        assert response.status_code == 200
