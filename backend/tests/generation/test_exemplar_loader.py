"""
Tests for Exemplar Loader

Tests loading exemplars and selection logic.
"""

import pytest
from pathlib import Path
from src.generation.exemplar_loader import ExemplarLoader, Exemplar


class TestExemplarLoader:
    """Test suite for ExemplarLoader."""
    
    @pytest.fixture
    def loader(self):
        """Create exemplar loader instance."""
        return ExemplarLoader()
    
    def test_loader_initialization(self, loader):
        """Test that loader initializes correctly."""
        assert loader is not None
        assert loader.exemplars_dir.exists()
    
    def test_load_exemplars(self, loader):
        """Test that exemplars are loaded."""
        count = loader.get_count()
        
        # Should have at least the button exemplar
        assert count > 0
    
    def test_get_available_types(self, loader):
        """Test getting available exemplar types."""
        types = loader.get_available_types()
        
        assert isinstance(types, list)
        # Should have button
        assert 'button' in types
    
    def test_get_exemplar_button(self, loader):
        """Test getting button exemplar."""
        exemplar = loader.get_exemplar('button')
        
        assert exemplar is not None
        assert isinstance(exemplar, Exemplar)
        assert exemplar.component_type == 'button'
        assert exemplar.component_name != ""
        assert exemplar.component_code != ""
        assert exemplar.stories_code != ""
    
    def test_get_exemplar_case_insensitive(self, loader):
        """Test that exemplar lookup is case insensitive."""
        exemplar1 = loader.get_exemplar('button')
        exemplar2 = loader.get_exemplar('Button')
        exemplar3 = loader.get_exemplar('BUTTON')
        
        # All should return the same exemplar
        assert exemplar1 is not None
        assert exemplar2 is not None
        assert exemplar3 is not None
    
    def test_get_exemplar_nonexistent(self, loader):
        """Test getting non-existent exemplar."""
        exemplar = loader.get_exemplar('nonexistent')
        
        assert exemplar is None
    
    def test_get_relevant_exemplars_exact_match(self, loader):
        """Test getting relevant exemplars with exact match."""
        exemplars = loader.get_relevant_exemplars('button', max_count=2)
        
        assert len(exemplars) > 0
        # First should be exact match
        assert exemplars[0].component_type == 'button'
    
    def test_get_relevant_exemplars_max_count(self, loader):
        """Test that max_count is respected."""
        exemplars = loader.get_relevant_exemplars('button', max_count=1)
        
        assert len(exemplars) <= 1
        
        exemplars = loader.get_relevant_exemplars('button', max_count=3)
        
        assert len(exemplars) <= 3
    
    def test_format_for_prompt(self, loader):
        """Test formatting exemplar for prompt."""
        exemplar = loader.get_exemplar('button')
        
        if exemplar:
            formatted = loader.format_for_prompt(exemplar)
            
            assert isinstance(formatted, str)
            assert exemplar.component_name in formatted
            assert 'Example:' in formatted
            assert 'Input Requirements:' in formatted
            assert 'Generated Component:' in formatted
            assert 'Generated Stories:' in formatted
    
    def test_exemplar_structure(self, loader):
        """Test that loaded exemplar has correct structure."""
        exemplar = loader.get_exemplar('button')
        
        if exemplar:
            # Check required fields
            assert hasattr(exemplar, 'component_name')
            assert hasattr(exemplar, 'component_type')
            assert hasattr(exemplar, 'input_data')
            assert hasattr(exemplar, 'component_code')
            assert hasattr(exemplar, 'stories_code')
            assert hasattr(exemplar, 'metadata')
            
            # Check types
            assert isinstance(exemplar.input_data, dict)
            assert isinstance(exemplar.metadata, dict)
            assert isinstance(exemplar.component_code, str)
            assert isinstance(exemplar.stories_code, str)
    
    def test_exemplar_input_data(self, loader):
        """Test that exemplar input data has expected structure."""
        exemplar = loader.get_exemplar('button')
        
        if exemplar:
            input_data = exemplar.input_data
            
            # Should have key sections
            assert 'tokens' in input_data or 'requirements' in input_data
    
    def test_exemplar_component_code_quality(self, loader):
        """Test that exemplar component code is high quality."""
        exemplar = loader.get_exemplar('button')
        
        if exemplar:
            code = exemplar.component_code
            
            # Should have TypeScript/React elements
            assert 'import' in code
            assert 'export' in code
            assert 'React' in code or 'react' in code
    
    def test_exemplar_stories_code_quality(self, loader):
        """Test that exemplar stories code is high quality."""
        exemplar = loader.get_exemplar('button')
        
        if exemplar:
            stories = exemplar.stories_code
            
            # Should have Storybook elements
            assert 'import' in stories
            assert 'export' in stories
            assert 'Meta' in stories or 'Story' in stories


class TestExemplarLoaderEdgeCases:
    """Test edge cases and error handling."""
    
    def test_loader_with_nonexistent_dir(self):
        """Test loader with non-existent exemplars directory."""
        fake_dir = Path("/nonexistent/path/to/exemplars")
        loader = ExemplarLoader(exemplars_dir=fake_dir)
        
        # Should handle gracefully
        assert loader is not None
        assert loader.get_count() == 0
    
    def test_get_relevant_exemplars_empty_cache(self):
        """Test getting relevant exemplars when cache is empty."""
        fake_dir = Path("/nonexistent/path/to/exemplars")
        loader = ExemplarLoader(exemplars_dir=fake_dir)
        
        exemplars = loader.get_relevant_exemplars('button')
        
        assert exemplars == []
