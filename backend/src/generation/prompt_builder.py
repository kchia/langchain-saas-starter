"""
Prompt Builder for LLM Code Generation

Constructs comprehensive prompts for generating React/TypeScript components.
Includes pattern reference, design tokens, requirements, and examples.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import json

# Try to import tiktoken for accurate token counting
try:
    import tiktoken
    TIKTOKEN_AVAILABLE = True
except ImportError:
    TIKTOKEN_AVAILABLE = False


@dataclass
class PromptTemplate:
    """Template for LLM prompts."""
    system_prompt: str
    user_prompt_template: str
    version: str = "1.0.0"


class PromptBuilder:
    """
    Build comprehensive prompts for component generation.
    
    Constructs prompts that include:
    - Pattern reference code
    - Design tokens with semantic meaning
    - Requirements (props, events, states, a11y)
    - Component naming and conventions
    - Validation constraints
    """
    
    # System prompt that defines the AI's role and capabilities
    SYSTEM_PROMPT = """You are an expert React and TypeScript developer specializing in creating accessible, production-ready UI components following shadcn/ui conventions.

Your expertise includes:
- Writing clean, type-safe TypeScript with strict mode (no 'any' types)
- Creating accessible components with proper ARIA attributes
- Following React best practices and modern patterns
- Implementing design systems with design tokens
- Writing comprehensive Storybook stories

TYPESCRIPT TYPE PATTERNS:
Use these exact patterns for proper TypeScript typing:

```typescript
// Button component with variants - CORRECT TypeScript pattern
import * as React from "react";

// 1. Define variant types explicitly
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

// 2. Extend React's built-in HTML attributes
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
}

// 3. Use React.forwardRef with explicit types
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(/* ... */)} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
```

```typescript
// Card component - CORRECT TypeScript pattern
import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated";
  children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(/* ... */)} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
```

**CRITICAL**: ALWAYS use these patterns:
- Explicit union types for variants: `type Variant = "a" | "b" | "c"`
- Extend appropriate React HTML attributes: `React.ButtonHTMLAttributes`, `React.HTMLAttributes`, etc.
- Use `React.forwardRef<HTMLElement, Props>` with both type parameters
- Include `children?: React.ReactNode` in props interface
- Set `displayName` for better debugging

CRITICAL REQUIREMENTS:
1. **Self-contained code**: Do NOT import from '@/lib/utils' or any utility files
2. **ALWAYS inline the cn utility** at the top of your component:
   ```typescript
   // Inline utility for merging classes
   const cn = (...classes: (string | undefined | null | false)[]) =>
     classes.filter(Boolean).join(' ');
   ```
3. **Use cn() for all className merging** - NEVER use template literals like `bg-${variant}`
4. **Static Tailwind classes only** - Use conditional logic, not dynamic class names
5. **Proper TypeScript** - NO 'any' types, including 'as any'
6. **Conditional button semantics** - Only add role="button"/tabIndex if onClick exists

Example of correct className usage with design tokens:
```typescript
// Button example - Complete styling with proper defaults
className={cn(
  // Base styles: layout, spacing, borders, transitions (REQUIRED)
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
  // Border for outline variant
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  // Color variants using extracted design tokens
  variant === "primary" && "bg-[#3B82F6] text-white hover:bg-[#2563EB]",
  variant === "secondary" && "bg-[#6B7280] text-white hover:bg-[#4B5563]",
  variant === "outline" && "border border-[#E5E7EB] bg-transparent hover:bg-[#F3F4F6]",
  // State modifiers
  disabled && "opacity-50 cursor-not-allowed",
  className
)}

// Card example - Complete card styling
className={cn(
  // Base styles: MUST include border, padding, rounded corners, text color
  "border border-[#E5E7EB] rounded-lg p-6 bg-white text-gray-900",
  // Optional enhancements
  shadow && "shadow-md",
  interactive && "hover:shadow-lg transition-shadow cursor-pointer",
  variant === "primary" && "border-[#3B82F6] bg-[#EFF6FF]",
  className
)}
```

**CRITICAL**: Every component MUST have complete functional styling by default:
- Cards MUST have: `border`, `border-[color]`, `rounded-lg`, `p-4` or `p-6`, background, `text-gray-900`
- Buttons MUST have: `px-4 py-2`, `rounded-md`, `font-medium`, background, text color, hover states
- Inputs MUST have: `border`, padding, `rounded-md`, `text-gray-900`, focus states
- ALL components MUST specify text color explicitly to ensure readability

**IMPORTANT**: When design tokens specify colors, use the EXACT color values provided:
- If tokens specify `primary: #3B82F6`, use `bg-[#3B82F6]` (not `bg-blue-500`)
- If tokens specify `secondary: rgb(107, 114, 128)`, use `bg-[rgb(107,114,128)]`
- This ensures the component matches the extracted design system exactly

You generate complete, working component code that compiles without errors."""

    # Template for the user prompt
    USER_PROMPT_TEMPLATE = """## Task
Generate a production-ready React component based on the requirements below.

## Reference Pattern (shadcn/ui)
Use this pattern as a reference for style and structure. DO NOT copy it directly - adapt it to meet the specific requirements.

```tsx
{pattern_code}
```

## Component Information
**Name**: {component_name}
**Type**: {component_type}
**Description**: {component_description}

## Design Tokens
Apply these design tokens to the component using CSS variables.

{design_tokens}

## Component Base Styling Requirements

Based on the component type **{component_type}**, ensure these base styles are included:

**Card components:**
- Base: `border border-[extracted-color] rounded-lg p-6 bg-white text-gray-900`
- Must be visually distinct as a container with clear boundaries
- Include proper spacing between content
- MUST include default text color (e.g., `text-gray-900`) to ensure content is readable

**Button components:**
- Base: `inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors`
- Must have visible background and hover states
- Include focus-visible styles for accessibility

**Input/Form components:**
- Base: `border border-[extracted-color] rounded-md px-3 py-2 w-full`
- Must have visible border and focus states
- Include proper spacing for text content

**If component type doesn't match above, use appropriate spacing, borders, and visual hierarchy for the component type.**

## Requirements

### Props
{props_requirements}

### Events
{events_requirements}

### States
{states_requirements}

### Accessibility
{accessibility_requirements}

## Constraints
- **MUST inline cn utility** - First line inside component should define the cn function
- **MUST use cn() for className** - NEVER use template literals for dynamic classes
- **Static Tailwind classes only** - No `bg-${{variant}}`, use conditionals instead
- **MUST use EXACT extracted token values** - Use `bg-[#3B82F6]` with the exact color from design tokens
- **MUST include complete base styling** - Every component needs padding, borders, rounded corners, etc.
- **MUST include text colors** - All components need explicit text colors (e.g., `text-gray-900`) to ensure readability
- **Cards MUST have**: `border border-[color] rounded-lg p-6 bg-white text-gray-900` as base styles
- **Buttons MUST have**: `px-4 py-2 rounded-md font-medium text-white` (or appropriate text color) plus background/hover states
- **Inputs MUST have**: `border border-[color] rounded-md px-3 py-2 text-gray-900` plus focus states
- Match colors EXACTLY to the design tokens provided (don't approximate with Tailwind color names)
- TypeScript strict mode (no 'any' types allowed, including 'as any')
- All props must have explicit types
- Only add role="button" and tabIndex if onClick prop exists
- Include proper ARIA attributes for accessibility
- Use Tailwind arbitrary values for extracted colors: `bg-[#HEX]`, `text-[rgb(r,g,b)]`, etc.
- Export component with displayName set
- Include proper JSDoc comments for props
- Component must compile without TypeScript errors
- Component must pass ESLint validation
- **Showcase MUST have descriptions**: Each variant must include technical description with exact values (colors, spacing, purpose)

## Output Format
**CRITICAL: You MUST return ALL THREE code files!**

Return a JSON object with the following structure:
{{
  "component_code": "complete .tsx file content (REQUIRED)",
  "stories_code": "complete .stories.tsx file content for Storybook (REQUIRED)",
  "showcase_code": "complete .showcase.tsx file that renders all variations (REQUIRED - see example below)",
  "imports": ["list of import statements"],
  "exports": ["list of exported names"],
  "explanation": "brief explanation of key implementation decisions"
}}

**IMPORTANT**: If showcase_code is missing or empty, your response will be rejected!

### Showcase File Example
The showcase file should render all component variations with DETAILED DESCRIPTIONS following this structure.
**Note**: The 4 examples below are illustrative - generate as many variations as needed to showcase ALL component features:

```tsx
import {{{{ ComponentName }}}} from './ComponentName';

export default function ComponentNameShowcase() {{{{
  return (
    <div className="space-y-8 p-8">
      {{{{/* Page Header */}}}}
      <div>
        <h1 className="text-3xl font-bold mb-2">ComponentName Components</h1>
        <p className="text-gray-600">Generated by Component Forge</p>
      </div>

      {{{{/* Variants Grid - Show ALL key variations that demonstrate component features */}}}}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {{{{/* Variation 1: Basic/Default - Minimal styling */}}}}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Basic ComponentName</h3>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <ComponentName>
              <div className="text-gray-900">
                <h4 className="font-semibold mb-2">Card Title</h4>
                <p className="text-gray-600">This is a basic card with border and padding. It has rounded corners (medium radius).</p>
              </div>
            </ComponentName>
          </div>
          <p className="text-sm text-gray-600">
            This is a basic component with border and padding. It has rounded corners (12px radius).
            Border: 1px solid #E5E7EB. Background: #FFFFFF. Padding: 24px.
          </p>
        </div>

        {{{{/* Variation 2: Elevated - With shadow for depth */}}}}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Elevated ComponentName</h3>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <ComponentName shadow{{{{/* or elevation prop if available */}}}}>
              <div className="text-gray-900">
                <h4 className="font-semibold mb-2">Card Title</h4>
                <p className="text-gray-600">This card has box-shadow for elevation effect. Padding: 20px. Shadow: 0 4px 12px rgba(0,0,0,0.1).</p>
              </div>
            </ComponentName>
          </div>
          <p className="text-sm text-gray-600">
            This component has box-shadow for elevation effect. Padding: 20px.
            Shadow: 0 4px 12px rgba(0,0,0,0.1). Used for components that need to stand out.
          </p>
        </div>

        {{{{/* Variation 3: Interactive - Shows hover/click behavior */}}}}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Interactive ComponentName (Hover)</h3>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <ComponentName
              hoverEffect{{{{/* or interactive prop */}}}}
              onClick={{{{() => alert('Clicked!')}}}}
            >
              <div className="text-gray-900">
                <h4 className="font-semibold mb-2">Clickable Card</h4>
                <p className="text-gray-600">Border changes on hover. Hover: Pointer cursor. Transition: all 200ms. Transform: scale(1.05) on hover.</p>
              </div>
            </ComponentName>
          </div>
          <p className="text-sm text-gray-600">
            Border changes on hover. Hover: Pointer cursor. Transition: all 200ms.
            Transform: scale(1.05) on hover. Background: #3B82F6 (or appropriate color).
          </p>
        </div>

        {{{{/* Variation 4: Feature combination (e.g., with header, different variant) */}}}}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Content ComponentName with Header</h3>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <ComponentName header="Header Text"{{{{/* or variant="primary" */}}}}>
              <div className="text-gray-900">
                <p className="text-gray-600">Body content goes here with proper spacing and typography hierarchy.</p>
              </div>
            </ComponentName>
          </div>
          <p className="text-sm text-gray-600">
            Component with header section. Header font-weight: 600. Margin-bottom: 16px.
            Demonstrates content structure and typography hierarchy.
          </p>
        </div>
      </div>

      {{{{/* IMPORTANT: Add more variations as needed to showcase ALL component features */}}}}
      {{{{/* - If component has 5+ variants/props, show them all */}}}}
      {{{{/* - If component is simple with 2-3 props, show 3-4 variations */}}}}
      {{{{/* - Each variation should demonstrate a UNIQUE and meaningful feature */}}}}
      {{{{/* - Grid will automatically wrap to multiple rows */}}}}
    </div>
  );
}}}}
```

**IMPORTANT**: Replace "ComponentName" with the actual component name (e.g., "Card", "Button", "Input").
Use the actual component's props and variants in the examples.

**CRITICAL SHOWCASE REQUIREMENTS**:

1. **Title Format**: MUST be "{{ComponentName}} Components" (plural) for professional look

2. **Grid Layout**: MUST use `grid grid-cols-1 md:grid-cols-2 gap-6` for responsive 2-column layout (will wrap to multiple rows as needed)

3. **Each Variation MUST Include**:
   - **Section container**: `<div className="space-y-3">` for consistent spacing
   - **Variant label**: `<h3 className="text-lg font-semibold">` describing what makes it unique
   - **Display container**: `<div className="p-6 bg-white rounded-lg border">` to showcase the component
   - **Technical description**: `<p className="text-sm text-gray-600">` with exact styling values

4. **Number of Variations**: Generate as many variations as needed to showcase ALL important features:
   - **Minimum**: Show at least the basic/default variant
   - **Comprehensive**: Create variations for each unique prop, variant type, state, and feature combination
   - **Quality over quantity**: Each variation should demonstrate something DIFFERENT and meaningful
   - **Typical range**: 4-8 variations depending on component complexity

5. **Component-Specific Variation Ideas** (adapt based on actual props):

   **For Card components** (show variations for each applicable feature):
   - Basic Card (minimal styling)
   - Elevated Card (with shadow/elevation)
   - Interactive Card (Hover) (with hover effects)
   - Content Card (with header prop/section)
   - Primary/Accent Variant (if variant prop exists)
   - With Border Radius variations (if applicable)
   - Etc. - show all meaningful combinations

   **For Button components** (show all variant types and states):
   - Each variant type (primary, secondary, outline, ghost, destructive, etc.)
   - Each size (sm, md, lg)
   - Disabled states
   - With icons (if supported)
   - Loading states (if applicable)

   **For Input components** (show all states and configurations):
   - Default Input (basic styling)
   - With Label (shows label prop)
   - With Placeholder
   - With Error State (error styling)
   - With Helper Text
   - Disabled Input (shows disabled state)
   - Different sizes (if applicable)

6. **Technical Descriptions MUST Include**:
   - Exact color values (#HEX or rgb())
   - Spacing values (padding, margin in px)
   - Border radius, shadows, transitions
   - When to use this variant
   - How it differs from other variants

7. **Each variation should demonstrate a DIFFERENT feature or combination** - don't just change one prop, show how multiple props work together when it makes sense

Generate complete, working code that meets all requirements."""

    def __init__(self):
        """Initialize prompt builder."""
        self.template = PromptTemplate(
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt_template=self.USER_PROMPT_TEMPLATE,
        )
    
    def build_prompt(
        self,
        pattern_code: str,
        component_name: str,
        component_type: str,
        tokens: Dict[str, Any],
        requirements: Dict[str, Any],
        component_description: Optional[str] = None,
    ) -> Dict[str, str]:
        """
        Build a complete prompt for component generation.
        
        Args:
            pattern_code: Reference pattern code (shadcn/ui)
            component_name: Name of the component to generate
            component_type: Type (button, card, input, etc.)
            tokens: Design tokens (colors, typography, spacing)
            requirements: Component requirements (props, events, states, a11y)
            component_description: Optional description of the component
        
        Returns:
            Dict with 'system' and 'user' prompts
        """
        # Format design tokens
        tokens_str = self._format_design_tokens(tokens)
        
        # Format requirements by category
        props_str = self._format_requirements(
            requirements.get("props", []),
            "No specific props required. Use common patterns for this component type."
        )
        
        events_str = self._format_requirements(
            requirements.get("events", []),
            "No specific events required. Include standard event handlers."
        )
        
        states_str = self._format_requirements(
            requirements.get("states", []),
            "No specific state requirements. Use appropriate state management."
        )
        
        a11y_str = self._format_requirements(
            requirements.get("accessibility", []),
            "Follow WCAG 2.1 AA standards with proper ARIA attributes."
        )
        
        # Build user prompt
        user_prompt = self.USER_PROMPT_TEMPLATE.format(
            pattern_code=pattern_code,
            component_name=component_name,
            component_type=component_type,
            component_description=component_description or f"A {component_type} component",
            design_tokens=tokens_str,
            props_requirements=props_str,
            events_requirements=events_str,
            states_requirements=states_str,
            accessibility_requirements=a11y_str,
        )
        
        return {
            "system": self.SYSTEM_PROMPT,
            "user": user_prompt,
        }
    
    def _format_design_tokens(self, tokens: Dict[str, Any]) -> str:
        """Format design tokens for the prompt."""
        sections = []

        # Format colors with usage instructions
        if "colors" in tokens and tokens["colors"]:
            colors = tokens["colors"]
            color_lines = []
            for name, value in colors.items():
                # Show token name, value, and how to use it
                color_lines.append(f"  - {name}: `{value}` → Use as `bg-[{value}]` or `text-[{value}]`")
            sections.append("**Colors:**\n" + "\n".join(color_lines))
        
        # Format typography
        if "typography" in tokens and tokens["typography"]:
            typo = tokens["typography"]
            typo_lines = []
            for key, value in typo.items():
                typo_lines.append(f"  - {key}: {value}")
            sections.append("**Typography:**\n" + "\n".join(typo_lines))
        
        # Format spacing
        if "spacing" in tokens and tokens["spacing"]:
            spacing = tokens["spacing"]
            spacing_lines = []
            for key, value in spacing.items():
                spacing_lines.append(f"  - {key}: {value}")
            sections.append("**Spacing:**\n" + "\n".join(spacing_lines))
        
        # Format borders
        if "borders" in tokens and tokens["borders"]:
            borders = tokens["borders"]
            border_lines = []
            for key, value in borders.items():
                border_lines.append(f"  - {key}: {value}")
            sections.append("**Borders:**\n" + "\n".join(border_lines))
        
        if not sections:
            return "No specific design tokens provided. Use sensible defaults."
        
        return "\n\n".join(sections)
    
    def _format_requirements(
        self, 
        requirements: List[Dict[str, Any]], 
        default_message: str
    ) -> str:
        """Format requirements list for the prompt."""
        if not requirements:
            return default_message
        
        lines = []
        for req in requirements:
            # Handle different requirement formats
            if isinstance(req, dict):
                name = req.get("name", "")
                req_type = req.get("type", "")
                description = req.get("description", "")
                
                if name:
                    line = f"- **{name}**"
                    if req_type:
                        line += f" ({req_type})"
                    if description:
                        line += f": {description}"
                    lines.append(line)
            elif isinstance(req, str):
                lines.append(f"- {req}")
        
        return "\n".join(lines) if lines else default_message
    
    def estimate_token_count(self, prompts: Dict[str, str]) -> int:
        """
        Estimate token count for the prompts.
        
        Uses tiktoken for accurate counting if available, otherwise falls back
        to rough estimate (~4 characters per token).
        
        Args:
            prompts: Dict with 'system' and 'user' prompts
        
        Returns:
            Estimated token count
        """
        if TIKTOKEN_AVAILABLE:
            try:
                # Use tiktoken for accurate token counting
                encoder = tiktoken.encoding_for_model("gpt-4o")
                system_tokens = len(encoder.encode(prompts["system"]))
                user_tokens = len(encoder.encode(prompts["user"]))
                return system_tokens + user_tokens
            except Exception:
                # Fall back to rough estimate if encoding fails
                pass
        
        # Fallback: rough estimate
        total_chars = len(prompts["system"]) + len(prompts["user"])
        return total_chars // 4
    
    def truncate_pattern_if_needed(
        self, 
        pattern_code: str, 
        max_lines: int = 200
    ) -> str:
        """
        Truncate pattern code if it's too long.
        
        Args:
            pattern_code: Pattern code to potentially truncate
            max_lines: Maximum number of lines to keep
        
        Returns:
            Potentially truncated pattern code
        """
        lines = pattern_code.split('\n')
        if len(lines) <= max_lines:
            return pattern_code
        
        # Keep first portion and add truncation notice
        truncated = '\n'.join(lines[:max_lines])
        truncated += f"\n\n// ... truncated {len(lines) - max_lines} lines ..."
        return truncated
