"""
Rate Limit Middleware

FastAPI middleware to apply rate limiting to protected endpoints.
"""

import logging
from typing import Callable, Optional
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from ...security.rate_limiter import get_security_rate_limiter, SecurityRateLimiter
from ...security.metrics import record_rate_limit_hit

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware to enforce rate limits on API endpoints.
    
    Applies to expensive endpoints:
    - /api/v1/tokens/extract/* - Token extraction (expensive AI call)
    - /api/v1/generation/generate - Component generation (expensive AI call)
    
    Rate limits are tiered based on user subscription level.
    """
    
    # Endpoints to protect with rate limiting
    PROTECTED_ENDPOINTS = [
        "/api/v1/tokens/extract",
        "/api/v1/generation/generate",
    ]
    
    # Endpoint to rate limit category mapping
    ENDPOINT_CATEGORIES = {
        "/api/v1/tokens/extract": "extract",
        "/api/v1/generation/generate": "generate",
    }
    
    def __init__(
        self,
        app: ASGIApp,
        rate_limiter: Optional[SecurityRateLimiter] = None
    ):
        """
        Initialize rate limit middleware.
        
        Args:
            app: ASGI application
            rate_limiter: Optional SecurityRateLimiter instance
        """
        super().__init__(app)
        self.rate_limiter = rate_limiter or get_security_rate_limiter()
        logger.info("Rate limit middleware initialized")
    
    def _should_rate_limit(self, path: str) -> tuple[bool, str]:
        """
        Check if path should be rate limited.
        
        Args:
            path: Request path
            
        Returns:
            Tuple of (should_limit: bool, category: str)
        """
        for endpoint in self.PROTECTED_ENDPOINTS:
            if path.startswith(endpoint):
                category = self.ENDPOINT_CATEGORIES.get(endpoint, "default")
                return True, category
        
        return False, ""
    
    async def dispatch(
        self,
        request: Request,
        call_next: Callable
    ) -> Response:
        """
        Process request with rate limiting.
        
        Args:
            request: Incoming request
            call_next: Next middleware/handler in chain
            
        Returns:
            Response (may be 429 if rate limit exceeded)
        """
        # Check if this endpoint should be rate limited
        should_limit, category = self._should_rate_limit(request.url.path)
        
        if not should_limit:
            # Not a protected endpoint, pass through
            return await call_next(request)
        
        # Extract user information
        user_id = self.rate_limiter.get_user_id(request)
        tier = self.rate_limiter.get_user_tier(request)
        
        try:
            # Check rate limit
            rate_limit_info = await self.rate_limiter.check_rate_limit(
                user_id=user_id,
                tier=tier,
                endpoint=category
            )
            
            # Add rate limit info to request state for handlers
            request.state.rate_limit = rate_limit_info
            
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers to response
            response.headers["X-RateLimit-Limit"] = str(rate_limit_info["limit"])
            response.headers["X-RateLimit-Remaining"] = str(rate_limit_info["remaining"])
            response.headers["X-RateLimit-Reset"] = str(rate_limit_info["reset_at"])
            
            return response
            
        except HTTPException as e:
            # Record rate limit hit for metrics (only for actual rate limit errors)
            if e.status_code == 429:
                # Only record if this is from our rate limiter (has Retry-After header)
                if e.headers and "Retry-After" in e.headers:
                    record_rate_limit_hit(tier, category)
                    logger.info(
                        f"Rate limit hit: user={user_id}, tier={tier}, endpoint={category}",
                        extra={
                            "event": "rate_limit_hit",
                            "user_id": user_id,
                            "tier": tier,
                            "endpoint": category
                        }
                    )
            
            # Convert HTTPException to JSONResponse for proper handling
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail},
                headers=e.headers if e.headers else {}
            )


def create_rate_limit_middleware(app: ASGIApp) -> RateLimitMiddleware:
    """
    Factory function to create rate limit middleware.
    
    Args:
        app: ASGI application
        
    Returns:
        RateLimitMiddleware instance
    """
    return RateLimitMiddleware(app)
