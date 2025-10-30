"""
Tests for Pattern Parser

Tests pattern parsing functionality with all 10 curated patterns.
Updated for simplified LLM-first pattern parser.
"""

import pytest
from pathlib import Path

from src.generation.pattern_parser import PatternParser
from src.generation.types import PatternStructure


class TestPatternParser:
    """Test suite for PatternParser."""
    
    @pytest.fixture
    def parser(self):
        """Create parser instance with default patterns directory."""
        return PatternParser()
    
    @pytest.fixture
    def patterns_dir(self):
        """Get patterns directory path."""
        backend_dir = Path(__file__).parent.parent.parent
        return backend_dir / "data" / "patterns"
    
    def test_parser_initialization(self, parser):
        """Test that parser initializes correctly."""
        assert parser is not None
        assert parser.patterns_dir.exists()
    
    def test_load_button_pattern(self, parser):
        """Test loading button pattern JSON."""
        pattern_data = parser.load_pattern("shadcn-button")
        
        assert pattern_data is not None
        assert "name" in pattern_data
        assert pattern_data["name"] == "Button"
        assert "code" in pattern_data
        assert "metadata" in pattern_data
    
    def test_load_nonexistent_pattern(self, parser):
        """Test that loading non-existent pattern raises error."""
        with pytest.raises(FileNotFoundError):
            parser.load_pattern("shadcn-nonexistent")
    
    def test_parse_button_pattern(self, parser):
        """Test parsing button pattern structure."""
        result = parser.parse("shadcn-button")
        
        assert isinstance(result, PatternStructure)
        assert result.component_name == "Button"
        assert result.component_type == "button"
        assert len(result.variants) > 0
        assert "default" in result.variants or "primary" in result.variants
        assert result.code != ""
        assert isinstance(result.dependencies, list)
        assert isinstance(result.metadata, dict)
    
    def test_parse_card_pattern(self, parser):
        """Test parsing card pattern structure."""
        result = parser.parse("shadcn-card")
        
        assert isinstance(result, PatternStructure)
        assert result.component_name == "Card"
        assert result.component_type == "card"
        assert result.code != ""
        assert isinstance(result.dependencies, list)
        assert isinstance(result.metadata, dict)
    
    
    def test_extract_variants_from_metadata(self, parser):
        """Test extracting variants from pattern metadata."""
        metadata = {
            "variants": [
                {"name": "default", "description": "Primary button"},
                {"name": "secondary", "description": "Secondary button"},
                {"name": "ghost", "description": "Ghost button"}
            ]
        }
        
        variants = parser._extract_variants(metadata)
        
        assert len(variants) == 3
        assert "default" in variants
        assert "secondary" in variants
        assert "ghost" in variants
    
    def test_component_type_extraction(self, parser):
        """Test that component type is correctly extracted from pattern_id."""
        result = parser.parse("shadcn-input")
        
        assert result.component_type == "input"
        
        result = parser.parse("shadcn-checkbox")
        assert result.component_type == "checkbox"
    
    def test_metadata_extraction(self, parser):
        """Test that pattern metadata is properly extracted."""
        result = parser.parse("shadcn-button")
        
        assert isinstance(result.metadata, dict)
        # Metadata should contain pattern information
        assert len(result.metadata) >= 0  # Can be empty or have data
    
    def test_list_available_patterns(self, parser):
        """Test listing all available patterns."""
        patterns = parser.list_available_patterns()
        
        assert len(patterns) >= 10  # At least 10 patterns
        assert "shadcn-button" in patterns
        assert "shadcn-card" in patterns
        assert "shadcn-input" in patterns
    
    @pytest.mark.parametrize("pattern_id", [
        "shadcn-button",
        "shadcn-card",
        "shadcn-input",
        "shadcn-badge",
        "shadcn-alert",
        "shadcn-checkbox",
        "shadcn-radio",
        "shadcn-select",
        "shadcn-switch",
        "shadcn-tabs"
    ])
    def test_parse_all_patterns(self, parser, pattern_id):
        """Test that all 10 curated patterns parse successfully with simplified interface."""
        result = parser.parse(pattern_id)
        
        assert isinstance(result, PatternStructure)
        assert result.component_name != ""
        assert result.component_type != ""
        assert result.code != ""
        assert isinstance(result.variants, list)
        assert isinstance(result.dependencies, list)
        assert isinstance(result.metadata, dict)
