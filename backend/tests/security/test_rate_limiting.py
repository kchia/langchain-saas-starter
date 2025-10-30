"""Tests for security rate limiting module."""

import pytest
import asyncio
import time
from unittest.mock import Mock, MagicMock, patch
from fastapi import Request, HTTPException
from redis.asyncio import Redis

from src.security.rate_limiter import (
    SecurityRateLimiter,
    get_security_rate_limiter,
)


class MockRedis:
    """Mock async Redis client for testing."""
    
    def __init__(self):
        """Initialize mock Redis with in-memory storage."""
        self.data = {}
        self.expirations = {}
    
    def pipeline(self, transaction=True):
        """Return mock pipeline."""
        return MockPipeline(self)
    
    def zrange(self, key, start, stop, withscores=False):
        """Mock zrange implementation."""
        if key not in self.data:
            return []
        
        sorted_items = sorted(self.data[key].items(), key=lambda x: x[1])
        result = sorted_items[start:stop+1] if stop >= 0 else sorted_items[start:]
        
        if withscores:
            return result
        return [item[0] for item in result]


class MockPipeline:
    """Mock async Redis pipeline for testing."""
    
    def __init__(self, redis_client):
        """Initialize mock pipeline."""
        self.redis = redis_client
        self.commands = []
    
    async def __aenter__(self):
        """Async context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        pass
    
    def zremrangebyscore(self, key, min_score, max_score):
        """Mock zremrangebyscore."""
        self.commands.append(("zremrangebyscore", key, min_score, max_score))
        return self
    
    def zadd(self, key, mapping):
        """Mock zadd."""
        self.commands.append(("zadd", key, mapping))
        return self
    
    def zcard(self, key):
        """Mock zcard."""
        self.commands.append(("zcard", key))
        return self
    
    def zrange(self, key, start, stop, withscores=False):
        """Mock zrange."""
        self.commands.append(("zrange", key, start, stop, withscores))
        return self
    
    def expire(self, key, seconds):
        """Mock expire."""
        self.commands.append(("expire", key, seconds))
        return self
    
    async def execute(self):
        """Execute pipeline commands asynchronously."""
        results = []
        
        for cmd in self.commands:
            if cmd[0] == "zremrangebyscore":
                _, key, min_score, max_score = cmd
                if key in self.redis.data:
                    self.redis.data[key] = {
                        k: v for k, v in self.redis.data[key].items()
                        if v > max_score
                    }
                results.append(None)
            
            elif cmd[0] == "zadd":
                _, key, mapping = cmd
                if key not in self.redis.data:
                    self.redis.data[key] = {}
                self.redis.data[key].update(mapping)
                results.append(len(mapping))
            
            elif cmd[0] == "zcard":
                _, key = cmd
                count = len(self.redis.data.get(key, {}))
                results.append(count)
            
            elif cmd[0] == "zrange":
                _, key, start, stop, withscores = cmd
                if key not in self.redis.data:
                    results.append([])
                else:
                    sorted_items = sorted(self.redis.data[key].items(), key=lambda x: x[1])
                    result = sorted_items[start:stop+1] if stop >= 0 else sorted_items[start:]
                    if withscores:
                        results.append(result)
                    else:
                        results.append([item[0] for item in result])
            
            elif cmd[0] == "expire":
                _, key, seconds = cmd
                self.redis.expirations[key] = time.time() + seconds
                results.append(True)
        
        return results


class TestSecurityRateLimiter:
    """Tests for SecurityRateLimiter class."""
    
    def test_init_with_redis_client(self):
        """Test initialization with provided Redis client."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        assert limiter.redis is mock_redis
    
    @patch.dict('os.environ', {
        'REDIS_HOST': 'testhost',
        'REDIS_PORT': '6380',
        'REDIS_DB': '1'
    })
    def test_init_with_env_vars(self):
        """Test initialization uses environment variables."""
        with patch('src.security.rate_limiter.Redis') as mock_redis_class:
            limiter = SecurityRateLimiter()
            
            mock_redis_class.assert_called_once_with(
                host='testhost',
                port=6380,
                db=1,
                decode_responses=True
            )
    
    @pytest.mark.asyncio
    async def test_tier_limits_configuration(self):
        """Test that tier limits are properly configured."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Check free tier
        assert limiter.TIERS["free"]["requests_per_minute"] == 10
        assert limiter.TIERS["free"]["components_per_month"] == 50
        assert limiter.TIERS["free"]["max_image_size_mb"] == 5
        
        # Check pro tier
        assert limiter.TIERS["pro"]["requests_per_minute"] == 60
        assert limiter.TIERS["pro"]["components_per_month"] == 500
        assert limiter.TIERS["pro"]["max_image_size_mb"] == 10
        
        # Check enterprise tier
        assert limiter.TIERS["enterprise"]["requests_per_minute"] == 600
        assert limiter.TIERS["enterprise"]["components_per_month"] == 10000
        assert limiter.TIERS["enterprise"]["max_image_size_mb"] == 50
    
    @pytest.mark.asyncio
    async def test_allows_requests_under_limit(self):
        """Test that requests under limit are allowed."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Free tier allows 10 requests/minute
        for i in range(10):
            result = await limiter.check_rate_limit(
                user_id="test_user",
                tier="free",
                endpoint="extract"
            )
            
            assert result["allowed"] is True
            assert result["tier"] == "free"
            assert result["limit"] == 10
            assert result["used"] == i + 1
            assert result["remaining"] == 10 - (i + 1)
    
    @pytest.mark.asyncio
    async def test_blocks_requests_over_limit(self):
        """Test that requests over limit are blocked."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Make requests up to limit (10 for free tier)
        for _ in range(10):
            await limiter.check_rate_limit(
                user_id="test_user",
                tier="free",
                endpoint="extract"
            )
        
        # 11th request should fail with 429
        with pytest.raises(HTTPException) as exc_info:
            await limiter.check_rate_limit(
                user_id="test_user",
                tier="free",
                endpoint="extract"
            )
        
        assert exc_info.value.status_code == 429
        assert "Rate limit exceeded" in exc_info.value.detail
        assert "Retry-After" in exc_info.value.headers
    
    @pytest.mark.asyncio
    async def test_different_tiers_have_different_limits(self):
        """Test that different tiers have different limits."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Free tier: 10 requests/min
        for _ in range(10):
            await limiter.check_rate_limit("user_free", "free", "extract")
        
        with pytest.raises(HTTPException):
            await limiter.check_rate_limit("user_free", "free", "extract")
        
        # Pro tier: 60 requests/min (should still work)
        for _ in range(60):
            await limiter.check_rate_limit("user_pro", "pro", "extract")
        
        with pytest.raises(HTTPException):
            await limiter.check_rate_limit("user_pro", "pro", "extract")
    
    @pytest.mark.asyncio
    async def test_different_users_have_separate_limits(self):
        """Test that different users have independent limits."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # User 1 uses up their limit
        for _ in range(10):
            await limiter.check_rate_limit("user1", "free", "extract")
        
        with pytest.raises(HTTPException):
            await limiter.check_rate_limit("user1", "free", "extract")
        
        # User 2 should still be able to make requests
        result = await limiter.check_rate_limit("user2", "free", "extract")
        assert result["allowed"] is True
    
    @pytest.mark.asyncio
    async def test_different_endpoints_have_separate_limits(self):
        """Test that different endpoints have independent limits."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Use up limit on extract endpoint
        for _ in range(10):
            await limiter.check_rate_limit("user1", "free", "extract")
        
        with pytest.raises(HTTPException):
            await limiter.check_rate_limit("user1", "free", "extract")
        
        # Generate endpoint should still work
        result = await limiter.check_rate_limit("user1", "free", "generate")
        assert result["allowed"] is True
    
    @pytest.mark.asyncio
    async def test_unknown_tier_defaults_to_free(self):
        """Test that unknown tier defaults to free tier limits."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        result = await limiter.check_rate_limit(
            user_id="test_user",
            tier="unknown_tier",
            endpoint="extract"
        )
        
        assert result["tier"] == "free"
        assert result["limit"] == 10
    
    @pytest.mark.asyncio
    async def test_retry_after_header_calculated(self):
        """Test that retry-after header is properly calculated."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Use up limit
        for _ in range(10):
            await limiter.check_rate_limit("test_user", "free", "extract")
        
        # Next request should fail with retry-after
        try:
            await limiter.check_rate_limit("test_user", "free", "extract")
            pytest.fail("Should have raised HTTPException")
        except HTTPException as e:
            assert "Retry-After" in e.headers
            retry_after = int(e.headers["Retry-After"])
            assert 0 <= retry_after <= 60
    
    @pytest.mark.asyncio
    async def test_redis_key_format(self):
        """Test that Redis keys are properly formatted."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        await limiter.check_rate_limit(
            user_id="user123",
            tier="free",
            endpoint="extract"
        )
        
        # Check that key was created in expected format
        expected_key = "rate_limit:user123:extract"
        assert expected_key in mock_redis.data
    
    def test_get_user_tier_from_header(self):
        """Test extracting user tier from request headers."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Mock request with tier header
        request = Mock(spec=Request)
        request.headers = {"X-User-Tier": "pro"}
        # Use spec to prevent automatic attribute creation
        request.state = Mock(spec=[])
        
        tier = limiter.get_user_tier(request)
        assert tier == "pro"
    
    def test_get_user_tier_from_state(self):
        """Test extracting user tier from request state."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Mock request with user in state
        request = Mock(spec=Request)
        request.headers = {}
        request.state = Mock()
        request.state.user = Mock()
        request.state.user.tier = "enterprise"
        
        tier = limiter.get_user_tier(request)
        assert tier == "enterprise"
    
    def test_get_user_tier_defaults_to_free(self):
        """Test that user tier defaults to free."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Mock request with no tier info
        request = Mock(spec=Request)
        request.headers = {}
        # Use spec to prevent automatic attribute creation
        request.state = Mock(spec=[])
        
        tier = limiter.get_user_tier(request)
        assert tier == "free"
    
    def test_get_user_id_from_state(self):
        """Test extracting user ID from request state."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Mock authenticated user
        request = Mock(spec=Request)
        request.state = Mock()
        request.state.user = Mock()
        request.state.user.id = "user123"
        request.headers = {}
        request.client = None
        
        user_id = limiter.get_user_id(request)
        assert user_id == "user:user123"
    
    def test_get_user_id_from_ip_address(self):
        """Test extracting user ID from IP address for anonymous users."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Mock anonymous user
        request = Mock(spec=Request)
        # Use spec to prevent automatic attribute creation
        request.state = Mock(spec=[])
        request.headers = {}
        request.client = Mock()
        request.client.host = "192.168.1.1"
        
        user_id = limiter.get_user_id(request)
        assert user_id == "ip:192.168.1.1"
    
    def test_get_user_id_from_forwarded_header(self):
        """Test extracting user ID from X-Forwarded-For header."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Mock request behind proxy
        request = Mock(spec=Request)
        # Use spec to prevent automatic attribute creation
        request.state = Mock(spec=[])
        request.headers = {"X-Forwarded-For": "10.0.0.1, 192.168.1.1"}
        request.client = Mock()
        request.client.host = "127.0.0.1"
        
        user_id = limiter.get_user_id(request)
        # Should use first IP from X-Forwarded-For
        assert user_id == "ip:10.0.0.1"
    
    def test_get_security_rate_limiter_singleton(self):
        """Test that get_security_rate_limiter returns singleton."""
        # Reset global instance
        import src.security.rate_limiter as module
        module._rate_limiter = None
        
        limiter1 = get_security_rate_limiter(MockRedis())
        limiter2 = get_security_rate_limiter()
        
        assert limiter1 is limiter2
        
        # Cleanup
        module._rate_limiter = None
    
    @pytest.mark.asyncio
    async def test_error_message_contains_details(self):
        """Test that rate limit error message is informative."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        # Use up limit
        for _ in range(10):
            await limiter.check_rate_limit("test_user", "free", "extract")
        
        # Check error message
        try:
            await limiter.check_rate_limit("test_user", "free", "extract")
            pytest.fail("Should have raised HTTPException")
        except HTTPException as e:
            assert "11/10" in e.detail
            assert "requests/min" in e.detail
            assert "Try again in" in e.detail
    
    @pytest.mark.asyncio
    async def test_response_includes_rate_limit_info(self):
        """Test that successful response includes rate limit metadata."""
        mock_redis = MockRedis()
        limiter = SecurityRateLimiter(redis_client=mock_redis)
        
        result = await limiter.check_rate_limit(
            user_id="test_user",
            tier="pro",
            endpoint="generate"
        )
        
        assert "allowed" in result
        assert "tier" in result
        assert "limit" in result
        assert "remaining" in result
        assert "used" in result
        assert "window_seconds" in result
        assert "reset_at" in result
        
        assert result["allowed"] is True
        assert result["tier"] == "pro"
        assert result["limit"] == 60
        assert result["used"] == 1
        assert result["remaining"] == 59
        assert result["window_seconds"] == 60
