"""
Integration Tests for Token Extraction Flow

Tests the complete flow from token extraction to export.
"""

import pytest
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from services.token_exporter import TokenExporter


class TestTokenExtractionFlow:
    """Integration tests for token extraction and export flow."""

    @pytest.fixture
    def sample_extracted_tokens(self):
        """Sample tokens as would be extracted from screenshot or Figma."""
        return {
            "colors": {
                "primary": {"value": "#3B82F6", "confidence": 0.92},
                "secondary": {"value": "#10B981", "confidence": 0.88},
                "background": {"value": "#FFFFFF", "confidence": 0.95},
                "foreground": {"value": "#1F2937", "confidence": 0.91},
            },
            "typography": {
                "fontFamily": {"value": "Inter", "confidence": 0.75},
                "fontSize": {"value": "16px", "confidence": 0.90},
                "fontWeight": {"value": "500", "confidence": 0.85},
            },
            "spacing": {
                "padding": {"value": "16px", "confidence": 0.85},
                "margin": {"value": "24px", "confidence": 0.80},
                "gap": {"value": "12px", "confidence": 0.82},
            },
        }

    @pytest.fixture
    def extraction_metadata(self):
        """Sample metadata for extraction."""
        return {
            "method": "screenshot",
            "timestamp": "2024-01-01T12:00:00Z",
            "averageConfidence": 0.87,
        }

    def test_screenshot_to_json_export(self, sample_extracted_tokens, extraction_metadata):
        """
        Test complete flow: Screenshot → Tokens → JSON Export
        
        This simulates:
        1. User uploads screenshot
        2. GPT-4V extracts tokens
        3. User exports as JSON
        """
        # Export to JSON
        result = TokenExporter.to_json(sample_extracted_tokens, extraction_metadata)

        # Verify structure
        assert "colors" in result
        assert "typography" in result
        assert "spacing" in result
        assert "_metadata" in result

        # Verify color tokens
        assert result["colors"]["primary"] == "#3B82F6"
        assert result["colors"]["secondary"] == "#10B981"
        assert result["colors"]["background"] == "#FFFFFF"
        assert result["colors"]["foreground"] == "#1F2937"

        # Verify typography tokens
        assert result["typography"]["fontFamily"] == "Inter"
        assert result["typography"]["fontSize"] == "16px"
        assert result["typography"]["fontWeight"] == "500"

        # Verify spacing tokens
        assert result["spacing"]["padding"] == "16px"
        assert result["spacing"]["margin"] == "24px"
        assert result["spacing"]["gap"] == "12px"

        # Verify metadata
        assert result["_metadata"]["extractionMethod"] == "screenshot"
        assert result["_metadata"]["averageConfidence"] == 0.87

    def test_screenshot_to_css_export(self, sample_extracted_tokens, extraction_metadata):
        """
        Test complete flow: Screenshot → Tokens → CSS Export
        
        This simulates:
        1. User uploads screenshot
        2. GPT-4V extracts tokens
        3. User exports as CSS
        """
        # Export to CSS
        css = TokenExporter.to_css(sample_extracted_tokens, extraction_metadata)

        # Verify CSS structure
        assert ":root {" in css
        assert "Design Tokens" in css

        # Verify color variables
        assert "--color-primary: #3B82F6;" in css
        assert "--color-secondary: #10B981;" in css
        assert "--color-background: #FFFFFF;" in css
        assert "--color-foreground: #1F2937;" in css

        # Verify typography variables
        assert "--font-family: Inter;" in css
        assert "--font-size-base: 16px;" in css
        assert "--font-weight-base: 500;" in css

        # Verify spacing variables
        assert "--spacing-padding: 16px;" in css
        assert "--spacing-margin: 24px;" in css
        assert "--spacing-gap: 12px;" in css

        # Verify metadata in comments
        assert "Extracted via: screenshot" in css
        assert "Average confidence: 87%" in css

    def test_figma_to_json_export(self):
        """
        Test complete flow: Figma → Tokens → JSON Export
        
        This simulates:
        1. User enters Figma URL and PAT
        2. System extracts tokens from Figma
        3. User exports as JSON
        """
        # Simulate Figma-extracted tokens
        figma_tokens = {
            "colors": {
                "primary": {"value": "#3B82F6", "confidence": 0.98},
                "secondary": {"value": "#10B981", "confidence": 0.97},
            },
            "typography": {
                "fontFamily": {"value": "Roboto", "confidence": 0.95},
                "fontSize": {"value": "14px", "confidence": 0.96},
            },
            "spacing": {
                "padding": {"value": "16px", "confidence": 0.94},
            },
        }

        metadata = {
            "method": "figma",
            "timestamp": "2024-01-01T12:00:00Z",
            "averageConfidence": 0.96,
        }

        # Export to JSON
        result = TokenExporter.to_json(figma_tokens, metadata)

        # Verify high confidence from Figma
        assert result["_metadata"]["averageConfidence"] == 0.96
        assert result["_metadata"]["extractionMethod"] == "figma"

        # Verify tokens
        assert result["colors"]["primary"] == "#3B82F6"
        assert result["typography"]["fontFamily"] == "Roboto"

    def test_manual_override_then_export(self, sample_extracted_tokens):
        """
        Test flow with manual override: Extract → Override → Export
        
        This simulates:
        1. User extracts tokens
        2. User manually overrides low-confidence tokens
        3. User exports final result
        """
        # Simulate user manually overriding a color
        sample_extracted_tokens["colors"]["primary"] = {
            "value": "#2563EB",  # User changed from #3B82F6
            "confidence": 1.0,    # Manual override = 100% confidence
        }

        # Export to JSON
        result = TokenExporter.to_json(sample_extracted_tokens)

        # Verify the override took effect
        assert result["colors"]["primary"] == "#2563EB"

        # Export to CSS
        css = TokenExporter.to_css(sample_extracted_tokens)
        assert "--color-primary: #2563EB;" in css

    def test_export_with_fallback_to_defaults(self):
        """
        Test export when low-confidence tokens fallback to defaults.
        
        This simulates:
        1. System extracts tokens with low confidence
        2. Low-confidence tokens replaced with shadcn/ui defaults
        3. User exports result
        """
        # Simulate tokens with some low-confidence values replaced by defaults
        tokens_with_defaults = {
            "colors": {
                "primary": {"value": "#3B82F6", "confidence": 0.65},  # Low confidence
                # Fallback applied:
                "background": {"value": "#FFFFFF", "confidence": 1.0},  # Default
            },
            "typography": {
                "fontFamily": {"value": "Inter", "confidence": 1.0},  # Default
                "fontSize": {"value": "16px", "confidence": 0.50},  # Low confidence
            },
        }

        # Export should work regardless of confidence levels
        result = TokenExporter.to_json(tokens_with_defaults)
        
        assert result["colors"]["primary"] == "#3B82F6"
        assert result["colors"]["background"] == "#FFFFFF"
        assert result["typography"]["fontFamily"] == "Inter"

    def test_export_formats_are_compatible(self, sample_extracted_tokens, extraction_metadata):
        """
        Test that JSON and CSS exports contain the same data.
        """
        json_export = TokenExporter.to_json(sample_extracted_tokens, extraction_metadata)
        css_export = TokenExporter.to_css(sample_extracted_tokens, extraction_metadata)

        # Verify each color in JSON is in CSS
        for color_name, color_value in json_export["colors"].items():
            expected_css_var = f"--color-{color_name}: {color_value};"
            assert expected_css_var in css_export

        # Verify typography
        if "fontFamily" in json_export["typography"]:
            font = json_export["typography"]["fontFamily"]
            assert f"--font-family: {font};" in css_export

        # Verify spacing
        for spacing_name, spacing_value in json_export["spacing"].items():
            expected_css_var = f"--spacing-{spacing_name}: {spacing_value};"
            assert expected_css_var in css_export
