import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from ...core.logging import get_logger, generate_request_id
from ...monitoring.logger import log_api_request, log_api_response, log_security_event

logger = get_logger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for automatic API request/response logging."""

    def __init__(
        self,
        app,
        skip_paths: list[str] = None,
        log_request_body: bool = False,
        log_response_body: bool = False,
    ):
        super().__init__(app)
        self.skip_paths = skip_paths or ["/health", "/metrics", "/docs", "/redoc", "/openapi.json"]
        self.log_request_body = log_request_body
        self.log_response_body = log_response_body

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process the request and response with logging."""
        start_time = time.time()

        # Generate request ID for correlation
        request_id = generate_request_id()

        # Add request ID to request state for use in other parts of the app
        request.state.request_id = request_id

        # Skip logging for certain paths
        if request.url.path in self.skip_paths:
            response = await call_next(request)
            return response

        # Extract user information if available (from auth)
        user_id = getattr(request.state, "user_id", None)

        # Log request
        await self._log_request(request, request_id, user_id)

        # Check for suspicious activity
        self._check_security_events(request, request_id, user_id)

        try:
            # Process the request
            response = await call_next(request)

            # Calculate duration
            duration = time.time() - start_time

            # Log response
            self._log_response(request, response, duration, request_id, user_id)

            # Add request ID to response headers for client debugging
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            # Log error
            duration = time.time() - start_time
            logger.error(
                f"Request {request_id} failed with exception: {str(e)}",
                extra={
                    "extra": {
                        "request_id": request_id,
                        "user_id": user_id,
                        "method": request.method,
                        "path": request.url.path,
                        "duration_ms": round(duration * 1000, 2),
                        "exception_type": type(e).__name__,
                        "exception_message": str(e),
                    }
                }
            )
            raise

    async def _log_request(
        self,
        request: Request,
        request_id: str,
        user_id: str = None
    ) -> None:
        """Log incoming request details."""
        context = {}

        # Add request body if enabled and not too large
        if self.log_request_body and request.method in ["POST", "PUT", "PATCH"]:
            try:
                # Read body (this might not work in all cases due to FastAPI's body handling)
                body = await request.body()
                if len(body) < 10000:  # Only log small bodies
                    context["request_body_size"] = len(body)
                else:
                    context["request_body_size"] = len(body)
                    context["body_truncated"] = True
            except Exception:
                context["body_read_error"] = True

        log_api_request(request, request_id, user_id, **context)

    def _log_response(
        self,
        request: Request,
        response: Response,
        duration: float,
        request_id: str,
        user_id: str = None,
    ) -> None:
        """Log outgoing response details."""
        context = {}

        # Add response body size if available
        content_length = response.headers.get("content-length")
        if content_length:
            context["response_body_size"] = int(content_length)

        # Add cache headers if present
        if "cache-control" in response.headers:
            context["cache_control"] = response.headers["cache-control"]

        log_api_response(request, response, duration, request_id, user_id, **context)

    def _check_security_events(
        self,
        request: Request,
        request_id: str,
        user_id: str = None
    ) -> None:
        """Check for and log security-related events."""
        client_ip = request.client.host if request.client else "unknown"

        # Check for common attack patterns in URL
        suspicious_patterns = [
            "../", "..\\", "script>", "javascript:", "eval(", "expression(",
            "union select", "drop table", "insert into", "update set"
        ]

        url_str = str(request.url).lower()
        for pattern in suspicious_patterns:
            if pattern in url_str:
                log_security_event(
                    event_type="suspicious_url_pattern",
                    user_id=user_id,
                    ip_address=client_ip,
                    details={
                        "pattern": pattern,
                        "url": str(request.url),
                        "method": request.method
                    },
                    request_id=request_id
                )
                break

        # Check for missing or suspicious User-Agent
        user_agent = request.headers.get("user-agent", "").lower()
        if not user_agent:
            log_security_event(
                event_type="missing_user_agent",
                user_id=user_id,
                ip_address=client_ip,
                request_id=request_id
            )
        elif any(bot in user_agent for bot in ["bot", "crawler", "spider", "scraper"]):
            log_security_event(
                event_type="bot_detected",
                user_id=user_id,
                ip_address=client_ip,
                details={"user_agent": user_agent},
                request_id=request_id
            )

        # Check for unusual request headers
        suspicious_headers = ["x-forwarded-for", "x-real-ip", "x-originating-ip"]
        present_headers = [h for h in suspicious_headers if h in request.headers]
        if present_headers:
            log_security_event(
                event_type="proxy_headers_detected",
                user_id=user_id,
                ip_address=client_ip,
                details={"headers": present_headers},
                request_id=request_id
            )


class RequestIDMiddleware:
    """Lightweight middleware to just add request IDs without full logging."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request_id = generate_request_id()
            scope["state"] = getattr(scope, "state", {})
            scope["state"]["request_id"] = request_id

            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    headers = list(message.get("headers", []))
                    headers.append([b"x-request-id", request_id.encode()])
                    message["headers"] = headers
                await send(message)

            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)