# Logging & Monitoring Guide

This directory contains the logging and monitoring infrastructure for the FastAPI backend.

## Overview

The logging system provides:
- **Structured JSON logging** for production environments
- **Human-readable logging** for development
- **Request/response tracking** with correlation IDs
- **AI operation logging** with token usage tracking
- **Database query logging** with performance metrics
- **Security event logging** for suspicious activities

## Usage

### Basic Logging

```python
from src.core.logging import get_logger

logger = get_logger(__name__)

logger.info("Application started")
logger.warning("This is a warning")
logger.error("An error occurred")
```

### API Request Logging

Request/response logging is automatic via middleware. Each request gets a unique `request_id` for correlation.

### AI Operation Logging

```python
from src.monitoring.logger import log_ai_operation, log_ai_error, log_ai_operation_decorator

# Manual logging
log_ai_operation(
    operation="text_generation",
    model="gpt-4",
    tokens_used=150,
    duration=2.5
)

# Decorator approach
@log_ai_operation_decorator(operation_name="chat_completion")
async def generate_response(prompt: str):
    # Your AI logic here
    return response
```

### Database Logging

```python
from src.monitoring.logger import log_database_query, log_database_error

try:
    # Your database operation
    log_database_query(
        query="SELECT * FROM users WHERE id = ?",
        duration=0.025,
        rows_affected=1
    )
except Exception as e:
    log_database_error(query, e)
```

### Security Event Logging

```python
from src.monitoring.logger import log_security_event

log_security_event(
    event_type="failed_login",
    user_id="user123",
    ip_address="192.168.1.1",
    details={"reason": "invalid_password"}
)
```

### Function Call Logging

```python
from src.monitoring.logger import log_function_call

@log_function_call(include_args=True, include_result=True)
async def process_data(data: dict):
    # Your function logic
    return result
```

## Environment Variables

Configure logging behavior via environment variables:

```bash
# Basic logging
LOG_LEVEL=INFO                # DEBUG, INFO, WARNING, ERROR, CRITICAL
ENVIRONMENT=development       # development, production
LOG_FILE=/path/to/logfile    # Optional file logging

# Request logging (via middleware)
LOG_REQUEST_BODY=false       # Log request bodies (development only)
LOG_RESPONSE_BODY=false      # Log response bodies (development only)

# Database logging
LOG_SQL_QUERIES=false        # Log SQL queries (development only)
```

## Log Formats

### Development Format
```
2024-01-01 12:00:00 | INFO     | src.main:42 | Application started
```

### Production Format (JSON)
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "logger": "src.main",
  "message": "Application started",
  "module": "main",
  "function": "startup",
  "line": 42,
  "request_id": "uuid-here"
}
```

## Best Practices

### 1. Use Appropriate Log Levels
- **DEBUG**: Detailed information for diagnosing problems
- **INFO**: General information about application flow
- **WARNING**: Something unexpected happened but the app is still working
- **ERROR**: A serious problem occurred
- **CRITICAL**: The application may not be able to continue

### 2. Include Context
```python
# Good
logger.info("User logged in", extra={
    "extra": {
        "user_id": user.id,
        "ip_address": request.client.host,
        "session_id": session.id
    }
})

# Bad
logger.info("User logged in")
```

### 3. Sanitize Sensitive Data
```python
# Good
log_database_query("SELECT * FROM users WHERE email = ?", duration=0.1)

# Bad - exposes sensitive data
log_database_query("SELECT * FROM users WHERE email = 'user@example.com'", duration=0.1)
```

### 4. Use Request IDs for Correlation
```python
# In your route handlers
@app.get("/api/data")
async def get_data(request: Request):
    request_id = request.state.request_id
    logger.info("Processing data request", extra={"extra": {"request_id": request_id}})
```

### 5. Handle Exceptions Properly
```python
try:
    result = await some_operation()
    logger.info("Operation completed successfully")
    return result
except SpecificException as e:
    logger.error(f"Specific error occurred: {e}", exc_info=True)
    raise
except Exception as e:
    logger.critical(f"Unexpected error: {e}", exc_info=True)
    raise
```

## Monitoring and Alerting

The logging system integrates with:
- **Prometheus metrics** (already configured)
- **Request correlation** via X-Request-ID headers
- **Security event detection** for common attack patterns

Consider setting up log aggregation tools like ELK stack, Grafana Loki, or cloud logging services to monitor logs in production.