"""
Tests for Token Exporter Service
"""

import pytest
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from services.token_exporter import TokenExporter


class TestTokenExporter:
    """Test cases for TokenExporter."""

    def test_to_json_basic(self):
        """Test basic JSON export."""
        tokens = {
            "colors": {
                "primary": {"value": "#3B82F6", "confidence": 0.92},
                "secondary": {"value": "#10B981", "confidence": 0.88},
            },
            "typography": {
                "fontFamily": {"value": "Inter", "confidence": 0.75},
                "fontSize": {"value": "16px", "confidence": 0.90},
            },
            "spacing": {
                "padding": {"value": "16px", "confidence": 0.85},
            },
        }

        result = TokenExporter.to_json(tokens)

        assert result["colors"]["primary"] == "#3B82F6"
        assert result["colors"]["secondary"] == "#10B981"
        assert result["typography"]["fontFamily"] == "Inter"
        assert result["typography"]["fontSize"] == "16px"
        assert result["spacing"]["padding"] == "16px"

    def test_to_json_with_metadata(self):
        """Test JSON export with metadata."""
        tokens = {
            "colors": {
                "primary": {"value": "#3B82F6", "confidence": 0.92},
            },
        }
        metadata = {
            "method": "screenshot",
            "timestamp": "2024-01-01T00:00:00Z",
            "averageConfidence": 0.87,
        }

        result = TokenExporter.to_json(tokens, metadata)

        assert "_metadata" in result
        assert result["_metadata"]["extractionMethod"] == "screenshot"
        assert result["_metadata"]["extractedAt"] == "2024-01-01T00:00:00Z"
        assert result["_metadata"]["averageConfidence"] == 0.87

    def test_to_json_handles_simple_values(self):
        """Test JSON export handles values without confidence scores."""
        tokens = {
            "colors": {
                "primary": "#3B82F6",  # Simple string value
            },
        }

        result = TokenExporter.to_json(tokens)

        assert result["colors"]["primary"] == "#3B82F6"

    def test_to_css_basic(self):
        """Test basic CSS export."""
        tokens = {
            "colors": {
                "primary": {"value": "#3B82F6", "confidence": 0.92},
                "secondary": {"value": "#10B981", "confidence": 0.88},
            },
            "typography": {
                "fontFamily": {"value": "Inter", "confidence": 0.75},
                "fontSize": {"value": "16px", "confidence": 0.90},
                "fontWeight": {"value": "500", "confidence": 0.85},
            },
            "spacing": {
                "padding": {"value": "16px", "confidence": 0.85},
                "margin": {"value": "24px", "confidence": 0.80},
            },
        }

        result = TokenExporter.to_css(tokens)

        # Check header
        assert "/**" in result
        assert "Design Tokens" in result
        assert ":root {" in result

        # Check colors
        assert "--color-primary: #3B82F6;" in result
        assert "--color-secondary: #10B981;" in result

        # Check typography
        assert "--font-family: Inter;" in result
        assert "--font-size-base: 16px;" in result
        assert "--font-weight-base: 500;" in result

        # Check spacing
        assert "--spacing-padding: 16px;" in result
        assert "--spacing-margin: 24px;" in result

    def test_to_css_with_metadata(self):
        """Test CSS export with metadata."""
        tokens = {
            "colors": {
                "primary": {"value": "#3B82F6", "confidence": 0.92},
            },
        }
        metadata = {
            "method": "figma",
            "timestamp": "2024-01-01T12:00:00Z",
            "averageConfidence": 0.92,
        }

        result = TokenExporter.to_css(tokens, metadata)

        assert "Extracted via: figma" in result
        assert "Generated at: 2024-01-01T12:00:00Z" in result
        assert "Average confidence: 92%" in result

    def test_to_css_handles_simple_values(self):
        """Test CSS export handles values without confidence scores."""
        tokens = {
            "colors": {
                "primary": "#3B82F6",  # Simple string value
            },
        }

        result = TokenExporter.to_css(tokens)

        assert "--color-primary: #3B82F6;" in result

    def test_to_json_empty_sections(self):
        """Test JSON export with empty sections."""
        tokens = {
            "colors": {},
            "typography": {},
            "spacing": {},
        }

        result = TokenExporter.to_json(tokens)

        assert result["colors"] == {}
        assert result["typography"] == {}
        assert result["spacing"] == {}

    def test_to_css_empty_sections(self):
        """Test CSS export with empty sections."""
        tokens = {
            "colors": {},
            "typography": {},
            "spacing": {},
        }

        result = TokenExporter.to_css(tokens)

        # Should still have structure
        assert ":root {" in result
        # But no actual properties
        assert "--color-" not in result
        assert "--font-" not in result
        assert "--spacing-" not in result

    def test_to_json_partial_typography(self):
        """Test JSON export with partial typography data."""
        tokens = {
            "typography": {
                "fontFamily": {"value": "Inter", "confidence": 0.75},
                # fontSize and fontWeight missing
            },
        }

        result = TokenExporter.to_json(tokens)

        assert result["typography"]["fontFamily"] == "Inter"
        assert "fontSize" not in result["typography"]
        assert "fontWeight" not in result["typography"]
