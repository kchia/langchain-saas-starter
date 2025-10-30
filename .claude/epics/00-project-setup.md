# Epic 0: Project Setup & Infrastructure

**Status**: Not Started
**Priority**: Critical
**Epic Owner**: Infrastructure Team
**Estimated Tasks**: 8

---

## Overview

Establish the foundational development environment and infrastructure required for ComponentForge. This epic ensures all developers can run the full stack locally with a single command and that production services are properly configured.

---

## Goals

1. Enable `make install` to configure all dependencies without errors
2. Enable `make dev` to start all services (frontend, backend, Docker services)
3. Establish database schemas and migrations
4. Seed initial pattern library in Qdrant
5. Configure observability with LangSmith
6. Document development workflows

---

## Success Criteria

- ✅ `make install` runs successfully on macOS and Linux
- ✅ `make dev` starts all services without manual intervention
- ✅ Health endpoints return 200 OK:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:8000/health
  - Qdrant: http://localhost:6333/dashboard
  - PostgreSQL: Connection successful
  - Redis: Connection successful
- ✅ Database migrations apply successfully
- ✅ Qdrant contains ≥2 seeded patterns (Button, Card)
- ✅ LangSmith project created and tracing configured
- ✅ Environment variable templates documented
- ✅ CONTRIBUTING.md exists with setup instructions

---

## Tasks

### Task 1: Configure Docker Compose Services
**Acceptance Criteria**:
- [ ] `docker-compose.yml` includes PostgreSQL 16, Qdrant, Redis 7
- [ ] Services expose correct ports (5432, 6333, 6379)
- [ ] Health checks configured for all services
- [ ] Volume mounts for persistence
- [ ] `docker-compose up -d` starts all services without errors

**Files**:
- `docker-compose.yml`
- `.dockerignore`

---

### Task 2: Set Up Python Backend Environment
**Acceptance Criteria**:
- [ ] Python 3.11+ virtual environment created in `backend/venv/`
- [ ] `requirements.txt` includes all dependencies:
  - FastAPI, uvicorn
  - LangChain, LangGraph, LangSmith
  - Pillow (image processing)
  - SQLAlchemy, asyncpg (PostgreSQL)
  - Qdrant client
  - prometheus-client
- [ ] `make install` creates venv and installs dependencies
- [ ] `backend/.env.example` documented with all required variables

**Files**:
- `backend/requirements.txt`
- `backend/.env.example`
- `Makefile` (install target)

---

### Task 3: Set Up Next.js Frontend Environment
**Acceptance Criteria**:
- [ ] Node.js 18+ verified
- [ ] `package.json` includes all dependencies:
  - Next.js 15.5.4, React 19
  - shadcn/ui components
  - Tailwind CSS v4
  - Zustand, TanStack Query
  - axe-core/react
  - Playwright
- [ ] `npm install` completes successfully
- [ ] Playwright browsers installed
- [ ] `app/.env.local.example` documented

**Files**:
- `app/package.json`
- `app/.env.local.example`
- `Makefile` (install target)

---

### Task 4: Create Database Schema & Migrations
**Acceptance Criteria**:
- [ ] Alembic migration system configured
- [ ] Initial migration creates tables:
  - `components` (id, name, type, tokens, requirements, pattern_id, created_at)
  - `patterns` (id, name, version, code, metadata, created_at)
  - `generations` (id, component_id, status, traces, cost, created_at)
  - `cache_entries` (id, key, value, ttl, created_at)
- [ ] Indexes on frequently queried columns
- [ ] `make migrate` applies migrations
- [ ] `make migrate-rollback` works correctly

**Files**:
- `backend/alembic.ini`
- `backend/alembic/env.py`
- `backend/alembic/versions/001_initial_schema.py`
- `backend/src/core/database.py`
- `Makefile` (migrate targets)

---

### Task 5: Seed Qdrant with Initial Patterns
**Acceptance Criteria**:
- [ ] Qdrant collection `patterns` created with config:
  - Vector size: 1536 (text-embedding-3-small)
  - Distance: Cosine
  - Payload schema defined
- [ ] Seed script extracts 2+ shadcn/ui patterns:
  - Button (primary, secondary, ghost variants)
  - Card (with header, content, footer)
- [ ] Patterns include:
  - TypeScript code (AST-parseable)
  - Metadata (props, variants, a11y features)
  - Embeddings pre-computed
- [ ] `make seed-patterns` populates Qdrant
- [ ] Verify via Qdrant dashboard (http://localhost:6333)

**Files**:
- `backend/scripts/seed_patterns.py`
- `backend/data/patterns/button.json`
- `backend/data/patterns/card.json`
- `Makefile` (seed-patterns target)

---

### Task 6: Configure LangSmith Observability
**Acceptance Criteria**:
- [ ] LangSmith project created: `componentforge-dev`
- [ ] Environment variables configured:
  - `LANGCHAIN_TRACING_V2=true`
  - `LANGCHAIN_API_KEY=<key>`
  - `LANGCHAIN_PROJECT=componentforge-dev`
- [ ] Test trace sent to LangSmith successfully
- [ ] Verify trace appears in LangSmith dashboard
- [ ] Documentation in `backend/.env.example`

**Files**:
- `backend/.env.example`
- `backend/src/core/tracing.py` (LangSmith config)
- `backend/tests/test_tracing.py`

---

### Task 7: Create Development Documentation
**Acceptance Criteria**:
- [ ] `CONTRIBUTING.md` includes:
  - Prerequisites (Node 18+, Python 3.11+, Docker)
  - Installation steps (`make install`)
  - Development workflow (`make dev`)
  - Testing commands (`make test`)
  - Code style guidelines (ESLint, black, isort)
  - Commit message conventions
  - PR process
- [ ] `docs/ARCHITECTURE.md` created with:
  - System architecture diagram
  - Data flow diagrams
  - Technology stack overview
- [ ] `README.md` updated with quick start guide

**Files**:
- `CONTRIBUTING.md`
- `docs/ARCHITECTURE.md`
- `README.md`

---

### Task 8: Configure Makefile Automation
**Acceptance Criteria**:
- [ ] `Makefile` includes targets:
  - `make install` - Install all dependencies
  - `make dev` - Start all services (tmux/split terminal)
  - `make test` - Run all tests (backend + frontend)
  - `make lint` - Run linters (ESLint, black, isort)
  - `make migrate` - Apply database migrations
  - `make seed-patterns` - Seed Qdrant patterns
  - `make clean` - Clean build artifacts
  - `make demo` - Prepare demo environment
- [ ] Cross-platform compatible (macOS, Linux)
- [ ] Error handling with clear messages
- [ ] Help target (`make help`) lists all commands

**Files**:
- `Makefile`

---

## Dependencies

**Blockers**: None (this is the foundation)

**Blocks**:
- Epic 1 (needs Figma integration and DB)
- Epic 2 (needs DB and LangSmith)
- Epic 3 (needs Qdrant with seeded patterns)
- Epic 4 (needs all infrastructure)
- Epic 5 (needs generated components)
- Epic 6 (needs caching infrastructure)

---

## Technical Notes

### Docker Services Configuration

**PostgreSQL**:
```yaml
postgres:
  image: postgres:16
  environment:
    POSTGRES_DB: componentforge
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

**Qdrant**:
```yaml
qdrant:
  image: qdrant/qdrant:latest
  ports:
    - "6333:6333"
    - "6334:6334"
  volumes:
    - qdrant_data:/qdrant/storage
```

**Redis**:
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

### Environment Variables Template

**Backend** (`backend/.env.example`):
```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/componentforge

# AI Services
OPENAI_API_KEY=sk-...
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=ls_...
LANGCHAIN_PROJECT=componentforge-dev

# Figma (optional for MVP)
FIGMA_ACCESS_TOKEN=figd_...

# Vector DB
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=  # Optional for local

# Cache
REDIS_URL=redis://localhost:6379/0

# Storage (optional for local dev)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=componentforge-dev
```

**Frontend** (`app/.env.local.example`):
```bash
# Auth
AUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# Feature Flags
NEXT_PUBLIC_ENABLE_FIGMA=true
NEXT_PUBLIC_ENABLE_SCREENSHOT=true
```

### Database Schema (Initial)

```sql
-- Components table
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    tokens JSONB NOT NULL,
    requirements JSONB,
    pattern_id UUID REFERENCES patterns(id),
    code TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Patterns table
CREATE TABLE patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Generations table (audit trail)
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID REFERENCES components(id),
    status VARCHAR(50) NOT NULL,
    traces JSONB,
    cost DECIMAL(10, 6),
    latency_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cache entries
CREATE TABLE cache_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    ttl TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_components_type ON components(type);
CREATE INDEX idx_components_created_at ON components(created_at DESC);
CREATE INDEX idx_generations_component_id ON generations(component_id);
CREATE INDEX idx_cache_key ON cache_entries(key);
CREATE INDEX idx_cache_ttl ON cache_entries(ttl);
```

---

## Testing Strategy

### Unit Tests
- Database connection and migrations
- Environment variable loading
- Docker service health checks

### Integration Tests
- End-to-end `make install` on clean system
- `make dev` starts all services
- Health endpoints return correct status
- Qdrant pattern retrieval works

### Manual Verification
- [ ] Visit http://localhost:3000 (Next.js)
- [ ] Visit http://localhost:8000/docs (FastAPI Swagger)
- [ ] Visit http://localhost:6333/dashboard (Qdrant)
- [ ] Run `psql` to verify PostgreSQL connection
- [ ] Run `redis-cli ping` to verify Redis

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Docker not installed | High | Clear error message with install link |
| Port conflicts (3000, 8000, etc.) | Medium | Document port requirements, provide override |
| Python version mismatch | Medium | Check version in `make install`, provide pyenv guide |
| Node version mismatch | Medium | Check version, provide nvm guide |
| Missing API keys | High | Provide detailed setup guide in CONTRIBUTING.md |
| Qdrant fails to start | Medium | Health check retry logic, clear error messages |

---

## Definition of Done

- [ ] All 8 tasks completed with acceptance criteria met
- [ ] CI/CD pipeline runs `make install && make test` successfully
- [ ] New developer can run `make install && make dev` and see working app
- [ ] All services accessible at documented URLs
- [ ] No manual steps required beyond copying `.env` files
- [ ] Documentation reviewed and approved
- [ ] Demo prepared with seeded data

---

## Related Epics

- **Blocks**: Epic 1, 2, 3, 4, 5, 6, 7, 8
- **Related**: Epic 9 (environment variable security)

---

## Notes

This epic is **critical path** - all other work depends on it. Prioritize completion within first week to unblock all teams.

Consider creating a `scripts/setup.sh` that automates the entire process for even better DX.
