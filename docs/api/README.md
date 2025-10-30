# API Reference

REST API documentation for ComponentForge.

## Contents

- [API Overview](./overview.md) - Quick reference and base URLs
- [Authentication](./authentication.md) - Auth flows and JWT tokens
- [Endpoints](./endpoints.md) - Complete endpoint reference

## Base URLs

- **Development**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Health Check**: `http://localhost:8000/health`
- **Metrics**: `http://localhost:8000/metrics`

## Quick Example

```bash
# Health check
curl http://localhost:8000/health

# Generate from screenshot (requires auth)
curl -X POST http://localhost:8000/api/v1/generate/screenshot \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@screenshot.png"
```

See [API Overview](./overview.md) for complete documentation.
