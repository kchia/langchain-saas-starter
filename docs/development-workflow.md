# Development Workflow

Complete guide for developing ComponentForge locally, including setup, debugging, testing, and common development workflows.

## Overview

ComponentForge uses a modern full-stack development workflow with:
- **Hot Reload**: Instant feedback on code changes
- **Type Safety**: TypeScript + Python type hints
- **Testing**: Unit, integration, and E2E tests
- **Linting**: ESLint + Black + isort
- **Observability**: LangSmith tracing for AI operations

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/component-forge.git
cd component-forge
```

### 2. Install Dependencies

```bash
# One-command install (recommended)
make install
```

This installs:
- Frontend dependencies (`app/node_modules`)
- Playwright browsers for E2E testing
- Backend Python virtual environment (`backend/venv`)
- AI dependencies (LangChain, LangGraph, Pillow)
- Environment file templates

**Manual Installation:**

```bash
# Frontend
cd app
npm install
npx playwright install

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy templates
cp backend/.env.example backend/.env
cp app/.env.local.example app/.env.local

# Edit with your API keys
# backend/.env: Add OPENAI_API_KEY, LANGCHAIN_API_KEY
# app/.env.local: Add AUTH_SECRET
```

**Required Environment Variables:**

```bash
# backend/.env
OPENAI_API_KEY=sk-your-openai-api-key
LANGCHAIN_API_KEY=lsv2_your-langchain-key
LANGCHAIN_TRACING_V2=true
DATABASE_URL=postgresql+asyncpg://demo_user:demo_pass@localhost:5432/demo_db
QDRANT_URL=http://localhost:6333
REDIS_URL=redis://localhost:6379

# app/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
AUTH_SECRET=generate-with-openssl-rand-base64-32
```

### 4. Start Services

```bash
# Start Docker services (PostgreSQL, Qdrant, Redis)
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 5. Initialize Database

```bash
cd backend
source venv/bin/activate

# Run migrations
alembic upgrade head

# Seed pattern database (optional)
python scripts/seed_patterns.py
```

### 6. Start Development Servers

```bash
# Terminal 1: Backend (with auto-reload)
cd backend
source venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend (with Fast Refresh)
cd app
npm run dev
```

### 7. Verify Installation

- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Qdrant Dashboard**: http://localhost:6333/dashboard

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Update dependencies (if changed)
cd app && npm install
cd backend && pip install -r requirements.txt

# 3. Run database migrations (if added)
cd backend && alembic upgrade head

# 4. Start services
docker-compose up -d

# 5. Start dev servers (in separate terminals)
cd backend && source venv/bin/activate && uvicorn src.main:app --reload
cd app && npm run dev

# 6. Make changes, test, commit

# 7. Run tests before pushing
make test

# 8. Push changes
git push origin your-branch
```

### Creating a New Feature

**1. Create Feature Branch:**
```bash
git checkout main
git pull
git checkout -b feature/your-feature-name
```

**2. Implement Feature:**

**Backend (Python):**
```python
# backend/src/api/v1/routes/your_feature.py
from fastapi import APIRouter

router = APIRouter(prefix="/your-feature", tags=["your-feature"])

@router.post("/endpoint")
async def create_thing(request: ThingRequest):
    # Implementation
    return {"success": True}
```

**Frontend (TypeScript):**
```typescript
// app/src/app/your-feature/page.tsx
export default function YourFeaturePage() {
  return <div>Your Feature</div>;
}

// app/src/services/api/your-feature.ts
export async function createThing(data: ThingData) {
  const response = await fetch('/api/v1/your-feature/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

**3. Write Tests:**

```bash
# Backend tests
cd backend
pytest tests/api/test_your_feature.py -v

# Frontend tests
cd app
npm test src/services/api/your-feature.test.ts
```

**4. Run Linting:**
```bash
make lint
```

**5. Commit Changes:**
```bash
git add .
git commit -m "feat(your-feature): add new feature

- Implements backend endpoint
- Creates frontend page
- Adds tests and documentation"
```

**6. Push and Create PR:**
```bash
git push origin feature/your-feature-name
# Create pull request on GitHub
```

## Debugging

### Backend Debugging (Python)

**1. Using Print Statements:**
```python
# Simple debugging
print(f"Variable value: {variable}")

# Structured logging (preferred)
from ..core.logging import get_logger

logger = get_logger(__name__)
logger.info("Processing request", extra={"extra": {"user_id": user_id}})
```

**2. Using Python Debugger (pdb):**
```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or use built-in breakpoint()
breakpoint()
```

**3. VS Code Debugger:**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "src.main:app",
        "--reload",
        "--host", "0.0.0.0",
        "--port", "8000"
      ],
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/backend"
      }
    }
  ]
}
```

**4. LangSmith Tracing:**

View AI operations in LangSmith dashboard:
```bash
# Set environment variables
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-key
LANGCHAIN_PROJECT=component-forge-dev

# View traces at https://smith.langchain.com/
```

### Frontend Debugging (Next.js)

**1. Browser DevTools:**
```typescript
// Console logging
console.log('Component rendered', props);

// Debugger statement
debugger;

// React DevTools
// Install extension: React Developer Tools
```

**2. VS Code Debugger:**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "cwd": "${workspaceFolder}/app",
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://\\S+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

**3. Network Inspection:**
```typescript
// Log API calls
const response = await fetch(url);
console.log('Response:', await response.json());

// Use React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

**4. State Debugging (Zustand):**
```typescript
// app/src/store/index.ts
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools((set) => ({
    // State
  }), { name: 'AppStore' })
);

// View in Redux DevTools extension
```

### Database Debugging

**1. Query Logging:**
```python
# backend/.env
LOG_SQL_QUERIES=true

# Logs all SQL queries to console
```

**2. PostgreSQL Console:**
```bash
# Connect to database
docker-compose exec postgres psql -U demo_user -d demo_db

# View tables
\dt

# View schema
\d table_name

# Run query
SELECT * FROM patterns LIMIT 10;
```

**3. Database GUI:**
- **pgAdmin**: https://www.pgadmin.org/
- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/

Connection details:
```
Host: localhost
Port: 5432
User: demo_user
Password: demo_pass
Database: demo_db
```

### Qdrant Debugging

**1. Web Dashboard:**
```bash
# Open browser
http://localhost:6333/dashboard

# View collections, vectors, and search
```

**2. API Debugging:**
```bash
# List collections
curl http://localhost:6333/collections

# Get collection info
curl http://localhost:6333/collections/patterns

# Search vectors
curl -X POST http://localhost:6333/collections/patterns/points/search \
  -H "Content-Type: application/json" \
  -d '{
    "vector": [0.1, 0.2, ...],
    "limit": 5
  }'
```

## Testing

### Running Tests

```bash
# All tests
make test

# Backend tests only
cd backend
source venv/bin/activate
pytest tests/ -v

# Frontend tests only
cd app
npm test

# E2E tests
cd app
npm run test:e2e

# Specific test file
pytest tests/api/test_generation.py -v
npm test src/services/api/generation.test.ts

# With coverage
pytest tests/ --cov=src --cov-report=html
npm test -- --coverage
```

### Writing Tests

**Backend (pytest):**

```python
# tests/api/test_your_feature.py
import pytest
from httpx import AsyncClient
from src.main import app

@pytest.mark.asyncio
async def test_create_thing():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/your-feature/endpoint",
            json={"name": "Test Thing"}
        )
        assert response.status_code == 200
        assert response.json()["success"] is True
```

**Frontend (Jest + React Testing Library):**

```typescript
// src/services/api/your-feature.test.ts
import { createThing } from './your-feature';

describe('createThing', () => {
  it('should create thing successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true })
      })
    );

    const result = await createThing({ name: 'Test' });
    expect(result.success).toBe(true);
  });
});
```

**E2E (Playwright):**

```typescript
// e2e/your-feature.spec.ts
import { test, expect } from '@playwright/test';

test('user can create thing', async ({ page }) => {
  await page.goto('http://localhost:3000/your-feature');
  await page.fill('input[name="name"]', 'Test Thing');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

## Code Quality

### Linting

```bash
# Run linters and auto-fix
make lint

# Check without fixing
make lint-check

# Backend only (Black + isort)
cd backend
black src/ tests/
isort src/ tests/

# Frontend only (ESLint)
cd app
npm run lint:fix
```

### Type Checking

**TypeScript:**
```bash
cd app
npm run type-check
```

**Python:**
```bash
cd backend
mypy src/
```

### Pre-commit Hooks

Install pre-commit hooks to run checks automatically:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

Create `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.44.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
        types: [file]
```

## Common Development Tasks

### Adding a New API Endpoint

1. **Create route file:**
   ```python
   # backend/src/api/v1/routes/new_endpoint.py
   from fastapi import APIRouter

   router = APIRouter(prefix="/new-endpoint", tags=["new-endpoint"])

   @router.get("/")
   async def get_things():
       return {"things": []}
   ```

2. **Register router:**
   ```python
   # backend/src/api/v1/api.py
   from .routes import new_endpoint

   api_router.include_router(new_endpoint.router)
   ```

3. **Add tests:**
   ```python
   # tests/api/test_new_endpoint.py
   async def test_get_things():
       # Test implementation
       pass
   ```

4. **Update OpenAPI docs:**
   ```python
   # backend/src/api/v1/routes/new_endpoint.py
   @router.get(
       "/",
       response_model=ThingsResponse,
       summary="Get all things",
       description="Returns a list of all things"
   )
   ```

### Adding a New Frontend Page

1. **Create page component:**
   ```typescript
   // app/src/app/new-page/page.tsx
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. **Add navigation:**
   ```typescript
   // app/src/components/Navigation.tsx
   <Link href="/new-page">New Page</Link>
   ```

3. **Add API service:**
   ```typescript
   // app/src/services/api/new-feature.ts
   export async function fetchThings() {
     const response = await fetch('/api/v1/new-endpoint');
     return response.json();
   }
   ```

4. **Add tests:**
   ```typescript
   // app/src/app/new-page/page.test.tsx
   import { render, screen } from '@testing-library/react';
   import NewPage from './page';

   test('renders new page', () => {
     render(<NewPage />);
     expect(screen.getByText('New Page')).toBeInTheDocument();
   });
   ```

### Adding a Database Migration

1. **Create migration:**
   ```bash
   cd backend
   source venv/bin/activate
   alembic revision --autogenerate -m "add new table"
   ```

2. **Review generated migration:**
   ```python
   # backend/alembic/versions/xxx_add_new_table.py
   def upgrade():
       op.create_table(
           'new_table',
           sa.Column('id', sa.Integer(), primary_key=True),
           sa.Column('name', sa.String(), nullable=False)
       )

   def downgrade():
       op.drop_table('new_table')
   ```

3. **Test migration:**
   ```bash
   # Apply
   alembic upgrade head

   # Rollback (test downgrade)
   alembic downgrade -1

   # Re-apply
   alembic upgrade head
   ```

4. **Update models:**
   ```python
   # backend/src/models/new_table.py
   from sqlalchemy import Column, Integer, String
   from ..database import Base

   class NewTable(Base):
       __tablename__ = "new_table"

       id = Column(Integer, primary_key=True)
       name = Column(String, nullable=False)
   ```

### Updating Dependencies

**Frontend:**
```bash
cd app

# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages
npm update

# Update to latest (major versions)
npx npm-check-updates -u
npm install
```

**Backend:**
```bash
cd backend

# Check for updates
pip list --outdated

# Update specific package
pip install --upgrade package-name

# Update requirements.txt
pip freeze > requirements.txt
```

## Common Issues and Solutions

### Issue: Docker services won't start

**Symptom**: `docker-compose up -d` fails

**Solutions**:
```bash
# Check if Docker daemon is running
docker info

# Restart Docker Desktop

# Remove old containers
docker-compose down -v
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Issue: Backend won't start

**Symptom**: `uvicorn src.main:app` fails with import errors

**Solutions**:
```bash
# Verify virtual environment is activated
which python  # Should show venv/bin/python

# Reinstall dependencies
pip install -r requirements.txt

# Check environment variables
cat backend/.env

# Verify database is running
docker-compose ps postgres
```

### Issue: Frontend build errors

**Symptom**: `npm run dev` fails with TypeScript errors

**Solutions**:
```bash
# Clear cache
rm -rf app/.next

# Reinstall dependencies
cd app
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npm list typescript
```

### Issue: Database connection errors

**Symptom**: `sqlalchemy.exc.OperationalError: could not connect`

**Solutions**:
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U demo_user -d demo_db

# Check DATABASE_URL in backend/.env
echo $DATABASE_URL
```

### Issue: AI features not working

**Symptom**: OpenAI API errors or LangSmith not tracing

**Solutions**:
```bash
# Verify API keys
echo $OPENAI_API_KEY
echo $LANGCHAIN_API_KEY

# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check LangSmith tracing
LANGCHAIN_TRACING_V2=true
```

### Issue: Tests failing

**Symptom**: `make test` shows failures

**Solutions**:
```bash
# Run tests individually to isolate issue
pytest tests/api/test_specific.py -v

# Check test environment
pytest --collect-only

# Clear test cache
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type d -name ".pytest_cache" -exec rm -rf {} +

# Reinstall test dependencies
pip install -r requirements.txt
```

## Performance Tips

### Faster Development Server Startup

**Backend:**
```bash
# Use --reload-dir to watch specific directories only
uvicorn src.main:app --reload --reload-dir src/

# Reduce worker count in development
uvicorn src.main:app --reload --workers 1
```

**Frontend:**
```bash
# Use turbopack (experimental)
npm run dev -- --turbo

# Disable source maps in development
# next.config.js
productionBrowserSourceMaps: false
```

### Faster Tests

```bash
# Run tests in parallel
pytest tests/ -n auto

# Run only failed tests
pytest --lf

# Run specific test markers
pytest -m "not slow"
```

### Faster Builds

```bash
# Cache dependencies
npm ci --prefer-offline

# Use build cache
docker-compose build --pull --build-arg BUILDKIT_INLINE_CACHE=1
```

## IDE Setup

### VS Code

**Recommended Extensions:**
- Python (ms-python.python)
- Pylance (ms-python.vscode-pylance)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- GitLens (eamodio.gitlens)

**Settings (`settings.json`):**
```json
{
  "python.defaultInterpreterPath": "backend/venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  }
}
```

### PyCharm

1. **Configure Python Interpreter**: Settings → Project → Python Interpreter → Add → Existing Environment → `backend/venv/bin/python`
2. **Enable Django Support**: Settings → Languages & Frameworks → Django → Enable Django Support
3. **Configure Database**: View → Tool Windows → Database → Add PostgreSQL datasource

## See Also

- [Deployment Guide](./deployment.md) - Production deployment
- [Architecture Overview](./architecture/overview.md) - System design
- [API Reference](./api/overview.md) - API documentation
- [Contributing Guide](./getting-started/contributing.md) - Contribution guidelines
- [Testing Guide](./testing/integration-testing.md) - Testing strategies
