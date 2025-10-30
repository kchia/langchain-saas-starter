"""
Token Exporter Service

Handles exporting design tokens to various formats (JSON, CSS).
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional, Literal


class TokenExporter:
    """Service for exporting design tokens to different formats."""

    @staticmethod
    def to_json(
        tokens: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Export tokens as JSON format.
        
        Args:
            tokens: Token data with colors, typography, spacing
            metadata: Optional metadata about extraction
            
        Returns:
            JSON-serializable dictionary
            
        Example:
            >>> tokens = {
            ...     "colors": {"primary": {"value": "#3B82F6", "confidence": 0.92}},
            ...     "typography": {"fontSize": {"value": "16px", "confidence": 0.90}}
            ... }
            >>> result = TokenExporter.to_json(tokens)
            >>> result["colors"]["primary"]
            '#3B82F6'
        """
        output: Dict[str, Any] = {
            "colors": {},
            "typography": {},
            "spacing": {},
        }

        # Extract colors
        if "colors" in tokens:
            for key, data in tokens["colors"].items():
                output["colors"][key] = data.get("value", data) if isinstance(data, dict) else data

        # Extract typography
        if "typography" in tokens:
            typo = tokens["typography"]
            if "fontFamily" in typo:
                output["typography"]["fontFamily"] = (
                    typo["fontFamily"].get("value", typo["fontFamily"])
                    if isinstance(typo["fontFamily"], dict)
                    else typo["fontFamily"]
                )
            if "fontSize" in typo:
                output["typography"]["fontSize"] = (
                    typo["fontSize"].get("value", typo["fontSize"])
                    if isinstance(typo["fontSize"], dict)
                    else typo["fontSize"]
                )
            if "fontWeight" in typo:
                output["typography"]["fontWeight"] = (
                    typo["fontWeight"].get("value", typo["fontWeight"])
                    if isinstance(typo["fontWeight"], dict)
                    else typo["fontWeight"]
                )

        # Extract spacing
        if "spacing" in tokens:
            for key, data in tokens["spacing"].items():
                output["spacing"][key] = data.get("value", data) if isinstance(data, dict) else data

        # Add metadata
        if metadata:
            output["_metadata"] = {
                "extractionMethod": metadata.get("method", "unknown"),
                "extractedAt": metadata.get("timestamp", datetime.now(timezone.utc).isoformat()),
                "averageConfidence": metadata.get("averageConfidence"),
            }

        return output

    @staticmethod
    def to_css(
        tokens: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Export tokens as CSS custom properties.
        
        Args:
            tokens: Token data with colors, typography, spacing
            metadata: Optional metadata about extraction
            
        Returns:
            CSS string with custom properties
            
        Example:
            >>> tokens = {
            ...     "colors": {"primary": {"value": "#3B82F6", "confidence": 0.92}}
            ... }
            >>> css = TokenExporter.to_css(tokens)
            >>> "--color-primary: #3B82F6;" in css
            True
        """
        lines = []

        # Add header comment
        lines.append("/**")
        lines.append(" * Design Tokens")
        if metadata:
            method = metadata.get("method", "unknown")
            lines.append(f" * Extracted via: {method}")
            timestamp = metadata.get("timestamp", datetime.now(timezone.utc).isoformat())
            lines.append(f" * Generated at: {timestamp}")
            if "averageConfidence" in metadata and metadata["averageConfidence"] is not None:
                conf_pct = int(metadata["averageConfidence"] * 100)
                lines.append(f" * Average confidence: {conf_pct}%")
        lines.append(" */")
        lines.append("")
        lines.append(":root {")

        # Add colors
        if "colors" in tokens and tokens["colors"]:
            lines.append("  /* Colors */")
            for key, data in tokens["colors"].items():
                value = data.get("value", data) if isinstance(data, dict) else data
                lines.append(f"  --color-{key}: {value};")
            lines.append("")

        # Add typography
        if "typography" in tokens and tokens["typography"]:
            lines.append("  /* Typography */")
            typo = tokens["typography"]
            if "fontFamily" in typo:
                value = (
                    typo["fontFamily"].get("value", typo["fontFamily"])
                    if isinstance(typo["fontFamily"], dict)
                    else typo["fontFamily"]
                )
                lines.append(f"  --font-family: {value};")
            if "fontSize" in typo:
                value = (
                    typo["fontSize"].get("value", typo["fontSize"])
                    if isinstance(typo["fontSize"], dict)
                    else typo["fontSize"]
                )
                lines.append(f"  --font-size-base: {value};")
            if "fontWeight" in typo:
                value = (
                    typo["fontWeight"].get("value", typo["fontWeight"])
                    if isinstance(typo["fontWeight"], dict)
                    else typo["fontWeight"]
                )
                lines.append(f"  --font-weight-base: {value};")
            lines.append("")

        # Add spacing
        if "spacing" in tokens and tokens["spacing"]:
            lines.append("  /* Spacing */")
            for key, data in tokens["spacing"].items():
                value = data.get("value", data) if isinstance(data, dict) else data
                lines.append(f"  --spacing-{key}: {value};")

        lines.append("}")

        return "\n".join(lines)
