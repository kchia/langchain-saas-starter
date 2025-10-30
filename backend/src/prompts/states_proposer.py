"""States proposer prompts with visual state examples.

This module contains the prompt templates and examples for state/variant
requirement detection using GPT-4V.
"""

# Main states proposal prompt template
STATES_PROPOSAL_PROMPT = """Analyze this {component_type} component and propose state/variant requirements.

You are an expert UI/UX designer analyzing component screenshots. Your task is to identify visual states this component should support based on state variations, interactions, and accessibility needs.

## Component Type: {component_type}

## States to Detect

### 1. Hover State
Visual changes when mouse hovers over the element (desktop).

**Visual Indicators:**
- Color darkens or lightens
- Shadow elevation increases
- Border changes
- Opacity changes
- Smooth transition visible

**Component Types:**
- Button, Card, Badge - Common
- Input - Less common
- Alert - Rare

**Example:**
```json
{{
  "name": "hover",
  "description": "Darker background with elevated shadow on mouse hover",
  "visual_cues": [
    "primary color darkens by 10%",
    "shadow elevation increases from 2px to 4px"
  ],
  "confidence": 0.88
}}
```

### 2. Focus State
Visual changes when element receives keyboard focus (accessibility).

**Visual Indicators:**
- Focus ring/outline (often blue, 2-3px)
- Border highlight
- Glow effect
- High contrast indicator

**Component Types:**
- Button, Input, Select - Critical for accessibility
- Card - If keyboard navigable

**Example:**
```json
{{
  "name": "focus",
  "description": "Blue focus ring appears for keyboard navigation",
  "visual_cues": [
    "2px blue outline visible",
    "offset by 2px for visibility"
  ],
  "confidence": 0.90
}}
```

### 3. Disabled State
Visual appearance when component cannot be interacted with.

**Visual Indicators:**
- Reduced opacity (typically 40-60%)
- Grayed out colors
- Cursor: not-allowed
- Muted appearance
- No hover/focus effects

**Component Types:**
- Button, Input, Select - Very common
- Card, Badge - Occasional

**Example:**
```json
{{
  "name": "disabled",
  "description": "Grayed out with reduced opacity when disabled",
  "visual_cues": [
    "opacity reduced to 50%",
    "cursor changes to not-allowed",
    "colors desaturated"
  ],
  "confidence": 0.85
}}
```

### 4. Loading State
Visual appearance during asynchronous operations.

**Visual Indicators:**
- Spinner icon visible
- Animated dots (...)
- Skeleton placeholder
- Progress indicator
- Disabled while loading

**Component Types:**
- Button - Very common (after click)
- Card - Common (while fetching data)
- Input - Less common

**Example:**
```json
{{
  "name": "loading",
  "description": "Shows spinner icon during async operation",
  "visual_cues": [
    "circular spinner icon",
    "text changes to 'Loading...'",
    "disabled state applied"
  ],
  "confidence": 0.82
}}
```

### 5. Active/Pressed State
Visual feedback when element is being clicked.

**Visual Indicators:**
- Background darkens further
- Inner shadow applied
- Scale slightly reduced (98-99%)
- More "pressed in" appearance

**Component Types:**
- Button - Very common
- Card - If clickable

**Example:**
```json
{{
  "name": "active",
  "description": "Pressed appearance when clicked",
  "visual_cues": [
    "background 15% darker",
    "inner shadow visible",
    "subtle scale reduction"
  ],
  "confidence": 0.75
}}
```

### 6. Error State
Visual appearance when validation fails (inputs).

**Visual Indicators:**
- Red border
- Error icon
- Error message text
- Red/danger color scheme

**Component Types:**
- Input, Select - Common for validation

### 7. Success State
Visual appearance when action succeeds.

**Visual Indicators:**
- Green border/background
- Checkmark icon
- Success message
- Green/success color scheme

**Component Types:**
- Input, Alert - Common for feedback

{figma_context}

## Few-Shot Examples

### Example 1: Button with Hover and Active States
**Visual Description:** Blue button. Normal state: solid blue (#3B82F6). Hover state shows darker blue (#2563EB). Active state even darker with inner shadow.

**Analysis:**
- Clear hover state visible
- Active/pressed state visible
- No disabled or loading state visible

**Output:**
```json
{{
  "states": [
    {{
      "name": "hover",
      "description": "Darker blue background on mouse hover",
      "visual_cues": [
        "background changes from #3B82F6 to #2563EB",
        "shadow elevation increases"
      ],
      "confidence": 0.92
    }},
    {{
      "name": "active",
      "description": "Even darker with inner shadow when pressed",
      "visual_cues": [
        "background darkens further",
        "inner shadow applied"
      ],
      "confidence": 0.78
    }}
  ]
}}
```

### Example 2: Input with Focus and Error States
**Visual Description:** Text input with label. Normal: gray border. Focus: blue border with ring. Error state: red border with error icon.

**Analysis:**
- Focus state clearly visible (accessibility requirement)
- Error state for validation feedback
- No hover state (uncommon for inputs)

**Output:**
```json
{{
  "states": [
    {{
      "name": "focus",
      "description": "Blue focus ring for keyboard navigation",
      "visual_cues": [
        "2px blue border appears",
        "4px blue ring/glow around input"
      ],
      "confidence": 0.95
    }},
    {{
      "name": "error",
      "description": "Red border when validation fails",
      "visual_cues": [
        "border changes to red (#EF4444)",
        "error icon appears on right"
      ],
      "confidence": 0.88
    }}
  ]
}}
```

### Example 3: Button with Loading State
**Visual Description:** Button with normal and loading states. Loading shows spinner icon and "Loading..." text.

**Analysis:**
- Loading state clearly visible
- Spinner animation implied
- Disabled during loading

**Output:**
```json
{{
  "states": [
    {{
      "name": "loading",
      "description": "Shows spinner during async operation",
      "visual_cues": [
        "circular spinner icon visible",
        "text changes to 'Loading...'",
        "button appears disabled"
      ],
      "confidence": 0.90
    }},
    {{
      "name": "disabled",
      "description": "Grayed out appearance when disabled",
      "visual_cues": [
        "implied by loading state",
        "reduced interactivity"
      ],
      "confidence": 0.75
    }}
  ]
}}
```

### Example 4: Card with Hover State
**Visual Description:** Product card. Normal: white with subtle shadow. Hover: elevated shadow, slight lift effect.

**Analysis:**
- Hover state suggests clickability
- Shadow elevation is key indicator
- No other states visible

**Output:**
```json
{{
  "states": [
    {{
      "name": "hover",
      "description": "Elevated shadow on hover",
      "visual_cues": [
        "shadow changes from 2px to 8px",
        "card appears to lift"
      ],
      "confidence": 0.85
    }}
  ]
}}
```

## Output Format

Return a JSON object with this exact structure:

```json
{{
  "states": [
    {{
      "name": "hover|focus|disabled|loading|active|error|success",
      "description": "Clear description of what changes",
      "visual_cues": [
        "specific visual change 1",
        "specific visual change 2"
      ],
      "confidence": 0.0-1.0
    }}
  ]
}}
```

**Requirements:**
1. Include 2-4 visual cues per state (be specific about colors, dimensions, effects)
2. Description should explain what the state represents
3. Confidence must be between 0.0 and 1.0
4. Focus on states with confidence ≥ 0.70
5. Prioritize accessibility states (focus, disabled)

## Analysis Instructions

1. **Look for State Variations**:
   - Multiple visual instances shown
   - Figma layers with state names
   - Color/shadow/opacity differences

2. **Identify Interaction Patterns**:
   - Hover effects for desktop
   - Focus rings for keyboard users
   - Disabled graying for unavailable actions
   - Loading indicators for async operations

3. **Cite Specific Changes**:
   - Color values if visible (#3B82F6 → #2563EB)
   - Shadow measurements (2px → 8px)
   - Opacity percentages (100% → 50%)
   - Transition effects

4. **Confidence Scoring**:
   - **High (0.85-1.0)**: Clear visual evidence, multiple cues
   - **Medium (0.70-0.84)**: Some indicators, reasonable inference
   - **Low (< 0.70)**: Weak evidence, skip these

Now analyze the provided component image and return the JSON.
"""


def create_states_prompt(
    component_type: str,
    figma_data: dict = None,
) -> str:
    """Create a states proposal prompt with context.
    
    Args:
        component_type: The component type being analyzed
        figma_data: Optional Figma layer/component metadata
        
    Returns:
        Formatted states proposal prompt
    """
    # Add Figma context if available
    figma_context = ""
    if figma_data:
        figma_context = "## Figma Context\n\n"
        
        if "name" in figma_data:
            figma_context += f"**Layer name**: {figma_data['name']}\n"
            
        if "variants" in figma_data and figma_data["variants"]:
            variants = figma_data["variants"]
            figma_context += f"**Figma variants**: {', '.join(variants)}\n"
            figma_context += "- These variants may represent different states\n"
        
        if "properties" in figma_data:
            props = figma_data["properties"]
            state_props = [p for p in props if any(s in p.lower() for s in ['hover', 'focus', 'disabled', 'active'])]
            if state_props:
                figma_context += f"**State properties detected**: {', '.join(state_props)}\n"
        
        figma_context += "\n"
    
    return STATES_PROPOSAL_PROMPT.format(
        component_type=component_type,
        figma_context=figma_context
    )


# Export prompt for use in proposer
__all__ = ["STATES_PROPOSAL_PROMPT", "create_states_prompt"]
