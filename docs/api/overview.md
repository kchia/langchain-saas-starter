# API Reference

ComponentForge REST API documentation.

## Base URLs

- **Development**: `http://localhost:8000`
- **Production**: `https://api.componentforge.com`

## Quick Reference

```bash
# Health check
GET /health

# API documentation (Swagger UI)
GET /docs

# Prometheus metrics
GET /metrics
```

## Authentication

All authenticated endpoints require a valid JWT token. See [Authentication](./authentication.md) for details.

```bash
# Example authenticated request
curl -X POST http://localhost:8000/api/v1/generate/screenshot \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@screenshot.png"
```

## Core Endpoints

### Component Generation

- `POST /api/v1/generate/screenshot` - Generate from screenshot
- `POST /api/v1/generate/figma` - Generate from Figma URL

### Pattern Management

- `POST /api/v1/patterns/search` - Semantic search for patterns
- `GET /api/v1/patterns/{id}` - Get specific pattern

### Components

- `GET /api/v1/components/` - List generated components
- `GET /api/v1/components/{id}` - Get component details
- `POST /api/v1/components/{id}/regenerate` - Regenerate component

### Documents

- `POST /api/v1/documents/upload` - Upload design document
- `GET /api/v1/documents/{id}` - Get document details

## Response Format

All responses follow this structure:

```json
{
  "status": "success" | "error",
  "data": { ... },
  "message": "Optional message",
  "timestamp": "2025-10-08T14:00:00Z"
}
```

## Error Handling

Error responses include:

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": { ... }
  },
  "timestamp": "2025-10-08T14:00:00Z"
}
```

### Common Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limiting

- **Authenticated users**: 100 requests/minute
- **Unauthenticated**: 20 requests/minute

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1633024800
```

## Complete API Documentation

For interactive API documentation with request/response examples, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## See Also

- [Authentication Guide](./authentication.md)
- [Endpoints Reference](./endpoints.md)
- [Architecture Overview](../architecture/overview.md)
