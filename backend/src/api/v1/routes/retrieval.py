"""Retrieval API endpoints for pattern search.

Implements the retrieval search API (B7) for Epic 3.
POST /api/v1/retrieval/search endpoint.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from langsmith import traceable
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from ....core.database import get_async_session
from ....services.retrieval_service import get_library_quality_metrics

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/retrieval", tags=["retrieval"])


# Request/Response Models
class RetrievalRequest(BaseModel):
    """Request model for pattern retrieval."""
    requirements: Dict = Field(
        ...,
        description="Component requirements from Epic 2",
        example={
            "component_type": "Button",
            "props": ["variant", "size", "disabled"],
            "variants": ["primary", "secondary", "ghost"],
            "a11y": ["aria-label", "keyboard navigation"]
        }
    )


class MatchHighlights(BaseModel):
    """Highlights of matched features."""
    matched_props: List[str] = Field(default_factory=list)
    matched_variants: List[str] = Field(default_factory=list)
    matched_a11y: List[str] = Field(default_factory=list)


class RankingDetails(BaseModel):
    """Ranking details for explainability."""
    bm25_score: float
    bm25_rank: int
    semantic_score: float
    semantic_rank: Optional[int]
    final_score: float
    final_rank: int


class PatternResult(BaseModel):
    """Individual pattern result with metadata."""
    id: str
    name: str
    category: str
    description: str
    framework: str
    library: str
    code: str
    metadata: Dict
    confidence: float = Field(..., ge=0, le=1)
    explanation: str
    match_highlights: MatchHighlights
    ranking_details: RankingDetails


class RetrievalMetadata(BaseModel):
    """Metadata about the retrieval process."""
    latency_ms: int
    methods_used: List[str]
    weights: Dict[str, float]
    total_patterns_searched: int
    query: str


class RetrievalResponse(BaseModel):
    """Response model for pattern retrieval."""
    patterns: List[PatternResult]
    retrieval_metadata: RetrievalMetadata


class LibraryStatsResponse(BaseModel):
    """Library-level statistics response."""

    total_patterns: int = Field(..., description="Total number of patterns in library")
    component_types: List[str] = Field(..., description="List of unique component names")
    categories: List[str] = Field(default_factory=list, description="Pattern categories")
    frameworks: List[str] = Field(default_factory=list, description="Supported frameworks")
    libraries: List[str] = Field(default_factory=list, description="UI libraries used")
    total_variants: int = Field(default=0, description="Total variant count across all patterns")
    total_props: int = Field(default=0, description="Total prop count across all patterns")
    metrics: Optional[Dict] = Field(None, description="Quality metrics (MRR, Hit@3) from latest evaluation")


def get_retrieval_service(request: Request):
    """Dependency to get retrieval service from FastAPI app state.
    
    Args:
        request: FastAPI request object containing app state
    
    Returns:
        RetrievalService instance from app state
    
    Raises:
        HTTPException: If retrieval service is not initialized in app state
    
    Note:
        The retrieval service should be initialized in the FastAPI app startup event:
        
        ```python
        @app.on_event("startup")
        async def startup_event():
            # Initialize service with actual Qdrant/OpenAI clients
            app.state.retrieval_service = RetrievalService(patterns, ...)
        ```
    """
    if not hasattr(request.app.state, "retrieval_service"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Retrieval service not initialized. Ensure app startup completed."
        )
    return request.app.state.retrieval_service


@router.post("/search", response_model=RetrievalResponse)
@traceable(name="retrieval_search_endpoint")
async def search_patterns(
    request: RetrievalRequest,
    retrieval_service=Depends(get_retrieval_service)
) -> RetrievalResponse:
    """Search for matching patterns based on requirements.
    
    This endpoint orchestrates the full retrieval pipeline:
    1. Query construction (BM25 + semantic)
    2. BM25 lexical search
    3. Semantic vector search
    4. Weighted fusion (0.3 BM25 + 0.7 semantic)
    5. Explainability and confidence scoring
    
    Args:
        request: RetrievalRequest with component requirements
        retrieval_service: Injected retrieval service
    
    Returns:
        RetrievalResponse with top-3 patterns and metadata
    
    Raises:
        HTTPException 400: Invalid request (missing required fields)
        HTTPException 422: Validation error
        HTTPException 500: Internal server error
    
    Example:
        ```
        POST /api/v1/retrieval/search
        {
            "requirements": {
                "component_type": "Button",
                "props": ["variant", "size"],
                "variants": ["primary", "secondary"]
            }
        }
        ```
    """
    try:
        logger.info(f"Received retrieval request: {request.requirements}")
        
        # Validate requirements has component_type
        if "component_type" not in request.requirements:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="requirements.component_type is required"
            )
        
        # Execute retrieval
        result = await retrieval_service.search(
            requirements=request.requirements,
            top_k=3
        )
        
        logger.info(
            f"Retrieval successful: {len(result['patterns'])} patterns, "
            f"{result['retrieval_metadata']['latency_ms']}ms"
        )
        
        return result
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Retrieval search failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retrieval search failed: {str(e)}"
        )


@router.get("/health")
async def health_check(request: Request):
    """Health check endpoint for retrieval service.
    
    Returns:
        Status dict indicating service health
    """
    try:
        if hasattr(request.app.state, "retrieval_service"):
            service = request.app.state.retrieval_service
            return {
                "status": "healthy",
                "total_patterns": len(service.patterns) if service else 0
            }
        else:
            return {
                "status": "unavailable",
                "total_patterns": 0,
                "message": "Service not initialized"
            }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "total_patterns": 0,
            "error": str(e)
        }


@router.get("/library/stats", response_model=LibraryStatsResponse)
async def get_library_statistics(
    request: Request,
    db: AsyncSession = Depends(get_async_session)
) -> LibraryStatsResponse:
    """Get library-level statistics and quality metrics.

    Returns library statistics including:
    - Total number of patterns in library
    - List of unique component names (types)
    - Categories (e.g., "form", "layout", "data-display")
    - Frameworks (e.g., "react", "vue")
    - Libraries (e.g., "shadcn/ui", "radix-ui")
    - Total variants and props counts
    - Quality metrics (MRR, Hit@3) from latest evaluation run (if available)

    Returns:
        LibraryStatsResponse: Library statistics and optional quality metrics

    Raises:
        HTTPException 503: Retrieval service not initialized
        HTTPException 500: Internal server error

    Example Response:
        {
            "total_patterns": 10,
            "component_types": ["Button", "Card", "Input", "Select", "Badge"],
            "categories": ["form", "data-display", "layout"],
            "frameworks": ["react"],
            "libraries": ["shadcn/ui", "radix-ui"],
            "total_variants": 45,
            "total_props": 120,
            "metrics": {
                "mrr": 0.75,
                "hit_at_3": 0.85,
                "last_evaluated": "2025-10-06T14:30:00Z"
            }
        }
    """
    try:
        # Get retrieval service from app state
        if not hasattr(request.app.state, "retrieval_service"):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Retrieval service not initialized"
            )

        service = request.app.state.retrieval_service

        # Get library stats (synchronous)
        stats = service.get_library_stats()

        # Get quality metrics from database (async)
        metrics = await get_library_quality_metrics(db)
        if metrics:
            stats["metrics"] = metrics

        logger.info(f"Library stats retrieved: {stats['total_patterns']} patterns")

        return LibraryStatsResponse(**stats)

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Failed to get library statistics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve library statistics: {str(e)}"
        )
