"""
Security Rate Limiter

Implements Redis-based distributed rate limiting for user requests.
Protects expensive endpoints from abuse with tiered limits.
"""

import time
import logging
from typing import Optional, Dict, Any
from redis.asyncio import Redis
from fastapi import HTTPException, Request

logger = logging.getLogger(__name__)


class SecurityRateLimiter:
    """
    Redis-based rate limiter for API endpoints.
    
    Uses sliding window counters to enforce tiered rate limits
    based on user subscription level (Free, Pro, Enterprise).
    
    Example:
        >>> limiter = SecurityRateLimiter(redis_client)
        >>> await limiter.check_rate_limit(user_id="user123", tier="free", endpoint="extract")
    """
    
    # Tiered rate limits configuration
    TIERS = {
        "free": {
            "requests_per_minute": 10,
            "components_per_month": 50,
            "max_image_size_mb": 5
        },
        "pro": {
            "requests_per_minute": 60,
            "components_per_month": 500,
            "max_image_size_mb": 10
        },
        "enterprise": {
            "requests_per_minute": 600,
            "components_per_month": 10000,
            "max_image_size_mb": 50
        }
    }
    
    def __init__(self, redis_client: Optional[Redis] = None):
        """
        Initialize rate limiter.
        
        Args:
            redis_client: Async Redis client instance. If None, creates a new client.
        """
        if redis_client is None:
            # Default Redis connection (async)
            import os
            redis_host = os.getenv("REDIS_HOST", "localhost")
            redis_port = int(os.getenv("REDIS_PORT", "6379"))
            redis_db = int(os.getenv("REDIS_DB", "0"))
            
            self.redis = Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                decode_responses=True
            )
            logger.info(
                f"Initialized async Redis client: {redis_host}:{redis_port}/{redis_db}"
            )
        else:
            self.redis = redis_client
    
    async def check_rate_limit(
        self,
        user_id: str,
        tier: str = "free",
        endpoint: str = "default"
    ) -> Dict[str, Any]:
        """
        Check if request is within rate limit and increment counter.
        
        Uses Redis sorted sets for sliding window implementation:
        - Key: rate_limit:{user_id}:{endpoint}
        - Score: timestamp
        - Value: timestamp (for uniqueness)
        
        Args:
            user_id: User identifier (IP address if not authenticated)
            tier: Subscription tier (free, pro, enterprise)
            endpoint: Endpoint identifier (extract, generate, upload)
            
        Returns:
            Dictionary with rate limit info
            
        Raises:
            HTTPException: 429 if rate limit exceeded
        """
        # Normalize tier
        tier = tier.lower()
        if tier not in self.TIERS:
            logger.warning(f"Unknown tier '{tier}', defaulting to 'free'")
            tier = "free"
        
        # Get tier configuration
        limit = self.TIERS[tier]["requests_per_minute"]
        window = 60  # 1 minute window in seconds
        
        # Redis key for this user/endpoint combination
        key = f"rate_limit:{user_id}:{endpoint}"
        
        # Current timestamp
        now = time.time()
        
        # Window start time
        window_start = now - window
        
        # Use Redis pipeline for atomic operations (async)
        async with self.redis.pipeline(transaction=True) as pipe:
            # Remove old entries outside the window
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Add current request
            pipe.zadd(key, {now: now})
            
            # Count requests in current window
            pipe.zcard(key)
            
            # Get oldest entry for retry-after calculation (fix race condition)
            pipe.zrange(key, 0, 0, withscores=True)
            
            # Set expiry on the key (cleanup)
            pipe.expire(key, window)
            
            # Execute pipeline
            results = await pipe.execute()
        
        # Get request count (3rd result from pipeline)
        request_count = results[2]
        
        # Get oldest entry (4th result from pipeline)
        oldest_entries = results[3]
        
        # Check if limit exceeded
        if request_count > limit:
            # Calculate retry-after time using oldest entry from pipeline
            if oldest_entries:
                oldest_time = oldest_entries[0][1]
                retry_after = int(oldest_time + window - now)
            else:
                retry_after = 60
            
            logger.warning(
                f"Rate limit exceeded for user {user_id} on {endpoint}: "
                f"{request_count}/{limit} requests/min (tier: {tier})",
                extra={
                    "event": "rate_limit_exceeded",
                    "user_id": user_id,
                    "tier": tier,
                    "endpoint": endpoint,
                    "count": request_count,
                    "limit": limit
                }
            )
            
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded: {request_count}/{limit} requests/min. Try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )
        
        # Calculate remaining requests
        remaining = limit - request_count
        
        logger.debug(
            f"Rate limit check passed for {user_id} on {endpoint}: "
            f"{request_count}/{limit} requests/min (tier: {tier})",
            extra={
                "event": "rate_limit_check",
                "user_id": user_id,
                "tier": tier,
                "endpoint": endpoint,
                "count": request_count,
                "limit": limit,
                "remaining": remaining
            }
        )
        
        return {
            "allowed": True,
            "tier": tier,
            "limit": limit,
            "remaining": remaining,
            "used": request_count,
            "window_seconds": window,
            "reset_at": int(now + window)
        }
    
    def get_user_tier(self, request: Request) -> str:
        """
        Extract user tier from request.
        
        In production, this should read from:
        - JWT token claims
        - Database user record
        - Auth service
        
        For MVP, defaults to 'free' tier.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Tier string (free, pro, enterprise)
        """
        # TODO: Implement actual tier extraction from auth
        # For now, check headers for testing purposes
        tier = request.headers.get("X-User-Tier", "free")
        
        # Could also check state from auth middleware
        if hasattr(request.state, "user"):
            user = request.state.user
            if hasattr(user, "tier"):
                tier = user.tier
        
        return tier.lower()
    
    def get_user_id(self, request: Request) -> str:
        """
        Extract user identifier from request.
        
        In production, this should be:
        - Authenticated user ID from JWT
        - Session ID
        - Fallback to IP address for anonymous users
        
        Args:
            request: FastAPI request object
            
        Returns:
            User identifier string
        """
        # Try to get authenticated user ID
        if hasattr(request.state, "user"):
            user = request.state.user
            if hasattr(user, "id"):
                return f"user:{user.id}"
        
        # Fallback to IP address for anonymous users
        # Get real IP from X-Forwarded-For if behind proxy
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        return f"ip:{client_ip}"


# Global rate limiter instance
_rate_limiter: Optional[SecurityRateLimiter] = None


def get_security_rate_limiter(redis_client: Optional[Redis] = None) -> SecurityRateLimiter:
    """
    Get global security rate limiter instance.
    
    Args:
        redis_client: Optional Redis client to use
        
    Returns:
        Singleton SecurityRateLimiter instance
    """
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = SecurityRateLimiter(redis_client)
    return _rate_limiter
