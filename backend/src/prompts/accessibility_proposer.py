"""Accessibility proposer prompts with WCAG examples.

This module contains the prompt templates and examples for accessibility
requirement detection using GPT-4V, focusing on WCAG 2.1 Level AA compliance.
"""

# Main accessibility proposal prompt template
ACCESSIBILITY_PROPOSAL_PROMPT = """Analyze this {component_type} component and propose accessibility requirements.

You are an accessibility expert analyzing component screenshots. Your task is to identify WCAG 2.1 Level AA compliance requirements this component needs to be fully accessible to all users including those with disabilities.

## Component Type: {component_type}

## Accessibility Requirements to Detect

### 1. aria-label (Screen Reader Text)
Descriptive text for screen readers when visual text is insufficient.

**When Required:**
- Icon-only buttons (no visible text label)
- Complex controls with multiple parts
- Visual-only information
- Buttons with just icons/symbols

**When NOT Required:**
- Button has visible text label
- Image has alt text
- Link has descriptive text content

**Example:**
```json
{{
  "name": "aria-label",
  "required": true,
  "description": "Descriptive label 'Close dialog' for screen readers",
  "visual_cues": [
    "icon-only close button (X symbol)",
    "no visible text label"
  ],
  "confidence": 0.95
}}
```

### 2. role (ARIA Role)
Semantic role when using non-semantic HTML elements.

**Common Roles:**
- `role="button"` - For div/span used as button
- `role="navigation"` - For nav elements
- `role="alert"` - For important messages
- `role="dialog"` - For modal dialogs
- `role="tab"` - For tab interfaces

**When Required:**
- Using `<div>` or `<span>` for interactive elements
- Custom components without semantic HTML

**Example:**
```json
{{
  "name": "role",
  "required": true,
  "description": "role='button' for semantic meaning",
  "visual_cues": [
    "button-like styling on non-button element"
  ],
  "confidence": 0.85
}}
```

### 3. Semantic HTML
Use proper HTML elements instead of divs.

**Recommendations:**
- `<button>` for buttons (not `<div onclick>`)
- `<input>` for form inputs
- `<select>` for dropdowns
- `<a>` for links
- `<nav>` for navigation
- `<main>` for main content

**Example:**
```json
{{
  "name": "semantic-html",
  "required": true,
  "description": "Use <button> element instead of <div>",
  "visual_cues": [
    "button styling suggests <button> element"
  ],
  "confidence": 0.90
}}
```

### 4. Keyboard Navigation
Full keyboard accessibility for all interactions.

**Requirements:**
- Tab key moves focus
- Enter/Space activates buttons
- Arrow keys for selection/navigation
- Escape closes dialogs/menus
- Focus visible at all times

**When Required:**
- All interactive elements (buttons, inputs, selects)
- Dropdowns, modals, tabs
- Any clickable component

**Example:**
```json
{{
  "name": "keyboard-navigation",
  "required": true,
  "description": "Support Tab, Enter, Space for full keyboard access",
  "visual_cues": [
    "interactive button element",
    "focus state visible"
  ],
  "confidence": 0.95
}}
```

### 5. Color Contrast
Sufficient contrast between text and background.

**WCAG AA Requirements:**
- Normal text: 4.5:1 minimum contrast ratio
- Large text (18pt+): 3:1 minimum contrast ratio
- UI components: 3:1 minimum

**Check For:**
- Light text on light background (fail)
- Dark text on dark background (fail)
- Gray text on white (may fail)

**Example:**
```json
{{
  "name": "color-contrast",
  "required": true,
  "description": "Ensure 4.5:1 contrast ratio for text",
  "visual_cues": [
    "white text on blue background",
    "appears to have sufficient contrast"
  ],
  "confidence": 0.80
}}
```

### 6. Focus Indicators
Visible focus indicators for keyboard users.

**Requirements:**
- 2px minimum outline thickness
- High contrast focus ring
- Visible in all states
- Offset from element edge

**Example:**
```json
{{
  "name": "focus-visible",
  "required": true,
  "description": "Visible focus ring for keyboard navigation",
  "visual_cues": [
    "blue focus outline visible",
    "2px thick, high contrast"
  ],
  "confidence": 0.88
}}
```

### 7. Alt Text (for images/icons)
Alternative text descriptions for images.

**When Required:**
- Informative images
- Icons conveying meaning
- Decorative images (use alt="")

{figma_context}

## Few-Shot Examples

### Example 1: Icon-Only Close Button
**Visual Description:** Small button with X icon, no text label, appears in top-right of dialog

**Analysis:**
- Icon-only → aria-label required
- Appears to be <button> element → semantic HTML good
- Interactive → keyboard navigation required
- Focus ring not visible → may need focus-visible

**Output:**
```json
{{
  "accessibility": [
    {{
      "name": "aria-label",
      "required": true,
      "description": "Descriptive label like 'Close dialog'",
      "visual_cues": [
        "X icon only, no text",
        "close button functionality implied"
      ],
      "confidence": 0.95
    }},
    {{
      "name": "keyboard-navigation",
      "required": true,
      "description": "Tab to focus, Enter/Space to activate",
      "visual_cues": [
        "interactive button element"
      ],
      "confidence": 0.92
    }},
    {{
      "name": "focus-visible",
      "required": true,
      "description": "Visible focus indicator for keyboard users",
      "visual_cues": [
        "no focus ring visible in screenshot"
      ],
      "confidence": 0.75
    }}
  ]
}}
```

### Example 2: Primary Action Button
**Visual Description:** Blue button with white "Sign In" text, appears to use <button> element

**Analysis:**
- Has visible text → aria-label not needed
- Good contrast (white on blue)
- Semantic HTML appears correct
- Keyboard navigation needed

**Output:**
```json
{{
  "accessibility": [
    {{
      "name": "semantic-html",
      "required": true,
      "description": "Use <button> element (appears correct)",
      "visual_cues": [
        "button styling",
        "appears to be proper button element"
      ],
      "confidence": 0.85
    }},
    {{
      "name": "keyboard-navigation",
      "required": true,
      "description": "Tab focus, Enter/Space activation",
      "visual_cues": [
        "interactive button"
      ],
      "confidence": 0.93
    }},
    {{
      "name": "color-contrast",
      "required": true,
      "description": "Maintain 4.5:1 contrast ratio (appears sufficient)",
      "visual_cues": [
        "white text on blue #3B82F6",
        "high contrast visible"
      ],
      "confidence": 0.88
    }}
  ]
}}
```

### Example 3: Text Input Field
**Visual Description:** Input with label "Email", placeholder "Enter your email", gray border

**Analysis:**
- Has label → good for screen readers
- Input element → semantic HTML correct
- Keyboard navigation critical for form field
- Associated label needed

**Output:**
```json
{{
  "accessibility": [
    {{
      "name": "label-association",
      "required": true,
      "description": "Associate label with input via htmlFor/id",
      "visual_cues": [
        "label text 'Email' visible above input"
      ],
      "confidence": 0.90
    }},
    {{
      "name": "keyboard-navigation",
      "required": true,
      "description": "Tab to focus, type to input, keyboard accessible",
      "visual_cues": [
        "text input field"
      ],
      "confidence": 0.95
    }},
    {{
      "name": "focus-visible",
      "required": true,
      "description": "Focus ring when input has focus",
      "visual_cues": [
        "blue border on focus visible"
      ],
      "confidence": 0.87
    }}
  ]
}}
```

### Example 4: Clickable Card
**Visual Description:** Product card with image, title, price. Appears clickable with hover shadow.

**Analysis:**
- If using div → needs role="button" or <a> tag
- Clickable → keyboard navigation required
- May need aria-label if no clear link text

**Output:**
```json
{{
  "accessibility": [
    {{
      "name": "semantic-html",
      "required": true,
      "description": "Use <a> or <button> for clickable card",
      "visual_cues": [
        "clickable card styling",
        "navigation element"
      ],
      "confidence": 0.82
    }},
    {{
      "name": "keyboard-navigation",
      "required": true,
      "description": "Tab focus, Enter to activate",
      "visual_cues": [
        "interactive card element"
      ],
      "confidence": 0.90
    }},
    {{
      "name": "aria-label",
      "required": false,
      "description": "Optional descriptive label if complex content",
      "visual_cues": [
        "product card with image and text",
        "may benefit from combined description"
      ],
      "confidence": 0.70
    }}
  ]
}}
```

## Output Format

Return a JSON object with this exact structure:

```json
{{
  "accessibility": [
    {{
      "name": "aria-label|role|semantic-html|keyboard-navigation|color-contrast|focus-visible|label-association",
      "required": true|false,
      "description": "Clear description of requirement",
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
1. Include 2-3 visual cues per requirement
2. Set `required: true` for WCAG Level AA compliance items
3. Confidence must be between 0.0 and 1.0
4. Focus on requirements with confidence ≥ 0.70
5. Prioritize keyboard navigation and screen reader support

## Analysis Instructions

1. **Check for Screen Reader Needs**:
   - Icon-only elements → aria-label required
   - Complex controls → descriptive labels
   - Visible text → aria-label often not needed

2. **Verify Semantic HTML**:
   - Button styling → should be <button>
   - Link styling → should be <a>
   - Input fields → should be <input>/<select>

3. **Ensure Keyboard Access**:
   - All interactive elements need Tab, Enter/Space
   - Focus must be visible
   - Logical tab order

4. **Check Color Contrast**:
   - Text on background must meet 4.5:1 (AA)
   - Use contrast checker if colors visible

5. **Confidence Scoring**:
   - **High (0.85-1.0)**: Clear accessibility need, WCAG requirement
   - **Medium (0.70-0.84)**: Likely needed, best practice
   - **Low (< 0.70)**: Optional enhancement, skip

Now analyze the provided component and return the JSON with WCAG 2.1 Level AA requirements.
"""


def create_accessibility_prompt(
    component_type: str,
    figma_data: dict = None,
) -> str:
    """Create an accessibility proposal prompt with context.
    
    Args:
        component_type: The component type being analyzed
        figma_data: Optional Figma layer/component metadata
        
    Returns:
        Formatted accessibility proposal prompt
    """
    # Add Figma context if available
    figma_context = ""
    if figma_data:
        figma_context = "## Figma Context\n\n"
        
        if "name" in figma_data:
            figma_context += f"**Layer name**: {figma_data['name']}\n"
            
        if "accessibility" in figma_data and figma_data["accessibility"]:
            a11y_props = figma_data["accessibility"]
            figma_context += f"**Figma a11y annotations**: {len(a11y_props)} properties\n"
            if "alt" in str(a11y_props).lower():
                figma_context += "- Alt text annotations detected\n"
            if "label" in str(a11y_props).lower():
                figma_context += "- Label annotations detected\n"
        
        figma_context += "\n"
    
    return ACCESSIBILITY_PROPOSAL_PROMPT.format(
        component_type=component_type,
        figma_context=figma_context
    )


# Export prompt for use in proposer
__all__ = ["ACCESSIBILITY_PROPOSAL_PROMPT", "create_accessibility_prompt"]
