"""
Tests for Prompt Builder

Tests prompt construction, token formatting, and requirement formatting.
"""

import pytest
from src.generation.prompt_builder import PromptBuilder


class TestPromptBuilder:
    """Test suite for PromptBuilder."""
    
    @pytest.fixture
    def builder(self):
        """Create prompt builder instance."""
        return PromptBuilder()
    
    @pytest.fixture
    def sample_pattern_code(self):
        """Sample pattern code."""
        return '''import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};'''
    
    @pytest.fixture
    def sample_tokens(self):
        """Sample design tokens."""
        return {
            "colors": {
                "primary": "#3B82F6",
                "secondary": "#64748B",
            },
            "typography": {
                "fontSize": "16px",
                "fontWeight": "500",
            },
            "spacing": {
                "padding": "8px 16px",
            },
        }
    
    @pytest.fixture
    def sample_requirements(self):
        """Sample requirements."""
        return {
            "props": [
                {
                    "name": "variant",
                    "type": "string",
                    "description": "Button variant (primary, secondary)",
                },
                {
                    "name": "size",
                    "type": "string",
                    "description": "Button size (sm, md, lg)",
                },
            ],
            "events": [
                {
                    "name": "onClick",
                    "type": "() => void",
                    "description": "Click handler",
                },
            ],
            "states": [
                {
                    "name": "disabled",
                    "type": "boolean",
                    "description": "Whether button is disabled",
                },
            ],
            "accessibility": [
                {
                    "name": "aria-label",
                    "description": "Accessible label for button",
                },
            ],
        }
    
    def test_builder_initialization(self, builder):
        """Test that builder initializes correctly."""
        assert builder is not None
        assert builder.template is not None
        assert builder.template.system_prompt != ""
        assert builder.template.user_prompt_template != ""
    
    def test_build_prompt_basic(
        self, 
        builder, 
        sample_pattern_code, 
        sample_tokens, 
        sample_requirements
    ):
        """Test basic prompt building."""
        prompts = builder.build_prompt(
            pattern_code=sample_pattern_code,
            component_name="CustomButton",
            component_type="button",
            tokens=sample_tokens,
            requirements=sample_requirements,
        )
        
        # Check structure
        assert "system" in prompts
        assert "user" in prompts
        
        # Check system prompt
        assert "React and TypeScript developer" in prompts["system"]
        
        # Check user prompt includes key elements
        user_prompt = prompts["user"]
        assert "CustomButton" in user_prompt
        assert "button" in user_prompt
        assert sample_pattern_code in user_prompt
        assert "#3B82F6" in user_prompt  # Color token
        assert "variant" in user_prompt  # Prop requirement
        assert "onClick" in user_prompt  # Event requirement
    
    def test_build_prompt_with_description(
        self, 
        builder, 
        sample_pattern_code, 
        sample_tokens, 
        sample_requirements
    ):
        """Test prompt building with component description."""
        prompts = builder.build_prompt(
            pattern_code=sample_pattern_code,
            component_name="CustomButton",
            component_type="button",
            tokens=sample_tokens,
            requirements=sample_requirements,
            component_description="A custom button with variants",
        )
        
        assert "A custom button with variants" in prompts["user"]
    
    def test_format_design_tokens_complete(self, builder, sample_tokens):
        """Test formatting of complete design tokens."""
        result = builder._format_design_tokens(sample_tokens)
        
        assert "Colors:" in result
        assert "primary: `#3B82F6` → Use as `bg-[#3B82F6]` or `text-[#3B82F6]`" in result
        assert "Typography:" in result
        assert "fontSize: 16px" in result
        assert "Spacing:" in result
        assert "padding: 8px 16px" in result
    
    def test_format_design_tokens_empty(self, builder):
        """Test formatting of empty design tokens."""
        result = builder._format_design_tokens({})
        
        assert "No specific design tokens" in result
    
    def test_format_design_tokens_partial(self, builder):
        """Test formatting with only some token categories."""
        tokens = {
            "colors": {
                "primary": "#3B82F6",
            },
        }
        
        result = builder._format_design_tokens(tokens)
        
        assert "Colors:" in result
        assert "primary: `#3B82F6` → Use as `bg-[#3B82F6]` or `text-[#3B82F6]`" in result
        assert "Typography:" not in result
    
    def test_format_requirements_with_data(self, builder):
        """Test formatting requirements with data."""
        requirements = [
            {
                "name": "variant",
                "type": "string",
                "description": "Button variant",
            },
            {
                "name": "size",
                "type": "string",
                "description": "Button size",
            },
        ]
        
        result = builder._format_requirements(requirements, "Default message")
        
        assert "variant" in result
        assert "string" in result
        assert "Button variant" in result
        assert "size" in result
        assert "Default message" not in result
    
    def test_format_requirements_empty(self, builder):
        """Test formatting empty requirements."""
        result = builder._format_requirements([], "Default message")
        
        assert result == "Default message"
    
    def test_format_requirements_string_format(self, builder):
        """Test formatting requirements with string format."""
        requirements = [
            "Must support keyboard navigation",
            "Must have focus styles",
        ]
        
        result = builder._format_requirements(requirements, "Default")
        
        assert "keyboard navigation" in result
        assert "focus styles" in result
    
    def test_estimate_token_count(self, builder, sample_pattern_code):
        """Test token count estimation."""
        prompts = {
            "system": "Short system prompt",
            "user": "Short user prompt",
        }
        
        count = builder.estimate_token_count(prompts)
        
        # Should be a positive number
        assert count > 0
        # Should be reasonable (not exact, just rough estimate)
        assert count < 100  # Short prompts should be < 100 tokens
    
    def test_estimate_token_count_long(
        self, 
        builder, 
        sample_pattern_code, 
        sample_tokens, 
        sample_requirements
    ):
        """Test token count estimation for longer prompts."""
        prompts = builder.build_prompt(
            pattern_code=sample_pattern_code,
            component_name="CustomButton",
            component_type="button",
            tokens=sample_tokens,
            requirements=sample_requirements,
        )
        
        count = builder.estimate_token_count(prompts)
        
        # Should be more substantial for complete prompt
        assert count > 100
    
    def test_truncate_pattern_short(self, builder):
        """Test that short patterns are not truncated."""
        short_code = "const Button = () => <button>Click</button>;"
        
        result = builder.truncate_pattern_if_needed(short_code, max_lines=200)
        
        assert result == short_code
    
    def test_truncate_pattern_long(self, builder):
        """Test that long patterns are truncated."""
        # Create a pattern with 250 lines
        long_code = "\n".join([f"// Line {i}" for i in range(250)])
        
        result = builder.truncate_pattern_if_needed(long_code, max_lines=200)
        
        # Should be truncated
        assert "truncated" in result.lower()
        # Should have approximately 200 lines
        assert len(result.split('\n')) < 250
    
    def test_build_prompt_empty_requirements(
        self, 
        builder, 
        sample_pattern_code, 
        sample_tokens
    ):
        """Test building prompt with empty requirements."""
        prompts = builder.build_prompt(
            pattern_code=sample_pattern_code,
            component_name="SimpleButton",
            component_type="button",
            tokens=sample_tokens,
            requirements={},
        )
        
        # Should still build valid prompt with defaults
        assert "system" in prompts
        assert "user" in prompts
        assert "No specific props required" in prompts["user"]
    
    def test_system_prompt_content(self, builder):
        """Test that system prompt has expected content."""
        system = builder.SYSTEM_PROMPT
        
        # Should mention key aspects
        assert "React" in system
        assert "TypeScript" in system
        assert "accessible" in system or "ARIA" in system
        assert "shadcn/ui" in system
    
    def test_user_prompt_template_content(self, builder):
        """Test that user prompt template has expected placeholders."""
        template = builder.USER_PROMPT_TEMPLATE
        
        # Should have key placeholders
        assert "{pattern_code}" in template
        assert "{component_name}" in template
        assert "{component_type}" in template
        assert "{design_tokens}" in template
        assert "{props_requirements}" in template
        
        # Should mention constraints
        assert "TypeScript strict mode" in template or "no 'any' types" in template
        assert "ARIA" in template or "accessibility" in template.lower()
