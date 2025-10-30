from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize logging first
from .core.logging import init_logging_from_env, get_logger
from .api.middleware.logging import LoggingMiddleware
from .api.middleware.rate_limit_middleware import RateLimitMiddleware
from .api.middleware.session_tracking import SessionTrackingMiddleware

# Initialize logging configuration
init_logging_from_env()
logger = get_logger(__name__)

# Initialize LangSmith tracing for observability
from .core.tracing import init_tracing
init_tracing()

# Try to import optional packages with proper error handling
try:
    from fastapi.responses import PlainTextResponse
    from prometheus_client import Counter, Histogram, generate_latest

    METRICS_ENABLED = True
    logger.info("Prometheus metrics enabled")
except ImportError as e:
    METRICS_ENABLED = False
    logger.warning(f"Metrics disabled - prometheus_client not available: {e}")

try:
    from dotenv import load_dotenv

    load_dotenv()
    logger.info("Environment variables loaded from .env file")
except ImportError as e:
    logger.warning(f"Using system environment variables - python-dotenv not available: {e}")

# Initialize metrics only if available
if METRICS_ENABLED:
    request_counter = Counter(
        "requests_total", "Total requests", ["method", "endpoint"]
    )
    request_duration = Histogram("request_duration_seconds", "Request duration")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting FastAPI application", extra={"extra": {"event": "startup"}})

    # Validate OpenAI API key at startup
    import os
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set - token extraction will fail")
    else:
        logger.info("OpenAI API key configured")
    
    # Verify Redis connection for rate limiting
    try:
        from redis.asyncio import Redis
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", "6379"))
        redis_db = int(os.getenv("REDIS_DB", "0"))
        
        redis_client = Redis(
            host=redis_host,
            port=redis_port,
            db=redis_db,
            decode_responses=True
        )
        await redis_client.ping()
        await redis_client.aclose()
        logger.info(f"Redis connection verified: {redis_host}:{redis_port}/{redis_db}")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
        logger.warning("Rate limiting will fail without Redis. Please ensure Redis is running.")
    

    # Initialize retrieval service
    try:
        from .services.retrieval_service import RetrievalService
        from .retrieval.bm25_retriever import BM25Retriever
        from .retrieval.semantic_retriever import SemanticRetriever
        from .retrieval.query_builder import QueryBuilder
        from .retrieval.weighted_fusion import WeightedFusion
        from .retrieval.explainer import RetrievalExplainer
        import json
        import glob

        logger.info("Loading pattern library...")

        # Load patterns from JSON files
        pattern_files = glob.glob("data/patterns/*.json")
        if not pattern_files:
            logger.error("No pattern files found in data/patterns/")
            raise FileNotFoundError("Pattern library is empty")

        patterns = []
        for file in pattern_files:
            try:
                with open(file) as f:
                    pattern = json.load(f)
                    patterns.append(pattern)
                    logger.info(f"Loaded pattern: {pattern.get('name', 'unknown')} from {file}")
            except Exception as e:
                logger.error(f"Failed to load pattern from {file}: {e}")

        logger.info(f"Loaded {len(patterns)} patterns from library")

        # Initialize retrievers
        bm25_retriever = BM25Retriever(patterns)
        logger.info("BM25 retriever initialized")

        # Try to initialize semantic retriever (graceful fallback)
        semantic_retriever = None
        try:
            from qdrant_client import QdrantClient
            from openai import AsyncOpenAI

            # Initialize clients
            qdrant_client = QdrantClient(
                url=os.getenv("QDRANT_URL", "http://localhost:6333")
            )
            openai_client = AsyncOpenAI(api_key=api_key)

            semantic_retriever = SemanticRetriever(
                qdrant_client=qdrant_client,
                openai_client=openai_client
            )
            logger.info("Semantic retriever initialized with Qdrant")
        except Exception as e:
            logger.warning(f"Semantic retriever unavailable: {e}. Using BM25 only.")

        # Initialize service components
        query_builder = QueryBuilder()
        weighted_fusion = WeightedFusion()
        explainer = RetrievalExplainer()

        # Create retrieval service
        app.state.retrieval_service = RetrievalService(
            patterns=patterns,
            bm25_retriever=bm25_retriever,
            semantic_retriever=semantic_retriever,
            query_builder=query_builder,
            weighted_fusion=weighted_fusion,
            explainer=explainer
        )

        logger.info(
            f"Retrieval service initialized successfully "
            f"(BM25: ✓, Semantic: {'✓' if semantic_retriever else '✗'})"
        )

    except Exception as e:
        logger.error(f"Failed to initialize retrieval service: {e}", exc_info=True)
        logger.warning("Retrieval endpoints will return 503 Service Unavailable")

    yield
    logger.info("Shutting down FastAPI application", extra={"extra": {"event": "shutdown"}})


app = FastAPI(
    title="Demo Day API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Expose all response headers
)

# Add session tracking middleware (must be early in chain)
app.add_middleware(SessionTrackingMiddleware)

# Add logging middleware
app.add_middleware(
    LoggingMiddleware,
    skip_paths=["/health", "/metrics", "/docs", "/redoc", "/openapi.json"],
    log_request_body=False,  # Set to True in development if needed
    log_response_body=False,  # Set to True in development if needed
)

# Add rate limiting middleware (applies to expensive endpoints)
app.add_middleware(RateLimitMiddleware)


@app.get("/health")
async def health():
    return {"status": "healthy"}


if METRICS_ENABLED:

    @app.get("/metrics", response_class=PlainTextResponse)
    async def metrics():
        return generate_latest()

else:

    @app.get("/metrics")
    async def metrics():
        return {"error": "Metrics not available - prometheus_client not installed"}


# Import and register routers
from .api.v1.routes import figma, tokens, requirements, retrieval, generation, evaluation

app.include_router(figma.router, prefix="/api/v1")
app.include_router(tokens.router, prefix="/api/v1")
app.include_router(requirements.router, prefix="/api/v1")
app.include_router(retrieval.router, prefix="/api/v1")
app.include_router(generation.router, prefix="/api/v1")
app.include_router(evaluation.router, prefix="/api/v1")
