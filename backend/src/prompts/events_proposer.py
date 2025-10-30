"""Events proposer prompts with interaction examples.

This module contains the prompt templates and examples for event handler
requirement detection using GPT-4V.
"""

# Main events proposal prompt template
EVENTS_PROPOSAL_PROMPT = """Analyze this {component_type} component and propose event handler requirements.

You are an expert React/TypeScript developer analyzing component screenshots. Your task is to identify event handlers this component should expose based on visual interaction cues.

## Component Type: {component_type}

## Event Handlers to Detect

### 1. onClick (Click/Tap Handler)
User clicks or taps the element to trigger an action.

**Visual Indicators:**
- Cursor changes to pointer on hover
- Button-like appearance (raised, shadowed, or bordered)
- Call-to-action styling (prominent colors, clear labels)
- Interactive feedback visible (hover states, active states)

**Component Types:**
- **Button**: Almost always has onClick (required)
- **Card**: May have onClick if clickable (optional)
- **Badge**: Sometimes clickable for filtering (optional)
- **Alert**: May have onClick for dismissal (optional)

**Example:**
```json
{{
  "name": "onClick",
  "required": true,
  "visual_cues": [
    "cursor pointer implied by button styling",
    "solid background suggests clickable",
    "call-to-action text: 'Sign In'"
  ],
  "confidence": 0.95
}}
```

### 2. onChange (Value Change Handler)
Input value changes (typing, selection).

**Visual Indicators:**
- Text input field with editable area
- Blinking text cursor visible
- Input border/underline styling
- Placeholder text visible
- Dropdown arrow for selects

**Component Types:**
- **Input**: Always has onChange (required)
- **Select**: Always has onChange (required)

**Example:**
```json
{{
  "name": "onChange",
  "required": true,
  "visual_cues": [
    "text input field with border",
    "placeholder text visible",
    "text cursor indicates editable"
  ],
  "confidence": 0.92
}}
```

### 3. onHover (Mouse Hover Handler)
Mouse hovers over element (desktop interaction).

**Visual Indicators:**
- Hover state visible in designs (color change, shadow increase)
- Multiple visual states shown (default + hover)
- Subtle visual feedback on interaction

**Component Types:**
- **Button**: Common for enhanced UX (optional)
- **Card**: Common for interactivity hints (optional)
- **Badge**: Less common (optional)

**Example:**
```json
{{
  "name": "onHover",
  "required": false,
  "visual_cues": [
    "darker shade on hover state visible",
    "shadow increase on interaction"
  ],
  "confidence": 0.75
}}
```

### 4. onFocus (Keyboard Focus Handler)
Element receives keyboard focus (accessibility).

**Visual Indicators:**
- Focus ring/outline visible
- Keyboard navigation support implied
- Tab-accessible element
- Form field or interactive control

**Component Types:**
- **Input**: Important for accessibility (required for a11y)
- **Select**: Important for accessibility (required for a11y)
- **Button**: Important for keyboard users (optional but recommended)

**Example:**
```json
{{
  "name": "onFocus",
  "required": false,
  "visual_cues": [
    "focus outline visible",
    "keyboard navigable form field"
  ],
  "confidence": 0.85
}}
```

### 5. onBlur (Focus Loss Handler)
Element loses focus (often paired with onFocus).

**Visual Indicators:**
- Form validation visible
- Error states shown
- Input fields with validation logic

**Component Types:**
- **Input**: Common for validation (optional)
- **Select**: Common for validation (optional)

## Required vs Optional Guidelines

**Required Events:**
- onClick on Button components
- onChange on Input/Select components
- Events essential to component function

**Optional Events:**
- onHover for enhanced UX
- onFocus for accessibility (highly recommended)
- onBlur for validation logic
- Events that enhance but aren't essential

{figma_context}

## Few-Shot Examples

### Example 1: Primary Button
**Visual Description:** Blue button with "Sign In" text, rounded corners, solid background, hover state shows darker shade

**Analysis:**
- Button component → onClick is required
- Hover state visible → onHover is optional but detected
- No focus ring visible → onFocus not proposed

**Output:**
```json
{{
  "events": [
    {{
      "name": "onClick",
      "required": true,
      "visual_cues": [
        "solid button styling",
        "call-to-action text",
        "cursor pointer implied"
      ],
      "confidence": 0.95
    }},
    {{
      "name": "onHover",
      "required": false,
      "visual_cues": [
        "hover state with darker background visible"
      ],
      "confidence": 0.80
    }}
  ]
}}
```

### Example 2: Text Input Field
**Visual Description:** Input field with label "Email", placeholder "Enter your email", visible text cursor, blue border on focus

**Analysis:**
- Input component → onChange is required
- Focus state visible → onFocus is detected
- Form field → onBlur for validation likely

**Output:**
```json
{{
  "events": [
    {{
      "name": "onChange",
      "required": true,
      "visual_cues": [
        "text input field",
        "editable area with cursor",
        "placeholder text visible"
      ],
      "confidence": 0.94
    }},
    {{
      "name": "onFocus",
      "required": false,
      "visual_cues": [
        "focus state with blue border visible",
        "keyboard navigable input"
      ],
      "confidence": 0.88
    }},
    {{
      "name": "onBlur",
      "required": false,
      "visual_cues": [
        "validation implied by form field"
      ],
      "confidence": 0.70
    }}
  ]
}}
```

### Example 3: Clickable Card
**Visual Description:** Card with product image, title, and price. Has subtle shadow. Hover state shows elevated shadow.

**Analysis:**
- Card component → onClick is optional (depends on design)
- Hover state → suggests interactivity
- Elevated shadow → clickable affordance

**Output:**
```json
{{
  "events": [
    {{
      "name": "onClick",
      "required": false,
      "visual_cues": [
        "hover state suggests clickability",
        "elevated shadow on hover",
        "card acts as navigation element"
      ],
      "confidence": 0.82
    }},
    {{
      "name": "onHover",
      "required": false,
      "visual_cues": [
        "shadow elevation change on hover"
      ],
      "confidence": 0.85
    }}
  ]
}}
```

### Example 4: Dropdown Select
**Visual Description:** Select field with down arrow icon, "Choose option" placeholder, border similar to text input

**Analysis:**
- Select component → onChange is required
- Keyboard navigable → onFocus important for accessibility
- Dropdown interaction → onClick to open

**Output:**
```json
{{
  "events": [
    {{
      "name": "onChange",
      "required": true,
      "visual_cues": [
        "select dropdown field",
        "down arrow icon",
        "selection interface"
      ],
      "confidence": 0.93
    }},
    {{
      "name": "onClick",
      "required": false,
      "visual_cues": [
        "dropdown requires click to open"
      ],
      "confidence": 0.88
    }},
    {{
      "name": "onFocus",
      "required": false,
      "visual_cues": [
        "keyboard navigable select element"
      ],
      "confidence": 0.82
    }}
  ]
}}
```

## Output Format

Return a JSON object with this exact structure:

```json
{{
  "events": [
    {{
      "name": "onClick|onChange|onHover|onFocus|onBlur",
      "required": true|false,
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
1. Include 2-4 visual cues per event (be specific)
2. Set `required: true` only for essential events
3. Confidence must be between 0.0 and 1.0
4. Focus on events with confidence ≥ 0.70
5. Consider component type when determining required status

## Analysis Instructions

1. **Identify Component Function**:
   - Is it a button? → onClick likely required
   - Is it an input? → onChange likely required
   - Is it decorative? → May not need events

2. **Look for Interaction Cues**:
   - Cursor pointer styling
   - Hover/focus state variations
   - Editable areas and input fields
   - Call-to-action text or icons

3. **Determine Required Status**:
   - Required: Event is essential for component function
   - Optional: Event enhances UX but isn't critical

4. **Confidence Scoring**:
   - **High (0.85-1.0)**: Clear interaction cues, standard patterns
   - **Medium (0.70-0.84)**: Some indicators, reasonable inference
   - **Low (< 0.70)**: Weak evidence, skip these

Now analyze the provided component image and return the JSON.
"""


def create_events_prompt(
    component_type: str,
    figma_data: dict = None,
) -> str:
    """Create an events proposal prompt with context.
    
    Args:
        component_type: The component type being analyzed
        figma_data: Optional Figma layer/component metadata
        
    Returns:
        Formatted events proposal prompt
    """
    # Add Figma context if available
    figma_context = ""
    if figma_data:
        figma_context = "## Figma Context\n\n"
        
        if "name" in figma_data:
            figma_context += f"**Layer name**: {figma_data['name']}\n"
            
        if "interactions" in figma_data and figma_data["interactions"]:
            interactions = figma_data["interactions"]
            figma_context += f"**Figma interactions detected**: {len(interactions)} interactions\n"
            figma_context += "- These may correspond to event handlers\n"
        
        if "properties" in figma_data:
            props = figma_data["properties"]
            if "interactive" in str(props).lower():
                figma_context += "**Interactive element**: Figma properties suggest interactivity\n"
        
        figma_context += "\n"
    
    return EVENTS_PROPOSAL_PROMPT.format(
        component_type=component_type,
        figma_context=figma_context
    )


# Export prompt for use in proposer
__all__ = ["EVENTS_PROPOSAL_PROMPT", "create_events_prompt"]
