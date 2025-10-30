import logging
import time
from functools import wraps
from typing import Any, Callable, Dict, Optional, TypeVar, cast
from fastapi import Request, Response

from src.core.logging import get_logger, log_with_context

# Type variable for decorator return type
F = TypeVar('F', bound=Callable[..., Any])

# Application-specific loggers
api_logger = get_logger("api")
ai_logger = get_logger("ai")
db_logger = get_logger("database")
security_logger = get_logger("security")


def log_api_request(
    request: Request,
    request_id: Optional[str] = None,
    user_id: Optional[str] = None,
    **context: Any
) -> None:
    """Log API request details."""
    log_with_context(
        api_logger,
        logging.INFO,
        f"{request.method} {request.url.path}",
        request_id=request_id,
        user_id=user_id,
        method=request.method,
        path=request.url.path,
        query_params=str(request.query_params),
        client_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        **context
    )


def log_api_response(
    request: Request,
    response: Response,
    duration: float,
    request_id: Optional[str] = None,
    user_id: Optional[str] = None,
    **context: Any
) -> None:
    """Log API response details."""
    log_with_context(
        api_logger,
        logging.INFO,
        f"{request.method} {request.url.path} -> {response.status_code}",
        request_id=request_id,
        user_id=user_id,
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=round(duration * 1000, 2),
        response_size=response.headers.get("content-length"),
        **context
    )


def log_ai_operation(
    operation: str,
    model: Optional[str] = None,
    tokens_used: Optional[int] = None,
    duration: Optional[float] = None,
    request_id: Optional[str] = None,
    **context: Any
) -> None:
    """Log AI/ML operation details."""
    log_with_context(
        ai_logger,
        logging.INFO,
        f"AI operation: {operation}",
        request_id=request_id,
        operation=operation,
        model=model,
        tokens_used=tokens_used,
        duration_ms=round(duration * 1000, 2) if duration else None,
        **context
    )


def log_ai_error(
    operation: str,
    error: Exception,
    model: Optional[str] = None,
    request_id: Optional[str] = None,
    **context: Any
) -> None:
    """Log AI/ML operation errors."""
    log_with_context(
        ai_logger,
        logging.ERROR,
        f"AI operation failed: {operation} - {str(error)}",
        request_id=request_id,
        operation=operation,
        model=model,
        error_type=type(error).__name__,
        error_message=str(error),
        **context
    )


def log_database_query(
    query: str,
    duration: Optional[float] = None,
    rows_affected: Optional[int] = None,
    request_id: Optional[str] = None,
    **context: Any
) -> None:
    """Log database query execution."""
    # Sanitize query for logging (remove sensitive data)
    sanitized_query = query[:100] + "..." if len(query) > 100 else query

    log_with_context(
        db_logger,
        logging.DEBUG,
        f"Database query executed",
        request_id=request_id,
        query_preview=sanitized_query,
        duration_ms=round(duration * 1000, 2) if duration else None,
        rows_affected=rows_affected,
        **context
    )


def log_database_error(
    query: str,
    error: Exception,
    request_id: Optional[str] = None,
    **context: Any
) -> None:
    """Log database operation errors."""
    sanitized_query = query[:100] + "..." if len(query) > 100 else query

    log_with_context(
        db_logger,
        logging.ERROR,
        f"Database operation failed: {str(error)}",
        request_id=request_id,
        query_preview=sanitized_query,
        error_type=type(error).__name__,
        error_message=str(error),
        **context
    )


def log_security_event(
    event_type: str,
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None
) -> None:
    """Log security-related events."""
    log_with_context(
        security_logger,
        logging.WARNING,
        f"Security event: {event_type}",
        request_id=request_id,
        event_type=event_type,
        user_id=user_id,
        ip_address=ip_address,
        details=details or {}
    )


# Decorators for automatic logging

def log_function_call(
    logger: Optional[logging.Logger] = None,
    level: int = logging.INFO,
    include_args: bool = False,
    include_result: bool = False
) -> Callable[[F], F]:
    """Decorator to automatically log function calls."""
    def decorator(func: F) -> F:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            func_logger = logger or get_logger(func.__module__)

            log_data = {
                "function": func.__name__,
                "module": func.__module__
            }

            if include_args:
                log_data["args"] = str(args)
                log_data["kwargs"] = str(kwargs)

            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time

                log_data["duration_ms"] = round(duration * 1000, 2)
                log_data["status"] = "success"

                if include_result:
                    log_data["result"] = str(result)[:200]  # Truncate long results

                func_logger.log(level, f"Function {func.__name__} completed", extra={"extra": log_data})
                return result

            except Exception as e:
                duration = time.time() - start_time
                log_data["duration_ms"] = round(duration * 1000, 2)
                log_data["status"] = "error"
                log_data["error"] = str(e)

                func_logger.error(f"Function {func.__name__} failed", extra={"extra": log_data})
                raise

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            func_logger = logger or get_logger(func.__module__)

            log_data = {
                "function": func.__name__,
                "module": func.__module__
            }

            if include_args:
                log_data["args"] = str(args)
                log_data["kwargs"] = str(kwargs)

            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time

                log_data["duration_ms"] = round(duration * 1000, 2)
                log_data["status"] = "success"

                if include_result:
                    log_data["result"] = str(result)[:200]

                func_logger.log(level, f"Function {func.__name__} completed", extra={"extra": log_data})
                return result

            except Exception as e:
                duration = time.time() - start_time
                log_data["duration_ms"] = round(duration * 1000, 2)
                log_data["status"] = "error"
                log_data["error"] = str(e)

                func_logger.error(f"Function {func.__name__} failed", extra={"extra": log_data})
                raise

        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return cast(F, async_wrapper)
        else:
            return cast(F, sync_wrapper)

    return decorator


def log_ai_operation_decorator(
    operation_name: Optional[str] = None,
    include_tokens: bool = True
) -> Callable[[F], F]:
    """Decorator specifically for AI operations."""
    def decorator(func: F) -> F:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            op_name = operation_name or func.__name__

            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time

                # Extract tokens from result if available
                tokens = None
                if include_tokens and hasattr(result, 'usage'):
                    tokens = getattr(result.usage, 'total_tokens', None)

                log_ai_operation(
                    operation=op_name,
                    duration=duration,
                    tokens_used=tokens
                )
                return result

            except Exception as e:
                log_ai_error(operation=op_name, error=e)
                raise

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            op_name = operation_name or func.__name__

            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time

                tokens = None
                if include_tokens and hasattr(result, 'usage'):
                    tokens = getattr(result.usage, 'total_tokens', None)

                log_ai_operation(
                    operation=op_name,
                    duration=duration,
                    tokens_used=tokens
                )
                return result

            except Exception as e:
                log_ai_error(operation=op_name, error=e)
                raise

        import asyncio
        if asyncio.iscoroutinefunction(func):
            return cast(F, async_wrapper)
        else:
            return cast(F, sync_wrapper)

    return decorator