# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start

```bash
make install    # Install all dependencies
make dev        # Start development environment
make test       # Run all tests
make demo       # Prepare demo environment
```

### Manual Development

```bash
# Start services
docker-compose up -d

# Backend (in separate terminal)
cd backend && source venv/bin/activate && uvicorn src.main:app --reload

# Frontend (in separate terminal)
cd app && npm run dev
```

### Testing

```bash
# Backend tests
cd backend && source venv/bin/activate && pytest tests/ -v

# Frontend tests
cd app && npm test

# E2E tests
cd app && npm run test:e2e
```

## Architecture

**Full-stack AI engineering project** with three-tier architecture:

### Frontend (`/app`)

- **Next.js 15.5.4** with App Router and TypeScript
- **shadcn/ui** with Radix UI primitives for component library
- **Tailwind CSS v4** for styling with CSS variables
- **Zustand** for client state management
- **TanStack Query** for server state and caching
- **axe-core/react** for accessibility testing
- **Playwright** for E2E testing
- **Auth.js v5** for authentication
- Runs on port 3000

### Backend (`/backend`)

- **FastAPI** for high-performance API
- **LangChain/LangGraph** for AI workflows and multi-agent orchestration
- **LangSmith** for AI observability and monitoring
- **Pillow** for image processing and screenshot analysis
- **SQLAlchemy** with async PostgreSQL
- **Qdrant client** for vector database operations
- **Prometheus** metrics collection
- Runs on port 8000

### Services (Docker Compose)

- **PostgreSQL 16** - Primary database (port 5432)
- **Qdrant** - Vector database for AI (ports 6333/6334)
- **Redis 7** - Cache and sessions (port 6379)

## Key Endpoints

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health
- Metrics: http://localhost:8000/metrics
- Qdrant dashboard: http://localhost:6333/dashboard

## Environment Setup

Copy `.env.example` files and configure:

- `backend/.env` - Database URLs, AI API keys
- `app/.env.local` - Auth secrets, API URLs

## Tech Stack Dependencies

- **Node.js 18+**, **Python 3.11+**, **Docker Desktop**
- AI: OpenAI, LangChain, LangGraph, LangSmith
- Vector: Qdrant, sentence-transformers
- Database: PostgreSQL with asyncpg, SQLAlchemy, Alembic
- UI: shadcn/ui, Radix UI, Tailwind CSS v4, Lucide React icons
- State: Zustand (client), TanStack Query (server), React Hook Form
- Testing: Playwright (E2E), axe-core (a11y), pytest (backend)
- Auth: Next-auth v5 with Auth.js core
- Image: Pillow (Python), GPT-4V for vision processing

## Code Style & Patterns

### Frontend (Next.js/TypeScript)

#### Component Library Usage (CRITICAL)

**BEFORE creating any new component, ALWAYS:**

1. **Check `.claude/BASE-COMPONENTS.md`** for the complete component library specification
2. **Search existing components** in `app/src/components/ui/` to see what's already implemented
3. **Reuse existing components** whenever possible - DO NOT recreate from scratch
4. **Extend existing components** with composition rather than creating duplicates

**Component Discovery Workflow:**
```bash
# Step 1: Check if component exists in base library
cat .claude/BASE-COMPONENTS.md | grep -i "componentName"

# Step 2: Check if component is already implemented
ls app/src/components/ui/ | grep -i "componentName"

# Step 3: If exists, import and use it
import { ComponentName } from "@/components/ui/component-name"

# Step 4: If not exists, install from shadcn/ui
npx shadcn-ui@latest add component-name
```

**Available Base Components (P0/P1):**
- Button (60+ uses) - variants: primary, secondary, ghost, success, warning
- Card (35+ uses) - variants: outlined, elevated, interactive
- Badge (25+ uses) - variants: success, warning, error, info, neutral
- Tabs (2 uses) - for Screenshot vs Figma, Preview/Code/Storybook
- Progress (8+ uses) - for extraction, generation, metrics
- Alert/Banner (5 uses) - for status messages
- Input (5+ uses) - for forms and text entry
- Code Block (4 uses) - for syntax-highlighted code display
- Modal/Dialog (2 uses) - for edit modals and reports
- Accordion (4 uses) - for collapsible sections

**Composite Components:**
- RequirementCard, PatternCard, MetricCard, ComponentRow, TokenDisplay
- ProgressStages, EditModal, CodePreviewModal

See `.claude/BASE-COMPONENTS.md` for complete specifications, props, and usage examples.

#### General Frontend Patterns

- Use App Router patterns (not Pages Router)
- Prefer server components over client components
- Use TypeScript strict mode with proper type definitions
- Follow Next.js 15.5.4 conventions
- Use Tailwind CSS v4 with semantic class composition and CSS variables
- Use shadcn/ui components as base, extend with Radix UI primitives
- Implement proper error boundaries with fallback UI
- Use React Server Components for data fetching when possible
- Implement proper loading states and Suspense boundaries
- Follow component composition patterns over inheritance
- Use proper TypeScript generics for reusable components
- Implement proper form validation with Zod schemas
- Structure components with clear separation of concerns
- Use Zustand for client state with proper store patterns
- Use TanStack Query for server state, caching, and mutations
- Implement accessibility testing with axe-core in development
- Use Lucide React for consistent iconography

### Backend (FastAPI/Python)

- Use async/await patterns consistently
- Follow FastAPI best practices with proper dependencies
- Use Pydantic models for all request/response validation
- Implement structured error handling with custom exceptions
- Use dependency injection for database and service connections
- Follow PEP 8 with black formatter and isort for imports
- Implement proper logging with structured format (JSON)
- Use SQLAlchemy async sessions with proper context management
- Implement request validation and sanitization
- Use proper HTTP status codes and error responses
- Implement rate limiting and request timeouts

### Database & Services

- Use async SQLAlchemy patterns with proper session management
- Implement connection pooling with appropriate limits
- Use Alembic for migrations with proper rollback strategies
- Follow Redis caching patterns with proper TTL
- Use Qdrant for vector operations with proper indexing
- Implement proper transaction management
- Use database migrations for schema changes
- Cache frequently accessed data appropriately
- Monitor database performance and query efficiency

### AI/ML Patterns (LangChain/LangGraph)

- Structure LangChain workflows as composable functions
- Use LangGraph for multi-agent orchestration and state management
- Use LangSmith for comprehensive AI observability and tracing
- Use proper error handling for AI model calls with retries
- Implement streaming responses for long-running AI operations
- Use proper vector search patterns with Qdrant
- Cache expensive AI operations appropriately
- Log AI interactions for debugging and monitoring
- Use environment variables for model configurations
- Implement proper prompt templates and versioning
- Handle AI model failures gracefully with fallbacks
- Follow LangGraph patterns for complex AI workflows
- Use Pillow for image preprocessing before vision model calls
- Implement confidence scoring for AI outputs
- Use proper agent state management patterns

### Security Patterns

- Validate all inputs using Pydantic models
- Sanitize user inputs before database operations
- Use parameterized queries to prevent SQL injection
- Implement proper CORS configuration
- Use HTTPS in production with proper headers
- Secure environment variables and secrets
- Implement proper session management
- Use rate limiting for API endpoints
- Log security-related events appropriately
- Implement proper authentication and authorization flows

## Project-Specific Rules

### Component Development (HIGHEST PRIORITY)

1. **ALWAYS CHECK `.claude/BASE-COMPONENTS.md` FIRST** before creating any UI component
2. **NEVER RECREATE** components that already exist in the base library
3. **REUSE AND COMPOSE** existing components instead of building from scratch
4. **SEARCH `app/src/components/ui/`** to verify component implementation status
5. **INSTALL from shadcn/ui** if the component is specified but not yet implemented
6. **FOLLOW** the exact variant specifications from BASE-COMPONENTS.md
7. **MAINTAIN** consistency with existing component props and API patterns

### Architecture & Stack

8. **NEVER** suggest using Pages Router - this project uses App Router
9. **ALWAYS** use TypeScript - no JavaScript suggestions
10. **PREFER** server components over client components
11. **USE** the existing auth system (Auth.js v5)
12. **FOLLOW** the established folder structure
13. **MAINTAIN** the three-tier architecture (Frontend/Backend/Services)
14. **USE** Docker Compose for services, not local installations

### Patterns & Quality

15. **IMPLEMENT** proper error handling and logging
16. **FOLLOW** the existing API patterns in `/backend/src/api/`
17. **USE** the existing component patterns in `/app/src/components/`
18. **USE** shadcn/ui components as the primary UI building blocks
19. **IMPLEMENT** proper accessibility with axe-core testing
20. **USE** Zustand for client state, TanStack Query for server state
21. **USE** LangSmith for all AI operation monitoring and debugging

## Common Anti-Patterns to Avoid

### Component Development (CRITICAL)

- **DON'T** create custom Button components when `@/components/ui/button` exists
- **DON'T** recreate Card, Badge, Input, or other base components from scratch
- **DON'T** ignore the component specifications in `.claude/BASE-COMPONENTS.md`
- **DON'T** create inconsistent component variants (use predefined variants)
- **DON'T** skip checking existing components before implementation
- **DON'T** duplicate component logic that already exists
- **DON'T** create "wrapper" components when composition is sufficient

### Architecture

- Don't suggest Pages Router patterns
- Don't mix client/server component patterns incorrectly
- Don't bypass the existing auth system
- Don't suggest changes that break the Docker setup

### Code Quality

- Don't use synchronous database operations
- Don't ignore proper error handling patterns
- Don't hardcode values (use environment variables)
- Don't create overly complex components or functions
- Don't ignore TypeScript errors or use 'any' types
- Don't skip input validation and sanitization

### AI/ML Specific

- Don't make AI calls without proper error handling
- Don't ignore vector search optimization
- Don't cache AI responses without considering staleness
- Don't expose sensitive prompts or model configurations
- Don't ignore streaming for long-running AI operations

### Performance

- Don't ignore proper loading states
- Don't fetch data in client components when server components suffice
- Don't ignore database query optimization
- Don't create unnecessary re-renders in React
- Don't ignore proper caching strategies
- thank you for being thoughtful and not overengineering