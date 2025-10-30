"""Tests for query builder module (B8).

Tests the transformation of requirements JSON into retrieval queries
for BM25 and semantic search.
"""

import pytest
from src.retrieval.query_builder import QueryBuilder


class TestQueryBuilder:
    """Test suite for QueryBuilder class."""
    
    @pytest.fixture
    def builder(self):
        """Create QueryBuilder instance for tests."""
        return QueryBuilder()
    
    def test_build_from_requirements_basic(self, builder):
        """Test basic query construction from requirements."""
        requirements = {
            "component_type": "Button",
            "props": ["variant", "size"],
            "variants": ["primary", "secondary", "ghost"]
        }
        
        result = builder.build_from_requirements(requirements)
        
        # Should have all three query types
        assert "bm25_query" in result
        assert "semantic_query" in result
        assert "filters" in result
        
        # BM25 query should contain component type 3x
        assert result["bm25_query"].count("button") == 3
        assert "variant" in result["bm25_query"]
        assert "size" in result["bm25_query"]
        
        # Semantic query should be natural language
        assert "Button component" in result["semantic_query"]
        assert "with variant" in result["semantic_query"]
    
    def test_bm25_query_weighting(self, builder):
        """Test BM25 query has proper term weighting."""
        requirements = {
            "component_type": "Card",
            "props": ["title", "description"],
            "variants": ["elevated", "outlined"]
        }
        
        query = builder._build_bm25_query(requirements)
        
        # Component type should appear 3 times (weight 3x)
        assert query.count("card") == 3
        
        # Props should appear once each (weight 1x)
        assert query.count("title") == 1
        assert query.count("description") == 1
        
        # Variants should appear once each (weight 1x)
        assert query.count("elevated") == 1
        assert query.count("outlined") == 1
    
    def test_bm25_query_props_as_dicts(self, builder):
        """Test BM25 query handles props as list of dicts."""
        requirements = {
            "component_type": "Input",
            "props": [
                {"name": "placeholder", "type": "string"},
                {"name": "disabled", "type": "boolean"}
            ]
        }
        
        query = builder._build_bm25_query(requirements)
        
        assert "placeholder" in query
        assert "disabled" in query
        # Should lowercase
        assert "PLACEHOLDER" not in query.upper() or "placeholder" in query
    
    def test_bm25_query_empty_requirements(self, builder):
        """Test BM25 query with empty requirements."""
        requirements = {}
        
        query = builder._build_bm25_query(requirements)
        
        # Should return empty string
        assert query == ""
    
    def test_bm25_query_missing_fields(self, builder):
        """Test BM25 query handles missing fields gracefully."""
        requirements = {
            "component_type": "Badge"
            # Missing props, variants, states
        }
        
        query = builder._build_bm25_query(requirements)
        
        # Should still work with just component type
        assert query == "badge badge badge"
    
    def test_semantic_query_complete(self, builder):
        """Test semantic query generation with all fields."""
        requirements = {
            "component_type": "Button",
            "props": ["variant", "size", "disabled"],
            "variants": ["primary", "secondary", "ghost"],
            "a11y": ["aria-label", "keyboard navigation"]
        }
        
        query = builder._build_semantic_query(requirements)
        
        # Should be a complete sentence
        assert query.startswith("A Button component")
        assert query.endswith(".")
        
        # Should include props
        assert "variant" in query
        assert "size" in query
        assert "disabled" in query
        
        # Should include variants
        assert "primary" in query
        assert "secondary" in query
        assert "ghost" in query
        
        # Should include a11y features
        assert "aria-label" in query
        assert "keyboard navigation" in query
    
    def test_semantic_query_single_prop(self, builder):
        """Test semantic query with single prop."""
        requirements = {
            "component_type": "Switch",
            "props": ["checked"]
        }
        
        query = builder._build_semantic_query(requirements)
        
        # Should not have "and" for single prop
        assert "with checked props" in query
        assert " and " not in query or " and " in "checked"
    
    def test_semantic_query_multiple_props(self, builder):
        """Test semantic query with multiple props."""
        requirements = {
            "component_type": "Select",
            "props": ["value", "onChange", "options"]
        }
        
        query = builder._build_semantic_query(requirements)
        
        # Should use "and" for last prop
        assert "value" in query
        assert "onChange" in query
        assert "options" in query
        assert " and " in query
    
    def test_semantic_query_props_as_dicts(self, builder):
        """Test semantic query handles props as dicts."""
        requirements = {
            "component_type": "Checkbox",
            "props": [
                {"name": "checked", "type": "boolean"},
                {"name": "label", "type": "string"}
            ]
        }
        
        query = builder._build_semantic_query(requirements)
        
        assert "checked" in query
        assert "label" in query
    
    def test_semantic_query_minimal(self, builder):
        """Test semantic query with minimal requirements."""
        requirements = {
            "component_type": "Alert"
        }
        
        query = builder._build_semantic_query(requirements)
        
        # Should still be valid
        assert query == "A Alert component."
    
    def test_filters_with_component_type(self, builder):
        """Test filter construction with component type."""
        requirements = {
            "component_type": "Button"
        }
        
        filters = builder._build_filters(requirements)
        
        assert "type" in filters
        assert filters["type"] == "button"
    
    def test_filters_empty(self, builder):
        """Test filter construction with no component type."""
        requirements = {}
        
        filters = builder._build_filters(requirements)
        
        assert filters == {}
    
    def test_edge_case_special_characters(self, builder):
        """Test handling of special characters in input."""
        requirements = {
            "component_type": "Custom-Button",
            "props": ["on-click", "is_active"]
        }
        
        query = builder._build_bm25_query(requirements)
        
        # Should preserve special chars (hyphen, underscore)
        assert "custom-button" in query
        assert "on-click" in query
        assert "is_active" in query
    
    def test_case_insensitivity(self, builder):
        """Test that all outputs are lowercase."""
        requirements = {
            "component_type": "BUTTON",
            "props": ["VARIANT", "Size"],
            "variants": ["Primary", "SECONDARY"]
        }
        
        bm25_query = builder._build_bm25_query(requirements)
        
        # All should be lowercase
        assert bm25_query.islower()
        assert "button" in bm25_query
        assert "variant" in bm25_query
        assert "size" in bm25_query
        assert "primary" in bm25_query
        assert "secondary" in bm25_query
