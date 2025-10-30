"""Shadcn/ui default design token fallbacks."""

from typing import Dict, Any

# Default design tokens from shadcn/ui with semantic naming
SHADCN_DEFAULTS: Dict[str, Any] = {
    "colors": {
        "primary": "#3B82F6",
        "secondary": "#64748B",
        "accent": "#06B6D4",
        "destructive": "#EF4444",
        "muted": "#94A3B8",
        "background": "#FFFFFF",
        "foreground": "#0F172A",
        "border": "#E2E8F0",
    },
    "typography": {
        # Font families
        "fontFamily": "Inter",
        "fontFamilyHeading": "Inter",
        "fontFamilyMono": "Fira Code",
        # Font scale
        "fontSizeXs": "12px",
        "fontSizeSm": "14px",
        "fontSizeBase": "16px",
        "fontSizeLg": "18px",
        "fontSizeXl": "20px",
        "fontSize2xl": "24px",
        "fontSize3xl": "30px",
        "fontSize4xl": "36px",
        # Font weights
        "fontWeightNormal": 400,
        "fontWeightMedium": 500,
        "fontWeightSemibold": 600,
        "fontWeightBold": 700,
        # Line heights
        "lineHeightTight": "1.25",
        "lineHeightNormal": "1.5",
        "lineHeightRelaxed": "1.75",
    },
    "spacing": {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "2xl": "48px",
        "3xl": "64px",
    },
    "borderRadius": {
        "sm": "2px",
        "md": "6px",
        "lg": "8px",
        "xl": "12px",
        "full": "9999px",
    },
}


def get_default_token(category: str, token_name: str) -> Any:
    """Get a default token value by category and name.
    
    Args:
        category: Token category (e.g., 'colors', 'typography')
        token_name: Token name within the category
        
    Returns:
        Default token value or None if not found
    """
    if category in SHADCN_DEFAULTS:
        return SHADCN_DEFAULTS[category].get(token_name)
    return None


def get_defaults_for_category(category: str) -> Dict[str, Any]:
    """Get all default tokens for a category.
    
    Args:
        category: Token category
        
    Returns:
        Dictionary of default tokens for the category
    """
    return SHADCN_DEFAULTS.get(category, {})
