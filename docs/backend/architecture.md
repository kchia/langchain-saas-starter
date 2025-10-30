# Backend Architecture

Comprehensive technical documentation for ComponentForge's FastAPI backend, covering system design, module structure, and architectural patterns.

## Overview

ComponentForge's backend is a high-performance, async-first Python application built with:

**Core Technology:**
- **FastAPI 0.104+** - Modern async web framework
- **Python 3.11+** - Latest Python with performance improvements
- **Pydantic v2** - Data validation and serialization
- **SQLAlchemy 2.0** - Async ORM with PostgreSQL
- **Uvicorn** - ASGI server

**AI/ML Stack:**
- **LangChain 0.1+** - LLM application framework
- **LangGraph 0.0.13+** - Multi-agent orchestration
- **LangSmith** - Observability and tracing
- **OpenAI API** - GPT-4V (vision), GPT-4 (text generation)
- **Qdrant** - Vector database for semantic search

**Infrastructure:**
- **PostgreSQL 16** - Primary database
- **Redis 7** - Caching and session storage
- **Prometheus** - Metrics collection
- **Docker** - Containerization

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    FastAPI Application                       │
│                      (main.py)                               │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                    Middleware Layer                          │
├──────────────────────────────────────────────────────────────┤
│  • CORS Middleware                                           │
│  • Logging Middleware                                        │
│  • Rate Limiting Middleware                                  │
│  • Authentication Middleware                                 │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│                     API Layer (v1)                           │
├──────────────────────────────────────────────────────────────┤
│  Routes:                                                     │
│  • /extraction    → Token & requirement extraction           │
│  • /retrieval     → Pattern search                           │
│  • /generation    → Code generation                          │
│  • /validation    → Quality validation                       │
│  • /health        → Health checks                            │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
├──────────────────────────────────────────────────────────────┤
│  • RetrievalService       → Pattern matching                 │
│  • GeneratorService       → Code generation orchestration    │
│  • ImageProcessor         → Image preprocessing              │
│  • FigmaClient            → Figma API integration            │
│  • RequirementExporter    → Export requirements              │
│  • TokenExporter          → Export design tokens             │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│              AI Agents & Pipelines                           │
├──────────────────────────────────────────────────────────────┤
│  Multi-Agent System:                                         │
│  • ComponentClassifier    → Classify component types         │
│  • TokenExtractor         → Extract design tokens            │
│  • RequirementOrchestrator → Coordinate proposers            │
│    ├─ PropsProposer       → Propose component props          │
│    ├─ EventsProposer      → Propose event handlers           │
│    ├─ StatesProposer      → Propose state management         │
│    └─ AccessibilityProposer → Propose a11y requirements      │
│                                                              │
│  Generation Pipeline:                                        │
│  • PromptBuilder          → Build LLM prompts                │
│  • LLMGenerator           → Generate code with GPT-4         │
│  • CodeValidator          → Validate TypeScript/ESLint       │
│  • PatternParser          → Parse shadcn/ui patterns         │
│  • CodeAssembler          → Assemble final code              │
│                                                              │
│  Retrieval System:                                           │
│  • QueryBuilder           → Build search queries             │
│  • BM25Retriever          → Keyword search                   │
│  • SemanticRetriever      → Vector search                    │
│  • WeightedFusion         → Combine BM25 + semantic          │
│  • RetrievalExplainer     → Generate explanations            │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│                   Core Infrastructure                        │
├──────────────────────────────────────────────────────────────┤
│  • Database (SQLAlchemy)  → Async PostgreSQL ORM             │
│  • Cache (Redis)          → Caching layer                    │
│  • Logging                → Structured JSON logging          │
│  • Tracing (LangSmith)    → AI operation tracing             │
│  • Rate Limiter           → API rate limiting                │
│  • Error Handling         → Custom exceptions                │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│                  External Services                           │
├──────────────────────────────────────────────────────────────┤
│  • OpenAI API             → GPT-4V, GPT-4, embeddings        │
│  • Qdrant                 → Vector database                  │
│  • PostgreSQL             → Relational database              │
│  • Redis                  → Cache and sessions               │
│  • Figma API              → Design file access               │
│  • LangSmith              → Observability platform           │
└──────────────────────────────────────────────────────────────┘
```

## Module Structure

### `/src/main.py` - Application Entry Point

**Purpose**: FastAPI application initialization and configuration

**Key Components:**
- **Lifespan Management**: Startup/shutdown lifecycle
- **CORS Configuration**: Cross-origin resource sharing
- **Middleware Setup**: Logging, rate limiting
- **Route Registration**: API v1 routes
- **Health Checks**: Service health monitoring
- **Metrics Endpoint**: Prometheus metrics

**Example:**
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting FastAPI application")
    # Initialize services
    yield
    # Shutdown
    logger.info("Shutting down FastAPI application")

app = FastAPI(
    title="ComponentForge API",
    version="1.0.0",
    lifespan=lifespan
)
```

### `/src/core/` - Core Infrastructure

#### `database.py` - Database Layer

**Purpose**: Async SQLAlchemy configuration and session management

**Key Features:**
- Async engine with connection pooling
- Session factory with dependency injection
- Health check utilities
- Transaction management

**Architecture:**
```python
# Async engine with pooling
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections
    echo=False
)

# Async session factory
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency for route injection
async def get_session():
    async with async_session_maker() as session:
        yield session
```

**Connection Pooling:**
- Pool size: 20 connections
- Max overflow: 10 connections
- Total capacity: 30 concurrent connections
- Pre-ping: Validates connections before use

#### `logging.py` - Structured Logging

**Purpose**: JSON structured logging with context

**Features:**
- JSON format for log aggregation
- Request ID tracking
- Extra context fields
- Multiple output destinations

**Log Levels:**
- `DEBUG`: Development debugging
- `INFO`: General information
- `WARNING`: Warning messages
- `ERROR`: Error events
- `CRITICAL`: Critical failures

**Usage:**
```python
from ..core.logging import get_logger

logger = get_logger(__name__)

logger.info(
    "Processing request",
    extra={
        "extra": {
            "user_id": user_id,
            "request_id": request_id,
            "endpoint": "/api/v1/generation/generate"
        }
    }
)
```

**Output Format:**
```json
{
  "timestamp": "2025-01-09T10:30:45.123Z",
  "level": "INFO",
  "logger": "src.api.v1.routes.generation",
  "message": "Processing request",
  "user_id": "12345",
  "request_id": "abc-123",
  "endpoint": "/api/v1/generation/generate"
}
```

#### `errors.py` - Error Handling

**Purpose**: Custom exception hierarchy and error responses

**Exception Hierarchy:**
```python
ComponentForgeError (Base)
├─ ValidationError
│  ├─ InvalidTokenError
│  ├─ InvalidRequirementError
│  └─ InvalidPatternError
├─ ServiceError
│  ├─ OpenAIError
│  ├─ QdrantError
│  ├─ DatabaseError
│  └─ FigmaAPIError
├─ NotFoundError
│  ├─ PatternNotFoundError
│  └─ ResourceNotFoundError
└─ RateLimitError
```

**Error Response Format:**
```json
{
  "error": {
    "type": "ValidationError",
    "message": "Invalid component type",
    "details": {
      "field": "component_type",
      "value": "unknown",
      "allowed": ["button", "card", "input"]
    },
    "request_id": "abc-123"
  }
}
```

#### `tracing.py` - LangSmith Tracing

**Purpose**: AI operation observability

**Features:**
- Automatic tracing of LLM calls
- Custom trace decorators
- Performance metrics
- Error tracking

**Usage:**
```python
from ..core.tracing import traced

@traced(run_name="extract_tokens")
async def extract_tokens(image: Image.Image):
    # Automatically traced in LangSmith
    result = await llm.generate(...)
    return result
```

**Traced Operations:**
- LLM generation calls
- Vector search queries
- Pattern retrieval
- Code validation
- Requirement extraction

#### `cache.py` - Caching Layer

**Purpose**: Redis-based caching with TTL

**Strategies:**
- **Function-level caching**: `@cache(ttl=3600)`
- **Manual caching**: `cache.set(key, value, ttl)`
- **Cache invalidation**: `cache.delete(key)`

**Usage:**
```python
from ..core.cache import cache, cache_decorator

@cache_decorator(ttl=3600)
async def get_patterns():
    # Cached for 1 hour
    return await db.query(Pattern).all()

# Manual caching
await cache.set("pattern:123", pattern_data, ttl=3600)
pattern = await cache.get("pattern:123")
```

#### `rate_limiter.py` - Rate Limiting

**Purpose**: API rate limiting and throttling

**Limits:**
- **Default**: 100 requests/minute per IP
- **Token extraction**: 10 requests/minute per IP
- **Code generation**: 20 requests/minute per IP
- **Pattern retrieval**: 50 requests/minute per IP

**Implementation:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/generate")
@limiter.limit("20/minute")
async def generate_component(request: Request):
    # Rate limited to 20/min
    pass
```

#### `models.py` - SQLAlchemy Models

**Purpose**: Database table definitions

**Key Models:**
- `User`: User accounts and authentication
- `Project`: User projects
- `Component`: Generated components
- `Pattern`: Cached patterns (optional)
- `Token`: Design tokens (optional)

**Example:**
```python
class Component(Base):
    __tablename__ = "components"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    code = Column(Text, nullable=False)
    pattern_id = Column(String, nullable=False)
    tokens = Column(JSON)
    requirements = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
```

### `/src/api/` - API Layer

#### `/api/v1/` - API Version 1

**Structure:**
```
api/v1/
├── api.py                  # API router aggregation
└── routes/
    ├── extraction.py       # Token/requirement extraction
    ├── retrieval.py        # Pattern search
    ├── generation.py       # Code generation
    ├── validation.py       # Quality validation
    └── health.py           # Health checks
```

**Versioning Strategy:**
- `/api/v1/` - Current stable version
- `/api/v2/` - Future breaking changes
- Version in URL path (not headers)
- Backward compatibility within major version

#### `/api/middleware/` - Middleware

**Logging Middleware:**
```python
class LoggingMiddleware:
    async def __call__(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        logger.info(f"Request started: {request.method} {request.url}")

        response = await call_next(request)

        logger.info(f"Request completed: {response.status_code}")
        return response
```

**CORS Middleware:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### `/src/agents/` - Multi-Agent System

**Purpose**: AI agents for requirement extraction (Epic 2)

#### Agent Hierarchy

**Base Agent:**
```python
# base_proposer.py
class BaseRequirementProposer:
    def __init__(self, category: RequirementCategory):
        self.category = category

    @abstractmethod
    async def propose(
        self,
        image: Image.Image,
        classification: ComponentClassification,
        tokens: Optional[Dict]
    ) -> List[RequirementProposal]:
        pass
```

**Specialized Agents:**

1. **ComponentClassifier** (`component_classifier.py`)
   - Classifies component type from screenshot
   - Uses GPT-4V for vision analysis
   - Returns component type + confidence

2. **TokenExtractor** (`token_extractor.py`)
   - Extracts design tokens from screenshots/Figma
   - Returns colors, typography, spacing, borders
   - Includes confidence scores

3. **RequirementOrchestrator** (`requirement_orchestrator.py`)
   - Coordinates all requirement proposers
   - Parallel execution of proposers
   - Aggregates and deduplicates results

4. **PropsProposer** (`props_proposer.py`)
   - Proposes component props
   - Analyzes visual properties
   - Suggests TypeScript types

5. **EventsProposer** (`events_proposer.py`)
   - Proposes event handlers
   - Detects interactive elements
   - Suggests onClick, onChange, etc.

6. **StatesProposer** (`states_proposer.py`)
   - Proposes state management needs
   - Detects dynamic UI elements
   - Suggests useState, controlled components

7. **AccessibilityProposer** (`accessibility_proposer.py`)
   - Proposes accessibility requirements
   - Detects ARIA label needs
   - Suggests keyboard navigation

**Orchestration Flow:**
```python
# RequirementOrchestrator
async def orchestrate(self, image, classification, tokens):
    # Run proposers in parallel
    results = await asyncio.gather(
        props_proposer.propose(image, classification, tokens),
        events_proposer.propose(image, classification, tokens),
        states_proposer.propose(image, classification, tokens),
        accessibility_proposer.propose(image, classification, tokens)
    )

    # Aggregate and deduplicate
    all_requirements = self._aggregate(results)
    return all_requirements
```

### `/src/generation/` - Code Generation Pipeline

**Purpose**: Transform patterns + tokens + requirements → React components (Epic 4)

#### Key Modules

**1. GeneratorService** (`generator_service.py`)
- **Orchestrates 3-stage pipeline**:
  1. LLM Generation (~20-40s)
  2. Validation (~10-20s)
  3. Post-Processing (<5s)

**2. PromptBuilder** (`prompt_builder.py`)
- Constructs comprehensive prompts
- Includes pattern reference, tokens, requirements
- Enforces validation constraints

**3. LLMGenerator** (`llm_generator.py`)
- Uses OpenAI GPT-4 for generation
- Structured JSON output
- Retry logic with exponential backoff

**4. CodeValidator** (`code_validator.py`)
- Parallel TypeScript + ESLint validation
- LLM-based error fixing
- Quality scoring (0.0-1.0)

**5. PatternParser** (`pattern_parser.py`)
- Loads shadcn/ui patterns from JSON
- Extracts component metadata
- Lists available patterns

**6. CodeAssembler** (`code_assembler.py`)
- Formats and organizes code
- Creates file structure
- Ensures consistent style

**7. ProvenanceGenerator** (`provenance.py`)
- Adds generation metadata headers
- Tracks pattern source, tokens, requirements

**Pipeline Flow:**
```
Pattern + Tokens + Requirements
         ↓
    PromptBuilder
         ↓
    LLMGenerator (GPT-4)
         ↓
  Component + Stories + Showcase
         ↓
    CodeValidator (TS + ESLint)
         ↓
    CodeAssembler
         ↓
  ProvenanceGenerator
         ↓
    Final Component Package
```

### `/src/retrieval/` - Pattern Retrieval System

**Purpose**: Semantic + keyword search for component patterns (Epic 3)

#### Components

**1. QueryBuilder** (`query_builder.py`)
- Transforms requirements → search queries
- Extracts searchable text from structured requirements

**2. BM25Retriever** (`bm25_retriever.py`)
- Keyword-based lexical search
- TF-IDF with BM25 ranking algorithm
- Weight: 30% (configurable)

**3. SemanticRetriever** (`semantic_retriever.py`)
- Vector similarity search
- OpenAI text-embedding-3-small (1536 dims)
- Qdrant cosine similarity
- Weight: 70% (configurable)

**4. WeightedFusion** (`weighted_fusion.py`)
- Combines BM25 + semantic scores
- Default: 0.3 × BM25 + 0.7 × semantic
- Min-max score normalization

**5. RetrievalExplainer** (`explainer.py`)
- Generates confidence scores (0-1)
- Creates human-readable explanations
- Identifies match highlights

**Hybrid Search Flow:**
```
Requirements
     ↓
QueryBuilder
     ↓
     ├─────────────┬─────────────┐
     ↓             ↓             ↓
BM25Search   SemanticSearch   Parallel
 (30%)           (70%)        Execution
     ↓             ↓
     └─────────────┴─────────────┐
                   ↓
            WeightedFusion
                   ↓
          RetrievalExplainer
                   ↓
       Top-3 Patterns + Explanations
```

### `/src/services/` - Business Logic Layer

**Purpose**: Reusable business logic services

**Services:**

1. **RetrievalService** (`retrieval_service.py`)
   - Orchestrates pattern retrieval pipeline
   - Manages BM25 + semantic search
   - Returns top-K patterns with explanations

2. **ImageProcessor** (`image_processor.py`)
   - Preprocesses screenshots for GPT-4V
   - Resizes, compresses, formats images
   - Converts to base64 for API calls

3. **FigmaClient** (`figma_client.py`)
   - Integrates with Figma API
   - Fetches design files and styles
   - Extracts design tokens

4. **RequirementExporter** (`requirement_exporter.py`)
   - Exports requirements to JSON
   - Formats for frontend consumption

5. **TokenExporter** (`token_exporter.py`)
   - Exports design tokens
   - Multiple formats: JSON, CSS, Tailwind

### `/src/validation/` - Quality Validation

**Purpose**: Comprehensive quality validation (Epic 5)

**Modules:**

1. **ReportGenerator** (`report_generator.py`)
   - Aggregates validation results
   - Generates HTML/JSON reports
   - Status determination (PASS/FAIL)
   - Creates recommendations

**Integration:**
```python
from validation.report_generator import QualityReportGenerator

generator = QualityReportGenerator()

validation_results = {
    "typescript": ts_result,
    "eslint": eslint_result,
    "a11y": a11y_result,
    "auto_fixes": fixes
}

report = generator.generate(validation_results, "Button")
html_report = generator.generate_html(report)
```

### `/src/prompts/` - LLM Prompts

**Purpose**: Centralized prompt templates for AI operations

**Prompt Files:**
- `component_classifier.py` - Component classification prompts
- `token_extraction.py` - Design token extraction prompts
- `props_proposer.py` - Props proposal prompts
- `events_proposer.py` - Events proposal prompts
- `states_proposer.py` - States proposal prompts
- `accessibility_proposer.py` - A11y proposal prompts

**Structure:**
```python
def create_token_extraction_prompt(image_base64: str) -> List[Dict]:
    return [
        {
            "role": "system",
            "content": "You are an expert at extracting design tokens..."
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Extract design tokens..."},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_base64}"}}
            ]
        }
    ]
```

## Data Flow

### Request Lifecycle

**1. HTTP Request Arrives**
```
Client → Nginx/LoadBalancer → FastAPI → Middleware Stack
```

**2. Middleware Processing**
```
CORS → Logging → Rate Limiting → Authentication → Route Handler
```

**3. Route Handler**
```
Parse request → Validate with Pydantic → Call service layer
```

**4. Service Layer**
```
Business logic → Database queries → External API calls
```

**5. Response**
```
Service result → Pydantic serialization → JSON response → Client
```

### Example: Code Generation Request

```
POST /api/v1/generation/generate
     ↓
Middleware (logging, rate limit)
     ↓
Route Handler (generation.py)
     ↓
GeneratorService.generate()
     ↓
├─ PatternParser.load_pattern()
├─ PromptBuilder.build_prompt()
├─ LLMGenerator.generate()
├─ CodeValidator.validate_and_fix()
└─ ProvenanceGenerator.generate_header()
     ↓
ValidationResult + GenerationResult
     ↓
Pydantic Model Serialization
     ↓
JSON Response
```

## Design Patterns

### 1. Dependency Injection

**Database Sessions:**
```python
from fastapi import Depends
from ..core.database import get_session

@router.get("/patterns")
async def list_patterns(
    db: AsyncSession = Depends(get_session)
):
    patterns = await db.query(Pattern).all()
    return patterns
```

**Services:**
```python
def get_retrieval_service():
    return RetrievalService(...)

@router.post("/search")
async def search_patterns(
    request: SearchRequest,
    service: RetrievalService = Depends(get_retrieval_service)
):
    return await service.search(request)
```

### 2. Async/Await Pattern

**All I/O operations are async:**
```python
# Database
async with async_session_maker() as session:
    result = await session.execute(query)

# HTTP calls
async with aiohttp.ClientSession() as session:
    async with session.get(url) as response:
        data = await response.json()

# LLM calls
result = await openai_client.chat.completions.create(...)
```

### 3. Context Managers

**Session Management:**
```python
@asynccontextmanager
async def get_session():
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### 4. Factory Pattern

**Agent Creation:**
```python
class AgentFactory:
    @staticmethod
    def create_proposer(category: RequirementCategory):
        if category == RequirementCategory.PROPS:
            return PropsProposer()
        elif category == RequirementCategory.EVENTS:
            return EventsProposer()
        # ...
```

### 5. Strategy Pattern

**Retrieval Strategies:**
```python
class RetrievalStrategy(ABC):
    @abstractmethod
    async def search(self, query: str) -> List[Pattern]:
        pass

class BM25Strategy(RetrievalStrategy):
    async def search(self, query: str):
        # BM25 implementation
        pass

class SemanticStrategy(RetrievalStrategy):
    async def search(self, query: str):
        # Vector search implementation
        pass
```

### 6. Observer Pattern

**Logging and Tracing:**
```python
# Automatically trace all LLM calls
@traced(run_name="generate_component")
async def generate_component(...):
    # LangSmith automatically observes this operation
    result = await llm.generate(...)
    return result
```

## Performance Optimizations

### 1. Connection Pooling

**Database:**
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)
```

**Qdrant:**
```python
qdrant_client = QdrantClient(
    url=QDRANT_URL,
    timeout=30,
    prefer_grpc=True  # Use gRPC for better performance
)
```

### 2. Caching

**Pattern Caching:**
```python
@cache_decorator(ttl=3600)
async def load_patterns():
    # Cached for 1 hour
    return patterns
```

**Figma API Caching:**
```python
# Cache Figma file data for 24 hours
await cache.set(f"figma:{file_id}", data, ttl=86400)
```

### 3. Parallel Execution

**Multi-Agent System:**
```python
# Run all proposers in parallel
results = await asyncio.gather(
    props_proposer.propose(...),
    events_proposer.propose(...),
    states_proposer.propose(...),
    accessibility_proposer.propose(...)
)
```

**Hybrid Search:**
```python
# Run BM25 and semantic search in parallel
bm25_results, semantic_results = await asyncio.gather(
    bm25_retriever.search(query),
    semantic_retriever.search(query)
)
```

### 4. Lazy Loading

**Pattern Library:**
```python
# Load patterns on-demand
patterns = None

def get_patterns():
    global patterns
    if patterns is None:
        patterns = load_pattern_library()
    return patterns
```

### 5. Request Batching

**Embedding Generation:**
```python
# Batch multiple texts for embedding
embeddings = await openai.embeddings.create(
    model="text-embedding-3-small",
    input=[text1, text2, text3]  # Batch instead of 3 separate calls
)
```

## Security

### 1. Input Validation

**Pydantic Models:**
```python
class GenerationRequest(BaseModel):
    pattern_id: str = Field(..., min_length=1, max_length=100)
    tokens: Dict[str, Any]
    requirements: List[RequirementProposal]

    @validator('pattern_id')
    def validate_pattern_id(cls, v):
        if not v.startswith('shadcn-'):
            raise ValueError('Invalid pattern ID')
        return v
```

### 2. SQL Injection Prevention

**Parameterized Queries:**
```python
# Safe - using SQLAlchemy ORM
query = select(Pattern).where(Pattern.id == pattern_id)

# Unsafe - string interpolation (NEVER DO THIS)
query = f"SELECT * FROM patterns WHERE id = '{pattern_id}'"
```

### 3. API Key Security

**Environment Variables:**
```python
# Never hardcode API keys
openai_api_key = os.getenv("OPENAI_API_KEY")

# Verify at startup
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not set")
```

### 4. Rate Limiting

**Per-Endpoint Limits:**
```python
@router.post("/generate")
@limiter.limit("20/minute")
async def generate_component(request: Request):
    # Rate limited to 20 requests per minute
    pass
```

### 5. CORS Configuration

**Whitelist Origins:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

## Testing

### Unit Tests

**Service Tests:**
```python
# tests/services/test_retrieval_service.py
@pytest.mark.asyncio
async def test_search_patterns():
    service = RetrievalService(...)
    results = await service.search(requirements)
    assert len(results) == 3
    assert results[0].confidence > 0.9
```

### Integration Tests

**API Tests:**
```python
# tests/api/test_generation.py
@pytest.mark.asyncio
async def test_generate_component():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/generation/generate",
            json={"pattern_id": "shadcn-button", ...}
        )
        assert response.status_code == 200
```

### Performance Tests

**Load Testing:**
```python
# tests/performance/test_generation_performance.py
@pytest.mark.asyncio
async def test_generation_latency():
    start = time.time()
    result = await generator.generate(request)
    latency = time.time() - start
    assert latency < 60  # p50 target < 60s
```

## Monitoring

### Metrics

**Prometheus Metrics:**
```python
# Request counter
request_counter = Counter('requests_total', 'Total requests', ['method', 'endpoint'])

# Latency histogram
request_duration = Histogram('request_duration_seconds', 'Request duration')

# Active connections gauge
active_connections = Gauge('active_connections', 'Active database connections')
```

### Logging

**Structured Logs:**
```json
{
  "timestamp": "2025-01-09T10:30:45.123Z",
  "level": "INFO",
  "message": "Generation completed",
  "latency_ms": 35420,
  "pattern_id": "shadcn-button",
  "success": true
}
```

### Tracing

**LangSmith Traces:**
- All LLM calls automatically traced
- Custom traces with `@traced` decorator
- View in LangSmith dashboard

## See Also

- [AI Pipeline Documentation](./ai-pipeline.md) - LangChain/LangGraph details
- [Database Schema](./database-schema.md) - Database design
- [API Reference](../api/overview.md) - API endpoints
- [Deployment Guide](../deployment.md) - Production deployment
