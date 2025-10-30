# Deployment Documentation

Production deployment guides for ComponentForge.

## Contents

- [Deployment Overview](./overview.md) - Deployment strategies
- [Docker Setup](./docker.md) - Docker and Docker Compose configuration
- [Production Deployment](./production.md) - Production deployment guide
- [Security](./security.md) - Security best practices
- [Monitoring](./monitoring.md) - Observability and monitoring

## Quick Deployment

### Development

```bash
# Start all services
docker-compose up -d

# Start backend
cd backend && source venv/bin/activate && uvicorn src.main:app --reload

# Start frontend
cd app && npm run dev
```

### Production (Recommended)

- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or AWS ECS
- **Database**: Managed PostgreSQL (AWS RDS, Supabase)
- **Vector DB**: Qdrant Cloud
- **Cache**: Redis Cloud or AWS ElastiCache

See [Production Deployment](./production.md) for detailed setup instructions.
