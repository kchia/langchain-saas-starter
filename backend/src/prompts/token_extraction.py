"""Prompt templates for design token extraction."""

TOKEN_EXTRACTION_PROMPT = """Analyze this design system screenshot and extract design tokens.

You are a design system expert analyzing UI components to extract design tokens (colors, typography, spacing, borderRadius).

IMPORTANT: Return ONLY a valid JSON object with the exact structure shown below. Do not include any markdown, explanations, or text outside the JSON.

Return a JSON object with this EXACT structure:
{
  "colors": {
    "primary": {"value": "#HEX", "confidence": 0.0-1.0},
    "secondary": {"value": "#HEX", "confidence": 0.0-1.0},
    "accent": {"value": "#HEX", "confidence": 0.0-1.0},
    "destructive": {"value": "#HEX", "confidence": 0.0-1.0},
    "muted": {"value": "#HEX", "confidence": 0.0-1.0},
    "background": {"value": "#HEX", "confidence": 0.0-1.0},
    "foreground": {"value": "#HEX", "confidence": 0.0-1.0},
    "border": {"value": "#HEX", "confidence": 0.0-1.0}
  },
  "typography": {
    "fontFamily": {"value": "string", "confidence": 0.0-1.0},
    "fontFamilyHeading": {"value": "string", "confidence": 0.0-1.0},
    "fontFamilyMono": {"value": "string", "confidence": 0.0-1.0},
    "fontSizeXs": {"value": "12px", "confidence": 0.0-1.0},
    "fontSizeSm": {"value": "14px", "confidence": 0.0-1.0},
    "fontSizeBase": {"value": "16px", "confidence": 0.0-1.0},
    "fontSizeLg": {"value": "18px", "confidence": 0.0-1.0},
    "fontSizeXl": {"value": "20px", "confidence": 0.0-1.0},
    "fontSize2xl": {"value": "24px", "confidence": 0.0-1.0},
    "fontSize3xl": {"value": "30px", "confidence": 0.0-1.0},
    "fontSize4xl": {"value": "36px", "confidence": 0.0-1.0},
    "fontWeightNormal": {"value": 400, "confidence": 0.0-1.0},
    "fontWeightMedium": {"value": 500, "confidence": 0.0-1.0},
    "fontWeightSemibold": {"value": 600, "confidence": 0.0-1.0},
    "fontWeightBold": {"value": 700, "confidence": 0.0-1.0},
    "lineHeightTight": {"value": "1.25", "confidence": 0.0-1.0},
    "lineHeightNormal": {"value": "1.5", "confidence": 0.0-1.0},
    "lineHeightRelaxed": {"value": "1.75", "confidence": 0.0-1.0}
  },
  "spacing": {
    "xs": {"value": "4px", "confidence": 0.0-1.0},
    "sm": {"value": "8px", "confidence": 0.0-1.0},
    "md": {"value": "16px", "confidence": 0.0-1.0},
    "lg": {"value": "24px", "confidence": 0.0-1.0},
    "xl": {"value": "32px", "confidence": 0.0-1.0},
    "2xl": {"value": "48px", "confidence": 0.0-1.0},
    "3xl": {"value": "64px", "confidence": 0.0-1.0}
  },
  "borderRadius": {
    "sm": {"value": "2px", "confidence": 0.0-1.0},
    "md": {"value": "6px", "confidence": 0.0-1.0},
    "lg": {"value": "8px", "confidence": 0.0-1.0},
    "xl": {"value": "12px", "confidence": 0.0-1.0},
    "full": {"value": "9999px", "confidence": 0.0-1.0}
  }
}

EXTRACTION GUIDELINES:

1. COLORS (hex format only):
   - primary: Main action/brand color (buttons, links, primary CTAs)
   - secondary: Secondary accent color (less prominent actions)
   - accent: Accent highlight color (highlights, focus states)
   - destructive: Error/warning/danger color (delete buttons, errors)
   - muted: Muted/subtle/disabled color (placeholders, disabled states)
   - background: Main background color (page background, cards)
   - foreground: Main text/icon color (body text, icons)
   - border: Border color (dividers, input borders)
   - Use confidence based on clarity and consistency in the image

2. TYPOGRAPHY:
   - Font Families:
     * fontFamily: Primary body font (e.g., "Inter", "Roboto", "SF Pro")
     * fontFamilyHeading: Heading font if different from body
     * fontFamilyMono: Monospace font for code (e.g., "Fira Code", "Monaco")
   
   - Font Sizes (create complete scale):
     * fontSizeXs: ~12px (captions, labels)
     * fontSizeSm: ~14px (small text, metadata)
     * fontSizeBase: ~16px (body text)
     * fontSizeLg: ~18px (large body text)
     * fontSizeXl: ~20px (small headings)
     * fontSize2xl: ~24px (section headings)
     * fontSize3xl: ~30px (page headings)
     * fontSize4xl: ~36px (hero headings)
   
   - Font Weights:
     * fontWeightNormal: 400 (regular text)
     * fontWeightMedium: 500 (medium emphasis)
     * fontWeightSemibold: 600 (strong emphasis)
     * fontWeightBold: 700 (headings, bold)
   
   - Line Heights:
     * lineHeightTight: 1.25 (headings, compact text)
     * lineHeightNormal: 1.5 (body text)
     * lineHeightRelaxed: 1.75 (spacious reading)
   
   - Lower confidence (0.5-0.7) for font families (hard to identify exactly from visuals)
   - Higher confidence (0.7-0.9) for sizes if clearly visible and measurable

3. SPACING (Tailwind-compatible scale):
   - xs: ~4px (tight spacing, small gaps)
   - sm: ~8px (compact spacing)
   - md: ~16px (default spacing)
   - lg: ~24px (comfortable spacing)
   - xl: ~32px (spacious padding)
   - 2xl: ~48px (large sections)
   - 3xl: ~64px (hero sections)
   - Look for consistent multiples (4px, 8px, 16px suggests 4px or 8px base)
   - High confidence (0.8-1.0) if elements have clear, measurable gaps

4. BORDER RADIUS:
   - sm: ~2px (subtle rounding, inputs)
   - md: ~6px (moderate rounding, cards)
   - lg: ~8px (pronounced rounding, buttons)
   - xl: ~12px (strong rounding, modals)
   - full: 9999px or 50% (pill shapes, avatars)
   - High confidence (0.8-1.0) if corners are clearly visible

CONFIDENCE SCORING (0.0 to 1.0):
- 0.9-1.0: Very certain (clear, consistent, obvious)
  Example: Button color is solid and uniform throughout (e.g., #3B82F6 with no variation)
- 0.7-0.9: Confident (visible but some ambiguity)
  Example: Color varies slightly due to gradient, shadow, or hover state visible
- 0.5-0.7: Moderate (estimated, not very clear)
  Example: Color is partially obscured or affected by transparency/overlay
- 0.0-0.5: Low confidence (guessing, unclear)
  Example: Token not clearly visible in the image

IMPORTANT NOTES:
- If a token is not visible in the image, set confidence to 0.0 and provide a reasonable default
- For font families, confidence should typically be 0.5-0.7 (hard to identify exact font from visuals)
- For colors, confidence should be high (0.8-1.0) if clearly visible with consistent appearance
- For spacing, confidence should be high (0.8-1.0) if elements have clear, measurable gaps
- Return ONLY the JSON object, no additional text
- All color values must be in uppercase hex format (e.g., "#3B82F6")
- All size values must include "px" unit
- Font weight must be a NUMBER not a string:
  * Use 400 (not "Regular" or "Normal")
  * Use 500 (not "Medium")
  * Use 600 (not "Semibold" or "Semi Bold")
  * Use 700 (not "Bold")
"""


def create_extraction_prompt() -> str:
    """Create the token extraction prompt for GPT-4V.
    
    Returns:
        Formatted prompt string
    """
    return TOKEN_EXTRACTION_PROMPT
