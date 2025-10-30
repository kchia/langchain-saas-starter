"""Figma integration API routes."""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any

from ....services.figma_client import (
    FigmaClient,
    FigmaClientError,
    FigmaAuthenticationError,
    FigmaFileNotFoundError,
    FigmaRateLimitError,
)
from ....core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/tokens", tags=["figma"])


# Request/Response Models


class FigmaAuthRequest(BaseModel):
    """Request model for Figma PAT authentication."""

    personal_access_token: str = Field(
        ..., 
        description="Figma Personal Access Token",
        min_length=10,
    )

    @field_validator("personal_access_token")
    @classmethod
    def validate_pat_format(cls, v):
        """Validate PAT format (basic check)."""
        if not v or not v.strip():
            raise ValueError("Personal access token cannot be empty")
        # Figma PATs typically start with 'figd_' but this isn't always the case
        return v.strip()


class FigmaAuthResponse(BaseModel):
    """Response model for Figma PAT authentication."""

    valid: bool = Field(..., description="Whether the token is valid")
    user_email: Optional[str] = Field(None, description="User email if token is valid")
    message: str = Field(..., description="Status message")


class FigmaExtractRequest(BaseModel):
    """Request model for Figma file extraction."""

    figma_url: str = Field(..., description="Figma file URL")
    personal_access_token: Optional[str] = Field(
        None,
        description="Figma PAT (if not provided, uses environment variable)",
    )

    @field_validator("figma_url")
    @classmethod
    def validate_figma_url(cls, v):
        """Validate Figma URL format."""
        if not v or not ("figma.com/file/" in v or "figma.com/design/" in v):
            raise ValueError(
                "Invalid Figma URL. Must be in format: https://figma.com/file/{key} or https://figma.com/design/{key}"
            )
        return v


class ColorTokens(BaseModel):
    """Semantic color tokens matching shadcn/ui convention."""
    primary: Optional[str] = Field(None, description="Primary brand color")
    secondary: Optional[str] = Field(None, description="Secondary accent color")
    accent: Optional[str] = Field(None, description="Accent highlight color")
    destructive: Optional[str] = Field(None, description="Destructive/error color")
    muted: Optional[str] = Field(None, description="Muted/subtle color")
    background: Optional[str] = Field(None, description="Main background")
    foreground: Optional[str] = Field(None, description="Main text color")
    border: Optional[str] = Field(None, description="Border color")


class TypographyTokens(BaseModel):
    """Typography scale and properties."""
    # Font families
    fontFamily: Optional[str] = Field(None, description="Primary font family")
    fontFamilyHeading: Optional[str] = Field(None, description="Heading font family")
    fontFamilyMono: Optional[str] = Field(None, description="Monospace font family")
    
    # Font scale (xs to 4xl)
    fontSizeXs: Optional[str] = Field(None, description="12px")
    fontSizeSm: Optional[str] = Field(None, description="14px")
    fontSizeBase: Optional[str] = Field(None, description="16px")
    fontSizeLg: Optional[str] = Field(None, description="18px")
    fontSizeXl: Optional[str] = Field(None, description="20px")
    fontSize2xl: Optional[str] = Field(None, description="24px")
    fontSize3xl: Optional[str] = Field(None, description="30px")
    fontSize4xl: Optional[str] = Field(None, description="36px")
    
    # Font weights
    fontWeightNormal: Optional[int] = Field(None, description="400")
    fontWeightMedium: Optional[int] = Field(None, description="500")
    fontWeightSemibold: Optional[int] = Field(None, description="600")
    fontWeightBold: Optional[int] = Field(None, description="700")
    
    # Line heights
    lineHeightTight: Optional[str] = Field(None, description="1.25")
    lineHeightNormal: Optional[str] = Field(None, description="1.5")
    lineHeightRelaxed: Optional[str] = Field(None, description="1.75")


class SpacingTokens(BaseModel):
    """Tailwind-compatible spacing scale."""
    xs: Optional[str] = Field(None, description="4px")
    sm: Optional[str] = Field(None, description="8px")
    md: Optional[str] = Field(None, description="16px")
    lg: Optional[str] = Field(None, description="24px")
    xl: Optional[str] = Field(None, description="32px")
    xl2: Optional[str] = Field(None, alias="2xl", description="48px")
    xl3: Optional[str] = Field(None, alias="3xl", description="64px")


class BorderRadiusTokens(BaseModel):
    """Border radius scale."""
    sm: Optional[str] = Field(None, description="2px")
    md: Optional[str] = Field(None, description="6px")
    lg: Optional[str] = Field(None, description="8px")
    xl: Optional[str] = Field(None, description="12px")
    full: Optional[str] = Field(None, description="9999px or 50%")


class DesignTokens(BaseModel):
    """Structured design tokens with semantic naming."""
    colors: ColorTokens = Field(default_factory=ColorTokens)
    typography: TypographyTokens = Field(default_factory=TypographyTokens)
    spacing: SpacingTokens = Field(default_factory=SpacingTokens)
    borderRadius: BorderRadiusTokens = Field(default_factory=BorderRadiusTokens)


class FigmaExtractResponse(BaseModel):
    """Response model for Figma file extraction."""

    file_key: str = Field(..., description="Figma file key")
    file_name: str = Field(..., description="Figma file name")
    tokens: DesignTokens = Field(..., description="Extracted design tokens")
    cached: bool = Field(..., description="Whether response was from cache")
    confidence: Dict[str, float] = Field(default_factory=dict, description="Confidence scores (flattened dotted keys)")
    fallbacks_used: list = Field(default_factory=list, description="List of tokens using fallbacks")
    review_needed: list = Field(default_factory=list, description="List of tokens needing review")


class CacheMetricsResponse(BaseModel):
    """Response model for cache metrics."""

    file_key: str
    hits: int
    misses: int
    total_requests: int
    hit_rate: float
    avg_latency_ms: float


# API Endpoints


@router.post("/figma/auth", response_model=FigmaAuthResponse)
async def authenticate_figma(request: FigmaAuthRequest):
    """
    Validate Figma Personal Access Token.

    This endpoint validates the provided PAT by calling Figma's /v1/me endpoint.
    The token is not stored server-side for security reasons.
    """
    try:
        async with FigmaClient(personal_access_token=request.personal_access_token) as client:
            user_data = await client.validate_token()

        return FigmaAuthResponse(
            valid=True,
            user_email=user_data.get("email"),
            message="Authentication successful",
        )

    except FigmaAuthenticationError as e:
        logger.warning(f"Figma authentication failed: {e}")
        return FigmaAuthResponse(
            valid=False, message="Invalid Personal Access Token"
        )

    except FigmaClientError as e:
        logger.error(f"Figma client error during authentication: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating token: {str(e)}",
        )


@router.post("/extract/figma", response_model=FigmaExtractResponse)
async def extract_figma_tokens(request: FigmaExtractRequest):
    """
    Extract design tokens from a Figma file.

    This endpoint fetches the Figma file and extracts:
    - Color styles (as hex values)
    - Text styles (font family, size, weight)
    - Auto-layout spacing (as spacing tokens)

    Results are cached for 5 minutes to reduce API calls.
    """
    try:
        # Extract file key from URL
        file_key = FigmaClient.extract_file_key(request.figma_url)
        logger.info(f"Extracting tokens from Figma file: {file_key}")

        # Initialize client with provided or environment PAT
        async with FigmaClient(personal_access_token=request.personal_access_token) as client:
            # Fetch file data (with caching)
            file_data = await client.get_file(file_key, use_cache=True)
            
            # Check if response was cached
            cached = file_data.get("_cached", False)
            
            # Extract file metadata
            file_name = file_data.get("name", "Unknown")
            
            # Fetch styles data (with caching)
            styles_data = await client.get_file_styles(file_key, use_cache=True)

            # Extract tokens from file and styles (with confidence scores)
            raw_tokens = _extract_tokens(file_data, styles_data)

            # Process tokens with confidence-based fallbacks
            from ....core.confidence import process_tokens_with_confidence
            processed = process_tokens_with_confidence(raw_tokens)

        return FigmaExtractResponse(
            file_key=file_key,
            file_name=file_name,
            tokens=DesignTokens(**processed["tokens"]),
            cached=cached,
            confidence=processed.get("confidence", {}),
            fallbacks_used=processed.get("fallbacks_used", []),
            review_needed=processed.get("review_needed", []),
        )

    except ValueError as e:
        logger.warning(f"Invalid Figma URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )

    except FigmaAuthenticationError as e:
        logger.warning(f"Figma authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Figma Personal Access Token",
        )

    except FigmaFileNotFoundError as e:
        logger.warning(f"Figma file not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )

    except FigmaRateLimitError as e:
        logger.warning(f"Figma rate limit exceeded: {e}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Figma API rate limit exceeded. Please try again later.",
        )

    except FigmaClientError as e:
        logger.error(f"Figma client error during extraction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting tokens: {str(e)}",
        )


@router.delete("/figma/cache/{file_key}")
async def invalidate_figma_cache(file_key: str):
    """
    Invalidate cache for a specific Figma file.

    This forces the next request to fetch fresh data from Figma API.
    """
    try:
        async with FigmaClient() as client:
            deleted = await client.invalidate_cache(file_key)

        return {
            "file_key": file_key,
            "cache_entries_deleted": deleted,
            "message": "Cache invalidated successfully" if deleted > 0 else "No cache entries found",
        }

    except Exception as e:
        logger.error(f"Error invalidating cache for {file_key}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error invalidating cache: {str(e)}",
        )


@router.get("/figma/cache/{file_key}/metrics", response_model=CacheMetricsResponse)
async def get_figma_cache_metrics(file_key: str):
    """
    Get cache metrics for a specific Figma file.

    Returns hit rate, latency, and other performance metrics.
    """
    try:
        async with FigmaClient() as client:
            metrics = await client.get_cache_metrics(file_key)

        return CacheMetricsResponse(**metrics)

    except Exception as e:
        logger.error(f"Error getting cache metrics for {file_key}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting cache metrics: {str(e)}",
        )


# Helper Functions
#
# Confidence Score Guidelines:
# - 0.9-1.0: Extracted from actual Figma data with high certainty
# - 0.7-0.9: Extracted with some inference or pattern matching
# - 0.4-0.6: Partial match, keyword-based inference, or semantic defaults
# - 0.0-0.3: Fallback defaults with no extracted data


def _extract_tokens(file_data: Dict[str, Any], styles_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract and normalize design tokens from Figma file and styles data with confidence scores.

    Args:
        file_data: Figma file data
        styles_data: Figma styles data

    Returns:
        Dictionary with tokens including confidence scores
        Format: {
            "colors": {"primary": {"value": "#HEX", "confidence": 0.6}},
            "typography": {...},
            "spacing": {...},
            "borderRadius": {...}
        }
    """
    tokens = {
        "colors": _extract_color_tokens(styles_data),
        "typography": _extract_typography_tokens(styles_data),
        "spacing": _extract_spacing_tokens(file_data),
        "borderRadius": _extract_border_radius_tokens(file_data),
    }

    return tokens


def _extract_border_radius_tokens(file_data: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """
    Extract border radius tokens from Figma nodes with confidence scores.

    Args:
        file_data: Figma file data from /files/{key} endpoint

    Returns:
        Dictionary of border radius tokens with {value, confidence}
    """
    border_radius_values = set()

    # Recursively traverse the document tree to find nodes with border radius
    def traverse_nodes(node: Dict[str, Any]):
        """Recursively traverse node tree to find border radius values."""
        if not isinstance(node, dict):
            return

        # Check for cornerRadius property (Figma uses this for rounded corners)
        corner_radius = node.get("cornerRadius", 0)
        if corner_radius > 0:
            border_radius_values.add(corner_radius)
        
        # Also check for individual corner radii
        top_left = node.get("topLeftRadius", 0)
        top_right = node.get("topRightRadius", 0)
        bottom_left = node.get("bottomLeftRadius", 0)
        bottom_right = node.get("bottomRightRadius", 0)
        
        if top_left > 0:
            border_radius_values.add(top_left)
        if top_right > 0:
            border_radius_values.add(top_right)
        if bottom_left > 0:
            border_radius_values.add(bottom_left)
        if bottom_right > 0:
            border_radius_values.add(bottom_right)

        # Recursively process children
        children = node.get("children", [])
        for child in children:
            traverse_nodes(child)

    # Start traversal from document root
    document = file_data.get("document", {})
    traverse_nodes(document)

    border_radius = {}

    # Convert border radius values to semantic tokens with confidence
    if border_radius_values:
        # Sort values to create a consistent token system
        sorted_values = sorted(border_radius_values)
        
        # Map to semantic scale (sm, md, lg, xl, full)
        # Higher confidence because extracted from actual data
        if len(sorted_values) >= 1:
            border_radius["sm"] = {"value": f"{sorted_values[0]}px", "confidence": 0.8}
        if len(sorted_values) >= 2:
            border_radius["md"] = {"value": f"{sorted_values[1]}px", "confidence": 0.8}
        if len(sorted_values) >= 3:
            border_radius["lg"] = {"value": f"{sorted_values[2]}px", "confidence": 0.8}
        if len(sorted_values) >= 4:
            border_radius["xl"] = {"value": f"{sorted_values[3]}px", "confidence": 0.8}
        
        # Check for circular elements (very large radius values)
        # Note: 500px threshold chosen because Figma often uses large radius values (e.g., 999px, 9999px)
        # for fully rounded corners (circles, pills), while typical rounded corners are < 50px
        for val in sorted_values:
            if val >= 500:  # Very large radius indicates circular/pill shape
                border_radius["full"] = {"value": "9999px", "confidence": 0.9}
                break
        
        logger.info(f"Extracted {len(border_radius)} border radius tokens from Figma nodes")
    
    # Fill in missing tokens with defaults and appropriate confidence
    confidence = 0.8 if border_radius_values else 0.3
    border_radius.setdefault("sm", {"value": "2px", "confidence": confidence})
    border_radius.setdefault("md", {"value": "6px", "confidence": confidence})
    border_radius.setdefault("lg", {"value": "8px", "confidence": confidence})
    border_radius.setdefault("xl", {"value": "12px", "confidence": confidence})
    border_radius.setdefault("full", {"value": "9999px", "confidence": 0.3})  # Less common, lower confidence

    return border_radius


def _extract_color_tokens(styles_data: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """
    Extract color tokens from Figma styles with confidence scores using semantic keyword matching.

    Args:
        styles_data: Figma styles data from /files/{key}/styles endpoint

    Returns:
        Dictionary of semantic color tokens with {value, confidence}
    """
    colors = {}
    
    # Keyword mapping for semantic colors
    keywords = {
        'primary': ['primary', 'brand', 'main', 'blue'],
        'secondary': ['secondary', 'accent-2', 'gray', 'grey'],
        'accent': ['accent', 'highlight', 'focus', 'teal', 'cyan'],
        'destructive': ['error', 'danger', 'red', 'destructive', 'warning'],
        'muted': ['muted', 'subtle', 'disabled', 'placeholder'],
        'background': ['background', 'bg', 'surface', 'canvas', 'white'],
        'foreground': ['foreground', 'text', 'content', 'black'],
        'border': ['border', 'divider', 'stroke', 'outline']
    }

    # Figma /files/{key}/styles returns: { "meta": { "styles": [...] } }
    meta = styles_data.get("meta", {})
    styles = meta.get("styles", [])

    for style in styles:
        # style_type can be: FILL, TEXT, EFFECT, GRID
        if style.get("style_type") == "FILL":
            name = style.get("name", "").lower()
            if not name:
                continue

            # Try to match against semantic keywords
            for semantic_name, keyword_list in keywords.items():
                if any(keyword in name for keyword in keyword_list):
                    if semantic_name not in colors:
                        # LIMITATION: Currently using default colors based on semantic name matching only.
                        # TODO: Fetch actual color values from Figma style nodes via /files/{key}/nodes endpoint.
                        # This would require additional API calls to get the actual fill colors from style references.
                        # Using lower confidence (0.4) since these are inferred defaults, not extracted values.
                        default_colors = {
                            'primary': '#3B82F6',
                            'secondary': '#64748B',
                            'accent': '#06B6D4',
                            'destructive': '#EF4444',
                            'muted': '#94A3B8',
                            'background': '#FFFFFF',
                            'foreground': '#0F172A',
                            'border': '#E2E8F0'
                        }
                        colors[semantic_name] = {
                            "value": default_colors.get(semantic_name, '#9CA3AF'),
                            "confidence": 0.4  # Lower confidence since using defaults, not extracted values
                        }
                    break

    # If no styles found, provide complete fallback defaults with low confidence
    if not colors:
        logger.info("No color styles found in Figma file, using semantic defaults")
        colors = {
            "primary": {"value": "#3B82F6", "confidence": 0.5},
            "secondary": {"value": "#64748B", "confidence": 0.5},
            "accent": {"value": "#06B6D4", "confidence": 0.5},
            "destructive": {"value": "#EF4444", "confidence": 0.5},
            "muted": {"value": "#94A3B8", "confidence": 0.5},
            "background": {"value": "#FFFFFF", "confidence": 0.5},
            "foreground": {"value": "#0F172A", "confidence": 0.5},
            "border": {"value": "#E2E8F0", "confidence": 0.5},
        }
    else:
        # Fill in any missing semantic colors with defaults
        default_colors = {
            "primary": {"value": "#3B82F6", "confidence": 0.4},
            "secondary": {"value": "#64748B", "confidence": 0.4},
            "accent": {"value": "#06B6D4", "confidence": 0.4},
            "destructive": {"value": "#EF4444", "confidence": 0.4},
            "muted": {"value": "#94A3B8", "confidence": 0.4},
            "background": {"value": "#FFFFFF", "confidence": 0.4},
            "foreground": {"value": "#0F172A", "confidence": 0.4},
            "border": {"value": "#E2E8F0", "confidence": 0.4},
        }
        for key, default_val in default_colors.items():
            if key not in colors:
                colors[key] = default_val

    return colors


def _extract_typography_tokens(styles_data: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """
    Extract typography tokens from Figma styles with confidence scores using font scale.

    Args:
        styles_data: Figma styles data from /files/{key}/styles endpoint

    Returns:
        Dictionary of typography tokens with {value, confidence}
    """
    typography = {}

    meta = styles_data.get("meta", {})
    styles = meta.get("styles", [])

    # Track if we found any text styles
    found_text_styles = False

    for style in styles:
        if style.get("style_type") == "TEXT":
            found_text_styles = True
            name = style.get("name", "").lower()
            if not name:
                continue

            # Extract typography properties from style name patterns
            # Note: Full implementation would parse actual node data
            # For now, infer from common naming patterns

            # Font family inference
            if not typography.get("fontFamily"):
                typography["fontFamily"] = {"value": "Inter", "confidence": 0.5}
            
            # Map style names to font scale
            if "caption" in name or "xs" in name or "tiny" in name:
                typography.setdefault("fontSizeXs", {"value": "12px", "confidence": 0.7})
            elif "small" in name or "sm" in name or "footnote" in name:
                typography.setdefault("fontSizeSm", {"value": "14px", "confidence": 0.7})
            elif "body" in name or "paragraph" in name or "base" in name:
                typography.setdefault("fontSizeBase", {"value": "16px", "confidence": 0.7})
            elif "large" in name or "lg" in name:
                typography.setdefault("fontSizeLg", {"value": "18px", "confidence": 0.7})
            elif ("h5" in name or "heading 5" in name) or ("xl" in name and "2xl" not in name):
                typography.setdefault("fontSizeXl", {"value": "20px", "confidence": 0.7})
            elif "h4" in name or "heading 4" in name or "2xl" in name:
                typography.setdefault("fontSize2xl", {"value": "24px", "confidence": 0.7})
            elif "h3" in name or "heading 3" in name or "3xl" in name:
                typography.setdefault("fontSize3xl", {"value": "30px", "confidence": 0.7})
            elif "h2" in name or "h1" in name or "heading" in name or "title" in name or "4xl" in name:
                typography.setdefault("fontSize4xl", {"value": "36px", "confidence": 0.7})
            
            # Font weight inference
            if "bold" in name or "heavy" in name:
                typography.setdefault("fontWeightBold", {"value": 700, "confidence": 0.7})
            elif "semibold" in name or "semi" in name or "medium" in name:
                typography.setdefault("fontWeightSemibold", {"value": 600, "confidence": 0.7})
            elif "light" in name or "thin" in name:
                typography.setdefault("fontWeightNormal", {"value": 400, "confidence": 0.7})

    # Fill in missing properties with defaults and appropriate confidence
    if not found_text_styles:
        logger.info("No text styles found in Figma file, using complete defaults")
    
    # Font families
    typography.setdefault("fontFamily", {"value": "Inter", "confidence": 0.4})
    typography.setdefault("fontFamilyHeading", {"value": "Inter", "confidence": 0.4})
    typography.setdefault("fontFamilyMono", {"value": "Fira Code", "confidence": 0.4})
    
    # Font scale
    typography.setdefault("fontSizeXs", {"value": "12px", "confidence": 0.4})
    typography.setdefault("fontSizeSm", {"value": "14px", "confidence": 0.4})
    typography.setdefault("fontSizeBase", {"value": "16px", "confidence": 0.4})
    typography.setdefault("fontSizeLg", {"value": "18px", "confidence": 0.4})
    typography.setdefault("fontSizeXl", {"value": "20px", "confidence": 0.4})
    typography.setdefault("fontSize2xl", {"value": "24px", "confidence": 0.4})
    typography.setdefault("fontSize3xl", {"value": "30px", "confidence": 0.4})
    typography.setdefault("fontSize4xl", {"value": "36px", "confidence": 0.4})
    
    # Font weights
    typography.setdefault("fontWeightNormal", {"value": 400, "confidence": 0.4})
    typography.setdefault("fontWeightMedium", {"value": 500, "confidence": 0.4})
    typography.setdefault("fontWeightSemibold", {"value": 600, "confidence": 0.4})
    typography.setdefault("fontWeightBold", {"value": 700, "confidence": 0.4})
    
    # Line heights
    typography.setdefault("lineHeightTight", {"value": "1.25", "confidence": 0.4})
    typography.setdefault("lineHeightNormal", {"value": "1.5", "confidence": 0.4})
    typography.setdefault("lineHeightRelaxed", {"value": "1.75", "confidence": 0.4})

    return typography


def _extract_spacing_tokens(file_data: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """
    Extract spacing tokens from auto-layout in Figma file with Tailwind-compatible scale.

    Args:
        file_data: Figma file data from /files/{key} endpoint

    Returns:
        Dictionary of spacing tokens with {value, confidence}
    """
    spacing = {}
    spacing_values = set()

    # Recursively traverse the document tree to find auto-layout nodes
    def traverse_nodes(node: Dict[str, Any]):
        """Recursively traverse node tree to find spacing values."""
        if not isinstance(node, dict):
            return

        # Check for auto-layout properties
        # Figma auto-layout nodes have: layoutMode, paddingLeft, paddingRight, paddingTop, paddingBottom, itemSpacing
        if node.get("layoutMode") in ["HORIZONTAL", "VERTICAL"]:
            # Extract padding values
            padding_top = node.get("paddingTop", 0)
            padding_right = node.get("paddingRight", 0)
            padding_bottom = node.get("paddingBottom", 0)
            padding_left = node.get("paddingLeft", 0)

            # Extract item spacing (gap)
            item_spacing = node.get("itemSpacing", 0)

            # Collect non-zero spacing values
            if padding_top > 0:
                spacing_values.add(padding_top)
            if padding_right > 0:
                spacing_values.add(padding_right)
            if padding_bottom > 0:
                spacing_values.add(padding_bottom)
            if padding_left > 0:
                spacing_values.add(padding_left)
            if item_spacing > 0:
                spacing_values.add(item_spacing)

        # Recursively process children
        children = node.get("children", [])
        for child in children:
            traverse_nodes(child)

    # Start traversal from document root
    document = file_data.get("document", {})
    traverse_nodes(document)

    # Convert spacing values to Tailwind-compatible semantic tokens with confidence
    if spacing_values:
        # Sort values to create a consistent token system
        sorted_values = sorted(spacing_values)

        # Create Tailwind-compatible semantic tokens from the values found
        # Higher confidence because extracted from actual data
        if len(sorted_values) >= 1:
            spacing["xs"] = {"value": f"{sorted_values[0]}px", "confidence": 0.8}
        if len(sorted_values) >= 2:
            spacing["sm"] = {"value": f"{sorted_values[1]}px", "confidence": 0.8}
        if len(sorted_values) >= 3:
            spacing["md"] = {"value": f"{sorted_values[2]}px", "confidence": 0.8}
        if len(sorted_values) >= 4:
            spacing["lg"] = {"value": f"{sorted_values[3]}px", "confidence": 0.8}
        if len(sorted_values) >= 5:
            spacing["xl"] = {"value": f"{sorted_values[4]}px", "confidence": 0.8}
        if len(sorted_values) >= 6:
            spacing["2xl"] = {"value": f"{sorted_values[5]}px", "confidence": 0.8}
        if len(sorted_values) >= 7:
            spacing["3xl"] = {"value": f"{sorted_values[6]}px", "confidence": 0.8}

        logger.info(f"Extracted {len(spacing)} spacing tokens from Figma auto-layout")
    
    # Fill in missing tokens with Tailwind defaults and appropriate confidence
    confidence = 0.8 if spacing_values else 0.3
    spacing.setdefault("xs", {"value": "4px", "confidence": confidence})
    spacing.setdefault("sm", {"value": "8px", "confidence": confidence})
    spacing.setdefault("md", {"value": "16px", "confidence": confidence})
    spacing.setdefault("lg", {"value": "24px", "confidence": confidence})
    spacing.setdefault("xl", {"value": "32px", "confidence": confidence})
    spacing.setdefault("2xl", {"value": "48px", "confidence": 0.3})  # Less common, lower confidence
    spacing.setdefault("3xl", {"value": "64px", "confidence": 0.3})  # Less common, lower confidence

    return spacing
