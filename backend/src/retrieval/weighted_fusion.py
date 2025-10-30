"""Weighted fusion combiner for BM25 and semantic search results.

This module implements weighted score fusion (B5) for Epic 3.
Combines BM25 lexical search and semantic vector search with
configurable weights (default: 0.3 BM25 + 0.7 semantic).
"""

from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)


class WeightedFusion:
    """Combines BM25 and semantic search results using weighted score fusion.
    
    Implements score normalization and weighted combination to produce
    final ranking scores for pattern retrieval.
    
    Default weights:
        - BM25: 0.3 (lexical/keyword matching)
        - Semantic: 0.7 (contextual/meaning matching)
    """
    
    def __init__(self, bm25_weight: float = 0.3, semantic_weight: float = 0.7):
        """Initialize weighted fusion combiner.
        
        Args:
            bm25_weight: Weight for BM25 scores (default: 0.3)
            semantic_weight: Weight for semantic scores (default: 0.7)
        
        Raises:
            ValueError: If weights don't sum to 1.0
        """
        if abs(bm25_weight + semantic_weight - 1.0) > 1e-6:
            raise ValueError(
                f"Weights must sum to 1.0, got {bm25_weight + semantic_weight}"
            )
        
        self.bm25_weight = bm25_weight
        self.semantic_weight = semantic_weight
        
        logger.info(
            f"Initialized WeightedFusion with weights: "
            f"BM25={bm25_weight}, Semantic={semantic_weight}"
        )
    
    def _normalize_scores(self, results: List[Tuple[Dict, float]]) -> Dict[str, float]:
        """Normalize scores to 0-1 range using min-max normalization.
        
        Args:
            results: List of (pattern, score) tuples
        
        Returns:
            Dictionary mapping pattern_id -> normalized_score
        
        Example:
            >>> results = [({"id": "p1"}, 5.0), ({"id": "p2"}, 2.0)]
            >>> normalize_scores(results)
            {"p1": 1.0, "p2": 0.0}
        """
        if not results:
            return {}
        
        # Extract scores
        scores = [score for _, score in results]
        
        # Handle edge cases
        if len(scores) == 1:
            # Single score normalizes to 1.0
            return {results[0][0]["id"]: 1.0}
        
        min_score = min(scores)
        max_score = max(scores)
        
        # Avoid division by zero
        range_score = max_score - min_score if max_score != min_score else 1.0
        
        # Normalize each score to [0, 1]
        normalized = {}
        for pattern, score in results:
            normalized_score = (score - min_score) / range_score
            normalized[pattern["id"]] = normalized_score
        
        return normalized
    
    def fuse(
        self,
        bm25_results: List[Tuple[Dict, float]],
        semantic_results: List[Tuple[Dict, float]],
        top_k: int = 3
    ) -> List[Tuple[Dict, float]]:
        """Combine BM25 and semantic rankings with weighted fusion.
        
        Process:
        1. Normalize BM25 scores to [0, 1]
        2. Normalize semantic scores to [0, 1]
        3. Compute weighted combination: w1*BM25 + w2*semantic
        4. Sort by combined score
        5. Return top-k patterns
        
        Args:
            bm25_results: List of (pattern, score) from BM25 retriever
            semantic_results: List of (pattern, score) from semantic retriever
            top_k: Number of top results to return (default: 3)
        
        Returns:
            List of (pattern, combined_score) tuples, sorted by score descending
        
        Example:
            >>> bm25_results = [(button_pattern, 0.95), (card_pattern, 0.42)]
            >>> semantic_results = [(button_pattern, 0.89), (input_pattern, 0.78)]
            >>> fused = fusion.fuse(bm25_results, semantic_results, top_k=3)
            >>> fused[0][0]["name"]
            'Button'
        """
        logger.info(
            f"Fusing {len(bm25_results)} BM25 results with "
            f"{len(semantic_results)} semantic results"
        )
        
        # Normalize scores from both retrievers
        bm25_scores = self._normalize_scores(bm25_results)
        semantic_scores = self._normalize_scores(semantic_results)
        
        logger.debug(f"BM25 normalized scores: {bm25_scores}")
        logger.debug(f"Semantic normalized scores: {semantic_scores}")
        
        # Get all unique pattern IDs from both result sets
        all_pattern_ids = set(bm25_scores.keys()) | set(semantic_scores.keys())
        
        logger.info(f"Found {len(all_pattern_ids)} unique patterns across both retrievers")
        
        # Compute weighted combined scores
        combined_scores = {}
        for pattern_id in all_pattern_ids:
            # Get normalized scores (default to 0 if pattern not in that retriever)
            bm25_score = bm25_scores.get(pattern_id, 0.0)
            semantic_score = semantic_scores.get(pattern_id, 0.0)
            
            # Weighted combination
            combined_score = (
                self.bm25_weight * bm25_score +
                self.semantic_weight * semantic_score
            )
            
            combined_scores[pattern_id] = combined_score
            
            logger.debug(
                f"Pattern {pattern_id}: BM25={bm25_score:.3f}, "
                f"Semantic={semantic_score:.3f}, Combined={combined_score:.3f}"
            )
        
        # Sort by combined score (descending)
        sorted_ids = sorted(
            combined_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:top_k]
        
        # Create pattern map from both result sets
        pattern_map = {}
        for pattern, _ in bm25_results + semantic_results:
            pattern_map[pattern["id"]] = pattern
        
        # Build final results with combined scores
        final_results = []
        for pattern_id, combined_score in sorted_ids:
            if pattern_id in pattern_map:
                final_results.append((pattern_map[pattern_id], combined_score))
        
        logger.info(f"Returning top-{len(final_results)} fused results")
        return final_results
    
    def fuse_with_details(
        self,
        bm25_results: List[Tuple[Dict, float]],
        semantic_results: List[Tuple[Dict, float]],
        top_k: int = 3
    ) -> List[Dict]:
        """Fuse with detailed score breakdown for explainability.
        
        Returns results with individual BM25 and semantic scores
        alongside the combined score.
        
        Args:
            bm25_results: BM25 search results
            semantic_results: Semantic search results
            top_k: Number of top results
        
        Returns:
            List of dicts with pattern, scores, and ranking details
        """
        # Get normalized scores
        bm25_scores = self._normalize_scores(bm25_results)
        semantic_scores = self._normalize_scores(semantic_results)
        
        # Create rank maps
        bm25_ranks = {
            pattern["id"]: rank + 1
            for rank, (pattern, _) in enumerate(bm25_results)
        }
        semantic_ranks = {
            pattern["id"]: rank + 1
            for rank, (pattern, _) in enumerate(semantic_results)
        }
        
        # Fuse normally
        fused_results = self.fuse(bm25_results, semantic_results, top_k)
        
        # Add detailed breakdown
        detailed_results = []
        for rank, (pattern, combined_score) in enumerate(fused_results, start=1):
            pattern_id = pattern["id"]
            
            detailed_results.append({
                "pattern": pattern,
                "final_score": round(combined_score, 3),
                "final_rank": rank,
                "bm25_score": round(bm25_scores.get(pattern_id, 0.0), 3),
                "bm25_rank": bm25_ranks.get(pattern_id, None),
                "semantic_score": round(semantic_scores.get(pattern_id, 0.0), 3),
                "semantic_rank": semantic_ranks.get(pattern_id, None),
                "weights": {
                    "bm25": self.bm25_weight,
                    "semantic": self.semantic_weight
                }
            })
        
        return detailed_results
