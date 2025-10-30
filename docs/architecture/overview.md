# ComponentForge System Architecture

## Overview

ComponentForge is an AI-powered design-to-code platform that transforms Figma designs and UI screenshots into production-ready React components. The system uses a three-tier architecture with modern web technologies and AI orchestration.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               ComponentForge                                │
├─────────────────┬─────────────────────┬─────────────────┬──────────────────┤
│                 │                     │                 │                  │
│  🎨 Frontend    │   🤖 Backend API   │   🗄️ Services   │  🔍 AI Layer     │
│  (Next.js 15)   │   (FastAPI)        │   (Docker)      │  (LangGraph)     │
│                 │                     │                 │                  │
│  ┌───────────┐  │   ┌─────────────┐  │  ┌──────────┐   │  ┌────────────┐  │
│  │   Pages   │  │   │   Routes    │  │  │PostgreSQL│   │  │   Agents   │  │
│  │  App Dir  │──┼──▶│   /api/v1   │──┼──│    DB    │   │  │ Extraction │  │
│  └───────────┘  │   └─────────────┘  │  └──────────┘   │  │  Matching  │  │
│                 │                     │                 │  │ Generation │  │
│  ┌───────────┐  │   ┌─────────────┐  │  ┌──────────┐   │  └────────────┘  │
│  │Components │  │   │  AI Agents  │  │  │  Qdrant  │   │                  │
│  │ shadcn/ui │  │   │  LangGraph  │──┼──│ Vectors  │   │  ┌────────────┐  │
│  └───────────┘  │   └─────────────┘  │  └──────────┘   │  │ LangSmith  │  │
│                 │                     │                 │  │  Tracing   │  │
│  ┌───────────┐  │   ┌─────────────┐  │  ┌──────────┐   │  └────────────┘  │
│  │   State   │  │   │   Models    │  │  │  Redis   │   │                  │
│  │  Zustand  │  │   │ SQLAlchemy  │  │  │  Cache   │   │                  │
│  │   Query   │  │   └─────────────┘  │  └──────────┘   │                  │
│  └───────────┘  │                     │                 │                  │
│                 │                     │                 │                  │
└─────────────────┴─────────────────────┴─────────────────┴──────────────────┘
```

## Technology Stack

### Frontend (`/app`)

**Framework & Runtime:**
- **Next.js 15.5.4** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5.0** - Type-safe JavaScript

**UI & Styling:**
- **shadcn/ui** - Accessible component library built on Radix UI
- **Radix UI** - Unstyled, accessible UI primitives
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Icon library

**State Management:**
- **Zustand** - Lightweight client state management
- **TanStack Query** - Server state management and caching
- **React Hook Form** - Form validation and handling

**Testing:**
- **Playwright** - End-to-end testing
- **axe-core/react** - Accessibility testing
- **Jest** - Unit testing

**Authentication:**
- **Auth.js v5** (NextAuth) - Authentication framework

### Backend (`/backend`)

**Framework & Runtime:**
- **FastAPI** - Modern Python web framework
- **Python 3.11+** - Programming language
- **Uvicorn** - ASGI server

**AI & ML:**
- **LangChain** - LLM framework
- **LangGraph** - Multi-agent orchestration
- **LangSmith** - AI observability and tracing
- **OpenAI GPT-4** - Text generation
- **GPT-4V** - Vision/image analysis
- **text-embedding-3-small** - Text embeddings

**Data & Storage:**
- **PostgreSQL 16** - Relational database
- **SQLAlchemy** - ORM with async support
- **Alembic** - Database migrations
- **Qdrant** - Vector database for semantic search
- **Redis 7** - Caching and sessions

**Image Processing:**
- **Pillow** - Image manipulation
- **pypdf** - PDF processing

**Monitoring:**
- **Prometheus** - Metrics collection
- **LangSmith** - AI operation tracking

### Infrastructure

**Containerization:**
- **Docker** - Container runtime
- **Docker Compose** - Multi-container orchestration

**Services:**
- PostgreSQL 16 (port 5432)
- Qdrant (ports 6333/6334)
- Redis 7 (port 6379)

## Data Flow

### 1. Component Generation Flow

```
User Input (Figma/Screenshot)
    ↓
Frontend (Next.js)
    ↓ HTTP POST /api/v1/generate
Backend API (FastAPI)
    ↓
LangGraph Orchestrator
    ↓
┌─────────────────────────────────────┐
│  Multi-Agent Pipeline               │
│                                     │
│  1. Token Extraction Agent          │
│     ├─ GPT-4V (screenshots)         │
│     └─ Figma API (designs)          │
│          ↓                          │
│  2. Pattern Matching Agent          │
│     ├─ Qdrant Vector Search         │
│     └─ BM25 Keyword Search          │
│          ↓                          │
│  3. Code Generation Agent           │
│     └─ GPT-4 + Pattern Templates    │
│          ↓                          │
│  4. Validation & Refinement         │
│     ├─ TypeScript Validation        │
│     └─ Accessibility Checks         │
└─────────────────────────────────────┘
    ↓
Generated Component
    ↓
Store in PostgreSQL
    ↓
Return to Frontend
    ↓
Display to User
```

### 2. Pattern Retrieval Flow

```
User Query
    ↓
Frontend Search
    ↓ POST /api/v1/patterns/search
Backend API
    ↓
Embedding Generation (OpenAI)
    ↓
Vector Search (Qdrant)
    │
    ├─ Semantic Similarity (Cosine)
    └─ Metadata Filtering
    ↓
Hybrid Ranking
    │
    ├─ Vector Score (60%)
    └─ BM25 Score (40%)
    ↓
Top-K Results
    ↓
Cache in Redis (TTL: 1 hour)
    ↓
Return to Frontend
```

### 3. Authentication Flow

```
User Login
    ↓
Frontend (Auth.js)
    ↓
POST /api/auth/signin
    ↓
Backend Validation
    ↓
PostgreSQL User Lookup
    ↓
JWT Token Generation
    ↓
Secure Cookie (httpOnly)
    ↓
Frontend State Update
```

## Database Schema

### PostgreSQL Tables

**users**
- User authentication and profiles
- Relationships: conversations, documents

**documents**
- Uploaded files and processing status
- Embeddings metadata
- Relationships: chunks, users

**document_chunks**
- Text chunks for RAG
- Vector references in Qdrant
- Relationships: documents

**conversations**
- Chat sessions
- Relationships: users, messages

**messages**
- Individual chat messages
- Context for AI generation
- Relationships: conversations

**embedding_models**
- Embedding model configurations
- Active model tracking

**evaluation_runs**
- AI performance metrics
- A/B testing results

### Qdrant Collections

**patterns**
- Component pattern embeddings
- Metadata: variants, props, a11y features
- Vector size: 1536 (text-embedding-3-small)
- Distance: Cosine similarity

## API Structure

### REST Endpoints

```
/health                    - Health check
/metrics                   - Prometheus metrics
/api/v1/
  ├── /auth/              - Authentication
  │   ├── /signin
  │   ├── /signup
  │   └── /signout
  ├── /generate/          - Component generation
  │   ├── /screenshot     - From screenshot
  │   └── /figma          - From Figma URL
  ├── /patterns/          - Pattern management
  │   ├── /search         - Semantic search
  │   └── /{id}           - Get pattern
  ├── /components/        - Generated components
  │   ├── /               - List components
  │   ├── /{id}           - Get component
  │   └── /{id}/regenerate
  └── /documents/         - Document management
      ├── /upload
      └── /{id}
```

## AI Agent Architecture

### LangGraph Multi-Agent System

```python
# Agent orchestration flow
graph = StateGraph(AgentState)

graph.add_node("extract", extract_tokens_agent)
graph.add_node("search", pattern_search_agent)
graph.add_node("generate", code_generation_agent)
graph.add_node("validate", validation_agent)

graph.add_edge("extract", "search")
graph.add_edge("search", "generate")
graph.add_edge("generate", "validate")
graph.add_conditional_edges(
    "validate",
    should_regenerate,
    {
        "regenerate": "generate",
        "complete": END
    }
)
```

### Agent Responsibilities

**1. Token Extraction Agent**
- Input: Screenshot or Figma URL
- Output: Design tokens (colors, spacing, typography)
- Model: GPT-4V for vision, Figma API for designs

**2. Pattern Search Agent**
- Input: Design tokens + requirements
- Output: Top-K matching component patterns
- Tools: Qdrant vector search, BM25 ranking

**3. Code Generation Agent**
- Input: Design tokens + matched pattern
- Output: TypeScript component code
- Model: GPT-4 with RAG-enhanced prompts

**4. Validation Agent**
- Input: Generated code
- Output: Validation results + fixes
- Tools: TypeScript compiler, ESLint, axe-core

## Caching Strategy

### Redis Cache Layers

**1. Pattern Search Results**
- TTL: 1 hour
- Key: `pattern:search:{query_hash}`

**2. Generated Components**
- TTL: 24 hours
- Key: `component:{id}`

**3. User Sessions**
- TTL: 7 days
- Key: `session:{token}`

**4. API Rate Limits**
- TTL: 1 minute
- Key: `ratelimit:{user_id}:{endpoint}`

## Security

### Authentication
- JWT tokens with secure httpOnly cookies
- Password hashing with bcrypt
- Session management with Redis

### API Security
- CORS configuration for allowed origins
- Rate limiting per user/IP
- Input validation with Pydantic
- SQL injection prevention (parameterized queries)

### Data Protection
- Environment variables for secrets
- API keys stored in .env (not committed)
- Database encryption at rest
- HTTPS in production

## Monitoring & Observability

### LangSmith Tracing
- All AI operations traced
- Latency and cost tracking
- Error debugging
- Performance optimization

### Prometheus Metrics
- Request counts and latency
- Error rates
- AI model usage
- Database query performance

### Logging
- Structured JSON logging
- Log levels: DEBUG, INFO, WARNING, ERROR
- Request/response logging (configurable)
- SQL query logging (development)

## Deployment

### Development
```bash
make install    # Install dependencies
make dev        # Start all services
make test       # Run tests
```

### Production (Recommended)
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or AWS ECS
- **Database**: Managed PostgreSQL (AWS RDS, Supabase)
- **Vector DB**: Qdrant Cloud
- **Cache**: Redis Cloud or AWS ElastiCache

## Performance Considerations

### Frontend Optimization
- Server-side rendering (SSR) for initial page load
- Static generation for documentation pages
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Prefetching for anticipated user actions

### Backend Optimization
- Async/await patterns throughout
- Database connection pooling
- Query optimization with indexes
- Redis caching for expensive operations
- Background tasks with Celery (future)

### AI Optimization
- Prompt caching
- Streaming responses for long generations
- Batch embedding generation
- Vector search optimization (HNSW index)

## Scalability

### Horizontal Scaling
- Stateless API servers (scale behind load balancer)
- Shared Redis for session management
- Database read replicas for queries
- Qdrant cluster for vector search

### Vertical Scaling
- Database optimization (indexes, query tuning)
- Larger instance sizes for AI workloads
- GPU instances for custom models (future)

## Future Enhancements

1. **Real-time Collaboration** - WebSocket support for live editing
2. **Custom Models** - Fine-tuned models for specific design systems
3. **Storybook Integration** - Auto-generate Storybook stories
4. **Testing Generation** - Auto-generate unit and E2E tests
5. **Multi-framework Support** - Vue, Svelte, Angular
6. **Design System Import** - Import entire design systems
7. **Version Control** - Component versioning and history
8. **Team Collaboration** - Shared workspaces and permissions

