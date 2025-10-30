# **EPIC: Extract Production-Ready LangChain SaaS Starter Template**

## **Epic Overview**

**Epic ID:** STARTER-001
**Title:** Extract ComponentForge Infrastructure into Reusable LangChain Web Starter
**Type:** Infrastructure / Product Development
**Priority:** High
**Estimated Duration:** 3-4 weeks (64-80 hours)
**Target Release:** Q2 2025

---

## **Epic Goal**

Create a production-ready, open-source starter template for building LangChain/LangGraph web applications with RAG capabilities, extracted from ComponentForge's battle-tested infrastructure.

**Success Definition:**

- A developer can go from `git clone` to deployed AI SaaS in < 4 hours
- Template saves 85-125 hours per new AI project
- 100% test coverage on infrastructure code
- Complete documentation with video walkthrough
- 3+ successful pilot projects validating the template

---

## **Strategic Context**

### **Why This Matters:**

1. **Market Gap:** No production-ready LangChain + Next.js starter exists with security, testing, and observability built-in
2. **Proven Infrastructure:** ComponentForge validates patterns over 6 months of development
3. **Open Source Value:** Gives back to community while building reputation
4. **Future Projects:** Accelerates all future AI SaaS development

### **Target Audience:**

- AI engineers building RAG applications
- Startups creating AI-powered SaaS products
- Teams using LangChain/LangGraph in production
- Developers wanting to learn production AI patterns

---

## **Epic Structure**

```
EPIC: Extract LangChain SaaS Starter
├── Phase 1: Infrastructure Audit & Preparation (Week 1)
│   ├── Story 1.1: Complete dependency audit
│   ├── Story 1.2: Add missing infrastructure (migrations, auth)
│   ├── Story 1.3: Create deployment configurations
│   └── Story 1.4: Add pre-commit hooks
│
├── Phase 2: Extraction & Genericization (Week 2)
│   ├── Story 2.1: Extract core backend infrastructure
│   ├── Story 2.2: Extract frontend scaffolding
│   ├── Story 2.3: Remove business logic systematically
│   ├── Story 2.4: Create placeholder examples
│   └── Story 2.5: Genericize documentation
│
├── Phase 3: Template Features & Polish (Week 3)
│   ├── Story 3.1: Build interactive setup wizard
│   ├── Story 3.2: Add example implementations
│   ├── Story 3.3: Create customization guides
│   ├── Story 3.4: Build example agents
│   └── Story 3.5: Add architecture decision templates
│
└── Phase 4: Validation & Release (Week 4)
    ├── Story 4.1: Test fresh installation flow
    ├── Story 4.2: Build 2-3 pilot projects
    ├── Story 4.3: Create video walkthrough
    ├── Story 4.4: Prepare marketing materials
    └── Story 4.5: Launch and gather feedback
```

---

# **PHASE 1: Infrastructure Audit & Preparation**

## **Story 1.1: Complete Dependency Audit**

**As a** template maintainer
**I want to** audit all dependencies and remove ComponentForge-specific packages
**So that** the starter template only includes universally useful dependencies

### **Acceptance Criteria:**

- [ ] Create dependency matrix (frontend + backend)
- [ ] Identify ComponentForge-specific dependencies
- [ ] Mark dependencies as: Keep / Remove / Make Optional
- [ ] Document why each dependency is included
- [ ] Create `DEPENDENCIES.md` explaining the stack

### **Tasks:**

1. Analyze `app/package.json` - identify all dependencies
2. Analyze `backend/requirements.txt` - identify all dependencies
3. Create dependency decision matrix in spreadsheet
4. Flag: Figma SDK (remove), OpenAI (keep), LangChain (keep), etc.
5. Test minimal dependency set works

### **Definition of Done:**

- [ ] Dependency matrix documented
- [ ] Unnecessary dependencies removed
- [ ] All kept dependencies justified in docs
- [ ] Fresh install works with new dependency list

**Effort:** 4 hours
**Dependencies:** None
**Risk:** Low

---

## **Story 1.2: Add Missing Infrastructure**

**As a** template user
**I want** complete infrastructure scaffolding (migrations, auth, examples)
**So that** I don't hit missing pieces when building my app

### **Acceptance Criteria:**

- [ ] Alembic migrations directory structure created
- [ ] Example migration file added with comments
- [ ] Auth.js v5 configuration scaffolding added
- [ ] Example auth provider configurations documented
- [ ] Example CRUD API route created
- [ ] Database seeder script example added

### **Tasks:**

#### **1.2.1: Database Migrations**

```bash
backend/alembic/
├── env.py                    # Alembic environment config
├── script.py.mako           # Migration template
└── versions/
    └── 001_initial_setup.py  # Example migration
```

**Implementation:**

```python
# backend/alembic/versions/001_initial_setup.py
"""Initial database setup

Revision ID: 001
Create Date: 2025-01-15
"""

from alembic import op
import sqlalchemy as sa

# Placeholder migration - customize for your app
def upgrade():
    # Example: Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(), unique=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
    )

def downgrade():
    op.drop_table('users')
```

#### **1.2.2: Authentication Scaffolding**

```typescript
// app/auth.config.ts
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  providers: [
    Credentials({
      // TODO: Implement your credential validation
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // TODO: Validate against your database
        // Example implementation:
        // const user = await db.user.findUnique(...)
        // if (user && await bcrypt.compare(...)) return user
        return null; // Replace with actual logic
      }
    })
  ]
  // TODO: Add your JWT and session configuration
} satisfies NextAuthConfig;
```

#### **1.2.3: Example CRUD Route**

```python
# backend/src/api/v1/routes/example.py
"""
Example CRUD API route

This demonstrates the patterns used in this starter:
- Pydantic models for request/response
- Async SQLAlchemy patterns
- Error handling with custom exceptions
- LangSmith tracing
- Structured logging
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from pydantic import BaseModel

from ...core.database import get_db
from ...core.tracing import traced
from ...core.logging import get_logger

router = APIRouter(prefix="/example", tags=["example"])
logger = get_logger(__name__)

# TODO: Define your Pydantic models
class ItemCreate(BaseModel):
    name: str
    description: str

class ItemResponse(BaseModel):
    id: int
    name: str
    description: str

@router.post("/items", response_model=ItemResponse)
@traced(run_name="create_item")
async def create_item(
    item: ItemCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new item - replace with your logic"""
    # TODO: Implement your database logic
    logger.info(f"Creating item: {item.name}")
    raise HTTPException(501, "TODO: Implement database logic")

# TODO: Add GET, UPDATE, DELETE endpoints following this pattern
```

### **Definition of Done:**

- [ ] Alembic directory structure exists with example migration
- [ ] Migration can be run successfully: `alembic upgrade head`
- [ ] Auth.js config file exists with TODOs and examples
- [ ] Example CRUD route exists with comprehensive comments
- [ ] All examples are well-documented with inline TODOs

**Effort:** 8 hours
**Dependencies:** Story 1.1
**Risk:** Low

---

## **Story 1.3: Create Deployment Configurations**

**As a** template user
**I want** deployment configurations for common platforms
**So that** I can deploy my app to production easily

### **Acceptance Criteria:**

- [ ] Vercel configuration for frontend deployment
- [ ] Railway/Render configuration for backend deployment
- [ ] Dockerfile for backend containerization
- [ ] .dockerignore configured properly
- [ ] Environment variable checklist for production
- [ ] Deployment guide with step-by-step instructions

### **Tasks:**

#### **1.3.1: Frontend Deployment (Vercel)**

```json
// vercel.json
{
  "buildCommand": "cd app && npm run build",
  "outputDirectory": "app/.next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url",
    "AUTH_SECRET": "@auth_secret"
  },
  "regions": ["sfo1"],
  "functions": {
    "app/src/app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

#### **1.3.2: Backend Deployment (Railway/Render)**

```toml
# railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "uvicorn src.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini .

# Run migrations and start app
CMD alembic upgrade head && \
    uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

#### **1.3.3: Deployment Guide**

```markdown
# docs/deployment/PRODUCTION.md

## Deployment Checklist

### Environment Variables

- [ ] OPENAI_API_KEY (required for AI features)
- [ ] DATABASE_URL (PostgreSQL connection string)
- [ ] REDIS_URL (Redis connection string)
- [ ] QDRANT_URL (Qdrant vector database)
- [ ] LANGCHAIN_API_KEY (for tracing)
- [ ] AUTH_SECRET (32+ character random string)

### Frontend (Vercel)

1. Connect GitHub repository
2. Select "app" as root directory
3. Set environment variables from checklist
4. Deploy

### Backend (Railway)

1. Connect GitHub repository
2. Select "Dockerfile" builder
3. Set environment variables
4. Add PostgreSQL, Redis, Qdrant services
5. Deploy
```

### **Definition of Done:**

- [ ] All deployment configs created and tested
- [ ] Dockerfile builds successfully
- [ ] Deployment guide complete with screenshots
- [ ] Environment variable checklist documented
- [ ] Example `.env.production` template added

**Effort:** 6 hours
**Dependencies:** None
**Risk:** Medium (platform-specific issues)

---

## **Story 1.4: Add Pre-commit Hooks**

**As a** template user
**I want** automatic code quality checks before commits
**So that** I catch errors early and maintain code quality

### **Acceptance Criteria:**

- [ ] `.pre-commit-config.yaml` configured
- [ ] Hooks run linting, formatting, and type checking
- [ ] Hooks are optional (documented how to skip)
- [ ] Installation instructions in README
- [ ] Hooks run in < 10 seconds for typical changes

### **Tasks:**

```yaml
# .pre-commit-config.yaml
repos:
  # Python
  - repo: https://github.com/psf/black
    rev: 24.1.1
    hooks:
      - id: black
        files: ^backend/

  - repo: https://github.com/PyCQA/isort
    rev: 5.13.2
    hooks:
      - id: isort
        files: ^backend/

  - repo: https://github.com/PyCQA/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
        files: ^backend/
        args: [--max-line-length=88, --extend-ignore=E203]

  # TypeScript/JavaScript
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v9.0.0
    hooks:
      - id: eslint
        files: ^app/
        types: [file]
        types_or: [javascript, jsx, ts, tsx]

  # General
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
        args: [--maxkb=1000]
      - id: check-merge-conflict
```

````markdown
# docs/development/PRE_COMMIT_HOOKS.md

## Pre-commit Hooks

### Installation

```bash
pip install pre-commit
pre-commit install
```
````

### Skipping Hooks (Emergency)

```bash
git commit --no-verify -m "Emergency fix"
```

### Running Manually

```bash
pre-commit run --all-files
```

````

### **Definition of Done:**
- [ ] `.pre-commit-config.yaml` exists and works
- [ ] Documentation added to README
- [ ] Hooks tested on sample commits
- [ ] Instructions for skipping hooks documented

**Effort:** 2 hours
**Dependencies:** None
**Risk:** Low

---

**Phase 1 Total Effort:** 20 hours
**Phase 1 Duration:** 1 week (part-time) or 2.5 days (full-time)

---

# **PHASE 2: Extraction & Genericization**

## **Story 2.1: Extract Core Backend Infrastructure**

**As a** template maintainer
**I want to** extract all reusable backend infrastructure
**So that** users get a production-ready FastAPI foundation

### **Acceptance Criteria:**
- [ ] Core utilities preserved (`src/core/`)
- [ ] Middleware chain intact (`src/api/middleware/`)
- [ ] Security module complete (`src/security/`)
- [ ] Testing infrastructure copied (`tests/`, `conftest.py`)
- [ ] All ComponentForge-specific code removed
- [ ] Placeholder routes added

### **Tasks:**

#### **2.1.1: Copy Core Infrastructure**
```bash
# Files to KEEP (copy to starter)
backend/src/core/
├── __init__.py
├── cache.py          # Redis caching patterns ✅
├── confidence.py     # ❌ REMOVE (ComponentForge-specific)
├── database.py       # SQLAlchemy async setup ✅
├── defaults.py       # ❌ REMOVE (ComponentForge-specific)
├── errors.py         # Circuit breakers, retry logic ✅
├── logging.py        # Structured JSON logging ✅
├── models.py         # ❌ REMOVE (business models)
└── tracing.py        # LangSmith integration ✅

backend/src/api/middleware/
├── __init__.py
├── logging.py              # Request/response logging ✅
├── rate_limit_middleware.py # Rate limiting ✅
└── session_tracking.py      # Session tracking ✅

backend/src/security/
├── __init__.py
├── code_sanitizer.py   # Code security scanning ✅
├── input_validator.py  # Input validation ✅
├── metrics.py          # Security metrics ✅
├── pii_detector.py     # PII detection ✅
├── rate_limiter.py     # Rate limiter core ✅
└── README.md           # Security documentation ✅
````

#### **2.1.2: Remove Business Logic**

```bash
# Files to DELETE (ComponentForge-specific)
backend/src/agents/          # Token extraction agents ❌
backend/src/retrieval/       # Pattern retrieval ❌
backend/src/generation/      # Code generation ❌
backend/src/prompts/         # ComponentForge prompts ❌
backend/src/services/figma_client.py     ❌
backend/src/services/image_processor.py  ❌
backend/src/services/token_exporter.py   ❌

# Keep but genericize
backend/src/services/retrieval_service.py → example_service.py
```

#### **2.1.3: Create Placeholder Main App**

```python
# backend/src/main.py (simplified)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.logging import init_logging_from_env, get_logger
from .api.middleware.logging import LoggingMiddleware
from .api.middleware.rate_limit_middleware import RateLimitMiddleware
from .api.middleware.session_tracking import SessionTrackingMiddleware
from .core.tracing import init_tracing

# Initialize logging
init_logging_from_env()
logger = get_logger(__name__)

# Initialize tracing
init_tracing()

app = FastAPI(
    title="LangChain SaaS Starter API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # TODO: Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add middleware chain
app.add_middleware(SessionTrackingMiddleware)
app.add_middleware(LoggingMiddleware, skip_paths=["/health", "/metrics", "/docs"])
app.add_middleware(RateLimitMiddleware)

@app.get("/health")
async def health():
    return {"status": "healthy"}

# TODO: Import and register your API routes here
# from .api.v1.routes import example
# app.include_router(example.router, prefix="/api/v1")

logger.info("Application started successfully")
```

### **Definition of Done:**

- [ ] All generic infrastructure copied
- [ ] All business logic removed
- [ ] Tests still pass (after adapting)
- [ ] Main app is clean placeholder
- [ ] Documentation updated with TODOs

**Effort:** 12 hours
**Dependencies:** Phase 1 complete
**Risk:** Medium (breaking tests during removal)

---

## **Story 2.2: Extract Frontend Scaffolding**

**As a** template user
**I want** a clean Next.js 15 setup with shadcn/ui
**So that** I can build my AI frontend quickly

### **Acceptance Criteria:**

- [ ] App Router structure preserved
- [ ] shadcn/ui components (11 base components) included
- [ ] Layout components (Navigation, Footer) genericized
- [ ] Providers setup (TanStack Query, Zustand) intact
- [ ] Storybook configuration working
- [ ] All ComponentForge pages removed
- [ ] Example pages added

### **Tasks:**

#### **2.2.1: Keep Core Structure**

```bash
app/src/
├── app/
│   ├── layout.tsx          # Root layout ✅
│   ├── page.tsx            # Home page (genericize) ⚠️
│   ├── providers.tsx       # Query + Zustand ✅
│   ├── globals.css         # Tailwind + CSS vars ✅
│   └── api/               # ❌ DELETE (no API routes in this architecture)
├── components/
│   ├── ui/                # shadcn/ui components ✅
│   └── layout/            # Nav, Footer (genericize) ⚠️
├── hooks/                 # Custom hooks ✅ (keep useful ones)
├── lib/
│   ├── utils.ts          # cn() helper ✅
│   └── api/              # API client (genericize) ⚠️
├── stores/               # Zustand stores (remove business) ⚠️
└── types/                # TypeScript types (remove business) ⚠️
```

#### **2.2.2: Create Generic Home Page**

```tsx
// app/src/app/page.tsx
export default function Home() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">LangChain SaaS Starter</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Production-ready Next.js + FastAPI + LangChain starter template
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {/* TODO: Add your feature cards here */}
          <FeatureCard
            title="🤖 AI Agents"
            description="LangGraph multi-agent orchestration"
          />
          <FeatureCard
            title="🔍 Vector Search"
            description="Qdrant RAG implementation"
          />
          <FeatureCard
            title="🔒 Production Ready"
            description="Security, testing, monitoring built-in"
          />
        </div>
      </div>
    </main>
  );
}
```

#### **2.2.3: Genericize API Client**

```typescript
// app/src/lib/api/client.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// TODO: Add your API endpoints here
// Example:
// export const exampleAPI = {
//   list: () => apiClient.get('/api/v1/example'),
//   create: (data) => apiClient.post('/api/v1/example', data),
// }
```

### **Definition of Done:**

- [ ] Clean App Router structure
- [ ] All shadcn/ui components working
- [ ] Generic home page renders
- [ ] Storybook starts successfully
- [ ] No broken imports or references

**Effort:** 10 hours
**Dependencies:** Story 2.1
**Risk:** Medium

---

## **Story 2.3: Remove Business Logic Systematically**

**As a** template maintainer
**I want** a systematic process for removing business logic
**So that** the extraction is consistent and complete

### **Acceptance Criteria:**

- [ ] Checklist of all files reviewed
- [ ] All ComponentForge references removed
- [ ] All placeholder TODOs added
- [ ] No broken imports
- [ ] All tests adapted or removed
- [ ] Git history preserved

### **Tasks:**

#### **2.3.1: Create Removal Checklist**

```markdown
## Business Logic Removal Checklist

### Backend

- [ ] agents/ directory (delete)
- [ ] retrieval/ directory (delete)
- [ ] generation/ directory (delete)
- [ ] prompts/ directory (delete)
- [ ] services/figma_client.py (delete)
- [ ] services/image_processor.py (delete)
- [ ] api/v1/routes/tokens.py (delete)
- [ ] api/v1/routes/requirements.py (delete)
- [ ] api/v1/routes/generation.py (delete)
- [ ] api/v1/routes/evaluation.py (delete)
- [ ] core/confidence.py (delete)
- [ ] core/defaults.py (delete)
- [ ] core/models.py (delete)

### Frontend

- [ ] app/extract/ (delete)
- [ ] app/patterns/ (delete)
- [ ] app/preview/ (delete)
- [ ] app/requirements/ (delete)
- [ ] app/evaluation/ (delete)
- [ ] components/tokens/ (delete)
- [ ] components/requirements/ (delete)
- [ ] components/patterns/ (delete)
- [ ] stores/useTokenStore.ts (delete)
- [ ] types/component.types.ts (delete)
- [ ] types/token.types.ts (delete)

### Tests (adapt or delete)

- [ ] tests/generation/ (delete)
- [ ] tests/evaluation/ (delete)
- [ ] e2e/token-extraction.spec.ts (delete)
- [ ] e2e/pattern-selection.spec.ts (delete)
```

#### **2.3.2: Search and Replace Script**

```bash
#!/bin/bash
# scripts/remove_business_logic.sh

echo "Removing ComponentForge business logic..."

# Remove directories
rm -rf backend/src/agents
rm -rf backend/src/retrieval
rm -rf backend/src/generation
rm -rf backend/src/prompts

# Remove frontend pages
rm -rf app/src/app/extract
rm -rf app/src/app/patterns
rm -rf app/src/app/preview
rm -rf app/src/app/requirements

# Search for remaining references
echo "Checking for remaining 'ComponentForge' references..."
grep -r "ComponentForge" backend/src app/src || echo "✅ No references found"

echo "Checking for remaining 'token extraction' references..."
grep -ri "token.extraction" backend/src app/src || echo "✅ No references found"

echo "✅ Business logic removal complete"
```

### **Definition of Done:**

- [ ] All items in checklist completed
- [ ] Search finds no ComponentForge references
- [ ] Tests pass (after adaptation)
- [ ] No broken imports

**Effort:** 8 hours
**Dependencies:** Stories 2.1, 2.2
**Risk:** High (potential for missed dependencies)

---

## **Story 2.4: Create Placeholder Examples**

**As a** template user
**I want** working examples of key patterns
**So that** I understand how to extend the starter

### **Acceptance Criteria:**

- [ ] Example LangChain agent implementation
- [ ] Example RAG query implementation
- [ ] Example API route with full patterns
- [ ] Example frontend page with API integration
- [ ] Example test for each pattern
- [ ] All examples well-commented

### **Tasks:**

#### **2.4.1: Example LangChain Agent**

```python
# backend/src/agents/example_agent.py
"""
Example LangChain Agent

This demonstrates the patterns for building agents in this starter:
- LangChain LCEL chains
- LangSmith tracing
- Structured logging
- Error handling
"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

from ..core.tracing import traced
from ..core.logging import get_logger

logger = get_logger(__name__)

class ExampleAgent:
    """
    Example agent that processes user queries.

    TODO: Replace this with your actual agent logic.
    """

    def __init__(self, model_name: str = "gpt-4"):
        self.model = ChatOpenAI(model=model_name, temperature=0)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful AI assistant."),
            ("user", "{input}")
        ])

        # Build LCEL chain
        self.chain = self.prompt | self.model | StrOutputParser()

    @traced(run_name="example_agent")
    async def process(self, user_input: str) -> str:
        """
        Process user input and return response.

        Args:
            user_input: User's question or request

        Returns:
            AI-generated response
        """
        try:
            logger.info(f"Processing input: {user_input[:50]}...")

            response = await self.chain.ainvoke({"input": user_input})

            logger.info("Response generated successfully")
            return response

        except Exception as e:
            logger.error(f"Agent processing failed: {e}", exc_info=True)
            raise
```

#### **2.4.2: Example RAG Implementation**

```python
# backend/src/agents/example_rag.py
"""
Example RAG (Retrieval-Augmented Generation) Implementation

Shows how to:
- Query Qdrant vector store
- Retrieve relevant documents
- Augment prompt with context
- Generate response with LangChain
"""

from typing import List
from qdrant_client import QdrantClient
from langchain_openai import OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate

from ..core.tracing import traced

class ExampleRAG:
    def __init__(self, collection_name: str = "documents"):
        self.qdrant = QdrantClient(url="http://localhost:6333")
        self.embeddings = OpenAIEmbeddings()
        self.collection_name = collection_name

    @traced(run_name="example_rag_query")
    async def query(self, question: str, top_k: int = 3) -> dict:
        """
        Perform RAG query.

        TODO: Customize this for your use case.
        """
        # 1. Generate query embedding
        query_embedding = await self.embeddings.aembed_query(question)

        # 2. Search vector store
        results = self.qdrant.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            limit=top_k
        )

        # 3. Extract context from results
        context = "\n\n".join([
            r.payload.get("content", "") for r in results
        ])

        # 4. Build prompt with context
        prompt = f"""Answer based on the following context:

{context}

Question: {question}

Answer:"""

        # TODO: Add your LLM call here

        return {
            "context": context,
            "results_count": len(results),
            "question": question
        }
```

#### **2.4.3: Example Frontend Page**

```tsx
// app/src/app/example/page.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// TODO: Replace with your actual API client
const exampleAPI = {
  query: async (input: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/example/query`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input })
      }
    );
    return response.json();
  }
};

export default function ExamplePage() {
  const [input, setInput] = useState("");

  const mutation = useMutation({
    mutationFn: exampleAPI.query,
    onSuccess: (data) => {
      console.log("Success:", data);
    },
    onError: (error) => {
      console.error("Error:", error);
    }
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Example AI Query</h1>

      <Card className="p-6 max-w-2xl">
        <div className="space-y-4">
          <Input
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <Button
            onClick={() => mutation.mutate(input)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Processing..." : "Submit"}
          </Button>

          {mutation.data && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <pre>{JSON.stringify(mutation.data, null, 2)}</pre>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
```

### **Definition of Done:**

- [ ] All example files created
- [ ] Examples run successfully
- [ ] Tests for examples pass
- [ ] Examples referenced in documentation

**Effort:** 10 hours
**Dependencies:** Stories 2.1, 2.2, 2.3
**Risk:** Low

---

## **Story 2.5: Genericize Documentation**

**As a** template user
**I want** documentation focused on the starter, not ComponentForge
**So that** I can learn the template quickly

### **Acceptance Criteria:**

- [ ] README.md completely rewritten for starter
- [ ] CLAUDE.md genericized with placeholders
- [ ] BASE-COMPONENTS.md reviewed and updated
- [ ] All docs references to ComponentForge removed
- [ ] Quick start guide works end-to-end
- [ ] Architecture docs reflect starter, not ComponentForge

### **Tasks:**

#### **2.5.1: New README.md**

```markdown
# 🚀 LangChain SaaS Starter

Production-ready Next.js 15 + FastAPI + LangChain starter for building AI-powered web applications.

## ✨ Features

- **🤖 AI-First Architecture**: LangChain/LangGraph for complex AI workflows
- **⚡ Modern Stack**: Next.js 15, React 19, FastAPI, TypeScript
- **🔍 RAG Ready**: Qdrant vector database, embeddings, semantic search
- **🔒 Production Security**: PII detection, code sanitization, rate limiting
- **📊 Observability**: LangSmith tracing, Prometheus metrics, structured logging
- **🧪 Battle-Tested**: 100+ tests, E2E coverage, accessibility testing
- **🐳 Docker Ready**: PostgreSQL, Redis, Qdrant via Docker Compose

## 🏗️ Architecture
```

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Next.js 15 │◄────►│ FastAPI │◄────►│ Services │
│ Frontend │ │ + LangChain│ │ (Docker) │
│ │ │ │ │ │
│ • shadcn/ui │ │ • Agents │ │ • PostgreSQL│
│ • Zustand │ │ • RAG │ │ • Qdrant │
│ • Tailwind │ │ • Tracing │ │ • Redis │
└─────────────┘ └─────────────┘ └─────────────┘

````

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/yourusername/langchain-saas-starter
cd langchain-saas-starter
make install

# 2. Configure environment
cp backend/.env.example backend/.env
cp app/.env.local.example app/.env.local
# Edit .env files with your API keys

# 3. Start services
make dev

# 4. Open in browser
open http://localhost:3000
````

## 📚 Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [API Reference](docs/api/README.md)
- [Deployment Guide](docs/deployment/PRODUCTION.md)
- [Development Guide](docs/development/README.md)

## 🛠️ Built With

- [Next.js 15](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [LangChain](https://langchain.com/) - AI framework
- [LangGraph](https://langchain-ai.github.io/langgraph/) - Agent orchestration
- [Qdrant](https://qdrant.tech/) - Vector database
- [shadcn/ui](https://ui.shadcn.com/) - Component library

## 📄 License

MIT License - see [LICENSE](LICENSE)

````

#### **2.5.2: Genericize CLAUDE.md**
```markdown
# CLAUDE.md

**Instructions for Claude Code when working with this starter template.**

## Tech Stack

### Frontend
- **Next.js 15.5.4** with App Router
- **shadcn/ui** component library
- **Tailwind CSS v4** for styling
- **Zustand** for client state
- **TanStack Query** for server state

### Backend
- **FastAPI** for async API
- **LangChain/LangGraph** for AI orchestration
- **LangSmith** for AI observability
- **PostgreSQL** for data persistence
- **Qdrant** for vector search
- **Redis** for caching

## Development Commands

```bash
make install    # Install all dependencies
make dev        # Start development servers
make test       # Run all tests
make lint       # Run linters
````

## Key Patterns

1. **Always check BASE-COMPONENTS.md before creating UI components**
2. **Use LangSmith tracing for all AI operations**
3. **Follow async patterns in FastAPI**
4. **Use shadcn/ui components, don't recreate from scratch**
5. **Add tests for all new features**

## TODO: Customize for Your Project

- Update this file with your project-specific patterns
- Add your API endpoints to the list
- Document your AI agent architecture
- Add your deployment targets

````

### **Definition of Done:**
- [ ] README.md focuses on starter template
- [ ] No ComponentForge references in docs
- [ ] Quick start guide tested end-to-end
- [ ] CLAUDE.md has clear TODOs for customization

**Effort:** 6 hours
**Dependencies:** All Phase 2 stories
**Risk:** Low

---

**Phase 2 Total Effort:** 46 hours
**Phase 2 Duration:** 1.5 weeks (part-time) or 6 days (full-time)

---

# **PHASE 3: Template Features & Polish**

## **Story 3.1: Build Interactive Setup Wizard**

**As a** template user
**I want** an interactive CLI wizard to customize my installation
**So that** I get exactly the configuration I need

### **Acceptance Criteria:**
- [ ] Interactive CLI prompts for configuration
- [ ] Wizard asks about: project name, database choice, AI providers, deployment target
- [ ] Wizard updates all config files automatically
- [ ] Wizard runs npm/pip install
- [ ] Wizard validates API keys
- [ ] Success message with next steps

### **Tasks:**

```typescript
// scripts/setup-wizard.ts
import { input, confirm, select } from '@inquirer/prompts'
import fs from 'fs'
import { execSync } from 'child_process'

async function runSetupWizard() {
  console.log('🚀 LangChain SaaS Starter Setup Wizard\n')

  // Project basics
  const projectName = await input({
    message: 'Project name:',
    default: 'my-ai-app'
  })

  // AI provider
  const aiProvider = await select({
    message: 'AI Provider:',
    choices: [
      { name: 'OpenAI (GPT-4)', value: 'openai' },
      { name: 'Anthropic (Claude)', value: 'anthropic' },
      { name: 'Both', value: 'both' }
    ]
  })

  // Database
  const usePostgres = await confirm({
    message: 'Use PostgreSQL for data persistence?',
    default: true
  })

  // Vector DB
  const useQdrant = await confirm({
    message: 'Use Qdrant for vector search (RAG)?',
    default: true
  })

  // Observability
  const useLangSmith = await confirm({
    message: 'Enable LangSmith tracing?',
    default: true
  })

  // Generate .env files
  console.log('\n📝 Generating configuration files...')

  const backendEnv = `
# Project: ${projectName}
DATABASE_URL=${usePostgres ? 'postgresql+asyncpg://user:pass@localhost:5432/db' : ''}
QDRANT_URL=${useQdrant ? 'http://localhost:6333' : ''}
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=${aiProvider !== 'anthropic' ? 'your-openai-key' : ''}
ANTHROPIC_API_KEY=${aiProvider !== 'openai' ? 'your-anthropic-key' : ''}
LANGCHAIN_TRACING_V2=${useLangSmith ? 'true' : 'false'}
LANGCHAIN_API_KEY=${useLangSmith ? 'your-langsmith-key' : ''}
LANGCHAIN_PROJECT=${projectName}
`

  fs.writeFileSync('backend/.env', backendEnv)

  // Install dependencies
  const shouldInstall = await confirm({
    message: 'Install dependencies now?',
    default: true
  })

  if (shouldInstall) {
    console.log('\n📦 Installing dependencies...')
    execSync('make install', { stdio: 'inherit' })
  }

  console.log('\n✅ Setup complete!')
  console.log('\n📚 Next steps:')
  console.log('  1. Update API keys in backend/.env and app/.env.local')
  console.log('  2. Run: make dev')
  console.log('  3. Open: http://localhost:3000')
}

runSetupWizard()
````

### **Definition of Done:**

- [ ] Wizard runs successfully
- [ ] All config files generated correctly
- [ ] Dependencies installed
- [ ] Instructions clear

**Effort:** 8 hours
**Dependencies:** Phase 2 complete
**Risk:** Low

---

## **Story 3.2: Add Example Implementations**

**As a** template user
**I want** 2-3 complete example apps
**So that** I see real-world usage patterns

### **Acceptance Criteria:**

- [ ] Example 1: Simple chatbot
- [ ] Example 2: Document Q&A (RAG)
- [ ] Example 3: Multi-step agent
- [ ] Each example is self-contained
- [ ] Each has its own README
- [ ] Examples can be removed easily

### **Tasks:**

```bash
examples/
├── 01-simple-chatbot/
│   ├── README.md
│   ├── backend/agent.py
│   └── frontend/page.tsx
├── 02-document-qa/
│   ├── README.md
│   ├── backend/rag.py
│   └── frontend/page.tsx
└── 03-multi-step-agent/
    ├── README.md
    ├── backend/workflow.py
    └── frontend/page.tsx
```

**Effort:** 12 hours
**Dependencies:** Story 2.4
**Risk:** Low

---

## **Story 3.3: Create Customization Guides**

**As a** template user
**I want** step-by-step guides for common customizations
**So that** I can extend the starter confidently

### **Acceptance Criteria:**

- [ ] Guide: Adding a new AI agent
- [ ] Guide: Adding a new API endpoint
- [ ] Guide: Adding authentication
- [ ] Guide: Deploying to production
- [ ] Guide: Adding a new database model
- [ ] All guides have code examples

### **Tasks:**

````markdown
# docs/guides/ADDING_AN_AGENT.md

## Adding a New AI Agent

### 1. Create Agent File

```python
# backend/src/agents/my_agent.py
from langchain_openai import ChatOpenAI
from ..core.tracing import traced

class MyAgent:
    @traced(run_name="my_agent")
    async def process(self, input: str) -> str:
        # Your logic here
        pass
```
````

### 2. Register in API Route

```python
# backend/src/api/v1/routes/my_route.py
from ...agents.my_agent import MyAgent

@router.post("/my-endpoint")
async def my_endpoint(input: str):
    agent = MyAgent()
    return await agent.process(input)
```

### 3. Add Frontend Integration

```tsx
// app/src/app/my-page/page.tsx
// Call your new endpoint
```

```

**Effort:** 8 hours
**Dependencies:** Phase 2 complete
**Risk:** Low

---

## **Story 3.4: Build Example Agents**

**As a** template user
**I want** 3-5 example agent implementations
**So that** I understand LangGraph patterns

### **Acceptance Criteria:**
- [ ] Sequential agent (chain of steps)
- [ ] Parallel agent (multiple tasks at once)
- [ ] Conditional agent (branching logic)
- [ ] Supervisor agent (orchestrates sub-agents)
- [ ] All traced with LangSmith
- [ ] All with comprehensive tests

**Effort:** 12 hours
**Dependencies:** Story 2.4
**Risk:** Medium

---

## **Story 3.5: Add Architecture Decision Templates**

**As a** template maintainer
**I want** ADR templates for common decisions
**So that** users document their architectural choices

### **Acceptance Criteria:**
- [ ] ADR template in `docs/adr/TEMPLATE.md`
- [ ] 2-3 example ADRs included
- [ ] Instructions for creating ADRs
- [ ] ADR index auto-generated

**Effort:** 4 hours
**Dependencies:** None
**Risk:** Low

---

**Phase 3 Total Effort:** 44 hours
**Phase 3 Duration:** 1.5 weeks (part-time) or 5.5 days (full-time)

---

# **PHASE 4: Validation & Release**

## **Story 4.1: Test Fresh Installation Flow**

**As a** template maintainer
**I want** to validate the complete installation experience
**So that** users don't hit blockers

### **Acceptance Criteria:**
- [ ] Fresh VM/container setup documented
- [ ] Installation tested on macOS, Linux, Windows
- [ ] All commands in README work
- [ ] Common issues documented in troubleshooting
- [ ] Installation < 10 minutes (excluding dependencies)

**Effort:** 8 hours
**Dependencies:** Phases 1-3 complete
**Risk:** High (platform-specific issues)

---

## **Story 4.2: Build 2-3 Pilot Projects**

**As a** template validator
**I want** to build real projects with the starter
**So that** I find gaps and issues

### **Acceptance Criteria:**
- [ ] Pilot 1: Customer support chatbot
- [ ] Pilot 2: Documentation Q&A system
- [ ] Pilot 3: Content generation tool
- [ ] Each pilot deployed to production
- [ ] Issues found are fixed in starter
- [ ] Success stories documented

**Effort:** 24 hours (8 hours per pilot)
**Dependencies:** Story 4.1
**Risk:** Medium

---

## **Story 4.3: Create Video Walkthrough**

**As a** template user
**I want** a video showing the starter in action
**So that** I can see the full workflow

### **Acceptance Criteria:**
- [ ] 15-20 minute walkthrough video
- [ ] Covers: installation, configuration, first agent, deployment
- [ ] Professional editing and audio
- [ ] Hosted on YouTube
- [ ] Embedded in README

**Effort:** 12 hours (recording + editing)
**Dependencies:** Story 4.1
**Risk:** Low

---

## **Story 4.4: Prepare Marketing Materials**

**As a** template maintainer
**I want** compelling marketing materials
**So that** developers discover and use the starter

### **Acceptance Criteria:**
- [ ] Landing page or microsite
- [ ] Twitter announcement thread
- [ ] Dev.to / Hashnode blog post
- [ ] Hacker News launch post
- [ ] Reddit /r/programming post
- [ ] Product Hunt submission

**Effort:** 8 hours
**Dependencies:** Story 4.3
**Risk:** Low

---

## **Story 4.5: Launch and Gather Feedback**

**As a** template maintainer
**I want** to launch publicly and gather feedback
**So that** I can improve the starter iteratively

### **Acceptance Criteria:**
- [ ] GitHub repository public
- [ ] Announced on social media
- [ ] Posted to relevant communities
- [ ] Issue templates set up
- [ ] Feedback mechanism documented
- [ ] First 10 issues triaged

**Effort:** 4 hours
**Dependencies:** Story 4.4
**Risk:** Low

---

**Phase 4 Total Effort:** 56 hours
**Phase 4 Duration:** 2 weeks (part-time) or 7 days (full-time)

---

# **EPIC SUMMARY**

## **Total Effort Breakdown**

| Phase | Stories | Effort | Duration (Part-time) | Duration (Full-time) |
|-------|---------|--------|----------------------|----------------------|
| Phase 1: Preparation | 4 stories | 20 hours | 1 week | 2.5 days |
| Phase 2: Extraction | 5 stories | 46 hours | 1.5 weeks | 6 days |
| Phase 3: Features | 5 stories | 44 hours | 1.5 weeks | 5.5 days |
| Phase 4: Validation | 5 stories | 56 hours | 2 weeks | 7 days |
| **TOTAL** | **19 stories** | **166 hours** | **6 weeks** | **21 days** |

## **Success Metrics**

**Quantitative:**
- [ ] Installation time < 10 minutes
- [ ] 100% test coverage on infrastructure
- [ ] 3+ pilot projects successfully deployed
- [ ] 50+ GitHub stars in first month
- [ ] 10+ community contributions in first quarter

**Qualitative:**
- [ ] Positive feedback from first 10 users
- [ ] Zero critical bugs reported
- [ ] Clear differentiation from competitors
- [ ] Strong community engagement

## **Dependencies & Risks**

### **External Dependencies:**
- Docker Desktop availability
- OpenAI/Anthropic API access
- Cloud deployment platforms (Vercel, Railway)
- GitHub for repository hosting

### **Risks & Mitigation:**

| Risk | Severity | Mitigation |
|------|----------|------------|
| Platform-specific installation issues | High | Test on all major platforms early |
| Incomplete business logic removal | Medium | Thorough checklist + automated search |
| Poor documentation | Medium | Get early user feedback |
| Low adoption | Low | Strong marketing + clear value prop |

## **Release Plan**

### **v1.0.0 - Initial Release (End of Phase 4)**
- All core infrastructure
- Example implementations
- Complete documentation
- Marketing materials

### **v1.1.0 - Community Feedback (4 weeks after launch)**
- Bug fixes from early users
- Additional examples
- Improved documentation
- Enhanced customization options

### **v2.0.0 - Advanced Features (3 months after launch)**
- Additional AI providers (Anthropic, Cohere, etc.)
- Advanced agent patterns
- Performance optimizations
- Enterprise features

---

## **Next Steps**

1. **Review & Approve Epic** - Stakeholder sign-off
2. **Set Up Project Board** - GitHub Projects or Jira
3. **Assign Resources** - Who's working on this?
4. **Begin Phase 1** - Start with Story 1.1

**Questions? Ready to get started?** 🚀
```
