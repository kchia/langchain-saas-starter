"""Retrieval service orchestrating the full pattern retrieval pipeline.

This module implements the retrieval orchestration (B7) for Epic 3.
Coordinates query building, BM25, semantic search, fusion, and explainability.
"""

from typing import Dict, List, Optional
import time
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.retrieval.query_builder import QueryBuilder
from src.retrieval.bm25_retriever import BM25Retriever
from src.retrieval.semantic_retriever import SemanticRetriever
from src.retrieval.weighted_fusion import WeightedFusion
from src.retrieval.explainer import RetrievalExplainer
from src.core.models import EvaluationRun
from langsmith import traceable

logger = logging.getLogger(__name__)


class RetrievalService:
    """Orchestrates the full retrieval pipeline for pattern matching.
    
    Pipeline:
    1. QueryBuilder: Transform requirements → queries
    2. BM25Retriever: Keyword search
    3. SemanticRetriever: Vector search
    4. WeightedFusion: Combine results
    5. Explainer: Add explanations and confidence scores
    """
    
    def __init__(
        self,
        patterns: List[Dict],
        bm25_retriever: Optional[BM25Retriever] = None,
        semantic_retriever: Optional[SemanticRetriever] = None,
        query_builder: Optional[QueryBuilder] = None,
        weighted_fusion: Optional[WeightedFusion] = None,
        explainer: Optional[RetrievalExplainer] = None
    ):
        """Initialize retrieval service.
        
        Args:
            patterns: List of pattern dictionaries
            bm25_retriever: Optional BM25 retriever (created if None)
            semantic_retriever: Optional semantic retriever
            query_builder: Optional query builder (created if None)
            weighted_fusion: Optional fusion (created if None)
            explainer: Optional explainer (created if None)
        """
        self.patterns = patterns
        
        # Initialize components
        self.query_builder = query_builder or QueryBuilder()
        self.bm25_retriever = bm25_retriever or BM25Retriever(patterns)
        self.semantic_retriever = semantic_retriever
        self.weighted_fusion = weighted_fusion or WeightedFusion()
        self.explainer = explainer or RetrievalExplainer()
        
        logger.info(
            f"Initialized RetrievalService with {len(patterns)} patterns"
        )
    
    @traceable(name="retrieval_search")
    async def search(
        self,
        requirements: Dict,
        top_k: int = 3
    ) -> Dict:
        """Execute full retrieval pipeline.
        
        Args:
            requirements: Requirements dictionary from Epic 2
                Expected keys: component_type, props, variants, a11y
            top_k: Number of top patterns to return (default: 3)
        
        Returns:
            Dictionary containing:
                - patterns: List of top-k patterns with explanations
                - retrieval_metadata: Metadata about retrieval process
        
        Example:
            >>> service = RetrievalService(patterns, semantic_retriever)
            >>> requirements = {
            ...     "component_type": "Button",
            ...     "props": ["variant", "size"],
            ...     "variants": ["primary", "secondary"]
            ... }
            >>> result = await service.search(requirements, top_k=3)
            >>> len(result["patterns"])
            3
        """
        start_time = time.time()
        
        logger.info(f"Starting retrieval for requirements: {requirements}")
        
        # Step 1: Build queries
        queries = self.query_builder.build_from_requirements(requirements)
        bm25_query = queries["bm25_query"]
        semantic_query = queries["semantic_query"]
        filters = queries["filters"]
        
        logger.info(f"Built queries - BM25: '{bm25_query[:50]}...', Semantic: '{semantic_query[:50]}...'")
        
        # Step 2: BM25 search
        bm25_results = self.bm25_retriever.search(bm25_query, top_k=10)
        logger.info(f"BM25 returned {len(bm25_results)} results")
        
        # Step 3: Semantic search (if available)
        semantic_results = []
        methods_used = ["bm25"]
        
        if self.semantic_retriever:
            semantic_results = await self.semantic_retriever.search(
                semantic_query,
                top_k=10,
                filters=filters
            )
            logger.info(f"Semantic search returned {len(semantic_results)} results")
            methods_used.append("semantic")
        else:
            logger.warning("Semantic retriever not available, using BM25 only")
        
        # Step 4: Fusion
        if semantic_results:
            fusion_details = self.weighted_fusion.fuse_with_details(
                bm25_results,
                semantic_results,
                top_k=top_k
            )
        else:
            # Fallback to BM25 only
            fusion_details = [
                {
                    "pattern": pattern,
                    "final_score": score,
                    "final_rank": rank,
                    "bm25_score": score,
                    "bm25_rank": rank,
                    "semantic_score": 0.0,
                    "semantic_rank": None,
                    "weights": {"bm25": 1.0, "semantic": 0.0}
                }
                for rank, (pattern, score) in enumerate(bm25_results[:top_k], start=1)
            ]
        
        logger.info(f"Fusion produced {len(fusion_details)} results")
        
        # Step 5: Add explanations
        enriched_patterns = []
        for detail in fusion_details:
            explanation_data = self.explainer.explain(
                pattern=detail["pattern"],
                requirements=requirements,
                bm25_score=detail["bm25_score"],
                bm25_rank=detail["bm25_rank"] or 999,
                semantic_score=detail["semantic_score"],
                semantic_rank=detail["semantic_rank"] or 999,
                final_score=detail["final_score"],
                final_rank=detail["final_rank"]
            )
            
            # Combine pattern with explanation
            enriched_pattern = {
                **detail["pattern"],
                "confidence": explanation_data["confidence"],
                "explanation": explanation_data["explanation"],
                "match_highlights": explanation_data["match_highlights"],
                "ranking_details": explanation_data["ranking_details"]
            }
            enriched_patterns.append(enriched_pattern)
        
        # Calculate latency
        latency_ms = int((time.time() - start_time) * 1000)
        
        logger.info(f"Retrieval completed in {latency_ms}ms, returning {len(enriched_patterns)} patterns")
        
        # Build response
        return {
            "patterns": enriched_patterns,
            "retrieval_metadata": {
                "latency_ms": latency_ms,
                "methods_used": methods_used,
                "weights": {
                    "bm25": self.weighted_fusion.bm25_weight,
                    "semantic": self.weighted_fusion.semantic_weight
                },
                "total_patterns_searched": len(self.patterns),
                "query": semantic_query if semantic_query else bm25_query
            }
        }

    def get_library_stats(self) -> Dict:
        """Compute library-level statistics from loaded patterns.

        Returns:
            Dictionary with:
            - total_patterns: int
            - component_types: List[str] (unique component names)
            - categories: List[str] (unique categories)
            - frameworks: List[str] (unique frameworks)
            - libraries: List[str] (unique libraries)
            - total_variants: int (sum of all variant counts)
            - total_props: int (sum of all prop counts)
        """
        if not self.patterns:
            logger.warning("No patterns loaded in retrieval service")
            return {
                "total_patterns": 0,
                "component_types": [],
                "categories": [],
                "frameworks": [],
                "libraries": [],
                "total_variants": 0,
                "total_props": 0,
            }

        component_types = set()
        categories = set()
        frameworks = set()
        libraries = set()
        total_variants = 0
        total_props = 0

        for pattern in self.patterns:
            # Extract unique values
            component_types.add(pattern.get("name", "Unknown"))

            if "category" in pattern:
                categories.add(pattern["category"])

            if "framework" in pattern:
                frameworks.add(pattern["framework"])

            if "library" in pattern:
                libraries.add(pattern["library"])

            # Count metadata items with defensive type checking
            metadata = pattern.get("metadata", {})

            # Handle variants
            variants = metadata.get("variants", [])
            if isinstance(variants, list):
                total_variants += len(variants)

            # Handle props - check if it's a list or dict
            props = metadata.get("props", [])
            if isinstance(props, list):
                total_props += len(props)
            elif isinstance(props, dict):
                total_props += len(props.keys())

        return {
            "total_patterns": len(self.patterns),
            "component_types": sorted(list(component_types)),
            "categories": sorted(list(categories)),
            "frameworks": sorted(list(frameworks)),
            "libraries": sorted(list(libraries)),
            "total_variants": total_variants,
            "total_props": total_props,
        }


async def get_library_quality_metrics(
    db: AsyncSession,
    evaluation_type: str = "retrieval"
) -> Optional[Dict]:
    """Fetch latest quality metrics from evaluation_runs table.

    This is a standalone function because it requires per-request
    database session, while RetrievalService is app-scoped.

    Args:
        db: Database session
        evaluation_type: Type of evaluation to query (default: "retrieval")

    Returns:
        Dictionary with MRR, Hit@3, and last_evaluated timestamp, or None
    """
    try:
        # Query latest completed evaluation run
        query = (
            select(EvaluationRun)
            .where(EvaluationRun.status == "completed")
            .where(EvaluationRun.evaluation_type == evaluation_type)
            .order_by(EvaluationRun.completed_at.desc())
            .limit(1)
        )

        result = await db.execute(query)
        latest_eval = result.scalar_one_or_none()

        if latest_eval and latest_eval.metrics:
            return {
                "mrr": latest_eval.metrics.get("mrr"),
                "hit_at_3": latest_eval.metrics.get("hit_at_3"),
                "last_evaluated": latest_eval.completed_at.isoformat() if latest_eval.completed_at else None
            }

        return None

    except Exception as e:
        logger.warning(f"Failed to fetch quality metrics: {e}")
        return None
