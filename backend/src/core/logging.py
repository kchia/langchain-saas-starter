import json
import logging
import logging.config
import os
import sys
from datetime import datetime
from typing import Any, Dict, Optional
import uuid


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON with additional context."""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add request ID if available
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id

        # Add user ID if available
        if hasattr(record, "user_id"):
            log_entry["user_id"] = record.user_id

        # Add extra fields from the log record
        if hasattr(record, "extra"):
            log_entry.update(record.extra)

        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, default=str)


class DevelopmentFormatter(logging.Formatter):
    """Human-readable formatter for development."""

    def __init__(self):
        super().__init__(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )


def setup_logging(
    log_level: str = "INFO",
    environment: str = "development",
    log_file: Optional[str] = None
) -> None:
    """
    Configure logging for the application.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        environment: Environment (development, production)
        log_file: Optional file path for logging
    """
    # Convert string level to logging constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    # Choose formatter based on environment
    if environment.lower() == "production":
        formatter = JSONFormatter()
    else:
        formatter = DevelopmentFormatter()

    # Configure handlers
    handlers = []

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(numeric_level)
    handlers.append(console_handler)

    # File handler (if specified)
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(JSONFormatter())  # Always use JSON for files
        file_handler.setLevel(numeric_level)
        handlers.append(file_handler)

    # Configure root logger
    logging.basicConfig(
        level=numeric_level,
        handlers=handlers,
        force=True  # Override any existing configuration
    )

    # Reduce noise from external libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a configured logger instance.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


def log_with_context(
    logger: logging.Logger,
    level: int,
    message: str,
    request_id: Optional[str] = None,
    user_id: Optional[str] = None,
    **kwargs: Any
) -> None:
    """
    Log a message with additional context.

    Args:
        logger: Logger instance
        level: Log level
        message: Log message
        request_id: Optional request ID for correlation
        user_id: Optional user ID
        **kwargs: Additional context fields
    """
    extra = {"extra": kwargs}

    if request_id:
        extra["request_id"] = request_id
    if user_id:
        extra["user_id"] = user_id

    logger.log(level, message, extra=extra)


def generate_request_id() -> str:
    """Generate a unique request ID."""
    return str(uuid.uuid4())


# Context manager for request logging
class RequestContext:
    """Context manager for request-scoped logging."""

    def __init__(self, request_id: Optional[str] = None):
        self.request_id = request_id or generate_request_id()
        self.start_time = datetime.utcnow()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.utcnow() - self.start_time).total_seconds()
        logger = get_logger(__name__)

        if exc_type:
            log_with_context(
                logger,
                logging.ERROR,
                f"Request {self.request_id} failed after {duration:.3f}s",
                request_id=self.request_id,
                duration=duration,
                exception_type=exc_type.__name__ if exc_type else None
            )
        else:
            log_with_context(
                logger,
                logging.INFO,
                f"Request {self.request_id} completed in {duration:.3f}s",
                request_id=self.request_id,
                duration=duration
            )


# Initialize logging from environment variables
def init_logging_from_env() -> None:
    """Initialize logging configuration from environment variables."""
    log_level = os.getenv("LOG_LEVEL", "INFO")
    environment = os.getenv("ENVIRONMENT", "development")
    log_file = os.getenv("LOG_FILE")

    setup_logging(
        log_level=log_level,
        environment=environment,
        log_file=log_file
    )