"""
Tests for LLM Code Generator

Tests LLM generation, structured output parsing, and error handling.
Uses mock generator to avoid API calls during testing.
"""

import pytest
from src.generation.llm_generator import (
    LLMGeneratedCode,
    MockLLMGenerator,
)


class TestLLMGeneratedCode:
    """Test suite for LLMGeneratedCode dataclass."""
    
    def test_dataclass_creation(self):
        """Test creating LLMGeneratedCode instance."""
        code = LLMGeneratedCode(
            component_code="const Button = () => <button>Click</button>;",
            stories_code="// stories",
            showcase_code="// showcase",
            imports=["import React from 'react';"],
            exports=["Button"],
            explanation="Test component",
            token_usage={"prompt_tokens": 100, "completion_tokens": 50, "total_tokens": 150},
        )
        
        assert code.component_code != ""
        assert code.stories_code != ""
        assert len(code.imports) == 1
        assert len(code.exports) == 1
        assert code.token_usage["total_tokens"] == 150
    
    def test_to_dict(self):
        """Test converting to dictionary."""
        code = LLMGeneratedCode(
            component_code="test",
            stories_code="test",
            showcase_code="test",
            imports=[],
            exports=[],
            explanation="test",
            token_usage={},
        )
        
        result = code.to_dict()
        
        assert isinstance(result, dict)
        assert "component_code" in result
        assert "stories_code" in result
        assert "imports" in result
        assert "exports" in result


class TestMockLLMGenerator:
    """Test suite for MockLLMGenerator."""
    
    @pytest.fixture
    def generator(self):
        """Create mock generator instance."""
        return MockLLMGenerator()
    
    def test_generator_initialization(self, generator):
        """Test that generator initializes correctly."""
        assert generator is not None
        assert generator.model == "mock-gpt-4"
        assert generator.max_retries == 3
        assert generator.timeout == 60
    
    @pytest.mark.asyncio
    async def test_generate_basic(self, generator):
        """Test basic code generation."""
        result = await generator.generate(
            system_prompt="You are a React developer.",
            user_prompt="Generate a button component.",
        )
        
        assert isinstance(result, LLMGeneratedCode)
        assert result.component_code != ""
        assert result.stories_code != ""
        assert len(result.imports) > 0
        assert len(result.exports) > 0
        assert result.explanation != ""
        assert result.token_usage["total_tokens"] > 0
    
    @pytest.mark.asyncio
    async def test_generate_component_structure(self, generator):
        """Test that generated component has expected structure."""
        result = await generator.generate(
            system_prompt="You are a React developer.",
            user_prompt="Generate a button component.",
        )
        
        # Check component code includes key elements
        component = result.component_code
        assert "React" in component
        assert "interface" in component or "type" in component  # TypeScript types
        assert "export" in component
        assert "Button" in component
    
    @pytest.mark.asyncio
    async def test_generate_stories_structure(self, generator):
        """Test that generated stories have expected structure."""
        result = await generator.generate(
            system_prompt="You are a React developer.",
            user_prompt="Generate a button component.",
        )
        
        # Check stories code includes Storybook elements
        stories = result.stories_code
        assert "Meta" in stories or "Story" in stories
        assert "export" in stories
        assert "Button" in stories
    
    @pytest.mark.asyncio
    async def test_generate_imports(self, generator):
        """Test that imports are captured."""
        result = await generator.generate(
            system_prompt="You are a React developer.",
            user_prompt="Generate a button component.",
        )
        
        assert len(result.imports) > 0
        # Should have React import
        assert any("React" in imp for imp in result.imports)
    
    @pytest.mark.asyncio
    async def test_generate_exports(self, generator):
        """Test that exports are captured."""
        result = await generator.generate(
            system_prompt="You are a React developer.",
            user_prompt="Generate a button component.",
        )
        
        assert len(result.exports) > 0
        # Should export Button
        assert "Button" in result.exports
    
    @pytest.mark.asyncio
    async def test_generate_token_usage(self, generator):
        """Test that token usage is tracked."""
        result = await generator.generate(
            system_prompt="You are a React developer.",
            user_prompt="Generate a button component.",
        )
        
        token_usage = result.token_usage
        assert "prompt_tokens" in token_usage
        assert "completion_tokens" in token_usage
        assert "total_tokens" in token_usage
        
        # Check that totals add up
        assert (
            token_usage["total_tokens"] ==
            token_usage["prompt_tokens"] + token_usage["completion_tokens"]
        )
    
    @pytest.mark.asyncio
    async def test_generate_with_different_temperature(self, generator):
        """Test generation with different temperature."""
        result = await generator.generate(
            system_prompt="You are a React developer.",
            user_prompt="Generate a button component.",
            temperature=0.5,
        )
        
        # Should still generate valid output
        assert result.component_code != ""
        assert result.stories_code != ""
    
    def test_estimate_cost(self, generator):
        """Test cost estimation."""
        token_usage = {
            "prompt_tokens": 1000,
            "completion_tokens": 500,
            "total_tokens": 1500,
        }
        
        cost = generator.estimate_cost(token_usage)
        
        # Should be a positive number
        assert cost > 0
        # Cost should be in reasonable range for these tokens
        assert cost < 0.10  # Less than 10 cents for 1500 tokens
    
    def test_estimate_cost_zero_tokens(self, generator):
        """Test cost estimation with zero tokens."""
        token_usage = {
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
        }
        
        cost = generator.estimate_cost(token_usage)
        
        assert cost == 0.0
    
    def test_get_model_info(self, generator):
        """Test getting model information."""
        info = generator.get_model_info()
        
        assert "model" in info
        assert "max_retries" in info
        assert "timeout" in info
        assert "langsmith_enabled" in info
        
        assert info["model"] == "mock-gpt-4"
        assert info["max_retries"] == 3
        assert info["timeout"] == 60


class TestLLMGeneratorValidation:
    """Test validation logic in LLM generator."""
    
    @pytest.fixture
    def generator(self):
        """Create mock generator instance."""
        return MockLLMGenerator()
    
    def test_validate_response_valid(self, generator):
        """Test validation with valid response."""
        response = {
            "component_code": "const Button = () => <button>Click</button>;",
            "stories_code": "// stories",
            "showcase_code": "// showcase",
            "imports": [],
            "exports": [],
            "explanation": "test",
        }
        
        # Should not raise
        generator._validate_response(response)
    
    def test_validate_response_missing_component_code(self, generator):
        """Test validation with missing component_code."""
        response = {
            "stories_code": "// stories",
        }
        
        with pytest.raises(ValueError, match="Missing required field: component_code"):
            generator._validate_response(response)
    
    def test_validate_response_missing_stories_code(self, generator):
        """Test validation with missing stories_code."""
        response = {
            "component_code": "const Button = () => <button>Click</button>;",
        }
        
        with pytest.raises(ValueError, match="Missing required field: stories_code"):
            generator._validate_response(response)
    
    def test_validate_response_empty_component_code(self, generator):
        """Test validation with empty component_code."""
        response = {
            "component_code": "",
            "stories_code": "// stories",
        }
        
        with pytest.raises(ValueError, match="Invalid value for field: component_code"):
            generator._validate_response(response)
    
    def test_validate_response_non_string_component_code(self, generator):
        """Test validation with non-string component_code."""
        response = {
            "component_code": 123,  # Not a string
            "stories_code": "// stories",
        }
        
        with pytest.raises(ValueError, match="Invalid value for field: component_code"):
            generator._validate_response(response)
