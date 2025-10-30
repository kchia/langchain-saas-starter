"""Tests for BM25 retriever module (B3).

Tests the BM25 lexical search with multi-field weighting
and tokenization support.
"""

import pytest
from src.retrieval.bm25_retriever import BM25Retriever


class TestBM25Retriever:
    """Test suite for BM25Retriever class."""
    
    @pytest.fixture
    def sample_patterns(self):
        """Create sample patterns for testing."""
        return [
            {
                "id": "shadcn-button",
                "name": "Button",
                "category": "form",
                "description": "A customizable button component with multiple variants",
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
                    ]
                }
            },
            {
                "id": "shadcn-card",
                "name": "Card",
                "category": "layout",
                "description": "A card container component for grouping content",
                "metadata": {
                    "props": [
                        {"name": "padding", "type": "string"},
                        {"name": "shadow", "type": "boolean"}
                    ],
                    "variants": [
                        {"name": "elevated"},
                        {"name": "outlined"}
                    ]
                }
            },
            {
                "id": "shadcn-input",
                "name": "Input",
                "category": "form",
                "description": "Text input field component",
                "metadata": {
                    "props": [
                        {"name": "placeholder", "type": "string"},
                        {"name": "disabled", "type": "boolean"},
                        {"name": "value", "type": "string"}
                    ],
                    "variants": []
                }
            }
        ]
    
    @pytest.fixture
    def retriever(self, sample_patterns):
        """Create BM25Retriever instance with sample patterns."""
        return BM25Retriever(sample_patterns)
    
    def test_initialization(self, retriever, sample_patterns):
        """Test retriever initializes correctly."""
        assert retriever.patterns == sample_patterns
        assert len(retriever.pattern_id_map) == len(sample_patterns)
        assert "shadcn-button" in retriever.pattern_id_map
        assert retriever.bm25 is not None
    
    def test_tokenize_basic(self, retriever):
        """Test basic tokenization."""
        tokens = retriever._tokenize("button variant size")
        assert tokens == ["button", "variant", "size"]
    
    def test_tokenize_camelcase(self, retriever):
        """Test camelCase tokenization."""
        tokens = retriever._tokenize("onClick onChange isActive")
        assert "on" in tokens
        assert "click" in tokens
        assert "change" in tokens
        assert "is" in tokens
        assert "active" in tokens
    
    def test_tokenize_kebab_case(self, retriever):
        """Test kebab-case tokenization."""
        tokens = retriever._tokenize("aria-label data-testid")
        assert "aria" in tokens
        assert "label" in tokens
        assert "data" in tokens
        assert "testid" in tokens
    
    def test_tokenize_underscore(self, retriever):
        """Test underscore tokenization."""
        tokens = retriever._tokenize("is_active has_error")
        assert "is" in tokens
        assert "active" in tokens
        assert "has" in tokens
        assert "error" in tokens
    
    def test_tokenize_mixed(self, retriever):
        """Test mixed case tokenization."""
        tokens = retriever._tokenize("onClick aria-label is_active Button")
        assert "on" in tokens
        assert "click" in tokens
        assert "aria" in tokens
        assert "label" in tokens
        assert "is" in tokens
        assert "active" in tokens
        assert "button" in tokens
    
    def test_create_document_structure(self, retriever, sample_patterns):
        """Test document creation structure."""
        doc = retriever._create_document(sample_patterns[0])
        
        # Should contain component name multiple times (3x weight)
        assert doc.count("Button") == 3
        
        # Should contain category (2x weight)
        assert doc.count("form") == 2
        
        # Should contain props
        assert "variant" in doc
        assert "size" in doc
        assert "disabled" in doc
        
        # Should contain description
        assert "customizable" in doc
    
    def test_search_exact_match(self, retriever):
        """Test search with exact component name."""
        results = retriever.search("Button", top_k=5)
        
        # Should return results
        assert len(results) > 0
        
        # Top result should be Button component
        assert results[0][0]["name"] == "Button"
        assert results[0][1] > 0  # Should have positive score
    
    def test_search_variant_query(self, retriever):
        """Test search with variant keywords."""
        results = retriever.search("button variant primary", top_k=5)
        
        # Button should rank first (has variant and primary)
        assert results[0][0]["name"] == "Button"
        
        # Button should have higher score than Card
        button_score = results[0][1]
        card_result = [r for r in results if r[0]["name"] == "Card"]
        if card_result:
            assert button_score > card_result[0][1]
    
    def test_search_category_query(self, retriever):
        """Test search by category."""
        results = retriever.search("form input", top_k=5)
        
        # Both Button and Input are form components
        form_components = [r for r in results if r[0]["category"] == "form"]
        assert len(form_components) >= 2
    
    def test_search_props_query(self, retriever):
        """Test search by props."""
        results = retriever.search("disabled", top_k=5)
        
        # Button and Input both have disabled prop
        names = [r[0]["name"] for r in results[:2]]
        assert "Button" in names or "Input" in names
    
    def test_search_description_query(self, retriever):
        """Test search by description keywords."""
        results = retriever.search("container grouping", top_k=5)
        
        # Card has these keywords in description
        card_in_top = any(r[0]["name"] == "Card" for r in results[:3])
        assert card_in_top
    
    def test_search_no_results(self, retriever):
        """Test search with non-matching query."""
        results = retriever.search("nonexistent component xyz", top_k=5)
        
        # Should still return results (all patterns), but with low scores
        assert len(results) == 3  # All 3 patterns
        # Scores should be close to zero
        assert all(score < 1.0 for _, score in results)
    
    def test_search_top_k_limit(self, retriever):
        """Test top_k parameter limits results."""
        results = retriever.search("component", top_k=2)
        
        # Should return exactly 2 results
        assert len(results) == 2
    
    def test_search_scoring_order(self, retriever):
        """Test results are sorted by score descending."""
        results = retriever.search("button form variant", top_k=5)
        
        # Scores should be in descending order
        scores = [score for _, score in results]
        assert scores == sorted(scores, reverse=True)
    
    def test_field_weighting_name_vs_description(self, retriever):
        """Test that name matches score higher than description matches."""
        # Search for "Button" - should match name strongly
        name_results = retriever.search("Button", top_k=1)
        
        # Search for description keyword - should have lower score
        desc_results = retriever.search("customizable", top_k=1)
        
        # Name match should have higher score
        assert name_results[0][1] > desc_results[0][1]
    
    def test_search_with_explanation(self, retriever):
        """Test search with explanation returns detailed info."""
        results = retriever.search_with_explanation("button variant", top_k=3)
        
        # Should have detailed structure
        assert len(results) <= 3
        assert all("pattern" in r for r in results)
        assert all("score" in r for r in results)
        assert all("matched_terms" in r for r in results)
        assert all("match_count" in r for r in results)
        
        # Top result should have matched terms
        if results:
            assert len(results[0]["matched_terms"]) > 0
    
    def test_search_explanation_matched_terms(self, retriever):
        """Test explanation shows which terms matched."""
        results = retriever.search_with_explanation("button variant", top_k=1)
        
        if results:
            matched = results[0]["matched_terms"]
            # Should match "button" and "variant"
            assert "button" in matched or "variant" in matched
    
    def test_empty_query(self, retriever):
        """Test search with empty query."""
        results = retriever.search("", top_k=5)
        
        # Should return all patterns (with zero or low scores)
        assert len(results) <= 5
    
    def test_case_insensitive_search(self, retriever):
        """Test search is case-insensitive."""
        results_lower = retriever.search("button", top_k=1)
        results_upper = retriever.search("BUTTON", top_k=1)
        results_mixed = retriever.search("BuTtOn", top_k=1)
        
        # Should all return Button as top result
        assert results_lower[0][0]["name"] == "Button"
        assert results_upper[0][0]["name"] == "Button"
        assert results_mixed[0][0]["name"] == "Button"
        
        # Scores should be similar (within small tolerance)
        assert abs(results_lower[0][1] - results_upper[0][1]) < 0.1
    
    def test_multiword_query(self, retriever):
        """Test search with multiple keywords."""
        results = retriever.search("form button variant primary disabled", top_k=1)
        
        # Button should rank highest (matches all terms)
        assert results[0][0]["name"] == "Button"
