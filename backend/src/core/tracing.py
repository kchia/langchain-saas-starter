"""LangSmith tracing and observability configuration.

This module provides configuration and utilities for LangSmith tracing,
enabling observability for AI operations throughout the application.
"""

import asyncio
import os
from datetime import datetime
from functools import wraps
from typing import Any, Dict, Optional

from .logging import get_logger

logger = get_logger(__name__)


class TracingConfig:
    """LangSmith tracing configuration."""

    def __init__(self):
        """Initialize tracing configuration from environment variables."""
        self.enabled = os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true"
        self.api_key = os.getenv("LANGCHAIN_API_KEY")
        self.project = os.getenv("LANGCHAIN_PROJECT", "componentforge-dev")
        self.endpoint = os.getenv(
            "LANGCHAIN_ENDPOINT", "https://api.smith.langchain.com"
        )

    def is_configured(self) -> bool:
        """Check if tracing is properly configured.

        Returns:
            bool: True if tracing is enabled and API key is set
        """
        return self.enabled and bool(self.api_key)

    def get_config(self) -> dict:
        """Get tracing configuration as dictionary.

        Returns:
            dict: Configuration dictionary with tracing settings
        """
        return {
            "enabled": self.enabled,
            "project": self.project,
            "endpoint": self.endpoint,
            "api_key_set": bool(self.api_key),
        }


# Global tracing configuration instance
_tracing_config: Optional[TracingConfig] = None


def get_tracing_config() -> TracingConfig:
    """Get or create the global tracing configuration instance.

    Returns:
        TracingConfig: The global tracing configuration instance
    """
    global _tracing_config
    if _tracing_config is None:
        _tracing_config = TracingConfig()
    return _tracing_config


def init_tracing() -> bool:
    """Initialize LangSmith tracing.

    Returns:
        bool: True if tracing was successfully initialized, False otherwise
    """
    config = get_tracing_config()

    if not config.is_configured():
        logger.warning(
            "LangSmith tracing not configured. Set LANGCHAIN_TRACING_V2=true "
            "and LANGCHAIN_API_KEY to enable tracing."
        )
        return False

    # Set environment variables for LangChain
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_API_KEY"] = config.api_key
    os.environ["LANGCHAIN_PROJECT"] = config.project
    os.environ["LANGCHAIN_ENDPOINT"] = config.endpoint

    logger.info(
        f"LangSmith tracing initialized",
        extra={
            "extra": {
                "project": config.project,
                "endpoint": config.endpoint,
            }
        },
    )
    return True


def traced(run_name: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None):
    """Decorator to add tracing to a function with metadata support.

    This decorator wraps functions with LangSmith tracing when available,
    automatically including session context and custom metadata.

    Note: The traceable decorator is applied at runtime (not at definition time)
    to allow dynamic metadata that changes per request (e.g., session_id).
    LangSmith's traceable decorator is designed to be lightweight, so the
    overhead is minimal.

    Args:
        run_name: Optional name for the trace run
        metadata: Optional metadata dictionary to include in the trace

    Returns:
        Decorated function with tracing enabled
    """

    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            config = get_tracing_config()
            if not config.is_configured():
                # If tracing not configured, just run the function normally
                return await func(*args, **kwargs)

            # Try to use LangSmith's traceable decorator if available
            try:
                from langsmith import traceable

                # Build trace metadata
                trace_metadata = build_trace_metadata(**(metadata or {}))

                # Wrap with traceable
                traced_func = traceable(
                    name=run_name or func.__name__, metadata=trace_metadata
                )(func)

                return await traced_func(*args, **kwargs)
            except ImportError:
                logger.debug("LangSmith not available, running without trace")
                return await func(*args, **kwargs)
            except Exception as e:
                logger.warning(f"Tracing error: {e}, running without trace")
                return await func(*args, **kwargs)

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            config = get_tracing_config()
            if not config.is_configured():
                return func(*args, **kwargs)

            try:
                from langsmith import traceable

                # Build trace metadata
                trace_metadata = build_trace_metadata(**(metadata or {}))

                # Wrap with traceable
                traced_func = traceable(
                    name=run_name or func.__name__, metadata=trace_metadata
                )(func)

                return traced_func(*args, **kwargs)
            except ImportError:
                logger.debug("LangSmith not available, running without trace")
                return func(*args, **kwargs)
            except Exception as e:
                logger.warning(f"Tracing error: {e}, running without trace")
                return func(*args, **kwargs)

        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


def build_trace_metadata(
    user_id: Optional[str] = None,
    component_type: Optional[str] = None,
    **extra: Any,
) -> Dict[str, Any]:
    """Build standardized trace metadata.

    Args:
        user_id: Optional user ID
        component_type: Optional component type being processed
        **extra: Additional metadata fields

    Returns:
        Dictionary with standardized metadata including session_id and timestamp
    """
    # Import here to avoid circular dependency
    try:
        from ..api.middleware.session_tracking import get_session_id

        session_id = get_session_id()
    except Exception:
        session_id = None

    metadata = {
        "timestamp": datetime.utcnow().isoformat(),
    }

    if session_id:
        metadata["session_id"] = session_id
    if user_id:
        metadata["user_id"] = user_id
    if component_type:
        metadata["component_type"] = component_type

    metadata.update(extra)
    return metadata


def get_current_run_id() -> Optional[str]:
    """Get current LangSmith run ID from context.

    Returns:
        str: Current run ID, or None if not in a trace context or LangSmith unavailable

    Note:
        Returns None when:
        - LangSmith tracing is disabled (LANGCHAIN_TRACING_V2=false)
        - Not in a traced function call
        - LangSmith packages not installed
        This is expected behavior and should be handled gracefully by callers.
    """
    try:
        from langsmith.run_helpers import get_current_run_tree

        run_tree = get_current_run_tree()
        return str(run_tree.id) if run_tree else None
    except Exception:
        return None


def get_trace_url(run_id: str) -> Optional[str]:
    """Get the LangSmith URL for a specific trace run.

    Args:
        run_id: The run ID from LangSmith

    Returns:
        str: Full URL to view the trace in LangSmith UI, or None if unavailable

    Example:
        >>> get_trace_url("12345-abcde-67890")
        'https://smith.langchain.com/o/59e7.../projects/p/c60ad.../r/12345-abcde-67890'
    """
    if not run_id:
        return None

    # Get org and project IDs from environment variables
    org_id = os.getenv("LANGSMITH_ORG_ID")
    project_id = os.getenv("LANGSMITH_PROJECT_ID")

    if not org_id or not project_id:
        logger.warning(
            "LANGSMITH_ORG_ID or LANGSMITH_PROJECT_ID not set. "
            "Trace URL will not be available."
        )
        return None

    # Construct the full LangSmith trace URL
    # Format: https://smith.langchain.com/o/{org_id}/projects/p/{project_id}/r/{run_id}
    base_url = "https://smith.langchain.com"
    return f"{base_url}/o/{org_id}/projects/p/{project_id}/r/{run_id}"


# Initialize tracing on module import if configured
init_tracing()
