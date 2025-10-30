"""Props proposer prompts with few-shot examples.

This module contains the prompt templates and examples for prop
requirement detection using GPT-4V.
"""

# Main props proposal prompt template
PROPS_PROPOSAL_PROMPT = """Analyze this {component_type} component and propose prop requirements.

You are an expert React/TypeScript developer analyzing component screenshots. Your task is to identify all props that this component should expose based on visual evidence.

## Component Type: {component_type}

## Prop Types to Detect

### 1. Variant Props (Enum)
Different visual styles of the same component.

**Visual Indicators:**
- Multiple background colors (primary=blue, secondary=gray, ghost=transparent)
- Different border styles (outlined, filled, none)
- Different text colors or weights
- Different shadow/elevation levels

**Examples:**
- `variant="primary|secondary|ghost|outline|text"`
- `color="primary|secondary|success|warning|error"`

### 2. Size Props (Enum)
Different size options for the component.

**Visual Indicators:**
- Different padding/spacing (compact vs spacious)
- Different font sizes
- Different height/width dimensions
- Different icon sizes

**Examples:**
- `size="xs|sm|md|lg|xl"`
- `density="compact|comfortable|spacious"`

### 3. Boolean Props
On/off feature toggles.

**Visual Indicators:**
- Disabled state (opacity, cursor, grayed out)
- Loading state (spinner, skeleton)
- Full width vs auto width
- Icon present vs text-only
- Rounded corners vs square

**Examples:**
- `disabled` - Grayed out, lower opacity
- `loading` - Spinner or skeleton state visible
- `fullWidth` - Spans full container width
- `icon` - Has an icon displayed
- `rounded` - Has rounded corners

### 4. Content Props (String/Number)
Props that accept text or numeric values.

**Visual Indicators:**
- Label text
- Placeholder text
- Counter badges
- Descriptive text

**Examples:**
- `label` - Visible text label
- `placeholder` - Placeholder text in inputs
- `count` - Numeric badge/counter

{figma_context}

{tokens_context}

## Few-Shot Examples

### Example 1: Button Component
**Visual Analysis:**
- Solid blue background with white text → Primary variant
- Also see outlined version with blue border → Secondary variant
- Small, medium, large sizes visible → Size prop
- Grayed out version visible → Disabled state

**Output:**
```json
{{
  "props": [
    {{
      "name": "variant",
      "type": "enum",
      "values": ["primary", "secondary", "outline"],
      "visual_cues": [
        "solid blue background for primary",
        "outlined blue border for secondary",
        "no background for outline variant"
      ],
      "confidence": 0.95
    }},
    {{
      "name": "size",
      "type": "enum",
      "values": ["sm", "md", "lg"],
      "visual_cues": [
        "three distinct button heights visible",
        "different padding amounts",
        "different font sizes"
      ],
      "confidence": 0.90
    }},
    {{
      "name": "disabled",
      "type": "boolean",
      "visual_cues": [
        "opacity-50 state visible",
        "cursor-not-allowed implied"
      ],
      "confidence": 0.85
    }}
  ]
}}
```

### Example 2: Card Component
**Visual Analysis:**
- Elevated shadow vs flat → Variant options
- Different padding visible → Size options

**Output:**
```json
{{
  "props": [
    {{
      "name": "variant",
      "type": "enum",
      "values": ["elevated", "outlined", "flat"],
      "visual_cues": [
        "box-shadow visible on elevated variant",
        "border visible on outlined variant"
      ],
      "confidence": 0.88
    }},
    {{
      "name": "padding",
      "type": "enum",
      "values": ["none", "sm", "md", "lg"],
      "visual_cues": [
        "different spacing between content and edges"
      ],
      "confidence": 0.75
    }}
  ]
}}
```

## Analysis Instructions

1. **Examine Visual Variations**:
   - Look for multiple instances or states of the component
   - Identify consistent patterns vs variations
   - Note color, size, spacing, shape differences

2. **Infer Prop Structure**:
   - Enum props: When you see 2+ distinct variations (primary/secondary)
   - Boolean props: When you see on/off states (disabled/enabled)
   - Size props: When you see small/medium/large variations

3. **Provide Evidence**:
   - Cite specific visual cues for each prop
   - Reference colors, dimensions, styles you observe
   - Be specific: "solid blue background" not "different colors"

4. **Confidence Scoring**:
   - **High (0.85-1.0)**: Clear visual evidence, multiple instances
   - **Medium (0.70-0.84)**: Some visual evidence, reasonable inference
   - **Low (< 0.70)**: Weak evidence, speculative

5. **Focus on Visual Props**:
   - Only propose props with clear visual manifestation
   - Avoid functional props without visual cues (onClick, onChange)
   - Skip content props unless clearly visible (label text, placeholder)

## Output Format

Return a JSON object with this exact structure:

```json
{{
  "props": [
    {{
      "name": "propName",
      "type": "enum|boolean|string|number",
      "values": ["value1", "value2"],  // Only for enum types
      "visual_cues": [
        "specific visual evidence 1",
        "specific visual evidence 2"
      ],
      "confidence": 0.0-1.0
    }}
  ]
}}
```

**Requirements:**
1. Include 2-5 visual cues per prop (be specific)
2. Confidence must be between 0.0 and 1.0
3. Only include `values` array for enum type props
4. Focus on props with confidence ≥ 0.70
5. Prioritize props with the clearest visual evidence

Now analyze the provided component image and return the JSON.
"""


def create_props_prompt(
    component_type: str,
    figma_data: dict = None,
    tokens: dict = None
) -> str:
    """Create a props proposal prompt with context.
    
    Args:
        component_type: The component type being analyzed
        figma_data: Optional Figma layer/component metadata
        tokens: Optional design tokens from Epic 1
        
    Returns:
        Formatted props proposal prompt
    """
    # Add Figma context if available
    figma_context = ""
    if figma_data:
        figma_context = "## Figma Context\n\n"
        
        if "name" in figma_data:
            figma_context += f"**Layer name**: {figma_data['name']}\n"
        
        if "variants" in figma_data and figma_data["variants"]:
            variants = figma_data["variants"]
            figma_context += f"**Figma variants detected**: {', '.join(variants)}\n"
            figma_context += "- These variants likely correspond to prop values\n"
        
        if "properties" in figma_data:
            props = figma_data["properties"]
            if props:
                figma_context += f"**Component properties**: {', '.join(props.keys())}\n"
        
        figma_context += "\n"
    
    # Add token context if available
    tokens_context = ""
    if tokens:
        tokens_context = "## Design Tokens Available\n\n"

        if "colors" in tokens and tokens["colors"]:
            colors_data = tokens["colors"]
            # Ensure we're working with a list
            if isinstance(colors_data, list):
                colors = [c.get("name", c.get("value", "")) for c in colors_data[:5]]
                tokens_context += f"**Colors**: {', '.join(colors)}\n"

        if "spacing" in tokens and tokens["spacing"]:
            spacing_data = tokens["spacing"]
            # Ensure we're working with a list
            if isinstance(spacing_data, list):
                spacing = [s.get("name", s.get("value", "")) for s in spacing_data[:5]]
                tokens_context += f"**Spacing**: {', '.join(spacing)}\n"

        tokens_context += "Use these tokens to inform size and spacing prop detection.\n\n"
    
    return PROPS_PROPOSAL_PROMPT.format(
        component_type=component_type,
        figma_context=figma_context,
        tokens_context=tokens_context
    )


# Export prompt for use in proposer
__all__ = ["PROPS_PROPOSAL_PROMPT", "create_props_prompt"]
