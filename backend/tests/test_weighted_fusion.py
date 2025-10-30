"""Tests for weighted fusion module (B5).

Tests the combination of BM25 and semantic search results
with configurable weights.
"""

import pytest
from src.retrieval.weighted_fusion import WeightedFusion


class TestWeightedFusion:
    """Test suite for WeightedFusion class."""
    
    @pytest.fixture
    def fusion(self):
        """Create WeightedFusion with default weights."""
        return WeightedFusion(bm25_weight=0.3, semantic_weight=0.7)
    
    @pytest.fixture
    def sample_bm25_results(self):
        """Sample BM25 search results."""
        return [
            ({"id": "p1", "name": "Button"}, 10.0),
            ({"id": "p2", "name": "Card"}, 5.0),
            ({"id": "p3", "name": "Input"}, 2.0)
        ]
    
    @pytest.fixture
    def sample_semantic_results(self):
        """Sample semantic search results."""
        return [
            ({"id": "p1", "name": "Button"}, 0.90),
            ({"id": "p4", "name": "Badge"}, 0.75),
            ({"id": "p2", "name": "Card"}, 0.60)
        ]
    
    def test_initialization_default_weights(self):
        """Test initialization with default weights."""
        fusion = WeightedFusion()
        assert fusion.bm25_weight == 0.3
        assert fusion.semantic_weight == 0.7
    
    def test_initialization_custom_weights(self):
        """Test initialization with custom weights."""
        fusion = WeightedFusion(bm25_weight=0.5, semantic_weight=0.5)
        assert fusion.bm25_weight == 0.5
        assert fusion.semantic_weight == 0.5
    
    def test_initialization_invalid_weights(self):
        """Test initialization fails if weights don't sum to 1.0."""
        with pytest.raises(ValueError, match="must sum to 1.0"):
            WeightedFusion(bm25_weight=0.5, semantic_weight=0.6)
    
    def test_normalize_scores_basic(self, fusion):
        """Test basic score normalization."""
        results = [
            ({"id": "p1"}, 10.0),
            ({"id": "p2"}, 5.0),
            ({"id": "p3"}, 0.0)
        ]
        
        normalized = fusion._normalize_scores(results)
        
        # Max score (10.0) should normalize to 1.0
        assert normalized["p1"] == 1.0
        
        # Min score (0.0) should normalize to 0.0
        assert normalized["p3"] == 0.0
        
        # Middle score (5.0) should normalize to 0.5
        assert normalized["p2"] == 0.5
    
    def test_normalize_scores_empty(self, fusion):
        """Test normalization with empty results."""
        normalized = fusion._normalize_scores([])
        assert normalized == {}
    
    def test_normalize_scores_single(self, fusion):
        """Test normalization with single result."""
        results = [({"id": "p1"}, 5.0)]
        normalized = fusion._normalize_scores(results)
        
        # Single score should normalize to 1.0
        assert normalized["p1"] == 1.0
    
    def test_normalize_scores_all_same(self, fusion):
        """Test normalization when all scores are equal."""
        results = [
            ({"id": "p1"}, 5.0),
            ({"id": "p2"}, 5.0),
            ({"id": "p3"}, 5.0)
        ]
        
        normalized = fusion._normalize_scores(results)
        
        # All should normalize to 0.0 (range is 0)
        assert all(score == 0.0 for score in normalized.values())
    
    def test_fuse_basic(self, fusion, sample_bm25_results, sample_semantic_results):
        """Test basic fusion of BM25 and semantic results."""
        results = fusion.fuse(sample_bm25_results, sample_semantic_results, top_k=3)
        
        # Should return 3 results
        assert len(results) <= 3
        
        # Results should be (pattern, score) tuples
        assert all(isinstance(r, tuple) and len(r) == 2 for r in results)
        
        # Pattern p1 (Button) should rank high (appears in both with high scores)
        assert results[0][0]["id"] == "p1"
    
    def test_fuse_respects_top_k(self, fusion, sample_bm25_results, sample_semantic_results):
        """Test that fuse respects top_k parameter."""
        results_top_2 = fusion.fuse(sample_bm25_results, sample_semantic_results, top_k=2)
        results_top_5 = fusion.fuse(sample_bm25_results, sample_semantic_results, top_k=5)
        
        assert len(results_top_2) == 2
        # Can't have more than unique patterns
        assert len(results_top_5) <= 5
    
    def test_fuse_scores_descending(self, fusion, sample_bm25_results, sample_semantic_results):
        """Test that fused results are sorted by score descending."""
        results = fusion.fuse(sample_bm25_results, sample_semantic_results, top_k=5)
        
        scores = [score for _, score in results]
        assert scores == sorted(scores, reverse=True)
    
    def test_fuse_pattern_only_in_bm25(self, fusion):
        """Test fusion when pattern appears only in BM25 results."""
        bm25_results = [({"id": "p1", "name": "Button"}, 10.0)]
        semantic_results = [({"id": "p2", "name": "Card"}, 0.80)]
        
        results = fusion.fuse(bm25_results, semantic_results, top_k=3)
        
        # Both patterns should appear in results
        pattern_ids = [r[0]["id"] for r in results]
        assert "p1" in pattern_ids
        assert "p2" in pattern_ids
    
    def test_fuse_pattern_only_in_semantic(self, fusion):
        """Test fusion when pattern appears only in semantic results."""
        bm25_results = [({"id": "p1", "name": "Button"}, 10.0)]
        semantic_results = [({"id": "p2", "name": "Card"}, 0.80)]
        
        results = fusion.fuse(bm25_results, semantic_results, top_k=3)
        
        # Both patterns should appear
        pattern_ids = [r[0]["id"] for r in results]
        assert "p1" in pattern_ids
        assert "p2" in pattern_ids
    
    def test_fuse_pattern_in_both(self, fusion):
        """Test fusion when pattern appears in both result sets."""
        bm25_results = [
            ({"id": "p1", "name": "Button"}, 10.0),
            ({"id": "p2", "name": "Card"}, 5.0)
        ]
        semantic_results = [
            ({"id": "p1", "name": "Button"}, 0.90),
            ({"id": "p3", "name": "Input"}, 0.70)
        ]
        
        results = fusion.fuse(bm25_results, semantic_results, top_k=3)
        
        # Pattern p1 should rank first (high scores in both)
        assert results[0][0]["id"] == "p1"
        
        # p1's score should be higher than p2 and p3
        p1_score = results[0][1]
        other_scores = [score for pattern, score in results[1:]]
        assert all(p1_score > s for s in other_scores)
    
    def test_fuse_empty_bm25(self, fusion):
        """Test fusion with empty BM25 results."""
        bm25_results = []
        semantic_results = [({"id": "p1", "name": "Button"}, 0.90)]
        
        results = fusion.fuse(bm25_results, semantic_results, top_k=3)
        
        # Should still return semantic results
        assert len(results) == 1
        assert results[0][0]["id"] == "p1"
    
    def test_fuse_empty_semantic(self, fusion):
        """Test fusion with empty semantic results."""
        bm25_results = [({"id": "p1", "name": "Button"}, 10.0)]
        semantic_results = []
        
        results = fusion.fuse(bm25_results, semantic_results, top_k=3)
        
        # Should still return BM25 results
        assert len(results) == 1
        assert results[0][0]["id"] == "p1"
    
    def test_fuse_both_empty(self, fusion):
        """Test fusion with both result sets empty."""
        results = fusion.fuse([], [], top_k=3)
        assert results == []
    
    def test_fuse_weighting_effect(self):
        """Test that weight values affect final ranking."""
        # Create fusion with BM25-heavy weights
        bm25_heavy = WeightedFusion(bm25_weight=0.9, semantic_weight=0.1)
        
        # Create fusion with semantic-heavy weights
        semantic_heavy = WeightedFusion(bm25_weight=0.1, semantic_weight=0.9)
        
        bm25_results = [
            ({"id": "p1", "name": "Button"}, 10.0),
            ({"id": "p2", "name": "Card"}, 1.0)
        ]
        semantic_results = [
            ({"id": "p2", "name": "Card"}, 0.95),
            ({"id": "p1", "name": "Button"}, 0.50)
        ]
        
        # With BM25-heavy, p1 should rank higher
        results_bm25_heavy = bm25_heavy.fuse(bm25_results, semantic_results, top_k=2)
        assert results_bm25_heavy[0][0]["id"] == "p1"
        
        # With semantic-heavy, p2 should rank higher
        results_semantic_heavy = semantic_heavy.fuse(bm25_results, semantic_results, top_k=2)
        assert results_semantic_heavy[0][0]["id"] == "p2"
    
    def test_fuse_with_details(self, fusion, sample_bm25_results, sample_semantic_results):
        """Test fusion with detailed score breakdown."""
        results = fusion.fuse_with_details(
            sample_bm25_results,
            sample_semantic_results,
            top_k=3
        )
        
        # Should have detailed structure
        assert len(results) <= 3
        assert all("pattern" in r for r in results)
        assert all("final_score" in r for r in results)
        assert all("final_rank" in r for r in results)
        assert all("bm25_score" in r for r in results)
        assert all("bm25_rank" in r for r in results)
        assert all("semantic_score" in r for r in results)
        assert all("semantic_rank" in r for r in results)
        assert all("weights" in r for r in results)
    
    def test_fuse_with_details_ranks(self, fusion, sample_bm25_results, sample_semantic_results):
        """Test that detailed results include correct ranks."""
        results = fusion.fuse_with_details(
            sample_bm25_results,
            sample_semantic_results,
            top_k=3
        )
        
        # Final ranks should be 1, 2, 3
        final_ranks = [r["final_rank"] for r in results]
        assert final_ranks == list(range(1, len(results) + 1))
        
        # BM25 rank for p1 should be 1 (it's first in BM25 results)
        p1_result = [r for r in results if r["pattern"]["id"] == "p1"][0]
        assert p1_result["bm25_rank"] == 1
    
    def test_fuse_with_details_weights(self, fusion, sample_bm25_results, sample_semantic_results):
        """Test that detailed results include weight information."""
        results = fusion.fuse_with_details(
            sample_bm25_results,
            sample_semantic_results,
            top_k=3
        )
        
        # All results should have same weights
        for r in results:
            assert r["weights"]["bm25"] == 0.3
            assert r["weights"]["semantic"] == 0.7
    
    def test_scores_in_valid_range(self, fusion, sample_bm25_results, sample_semantic_results):
        """Test that combined scores are in [0, 1] range."""
        results = fusion.fuse(sample_bm25_results, sample_semantic_results, top_k=5)
        
        for _, score in results:
            assert 0 <= score <= 1
