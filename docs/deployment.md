# Deployment Guide

Comprehensive guide for deploying ComponentForge to production, staging, and local Docker environments.

## Overview

ComponentForge is a full-stack application with three tiers:
- **Frontend**: Next.js 15.5.4 (port 3000)
- **Backend**: FastAPI + Python 3.11 (port 8000)
- **Services**: PostgreSQL, Qdrant, Redis (Docker Compose)

This guide covers deployment to various environments with best practices for security, performance, and observability.

## Prerequisites

### All Environments

- **Docker Desktop** - For containerized services
- **Node.js 18+** - For frontend builds
- **Python 3.11+** - For backend runtime
- **OpenAI API Key** - For AI features
- **Git** - For code deployment

### Production-Specific

- **Domain Name** - With SSL certificate
- **Cloud Provider** - AWS, GCP, Azure, or Vercel/Railway
- **PostgreSQL Database** - Managed service recommended
- **Redis Instance** - Managed service recommended
- **Qdrant Cloud** - Or self-hosted Qdrant instance

## Environment Configuration

### Environment Variables

ComponentForge requires environment variables for both frontend and backend:

#### Backend Environment (`backend/.env`)

```bash
# Database Configuration
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname

# Vector Database (Qdrant)
QDRANT_URL=https://your-qdrant-cluster.cloud.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-api-key

# Cache (Redis)
REDIS_URL=redis://user:password@host:6379

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key
LANGCHAIN_API_KEY=lsv2_your-langchain-key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_PROJECT=component-forge-production

# Figma Integration
FIGMA_PAT=figd_your-figma-personal-access-token

# Authentication
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=https://your-domain.com

# Monitoring & Observability
PROMETHEUS_MULTIPROC_DIR=/tmp/prometheus
LANGFUSE_PUBLIC_KEY=pk-lf-your-public-key
LANGFUSE_SECRET_KEY=sk-lf-your-secret-key
LANGFUSE_HOST=https://cloud.langfuse.com

# Application Settings
DEBUG=false
LOG_LEVEL=INFO
ENVIRONMENT=production
CORS_ORIGINS=https://your-domain.com

# Security
SECRET_KEY=generate-with-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Frontend Environment (`app/.env.local`)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_API_WS_URL=wss://api.your-domain.com

# Authentication (Auth.js v5)
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true

# Environment
NODE_ENV=production
```

### Generating Secrets

```bash
# Generate AUTH_SECRET (32 bytes base64)
openssl rand -base64 32

# Generate SECRET_KEY (32 bytes hex)
openssl rand -hex 32
```

## Local Development Deployment

### Quick Start with Make

```bash
# Install dependencies
make install

# Start services (PostgreSQL, Qdrant, Redis)
make dev

# Terminal 1: Start backend
cd backend && source venv/bin/activate && uvicorn src.main:app --reload

# Terminal 2: Start frontend
cd app && npm run dev
```

### Manual Setup

1. **Start Docker Services**
   ```bash
   docker-compose up -d
   ```

2. **Configure Environment**
   ```bash
   cp backend/.env.example backend/.env
   cp app/.env.local.example app/.env.local
   # Edit files with your API keys
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd app
   npm install
   npx playwright install
   ```

5. **Run Database Migrations**
   ```bash
   cd backend
   source venv/bin/activate
   alembic upgrade head
   ```

6. **Seed Pattern Database**
   ```bash
   make seed-patterns
   ```

7. **Start Services**
   ```bash
   # Terminal 1: Backend
   cd backend && source venv/bin/activate
   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

   # Terminal 2: Frontend
   cd app && npm run dev
   ```

8. **Verify Installation**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health
   - Qdrant: http://localhost:6333/dashboard

## Docker Compose Deployment

### Single Machine Setup

Ideal for staging or small production deployments.

**1. Create `docker-compose.prod.yml`:**

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./app
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=postgresql+asyncpg://demo_user:demo_pass@postgres:5432/demo_db
      - QDRANT_URL=http://qdrant:6333
      - REDIS_URL=redis://redis:6379
    env_file:
      - ./backend/.env
    depends_on:
      - postgres
      - qdrant
      - redis
    restart: always
    volumes:
      - ./backend/data:/app/data

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: demo_user
      POSTGRES_PASSWORD: demo_pass
      POSTGRES_DB: demo_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage
    restart: always

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: always

volumes:
  postgres_data:
  qdrant_data:
```

**2. Create Backend Dockerfile (`backend/Dockerfile.prod`):**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Start application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

**3. Create Frontend Dockerfile (`app/Dockerfile.prod`):**

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV NODE_ENV production
ENV PORT 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]
```

**4. Deploy:**

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Seed patterns
docker-compose -f docker-compose.prod.yml exec backend python scripts/seed_patterns.py
```

## Cloud Deployments

### Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Select `app/` as root directory

2. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: app
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Set Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   AUTH_SECRET=your-auth-secret
   AUTH_URL=https://your-domain.vercel.app
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main

**Backend on Railway:**

1. **Connect Repository**
   - Go to https://railway.app
   - Create new project from GitHub
   - Select backend directory

2. **Add Services**
   - PostgreSQL (from Railway's template)
   - Redis (from Railway's template)
   - Python service (your backend code)

3. **Configure Backend Service**
   ```
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn src.main:app --host 0.0.0.0 --port $PORT --workers 4
   ```

4. **Set Environment Variables**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   QDRANT_URL=https://your-qdrant-cloud.io:6333
   QDRANT_API_KEY=your-qdrant-key
   OPENAI_API_KEY=your-openai-key
   LANGCHAIN_API_KEY=your-langchain-key
   ENVIRONMENT=production
   DEBUG=false
   ```

5. **Deploy**
   - Railway automatically builds and deploys

### AWS (Full Stack)

**Architecture:**
- **Frontend**: AWS Amplify or S3 + CloudFront
- **Backend**: ECS Fargate or EC2
- **Database**: RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **Vector DB**: Qdrant Cloud or self-hosted EC2

**Frontend (AWS Amplify):**

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

**Backend (ECS Fargate):**

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name component-forge-backend
   ```

2. **Build and Push Docker Image**
   ```bash
   # Build image
   docker build -f backend/Dockerfile.prod -t component-forge-backend .

   # Tag for ECR
   docker tag component-forge-backend:latest \
     123456789.dkr.ecr.us-east-1.amazonaws.com/component-forge-backend:latest

   # Push to ECR
   aws ecr get-login-password --region us-east-1 | \
     docker login --username AWS --password-stdin \
     123456789.dkr.ecr.us-east-1.amazonaws.com

   docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/component-forge-backend:latest
   ```

3. **Create ECS Task Definition** (`task-definition.json`)
   ```json
   {
     "family": "component-forge-backend",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "1024",
     "memory": "2048",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/component-forge-backend:latest",
         "portMappings": [
           {
             "containerPort": 8000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {"name": "ENVIRONMENT", "value": "production"},
           {"name": "DEBUG", "value": "false"}
         ],
         "secrets": [
           {
             "name": "DATABASE_URL",
             "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-url"
           },
           {
             "name": "OPENAI_API_KEY",
             "valueFrom": "arn:aws:secretsmanager:region:account:secret:openai-key"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/component-forge-backend",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

4. **Create ECS Service**
   ```bash
   aws ecs create-service \
     --cluster component-forge \
     --service-name backend \
     --task-definition component-forge-backend \
     --desired-count 2 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
     --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=8000"
   ```

## Database Migrations

### Production Migration Strategy

```bash
# 1. Backup database before migration
pg_dump -h your-db-host -U your-user -d your-db -F c -b -v -f backup_$(date +%Y%m%d_%H%M%S).dump

# 2. Test migration on staging
cd backend && source venv/bin/activate
alembic upgrade head --sql > migration.sql  # Preview SQL
alembic upgrade head  # Apply migration

# 3. If successful, apply to production
ENVIRONMENT=production alembic upgrade head

# 4. Rollback if issues occur
alembic downgrade -1
```

### Zero-Downtime Migrations

For breaking schema changes:

1. **Phase 1**: Add new columns (backward compatible)
   ```bash
   alembic upgrade head
   ```

2. **Phase 2**: Deploy code using both old and new columns

3. **Phase 3**: Migrate data
   ```sql
   UPDATE table SET new_column = old_column WHERE new_column IS NULL;
   ```

4. **Phase 4**: Deploy code using only new columns

5. **Phase 5**: Remove old columns
   ```bash
   alembic upgrade head
   ```

## Monitoring & Observability

### Health Checks

**Backend Health Endpoint:**
```bash
curl https://api.your-domain.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "redis": "ok",
    "qdrant": "ok"
  },
  "timestamp": "2025-01-09T10:30:45Z"
}
```

### Logging

**Backend (Python):**
- Structured JSON logging to stdout
- Log aggregation: CloudWatch, DataDog, or Logtail
- Levels: DEBUG, INFO, WARNING, ERROR, CRITICAL

**Frontend (Next.js):**
- Client-side errors: Sentry or Vercel Analytics
- Server-side logs: Vercel logs or CloudWatch

### Metrics

**Prometheus Metrics:**
```python
# Backend exposes /metrics endpoint
from prometheus_client import Counter, Histogram

generation_requests = Counter('generation_requests_total', 'Total generation requests')
generation_latency = Histogram('generation_latency_seconds', 'Generation latency')
```

**Grafana Dashboard:**
- Request rate and latency (p50, p95, p99)
- Error rates by endpoint
- AI model usage and costs
- Database connection pool metrics
- Cache hit/miss rates

### LangSmith Tracing

All AI operations are traced in LangSmith:

```bash
# View traces in LangSmith dashboard
https://smith.langchain.com/

# Filter by project
Project: component-forge-production

# Key metrics:
- Total LLM calls
- Token usage and costs
- Latency by operation
- Error rates
- Retrieval quality (MRR, Hit@3)
```

## Performance Optimization

### Frontend

1. **Static Generation** - Pre-render pages at build time
   ```typescript
   // app/page.tsx
   export const dynamic = 'force-static';
   ```

2. **Image Optimization** - Use Next.js Image component
   ```typescript
   import Image from 'next/image';
   <Image src="/logo.png" width={200} height={200} alt="Logo" />
   ```

3. **Code Splitting** - Dynamic imports for large components
   ```typescript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'));
   ```

4. **CDN Caching** - Configure cache headers
   ```typescript
   export const revalidate = 3600; // Revalidate every hour
   ```

### Backend

1. **Connection Pooling** - Configure SQLAlchemy pool
   ```python
   engine = create_async_engine(
       DATABASE_URL,
       pool_size=20,
       max_overflow=10,
       pool_pre_ping=True
   )
   ```

2. **Redis Caching** - Cache expensive operations
   ```python
   @cache(ttl=3600)
   async def get_patterns():
       return await db.query(Pattern).all()
   ```

3. **Worker Scaling** - Multiple Uvicorn workers
   ```bash
   uvicorn src.main:app --workers 4 --host 0.0.0.0
   ```

4. **Rate Limiting** - Protect API endpoints
   ```python
   from slowapi import Limiter

   limiter = Limiter(key_func=get_remote_address)

   @app.post("/api/generate")
   @limiter.limit("10/minute")
   async def generate():
       ...
   ```

## Security Best Practices

### 1. Environment Variables
- **Never** commit `.env` files to Git
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate API keys regularly

### 2. HTTPS/TLS
- Enforce HTTPS in production
- Use Let's Encrypt for free SSL certificates
- Configure HSTS headers

### 3. CORS Configuration
```python
# backend/src/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### 4. Authentication
- Use Auth.js v5 with secure session storage
- Implement rate limiting on auth endpoints
- Enable 2FA for admin users

### 5. Database Security
- Use connection pooling with proper limits
- Enable SSL for database connections
- Regular backups and point-in-time recovery

### 6. Dependency Updates
```bash
# Check for vulnerabilities
npm audit
pip-audit

# Update dependencies
npm update
pip install --upgrade -r requirements.txt
```

## Troubleshooting

### Common Issues

**1. Docker services not starting**
```bash
# Check Docker daemon
docker info

# Check service logs
docker-compose logs postgres
docker-compose logs qdrant

# Restart services
docker-compose restart
```

**2. Database connection errors**
```bash
# Test connection
psql -h localhost -U demo_user -d demo_db

# Check if port is blocked
lsof -i :5432
```

**3. Frontend build fails**
```bash
# Clear Next.js cache
rm -rf app/.next

# Reinstall dependencies
cd app && rm -rf node_modules && npm install
```

**4. Backend import errors**
```bash
# Verify Python environment
source backend/venv/bin/activate
python --version

# Reinstall dependencies
pip install -r backend/requirements.txt
```

**5. AI features not working**
```bash
# Verify API keys
echo $OPENAI_API_KEY

# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## Rollback Procedures

### Application Rollback

**Docker Compose:**
```bash
# Tag current version
docker-compose -f docker-compose.prod.yml build
docker tag component-forge-backend:latest component-forge-backend:v1.2.3

# Rollback to previous version
docker-compose -f docker-compose.prod.yml down
docker tag component-forge-backend:v1.2.2 component-forge-backend:latest
docker-compose -f docker-compose.prod.yml up -d
```

**Vercel:**
```bash
# View deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Database Rollback

```bash
# Rollback last migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade abc123

# Restore from backup
pg_restore -h host -U user -d dbname -v backup_file.dump
```

## Checklist

### Pre-Deployment

- [ ] All tests passing (`make test`)
- [ ] Linting clean (`make lint-check`)
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates configured
- [ ] Monitoring dashboards created
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### Post-Deployment

- [ ] Health checks passing
- [ ] Smoke tests successful
- [ ] Monitoring shows normal metrics
- [ ] Logs show no errors
- [ ] User acceptance testing complete
- [ ] Documentation updated
- [ ] Team notified of deployment

## See Also

- [Development Workflow](./development-workflow.md) - Local development guide
- [Architecture Overview](./architecture/overview.md) - System design
- [API Reference](./api/overview.md) - API documentation
- [Testing Guide](./testing/integration-testing.md) - Testing strategies
