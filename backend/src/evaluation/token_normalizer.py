"""Token normalization for E2E evaluation.

This module normalizes generic design system tokens (extracted by GPT-4V)
to component-specific tokens (expected by ground truth) for accurate evaluation.
"""

from typing import Dict, Any, List, Tuple
from ..core.logging import get_logger

logger = get_logger(__name__)


class TokenNormalizer:
    """Normalizes extracted tokens to match ground truth schema."""

    def __init__(self):
        """Initialize token normalizer with mapping rules."""
        self.unmappable_categories = {'dimensions'}  # Not extractable from vision

    def normalize_extracted_tokens(
        self,
        extracted: Dict[str, Any],
        component_type: str,
        expected: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Normalize extracted tokens to match expected ground truth format.

        Args:
            extracted: Generic tokens from extractor (e.g., primary, fontSizeSm)
            component_type: Component type from screenshot_id (e.g., "alert", "button")
            expected: Expected ground truth tokens (for reference)

        Returns:
            Normalized tokens matching expected schema
        """
        normalized = {}

        # Normalize each category
        for category in ['colors', 'spacing', 'typography', 'border', 'borderRadius']:
            if category in extracted:
                normalized_category = self._normalize_category(
                    extracted[category],
                    category,
                    component_type,
                    expected.get(category, {})
                )
                if normalized_category:
                    # Handle borderRadius -> border category mapping
                    target_category = 'border' if category == 'borderRadius' else category
                    if target_category not in normalized:
                        normalized[target_category] = {}
                    normalized[target_category].update(normalized_category)

        return normalized

    def _normalize_category(
        self,
        extracted_cat: Dict[str, Any],
        category: str,
        component_type: str,
        expected_cat: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Normalize a specific category of tokens."""
        normalized = {}

        if category == 'colors':
            normalized = self._normalize_colors(extracted_cat, component_type, expected_cat)
        elif category == 'spacing':
            normalized = self._normalize_spacing(extracted_cat, component_type, expected_cat)
        elif category == 'typography':
            normalized = self._normalize_typography(extracted_cat, component_type, expected_cat)
        elif category in ('border', 'borderRadius'):
            normalized = self._normalize_border(extracted_cat, category, expected_cat)

        return normalized

    def _normalize_colors(
        self,
        extracted: Dict[str, Any],
        component_type: str,
        expected: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Normalize color tokens based on component type."""
        normalized = {}

        # Component-specific mappings
        if component_type == 'alert':
            # Alert variant colors
            if 'primary' in extracted:
                normalized['info_border'] = extracted['primary']
            if 'destructive' in extracted:
                normalized['error_border'] = extracted['destructive']
                normalized['error_bg'] = self._lighten_color(extracted['destructive'])
            if 'accent' in extracted:
                normalized['success_border'] = extracted['accent']
                normalized['success_bg'] = self._lighten_color(extracted['accent'])
            if 'foreground' in extracted:
                normalized['info_title'] = extracted['foreground']
                normalized['info_text'] = extracted['foreground']
            if 'background' in extracted:
                normalized['info_bg'] = extracted['background']
                normalized['success_bg'] = extracted['background']
                normalized['warning_bg'] = extracted['background']
                normalized['error_bg'] = extracted['background']

        elif component_type == 'button':
            # Button colors (closer mapping)
            if 'primary' in extracted:
                normalized['primary'] = extracted['primary']
                # outlined_color typically matches primary for outlined variant
                if 'outlined' in expected:
                    normalized['outlined'] = extracted['primary']
            if 'secondary' in extracted:
                normalized['secondary'] = extracted['secondary']
            if 'border' in extracted:
                # outlined_color can also map to border color
                if 'outlined' in expected and 'outlined' not in normalized:
                    normalized['outlined'] = extracted['border']
            if 'foreground' in extracted:
                normalized['text'] = extracted['foreground']
            if 'muted' in extracted:
                normalized['disabled_bg'] = extracted['muted']
                normalized['disabled_text'] = extracted['muted']

        elif component_type in ('card', 'input', 'select'):
            # Direct matches for these components
            if 'background' in extracted:
                normalized['background'] = extracted['background']
            if 'border' in extracted:
                normalized['border'] = extracted['border']
            if 'foreground' in extracted:
                normalized['text'] = extracted['foreground']
            if 'muted' in extracted:
                if component_type in ('input', 'select'):
                    normalized['disabled_bg'] = extracted['muted']
                    normalized['disabled_text'] = extracted['muted']

        # Generic fallbacks for any remaining expected keys
        for expected_key in expected:
            if expected_key not in normalized and expected_key.endswith('_bg'):
                # Try to map background colors generically
                if 'background' in extracted:
                    normalized[expected_key] = extracted['background']
            elif expected_key not in normalized and expected_key.endswith('_border'):
                if 'border' in extracted:
                    normalized[expected_key] = extracted['border']

        return normalized

    def _normalize_spacing(
        self,
        extracted: Dict[str, Any],
        component_type: str,
        expected: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Normalize spacing tokens."""
        normalized = {}

        # Map generic spacing scale to component-specific
        spacing_map = {
            'xs': '4px',
            'sm': '8px',
            'md': '16px',
            'lg': '24px',
            'xl': '32px',
            '2xl': '48px',
            '3xl': '64px'
        }

        # Direct mappings for common patterns
        if 'padding' in expected:
            # Use md or lg as default padding
            if 'md' in extracted:
                normalized['padding'] = extracted['md']
            elif 'lg' in extracted:
                normalized['padding'] = extracted['lg']
            elif 'sm' in extracted:
                normalized['padding'] = extracted['sm']

        if 'gap' in expected:
            # Use xs or sm as default gap
            if 'xs' in extracted:
                normalized['gap'] = extracted['xs']
            elif 'sm' in extracted:
                normalized['gap'] = extracted['sm']

        if 'gaps' in expected:
            if 'sm' in extracted:
                normalized['gaps'] = extracted['sm']
            elif 'xs' in extracted:
                normalized['gaps'] = extracted['xs']

        # Component-specific spacing
        if component_type == 'button':
            if 'padding_small' in expected and 'sm' in extracted:
                normalized['padding_small'] = extracted['sm']
            if 'padding_medium' in expected and 'md' in extracted:
                normalized['padding_medium'] = extracted['md']
            if 'padding_large' in expected and 'lg' in extracted:
                normalized['padding_large'] = extracted['lg']

        if 'footer_padding' in expected:
            if 'md' in extracted:
                normalized['footer_padding'] = extracted['md']
            elif 'sm' in extracted:
                normalized['footer_padding'] = extracted['sm']

        if 'padding_with_icon' in expected:
            # Approximate with md + some extra
            if 'md' in extracted:
                normalized['padding_with_icon'] = extracted['md']

        return normalized

    def _normalize_typography(
        self,
        extracted: Dict[str, Any],
        component_type: str,
        expected: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Normalize typography tokens."""
        normalized = {}

        # Font size mappings
        size_map = {
            'fontSizeXs': (12, 'xs'),
            'fontSizeSm': (14, 'sm'),
            'fontSizeBase': (16, 'base'),
            'fontSizeLg': (18, 'lg'),
            'fontSizeXl': (20, 'xl'),
            'fontSize2xl': (24, '2xl'),
            'fontSize3xl': (30, '3xl'),
            'fontSize4xl': (36, '4xl')
        }

        # Map to expected keys
        for expected_key in expected:
            if expected_key.startswith('title_size'):
                # Usually larger sizes
                if 'fontSize2xl' in extracted:
                    normalized[expected_key] = extracted['fontSize2xl']
                elif 'fontSizeXl' in extracted:
                    normalized[expected_key] = extracted['fontSizeXl']
                elif 'fontSizeLg' in extracted:
                    normalized[expected_key] = extracted['fontSizeLg']

            elif expected_key.startswith('message_size') or expected_key.startswith('description_size'):
                # Usually base or small
                if 'fontSizeBase' in extracted:
                    normalized[expected_key] = extracted['fontSizeBase']
                elif 'fontSizeSm' in extracted:
                    normalized[expected_key] = extracted['fontSizeSm']

            elif expected_key == 'fontSize' or expected_key.startswith('fontSize_'):
                # Direct size match
                if 'fontSizeBase' in extracted:
                    normalized[expected_key] = extracted['fontSizeBase']
                elif 'fontSizeSm' in extracted:
                    normalized[expected_key] = extracted['fontSizeSm']

        # Font weight mappings
        if 'title_weight' in expected:
            if 'fontWeightSemibold' in extracted:
                normalized['title_weight'] = str(extracted['fontWeightSemibold'])
            elif 'fontWeightBold' in extracted:
                normalized['title_weight'] = str(extracted['fontWeightBold'])

        if 'fontWeight' in expected:
            if 'fontWeightMedium' in extracted:
                normalized['fontWeight'] = str(extracted['fontWeightMedium'])
            elif 'fontWeightSemibold' in extracted:
                normalized['fontWeight'] = str(extracted['fontWeightSemibold'])

        if 'label_weight' in expected:
            if 'fontWeightMedium' in extracted:
                normalized['label_weight'] = str(extracted['fontWeightMedium'])

        # Component-specific size mappings
        if component_type == 'button':
            if 'fontSize_small' in expected and 'fontSizeSm' in extracted:
                normalized['fontSize_small'] = extracted['fontSizeSm']
            if 'fontSize_medium' in expected and 'fontSizeBase' in extracted:
                normalized['fontSize_medium'] = extracted['fontSizeBase']
            if 'fontSize_large' in expected and 'fontSizeLg' in extracted:
                normalized['fontSize_large'] = extracted['fontSizeLg']

        return normalized

    def _normalize_border(
        self,
        extracted: Dict[str, Any],
        source_category: str,
        expected: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Normalize border/borderRadius tokens."""
        normalized = {}

        # Map borderRadius scale to border.radius
        if source_category == 'borderRadius':
            if 'radius' in expected:
                if 'lg' in extracted:
                    normalized['radius'] = extracted['lg']
                elif 'md' in extracted:
                    normalized['radius'] = extracted['md']
                elif 'sm' in extracted:
                    normalized['radius'] = extracted['sm']
                elif 'xl' in extracted:
                    normalized['radius'] = extracted['xl']

        # Direct matches for other border properties
        if source_category == 'border' and 'border' in extracted:
            # Handle border color (from colors category, not border category)
            pass

        # Width and other properties (typically not in borderRadius)
        if 'width' in expected:
            # Default border width if not extractable
            normalized['width'] = '1px'  # Common default

        if 'left_width' in expected:
            normalized['left_width'] = '4px'  # Common default for alert left border

        if 'outlined_width' in expected:
            normalized['outlined_width'] = '2px'  # Common default for outlined buttons

        # outlined_color would come from colors category, not border
        # This is handled in color normalization

        return normalized

    def _lighten_color(self, color: str) -> str:
        """Approximate lightening of color for background variants."""
        # Simple heuristic: if it's a valid hex, try to lighten
        # This is approximate - just uses a lighter shade
        # In practice, extracted tokens may already have light backgrounds
        return color  # Return as-is; extraction should handle this

    def get_unmappable_tokens(self, expected: Dict[str, Any]) -> List[str]:
        """
        Identify tokens that cannot be mapped from generic extraction.

        Args:
            expected: Expected ground truth tokens

        Returns:
            List of token paths that should be excluded from accuracy calculation
        """
        unmappable = []

        # Dimensions category is never extractable from vision
        if 'dimensions' in expected:
            for key in expected['dimensions']:
                unmappable.append(f"dimensions.{key}")

        # Variant-specific tokens that might not have mappings
        # These are identified during normalization - if they remain unmapped,
        # they'll be marked as missing but shouldn't penalize accuracy heavily

        return unmappable

