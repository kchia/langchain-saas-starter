"""
Error Handling and Retry Logic

Provides robust error handling with exponential backoff and retry logic.
"""

import asyncio
import logging
import random
import time
from typing import TypeVar, Callable, Tuple, Type, Optional
from functools import wraps

logger = logging.getLogger(__name__)

T = TypeVar('T')


class RetryableError(Exception):
    """Base exception for errors that can be retried."""
    pass


class RateLimitError(RetryableError):
    """Raised when API rate limit is exceeded."""
    pass


class NetworkError(RetryableError):
    """Raised for network-related errors."""
    pass


class ErrorHandler:
    """
    Handles errors with retry logic and exponential backoff.
    
    Example:
        >>> handler = ErrorHandler(max_retries=3, base_delay=1.0)
        >>> async def risky_operation():
        ...     # Some operation that might fail
        ...     return "success"
        >>> result = await handler.with_retry(risky_operation)
    """
    
    def __init__(
        self,
        max_retries: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 60.0
    ):
        """
        Initialize error handler.
        
        Args:
            max_retries: Maximum number of retry attempts
            base_delay: Base delay in seconds for exponential backoff
            max_delay: Maximum delay between retries
        """
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay

    async def with_retry(
        self,
        func: Callable[[], T],
        error_types: Tuple[Type[Exception], ...] = (Exception,),
        context: Optional[dict] = None
    ) -> T:
        """
        Execute function with retry logic.
        
        Args:
            func: Async function to execute
            error_types: Tuple of exception types to catch and retry
            context: Optional context for logging
            
        Returns:
            Result of the function
            
        Raises:
            Last exception if all retries fail
        """
        last_error: Optional[Exception] = None
        
        for attempt in range(self.max_retries):
            try:
                return await func()
            except error_types as e:
                last_error = e
                
                # Log the error with context
                log_context = {
                    "attempt": attempt + 1,
                    "max_retries": self.max_retries,
                    "error": str(e),
                    "error_type": type(e).__name__,
                }
                if context:
                    log_context.update(context)
                
                logger.warning(
                    f"Attempt {attempt + 1}/{self.max_retries} failed: {e}",
                    extra=log_context
                )
                
                # Don't sleep on the last attempt
                if attempt < self.max_retries - 1:
                    delay = self._calculate_delay(attempt)
                    logger.info(f"Retrying in {delay:.2f}s...")
                    await asyncio.sleep(delay)
                else:
                    logger.error(
                        f"All {self.max_retries} attempts failed",
                        extra=log_context
                    )
                    raise
        
        # This should never be reached, but just in case
        if last_error:
            raise last_error
        raise RuntimeError("Retry logic failed unexpectedly")

    def _calculate_delay(self, attempt: int) -> float:
        """
        Calculate exponential backoff delay with jitter.
        
        Args:
            attempt: Current attempt number (0-indexed)
            
        Returns:
            Delay in seconds
        """
        # Exponential backoff: base_delay * 2^attempt
        delay = self.base_delay * (2 ** attempt)
        
        # Add jitter (random factor between 0 and 0.3 of delay)
        jitter = random.uniform(0, delay * 0.3)
        delay += jitter
        
        # Cap at max_delay
        return min(delay, self.max_delay)


class CircuitBreaker:
    """
    Circuit breaker pattern for external services.
    
    Prevents cascading failures by "opening" the circuit after
    a threshold of failures, giving the service time to recover.
    
    States:
    - CLOSED: Normal operation, requests pass through
    - OPEN: Too many failures, requests fail fast
    - HALF_OPEN: Testing if service recovered
    
    Example:
        >>> breaker = CircuitBreaker(
        ...     failure_threshold=5,
        ...     timeout=60.0
        ... )
        >>> async def call_external_api():
        ...     return "data"
        >>> result = await breaker.call(call_external_api)
    """
    
    def __init__(
        self,
        failure_threshold: int = 5,
        timeout: float = 60.0
    ):
        """
        Initialize circuit breaker.
        
        Args:
            failure_threshold: Number of failures before opening circuit
            timeout: Seconds to wait before attempting reset
        """
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time: Optional[float] = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN

    async def call(
        self,
        func: Callable[[], T],
        context: Optional[dict] = None
    ) -> T:
        """
        Execute function through circuit breaker.
        
        Args:
            func: Async function to execute
            context: Optional context for logging
            
        Returns:
            Result of the function
            
        Raises:
            Exception if circuit is open or call fails
        """
        # Check if we should attempt to reset
        if self.state == "OPEN" and self._should_attempt_reset():
            self.state = "HALF_OPEN"
            logger.info("Circuit breaker attempting reset (HALF_OPEN)")
        
        # Fail fast if circuit is open
        if self.state == "OPEN":
            error_msg = f"Circuit breaker is OPEN (failures: {self.failures})"
            logger.error(error_msg, extra=context or {})
            raise RuntimeError(error_msg)
        
        try:
            result = await func()
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            
            log_context = {
                "state": self.state,
                "failures": self.failures,
                "error": str(e),
            }
            if context:
                log_context.update(context)
            
            logger.error(
                f"Circuit breaker call failed: {e}",
                extra=log_context
            )
            raise

    def _should_attempt_reset(self) -> bool:
        """Check if enough time passed to attempt reset."""
        if self.last_failure_time is None:
            return True
        elapsed = time.time() - self.last_failure_time
        return elapsed >= self.timeout

    def _on_success(self):
        """Handle successful call."""
        if self.state == "HALF_OPEN":
            logger.info("Circuit breaker reset successful (CLOSED)")
        self.failures = 0
        self.state = "CLOSED"

    def _on_failure(self):
        """Handle failed call."""
        self.failures += 1
        self.last_failure_time = time.time()

        if self.failures >= self.failure_threshold:
            if self.state != "OPEN":
                logger.warning(
                    f"Circuit breaker opening after {self.failures} failures"
                )
            self.state = "OPEN"


def get_user_friendly_error_message(error: Exception) -> str:
    """
    Convert technical errors to user-friendly messages.
    
    Args:
        error: Exception to convert
        
    Returns:
        User-friendly error message
    """
    error_type = type(error).__name__
    error_msg = str(error)
    
    # Rate limit errors
    if isinstance(error, RateLimitError) or "rate limit" in error_msg.lower():
        if "figma" in error_msg.lower():
            return "Figma API limit reached. Please try again in a few minutes."
        if "openai" in error_msg.lower():
            return "AI service is temporarily unavailable. Please try again in a moment."
        return "API rate limit exceeded. Please try again shortly."
    
    # Network errors
    if isinstance(error, (NetworkError, TimeoutError, ConnectionError)):
        return "Network connection failed. Please check your connection and try again."
    
    # File upload errors
    if "file" in error_msg.lower() and ("size" in error_msg.lower() or "format" in error_msg.lower()):
        return "Image upload failed. Please use PNG/JPG under 10MB."
    
    # Authentication errors
    if "auth" in error_msg.lower() or "permission" in error_msg.lower():
        return "Authentication failed. Please check your credentials."
    
    # Default message
    return "An unexpected error occurred. Please try again or contact support if the problem persists."
