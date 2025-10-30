# Rate Limiting Implementation - Story 3.3

## Overview

This directory contains the security-focused rate limiting implementation for ComponentForge, protecting expensive API endpoints from abuse with Redis-based distributed rate limiting.

## Architecture

### Components

1. **SecurityRateLimiter** (`backend/src/security/rate_limiter.py`)
   - **Async Redis-based** sliding window counter (uses `redis.asyncio`)
   - Tiered limits by subscription level (Free/Pro/Enterprise)
   - User identification from auth state or IP address
   - 429 error responses with Retry-After headers
   - **Atomic pipeline operations** to prevent race conditions

2. **RateLimitMiddleware** (`backend/src/api/middleware/rate_limit_middleware.py`)
   - FastAPI middleware for automatic rate limiting
   - Applied to expensive endpoints only
   - Adds rate limit headers to all responses
   - Integrates with Prometheus metrics

3. **Prometheus Metrics** (`backend/src/security/metrics.py`)
   - `rate_limit_hits_total` - Counter for rate limit violations
   - `security_events_total` - Counter for all security events

## Tiered Rate Limits

| Tier       | Requests/Minute | Components/Month | Max Image Size |
|------------|-----------------|------------------|----------------|
| Free       | 10              | 50               | 5 MB           |
| Pro        | 60              | 500              | 10 MB          |
| Enterprise | 600             | 10,000           | 50 MB          |

## Protected Endpoints

Rate limiting is applied to the following expensive endpoints:

- `/api/v1/tokens/extract/screenshot` - Token extraction (AI-powered)
- `/api/v1/generation/generate` - Component generation (AI-powered)

Other endpoints are not rate limited to ensure fast browsing and metadata retrieval.

## Usage

### Automatic Protection

Rate limiting is automatically applied via middleware in `main.py`:

```python
from src.api.middleware.rate_limit_middleware import RateLimitMiddleware

app.add_middleware(RateLimitMiddleware)
```

### Response Headers

All rate-limited endpoints include the following headers:

- `X-RateLimit-Limit` - Maximum requests allowed per window
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - Unix timestamp when the window resets

Example:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1730138877
```

### 429 Rate Limit Error

When rate limit is exceeded:

```json
{
  "detail": "Rate limit exceeded: 11/10 requests/min. Try again in 59 seconds."
}
```

Headers:
```
Retry-After: 59
```

### User Tier Detection

User tier is detected from:

1. `X-User-Tier` header (for testing)
2. `request.state.user.tier` (from auth middleware)
3. Defaults to `free` tier

Example request with tier:
```bash
curl -H "X-User-Tier: pro" http://localhost:8000/api/v1/tokens/extract/screenshot
```

### User Identification

Users are identified by:

1. Authenticated user ID: `user:{user_id}` (from `request.state.user.id`)
2. IP address: `ip:{ip_address}` (fallback for anonymous users)
3. Real IP from `X-Forwarded-For` header (if behind proxy)

## Redis Configuration

Rate limiting requires Redis to be running. Configure via environment variables:

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

Redis keys follow the pattern:
```
rate_limit:{user_id}:{endpoint}
```

Example:
```
rate_limit:user:123:extract
rate_limit:ip:192.168.1.1:generate
```

## Testing

### Unit Tests

Run security rate limiter tests:
```bash
cd backend
pytest tests/security/test_rate_limiting.py -v
```

20 tests covering:
- Tiered limits enforcement
- Sliding window behavior
- User/endpoint isolation
- Error messages and headers
- User tier and ID detection

### Integration Tests

Run middleware integration tests:
```bash
cd backend
pytest tests/integration/test_rate_limit_middleware.py -v
```

8 tests covering:
- End-to-end rate limiting flow
- Multiple tiers and endpoints
- Response header injection
- Error handling

### All Tests

Run all rate limiting tests:
```bash
cd backend
pytest tests/security/test_rate_limiting.py tests/integration/test_rate_limit_middleware.py -v
```

Total: 28 tests

## Monitoring

### Prometheus Metrics

View rate limit metrics at `/metrics`:

```
# HELP rate_limit_hits_total Rate limit violations
# TYPE rate_limit_hits_total counter
rate_limit_hits_total{tier="free",endpoint="extract"} 5.0
rate_limit_hits_total{tier="pro",endpoint="generate"} 2.0

# HELP security_events_total Total security events
# TYPE security_events_total counter
security_events_total{event_type="rate_limit",severity="medium"} 7.0
```

### Logs

Rate limit events are logged with structured metadata:

```json
{
  "event": "rate_limit_exceeded",
  "user_id": "ip:192.168.1.1",
  "tier": "free",
  "endpoint": "extract",
  "count": 11,
  "limit": 10
}
```

## Implementation Details

### Sliding Window Algorithm

Uses **async** Redis sorted sets for atomic sliding window:

1. Remove entries older than 60 seconds
2. Add current timestamp to set
3. Count entries in window
4. Get oldest entry (for retry-after calculation)
5. Check if count exceeds limit
6. Set TTL for automatic cleanup

### Atomic Operations

All Redis operations use **async pipelining** for atomicity and performance:

```python
async with redis.pipeline(transaction=True) as pipe:
    pipe.zremrangebyscore(key, 0, window_start)
    pipe.zadd(key, {now: now})
    pipe.zcard(key)
    pipe.zrange(key, 0, 0, withscores=True)  # Get oldest for retry-after
    pipe.expire(key, window)
    results = await pipe.execute()
```

This ensures:
- **Race-free** rate limiting in distributed environments
- **Non-blocking** I/O operations for better performance under load
- **Accurate retry-after** calculation without additional Redis calls

### Production Considerations

1. **Redis High Availability**: Use Redis Cluster or Sentinel for production
2. **Async Redis**: Uses `redis.asyncio` for non-blocking I/O operations
3. **Authentication**: Implement proper JWT-based authentication to get user tiers
4. **Rate Limit Tiers**: Adjust limits based on actual usage patterns
5. **Monitoring**: Set up alerts for sustained high rate limit hits
6. **IP Detection**: Configure `X-Forwarded-For` handling for your load balancer
7. **Redis Health Check**: Startup verification ensures Redis is available before accepting requests

## Future Enhancements

- [ ] Monthly component limit tracking (currently configured but not enforced)
- [ ] Exponential backoff for repeat violators
- [ ] Whitelist/blacklist for specific IPs
- [ ] Admin endpoint to view and reset rate limits
- [ ] Integration with authentication service for tier detection
- [ ] Rate limit analytics dashboard

## References

- Epic 003: Safety & Guardrails - `/backend/.claude/epics/epic-003-safety-guardrails.md`
- Story 3.3 Specification - Line 195-265 of epic
- Redis Sliding Window Pattern - https://redis.io/commands/zadd
