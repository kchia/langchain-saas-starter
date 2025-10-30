"""
Tests for Error Handler and Circuit Breaker
"""

import pytest
import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from core.errors import (
    ErrorHandler,
    CircuitBreaker,
    RetryableError,
    RateLimitError,
    NetworkError,
    get_user_friendly_error_message,
)


class TestErrorHandler:
    """Test cases for ErrorHandler."""

    @pytest.mark.asyncio
    async def test_successful_call(self):
        """Test that successful calls work without retry."""
        handler = ErrorHandler(max_retries=3, base_delay=0.1)
        call_count = 0

        async def successful_function():
            nonlocal call_count
            call_count += 1
            return "success"

        result = await handler.with_retry(successful_function)

        assert result == "success"
        assert call_count == 1  # Called only once

    @pytest.mark.asyncio
    async def test_retry_on_failure(self):
        """Test retry logic on transient failures."""
        handler = ErrorHandler(max_retries=3, base_delay=0.01)
        call_count = 0

        async def flaky_function():
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise RetryableError("Temporary failure")
            return "success"

        result = await handler.with_retry(
            flaky_function,
            error_types=(RetryableError,)
        )

        assert result == "success"
        assert call_count == 3  # Failed twice, succeeded on third

    @pytest.mark.asyncio
    async def test_max_retries_exceeded(self):
        """Test that max retries are respected."""
        handler = ErrorHandler(max_retries=3, base_delay=0.01)
        call_count = 0

        async def always_fails():
            nonlocal call_count
            call_count += 1
            raise RetryableError("Always fails")

        with pytest.raises(RetryableError):
            await handler.with_retry(
                always_fails,
                error_types=(RetryableError,)
            )

        assert call_count == 3  # Max retries reached

    @pytest.mark.asyncio
    async def test_exponential_backoff(self):
        """Test exponential backoff timing."""
        handler = ErrorHandler(max_retries=3, base_delay=0.1)
        delays = []

        async def track_delays():
            import time
            if not delays:
                delays.append(time.time())
                raise RetryableError("Fail 1")
            elif len(delays) == 1:
                delays.append(time.time())
                raise RetryableError("Fail 2")
            else:
                delays.append(time.time())
                return "success"

        await handler.with_retry(
            track_delays,
            error_types=(RetryableError,)
        )

        # Check that delays increase
        if len(delays) >= 3:
            delay1 = delays[1] - delays[0]
            delay2 = delays[2] - delays[1]
            # Second delay should be roughly 2x the first (with jitter tolerance)
            assert delay2 > delay1

    @pytest.mark.asyncio
    async def test_non_retryable_error(self):
        """Test that non-retryable errors are not retried."""
        handler = ErrorHandler(max_retries=3, base_delay=0.01)
        call_count = 0

        async def raises_value_error():
            nonlocal call_count
            call_count += 1
            raise ValueError("Not retryable")

        with pytest.raises(ValueError):
            await handler.with_retry(
                raises_value_error,
                error_types=(RetryableError,)  # Only retry RetryableError
            )

        assert call_count == 1  # Not retried


class TestCircuitBreaker:
    """Test cases for CircuitBreaker."""

    @pytest.mark.asyncio
    async def test_successful_calls(self):
        """Test successful calls keep circuit closed."""
        breaker = CircuitBreaker(failure_threshold=3, timeout=1.0)

        async def successful_call():
            return "success"

        for _ in range(5):
            result = await breaker.call(successful_call)
            assert result == "success"
            assert breaker.state == "CLOSED"

    @pytest.mark.asyncio
    async def test_circuit_opens_on_failures(self):
        """Test circuit opens after threshold failures."""
        breaker = CircuitBreaker(failure_threshold=3, timeout=1.0)

        async def failing_call():
            raise RetryableError("Failure")

        # Fail threshold times
        for i in range(3):
            with pytest.raises(RetryableError):
                await breaker.call(failing_call)

        # Circuit should be open
        assert breaker.state == "OPEN"
        assert breaker.failures >= 3

    @pytest.mark.asyncio
    async def test_circuit_fails_fast_when_open(self):
        """Test circuit fails fast when open."""
        breaker = CircuitBreaker(failure_threshold=2, timeout=1.0)

        async def failing_call():
            raise RetryableError("Failure")

        # Open the circuit
        for _ in range(2):
            with pytest.raises(RetryableError):
                await breaker.call(failing_call)

        assert breaker.state == "OPEN"

        # Next call should fail fast with RuntimeError
        async def any_call():
            return "success"

        with pytest.raises(RuntimeError, match="Circuit breaker is OPEN"):
            await breaker.call(any_call)

    @pytest.mark.asyncio
    async def test_circuit_half_open_after_timeout(self):
        """Test circuit enters half-open state after timeout."""
        breaker = CircuitBreaker(failure_threshold=2, timeout=0.1)

        async def failing_call():
            raise RetryableError("Failure")

        # Open the circuit
        for _ in range(2):
            with pytest.raises(RetryableError):
                await breaker.call(failing_call)

        assert breaker.state == "OPEN"

        # Wait for timeout
        await asyncio.sleep(0.15)

        # Next call should attempt (half-open)
        async def successful_call():
            return "success"

        result = await breaker.call(successful_call)
        assert result == "success"
        assert breaker.state == "CLOSED"  # Reset on success

    @pytest.mark.asyncio
    async def test_circuit_resets_on_success(self):
        """Test circuit resets failure count on success."""
        breaker = CircuitBreaker(failure_threshold=3, timeout=1.0)

        async def failing_call():
            raise RetryableError("Failure")

        async def successful_call():
            return "success"

        # Fail once
        with pytest.raises(RetryableError):
            await breaker.call(failing_call)

        assert breaker.failures == 1

        # Succeed
        await breaker.call(successful_call)

        # Failure count should reset
        assert breaker.failures == 0
        assert breaker.state == "CLOSED"


class TestUserFriendlyErrors:
    """Test user-friendly error messages."""

    def test_rate_limit_figma(self):
        """Test Figma rate limit error message."""
        error = RateLimitError("Figma API rate limit exceeded")
        message = get_user_friendly_error_message(error)
        assert "Figma API limit reached" in message
        assert "try again" in message.lower()

    def test_rate_limit_openai(self):
        """Test OpenAI rate limit error message."""
        error = RateLimitError("OpenAI rate limit exceeded")
        message = get_user_friendly_error_message(error)
        assert "AI service" in message
        assert "temporarily unavailable" in message

    def test_network_error(self):
        """Test network error message."""
        error = NetworkError("Connection failed")
        message = get_user_friendly_error_message(error)
        assert "Network connection failed" in message
        assert "check your connection" in message

    def test_timeout_error(self):
        """Test timeout error message."""
        error = TimeoutError("Request timed out")
        message = get_user_friendly_error_message(error)
        assert "Network connection failed" in message

    def test_file_upload_error(self):
        """Test file upload error message."""
        error = ValueError("File size exceeds limit")
        message = get_user_friendly_error_message(error)
        assert "Image upload failed" in message
        assert "PNG/JPG under 10MB" in message

    def test_auth_error(self):
        """Test authentication error message."""
        error = PermissionError("Authentication required")
        message = get_user_friendly_error_message(error)
        assert "Authentication failed" in message
        assert "credentials" in message

    def test_generic_error(self):
        """Test generic error message."""
        error = Exception("Something went wrong")
        message = get_user_friendly_error_message(error)
        assert "unexpected error" in message
        assert "try again" in message.lower()
