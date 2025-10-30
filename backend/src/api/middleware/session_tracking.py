"""Session tracking middleware for request tracing.

This module provides middleware to generate and track session IDs for all requests,
enabling correlation of AI operations across a single user session.
"""

import uuid
from contextvars import ContextVar
from typing import Optional

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from ...core.logging import get_logger

logger = get_logger(__name__)

# Context variable to store session ID for the current request
session_id_var: ContextVar[str] = ContextVar("session_id", default="")


class SessionTrackingMiddleware(BaseHTTPMiddleware):
    """Middleware to generate and track session IDs for requests.

    This middleware:
    - Generates a unique session ID for each request
    - Stores it in a context variable for access by agents
    - Adds it to request state for access in route handlers
    - Includes it in response headers for client tracking
    """

    async def dispatch(self, request: Request, call_next):
        """Process request and add session tracking.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware/handler in chain

        Returns:
            Response with X-Session-ID header
        """
        # Generate unique session ID
        session_id = str(uuid.uuid4())

        # Store in context variable (accessible by traced functions)
        session_id_var.set(session_id)

        # Add to request state (accessible in route handlers)
        request.state.session_id = session_id

        # Log session start
        logger.debug(
            f"Session started: {session_id}",
            extra={"extra": {"session_id": session_id, "path": request.url.path}},
        )

        # Process request
        response = await call_next(request)

        # Add session ID to response headers
        response.headers["X-Session-ID"] = session_id

        return response


def get_session_id() -> Optional[str]:
    """Get current session ID from context.

    Returns:
        str: Current session ID, or empty string if not set
    """
    return session_id_var.get()
