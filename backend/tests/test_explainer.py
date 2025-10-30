"""Tests for explainer module (B6).

Tests the explanation and confidence scoring for retrieval results.
"""

import pytest
from src.retrieval.explainer import RetrievalExplainer


class TestRetrievalExplainer:
    """Test suite for RetrievalExplainer class."""
    
    @pytest.fixture
    def explainer(self):
        """Create RetrievalExplainer instance."""
        return RetrievalExplainer()
    
    @pytest.fixture
    def sample_pattern(self):
        """Sample pattern for testing."""
        return {
            "id": "shadcn-button",
            "name": "Button",
            "category": "form",
            "description": "A button component with variants",
            "metadata": {
                "props": [
                    {"name": "variant", "type": "string"},
                    {"name": "size", "type": "string"},
                    {"name": "disabled", "type": "boolean"}
                ],
                "variants": [
                    {"name": "primary"},
                    {"name": "secondary"},
                    {"name": "ghost"}
                ],
                "a11y": {
                    "features": [
                        "Keyboard navigation support",
                        "aria-label support"
                    ]
                }
            }
        }
    
    @pytest.fixture
    def sample_requirements(self):
        """Sample requirements for testing."""
        return {
            "component_type": "Button",
            "props": ["variant", "size"],
            "variants": ["primary", "secondary"],
            "a11y": ["keyboard navigation", "aria-label"]
        }
    
    def test_explain_structure(self, explainer, sample_pattern, sample_requirements):
        """Test explain returns correct structure."""
        result = explainer.explain(
            pattern=sample_pattern,
            requirements=sample_requirements,
            bm25_score=0.95,
            bm25_rank=1,
            semantic_score=0.89,
            semantic_rank=2,
            final_score=0.915,
            final_rank=1
        )
        
        # Verify structure
        assert "pattern_id" in result
        assert "confidence" in result
        assert "explanation" in result
        assert "match_highlights" in result
        assert "ranking_details" in result
        
        # Verify types
        assert isinstance(result["confidence"], float)
        assert isinstance(result["explanation"], str)
        assert isinstance(result["match_highlights"], dict)
        assert isinstance(result["ranking_details"], dict)
    
    def test_explain_pattern_id(self, explainer, sample_pattern, sample_requirements):
        """Test pattern_id is correctly set."""
        result = explainer.explain(
            sample_pattern, sample_requirements,
            0.9, 1, 0.8, 1, 0.85, 1
        )
        
        assert result["pattern_id"] == "shadcn-button"
    
    def test_explain_confidence_range(self, explainer, sample_pattern, sample_requirements):
        """Test confidence is in [0, 1] range."""
        result = explainer.explain(
            sample_pattern, sample_requirements,
            0.9, 1, 0.8, 1, 0.85, 1
        )
        
        assert 0 <= result["confidence"] <= 1
    
    def test_explain_ranking_details(self, explainer, sample_pattern, sample_requirements):
        """Test ranking details are correct."""
        result = explainer.explain(
            sample_pattern, sample_requirements,
            bm25_score=0.95,
            bm25_rank=1,
            semantic_score=0.89,
            semantic_rank=2,
            final_score=0.915,
            final_rank=1
        )
        
        details = result["ranking_details"]
        assert details["bm25_score"] == 0.95
        assert details["bm25_rank"] == 1
        assert details["semantic_score"] == 0.89
        assert details["semantic_rank"] == 2
        assert details["final_score"] == 0.92  # Rounded
        assert details["final_rank"] == 1
    
    def test_find_matches_props(self, explainer, sample_pattern, sample_requirements):
        """Test finding matching props."""
        matches = explainer._find_matches(sample_pattern, sample_requirements)
        
        assert "variant" in matches["matched_props"]
        assert "size" in matches["matched_props"]
        # disabled not in requirements
        assert "disabled" not in matches["matched_props"]
    
    def test_find_matches_variants(self, explainer, sample_pattern, sample_requirements):
        """Test finding matching variants."""
        matches = explainer._find_matches(sample_pattern, sample_requirements)
        
        assert "primary" in matches["matched_variants"]
        assert "secondary" in matches["matched_variants"]
        # ghost not in requirements
        assert "ghost" not in matches["matched_variants"]
    
    def test_find_matches_a11y(self, explainer, sample_pattern, sample_requirements):
        """Test finding matching a11y features with fuzzy matching."""
        matches = explainer._find_matches(sample_pattern, sample_requirements)
        
        # Should match "keyboard navigation" (fuzzy)
        assert len(matches["matched_a11y"]) > 0
    
    def test_find_matches_no_matches(self, explainer):
        """Test finding matches when nothing matches."""
        pattern = {
            "metadata": {
                "props": [{"name": "foo"}],
                "variants": [],
                "a11y": {"features": []}
            }
        }
        requirements = {
            "props": ["bar"],
            "variants": [],
            "a11y": []
        }
        
        matches = explainer._find_matches(pattern, requirements)
        
        assert matches["matched_props"] == []
        assert matches["matched_variants"] == []
        assert matches["matched_a11y"] == []
    
    def test_compute_confidence_high_scores(self, explainer, sample_pattern):
        """Test confidence computation with high scores."""
        confidence = explainer._compute_confidence(
            final_score=0.95,
            bm25_rank=1,
            semantic_rank=1,
            pattern=sample_pattern,
            match_highlights={
                "matched_props": ["variant", "size"],
                "matched_variants": ["primary"],
                "matched_a11y": ["aria-label"]
            }
        )
        
        # High scores and rank agreement should give high confidence
        assert confidence > 0.7
    
    def test_compute_confidence_low_scores(self, explainer, sample_pattern):
        """Test confidence with low scores."""
        confidence = explainer._compute_confidence(
            final_score=0.3,
            bm25_rank=10,
            semantic_rank=15,
            pattern=sample_pattern,
            match_highlights={
                "matched_props": [],
                "matched_variants": [],
                "matched_a11y": []
            }
        )
        
        # Low scores should give lower confidence
        assert confidence < 0.5
    
    def test_compute_confidence_rank_agreement(self, explainer, sample_pattern):
        """Test confidence increases with rank agreement."""
        matches = {"matched_props": ["variant"], "matched_variants": [], "matched_a11y": []}
        
        # Same rank in both
        conf_same = explainer._compute_confidence(0.8, 1, 1, sample_pattern, matches)
        
        # Different ranks
        conf_diff = explainer._compute_confidence(0.8, 1, 10, sample_pattern, matches)
        
        # Same rank should have higher confidence
        assert conf_same > conf_diff
    
    def test_compute_confidence_one_retriever(self, explainer, sample_pattern):
        """Test confidence when pattern only in one retriever."""
        matches = {"matched_props": ["variant"], "matched_variants": [], "matched_a11y": []}
        
        # Only in BM25
        conf_bm25 = explainer._compute_confidence(0.8, 1, None, sample_pattern, matches)
        
        # Only in semantic
        conf_sem = explainer._compute_confidence(0.8, None, 1, sample_pattern, matches)
        
        # Both should have moderate confidence
        assert 0.2 < conf_bm25 < 0.8
        assert 0.2 < conf_sem < 0.8
    
    def test_generate_explanation_exact_match(self, explainer, sample_pattern, sample_requirements):
        """Test explanation generation for exact component type match."""
        matches = explainer._find_matches(sample_pattern, sample_requirements)
        explanation = explainer._generate_explanation(
            sample_pattern, sample_requirements, matches, 0.9, 0.85
        )
        
        assert "Exact match for 'button' component type" in explanation
    
    def test_generate_explanation_with_props(self, explainer, sample_pattern, sample_requirements):
        """Test explanation includes matched props."""
        matches = explainer._find_matches(sample_pattern, sample_requirements)
        explanation = explainer._generate_explanation(
            sample_pattern, sample_requirements, matches, 0.9, 0.85
        )
        
        # Should mention props
        assert "variant" in explanation or "props" in explanation
    
    def test_generate_explanation_with_variants(self, explainer, sample_pattern, sample_requirements):
        """Test explanation includes matched variants."""
        matches = explainer._find_matches(sample_pattern, sample_requirements)
        explanation = explainer._generate_explanation(
            sample_pattern, sample_requirements, matches, 0.9, 0.85
        )
        
        # Should mention variants
        assert "variant" in explanation.lower()
    
    def test_generate_explanation_high_scores(self, explainer, sample_pattern, sample_requirements):
        """Test explanation mentions high similarity scores."""
        matches = explainer._find_matches(sample_pattern, sample_requirements)
        explanation = explainer._generate_explanation(
            sample_pattern, sample_requirements, matches, 0.95, 0.92
        )
        
        # Should mention strong match
        assert "strong" in explanation.lower() or "high" in explanation.lower()
    
    def test_generate_explanation_minimal(self, explainer):
        """Test explanation generation with minimal matches."""
        pattern = {"id": "p1", "name": "Card", "metadata": {}}
        requirements = {"component_type": "Card", "props": [], "variants": [], "a11y": []}
        matches = {"matched_props": [], "matched_variants": [], "matched_a11y": []}
        
        explanation = explainer._generate_explanation(
            pattern, requirements, matches, 0.5, 0.5
        )
        
        # Should still have valid explanation
        assert len(explanation) > 0
        assert "card" in explanation
