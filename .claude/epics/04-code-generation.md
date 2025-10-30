# Epic 4: Code Generation & Adaptation

**Status**: ✅ Completed (Refactored in Epic 4.5)
**Priority**: Critical
**Epic Owner**: AI/ML Team
**Estimated Tasks**: 10
**Depends On**: Epic 1 (Design Tokens), Epic 2 (Requirements), Epic 3 (Pattern Retrieval)

**Note**: This epic was successfully completed and then significantly improved in **Epic 4.5: LLM-First Code Generation Refactor**. The original 8-stage template-based pipeline has been replaced with a modern 3-stage LLM-first approach using GPT-4, resulting in 3x faster generation and better quality.

---

## Overview

Build the code generation system that adapts retrieved shadcn/ui patterns to match extracted tokens and approved requirements. Generates production-ready TypeScript components with Tailwind CSS, ARIA attributes, Storybook stories, and provenance headers.

---

## Goals

1. Parse pattern AST to understand code structure
2. Inject design tokens into component styles
3. Generate Tailwind CSS classes with CSS variables
4. Implement approved requirements (props, events, states)
5. Add ARIA attributes and semantic HTML
6. Enforce TypeScript strict mode with proper types
7. Generate Storybook stories for all variants
8. Add provenance headers tracking generation source
9. Resolve imports and dependencies correctly
10. Achieve p50 latency ≤60s for Button/Card generation

---

## Success Criteria

**Epic 4 - Original Implementation**:
- ✅ Parse TypeScript AST without errors
- ✅ Inject tokens into Tailwind classes correctly
- ✅ Generate CSS variables in component file
- ✅ Implement all approved requirements from Epic 2
- ✅ Add proper ARIA attributes (aria-label, role, etc.)
- ✅ TypeScript strict mode compilation succeeds
- ✅ No `any` types without justification
- ✅ Generate Storybook stories with all variants
- ✅ Provenance header includes pattern ID and version
- ✅ Import resolution handles shadcn/ui dependencies
- ✅ Generated code passes ESLint and Prettier
- ✅ p50 latency ≤60s for Button/Card components
- ✅ p95 latency ≤90s

**Epic 4.5 - LLM-First Improvements**:
- ✅ 3-stage pipeline (LLM → Validate → Post-process)
- ✅ GPT-4 single-pass generation with structured output
- ✅ Automatic validation and LLM-driven fixes
- ✅ Comprehensive LangSmith tracing
- ✅ p50 latency ≤20s (3x faster than original)
- ✅ p95 latency ≤30s (3x faster than original)
- ✅ Quality score ≥80/100
- ✅ First-time valid rate ≥85%

**See**: `.claude/epics/04.5-llm-first-generation-refactor.md` for details on the refactor.

---

## Wireframe

### Interactive Prototype
**View HTML:** [component-preview-page.html](../wireframes/component-preview-page.html)

![Component Preview Page](../wireframes/screenshots/04-component-preview-desktop.png)

### Key UI Elements

**Generation Progress** (Top banner - during generation)
- Progress bar with stages → Tasks 1-10 pipeline visualization
  - AST Parsing → Task 1
  - Token Injection → Task 2
  - Tailwind Generation → Task 3
  - Requirements Implementation → Task 4
  - A11y Enhancement → Task 5
  - Type Generation → Task 6
  - Storybook Generation → Task 7
  - Provenance Headers → Task 8
  - Import Resolution → Task 9
  - Code Assembly → Task 10
- Current stage indicator
- Elapsed time display (target: ≤60s)

**Component Preview** (Left panel)
- Live component render with Tailwind CSS
- Interactive variant selector → Task 4: Requirements Implementation
- State toggles (hover, focus, disabled, loading)
- Viewport size controls (mobile, tablet, desktop)
- Dark/light mode toggle

**Code Viewer** (Right panel)
- Tabbed interface:
  - **Component.tsx** → Main component code
    - Provenance header → Task 8
    - Type definitions → Task 6
    - CSS variables → Task 2: Token Injection
    - Component implementation → Task 4
  - **Component.stories.tsx** → Task 7: Storybook Generation
  - **tokens.json** → Injected tokens from Epic 1
  - **requirements.json** → Approved requirements from Epic 2
- Syntax highlighting
- Copy button per tab
- Download all button

**Generation Details** (Expandable section)
- Pattern used (from Epic 3)
- Tokens applied → Task 2: Design Token Injection
- Requirements implemented → Task 4: Requirements Implementation
- ARIA attributes added → Task 5: ARIA Attributes & Semantic HTML
- Import statements → Task 9: Import Resolution
- TypeScript compilation status → Task 6: TypeScript Type Safety

**Quality Indicators** (Right sidebar - preview of Epic 5)
- TypeScript: ✓ Compiled successfully
- ESLint: ✓ No errors
- Prettier: ✓ Formatted
- Accessibility: Pending validation (→ Epic 5)
- Token Adherence: Calculating... (→ Epic 5)

**Action Buttons**
- "Run Quality Validation" (proceed to Epic 5)
- "Regenerate with Changes"
- "Export Component"
- "Add to Project"

### User Flow
1. Generation starts with pattern, tokens, and requirements
2. Progress bar shows real-time pipeline stages
3. Component preview updates as generation completes
4. Code viewer displays generated files with syntax highlighting
5. User inspects component preview and code
6. User proceeds to quality validation (Epic 5)

**Performance Metrics:**
- Generation latency (p50 target: ≤60s, p95: ≤90s)
- Tokens injected count
- Requirements implemented count
- Lines of code generated

**Quick Test:**
```bash
# View wireframe locally
open .claude/wireframes/component-preview-page.html
```

---

## Tasks

### Task 1: AST Parsing & Analysis
**Acceptance Criteria**:
- [ ] Parse TypeScript pattern code to AST using `@babel/parser`
- [ ] Extract component structure:
  - Component name and type (function/class)
  - Props interface
  - Return statement (JSX)
  - Imports and dependencies
- [ ] Identify modification points:
  - Style/className attributes
  - Props destructuring
  - Event handlers
  - Conditional rendering
- [ ] Handle parsing errors gracefully
- [ ] Support both function and arrow function components
- [ ] Preserve code formatting and comments

**Files**:
- `backend/src/generation/ast_parser.py`

**AST Parsing**:
```python
import json
from typing import Dict, Any
import subprocess

class ASTParser:
    def parse(self, code: str) -> Dict[str, Any]:
        """Parse TypeScript code to AST using Babel parser."""
        # Use Node.js subprocess to parse with @babel/parser
        result = subprocess.run(
            ['node', 'scripts/parse_ast.js'],
            input=code,
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise ValueError(f"AST parsing failed: {result.stderr}")

        ast = json.loads(result.stdout)
        return self._analyze_ast(ast)

    def _analyze_ast(self, ast: dict) -> dict:
        """Extract component structure from AST."""
        return {
            "component_name": self._get_component_name(ast),
            "props_interface": self._get_props_interface(ast),
            "jsx_structure": self._get_jsx_structure(ast),
            "imports": self._get_imports(ast),
            "modification_points": self._find_modification_points(ast)
        }
```

**Node.js Helper** (`scripts/parse_ast.js`):
```javascript
const parser = require('@babel/parser');
const fs = require('fs');

const code = fs.readFileSync(0, 'utf-8'); // Read from stdin

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['typescript', 'jsx']
});

console.log(JSON.stringify(ast, null, 2));
```

**Tests**:
- Parse shadcn/ui Button component successfully
- Extract props interface correctly
- Identify className modification points
- Handle parsing errors gracefully

---

### Task 2: Design Token Injection
**Acceptance Criteria**:
- [ ] Map extracted tokens to component styles:
  - Colors → background, text, border colors
  - Typography → font family, size, weight
  - Spacing → padding, margin, gap
- [ ] Generate CSS variable definitions:
  ```css
  :root {
    --color-primary: #3B82F6;
    --font-size-base: 16px;
    --spacing-md: 16px;
  }
  ```
- [ ] Replace hardcoded values in pattern with CSS vars
- [ ] Handle token mapping for different component types:
  - Button: primary color, padding, font
  - Card: background, border, spacing
  - Input: border color, focus ring, padding
- [ ] Preserve existing Tailwind classes when possible
- [ ] Add fallback values for missing tokens

**Files**:
- `backend/src/generation/token_injector.py`

**Token Injection**:
```python
class TokenInjector:
    def inject(self, ast: dict, tokens: dict) -> dict:
        """Inject design tokens into component AST."""
        css_vars = self._generate_css_variables(tokens)
        modified_ast = self._replace_styles(ast, tokens)

        return {
            "ast": modified_ast,
            "css_variables": css_vars,
            "token_mapping": self._create_token_mapping(tokens)
        }

    def _generate_css_variables(self, tokens: dict) -> str:
        """Generate CSS variable definitions."""
        vars = []
        if "colors" in tokens:
            for name, value in tokens["colors"].items():
                vars.append(f"  --color-{name}: {value};")

        if "typography" in tokens:
            if "fontSize" in tokens["typography"]:
                vars.append(f"  --font-size-base: {tokens['typography']['fontSize']};")

        if "spacing" in tokens:
            for name, value in tokens["spacing"].items():
                vars.append(f"  --spacing-{name}: {value};")

        return ":root {\n" + "\n".join(vars) + "\n}"

    def _replace_styles(self, ast: dict, tokens: dict) -> dict:
        """Replace hardcoded styles with token references."""
        # Modify className attributes to use CSS variables
        # Example: bg-blue-500 → bg-[var(--color-primary)]
        pass
```

**Tests**:
- CSS variables generated correctly
- Token values injected into styles
- Fallback values used when tokens missing
- Token mapping complete and accurate

---

### Task 3: Tailwind CSS Generation
**Acceptance Criteria**:
- [ ] Generate Tailwind CSS classes using design tokens
- [ ] Use CSS variables for dynamic values:
  - `bg-[var(--color-primary)]`
  - `text-[var(--font-size-base)]`
  - `p-[var(--spacing-md)]`
- [ ] Support all Tailwind utilities:
  - Colors: bg, text, border
  - Spacing: p, m, gap
  - Typography: font, text, leading
  - Layout: flex, grid
  - States: hover, focus, disabled
- [ ] Generate responsive classes when needed
- [ ] Maintain semantic class composition
- [ ] Avoid inline styles unless necessary
- [ ] Validate generated classes against Tailwind config

**Files**:
- `backend/src/generation/tailwind_generator.py`

**Tailwind Generation**:
```python
class TailwindGenerator:
    def generate_classes(self, element: str, tokens: dict,
                        variant: str = None) -> str:
        """Generate Tailwind classes for element."""
        classes = []

        # Base classes
        if element == "button":
            classes.extend([
                "inline-flex items-center justify-center",
                "rounded-md text-sm font-medium",
                "transition-colors focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-50"
            ])

            # Variant-specific classes
            if variant == "primary":
                classes.extend([
                    "bg-[var(--color-primary)]",
                    "text-white",
                    "hover:bg-[var(--color-primary)]/90"
                ])
            elif variant == "secondary":
                classes.extend([
                    "bg-secondary text-secondary-foreground",
                    "hover:bg-secondary/80"
                ])

            # Spacing from tokens
            if "spacing" in tokens:
                padding = tokens["spacing"].get("padding", "16px")
                classes.append(f"p-[{padding}]")

        return " ".join(classes)
```

**Tests**:
- Tailwind classes generated correctly
- CSS variables used appropriately
- Classes validate against Tailwind config
- Responsive classes work correctly

---

### Task 4: Requirements Implementation
**Acceptance Criteria**:
- [ ] Implement all approved requirements from Epic 2:
  - Props: Add to interface, use in component
  - Events: Add event handlers (onClick, onChange, etc.)
  - States: Implement state management for hover, focus, disabled
  - Validation: Add validation logic for inputs
  - A11y: Add ARIA attributes
- [ ] Generate TypeScript prop types from requirements
- [ ] Add JSDoc comments for props
- [ ] Implement prop validation (required vs optional)
- [ ] Handle default values for optional props
- [ ] Generate variant logic based on props
- [ ] Add event handler type definitions

**Files**:
- `backend/src/generation/requirement_implementer.py`

**Requirement Implementation**:
```python
class RequirementImplementer:
    def implement(self, ast: dict, requirements: dict) -> dict:
        """Implement approved requirements in component."""
        modified_ast = ast.copy()

        # Add props to interface
        if "props" in requirements:
            modified_ast = self._add_props(modified_ast, requirements["props"])

        # Add event handlers
        if "events" in requirements:
            modified_ast = self._add_events(modified_ast, requirements["events"])

        # Add state management
        if "states" in requirements:
            modified_ast = self._add_states(modified_ast, requirements["states"])

        # Add accessibility attributes
        if "accessibility" in requirements:
            modified_ast = self._add_a11y(modified_ast, requirements["accessibility"])

        return modified_ast

    def _add_props(self, ast: dict, props: list) -> dict:
        """Add props to TypeScript interface."""
        # Generate interface code
        interface_code = "interface ButtonProps {\n"
        for prop in props:
            prop_type = self._infer_prop_type(prop)
            optional = "?" if not prop.get("required") else ""
            interface_code += f"  {prop['name']}{optional}: {prop_type};\n"
        interface_code += "}"
        # Insert into AST
        return ast
```

**Tests**:
- Props added to interface correctly
- Event handlers implemented properly
- State management works as expected
- Default values handled correctly

---

### Task 5: ARIA Attributes & Semantic HTML
**Acceptance Criteria**:
- [ ] Add appropriate ARIA attributes:
  - `aria-label` for icon-only buttons
  - `aria-disabled` for disabled state
  - `aria-busy` for loading state
  - `aria-pressed` for toggle buttons
  - `role` when semantic HTML insufficient
- [ ] Use semantic HTML elements:
  - `<button>` for clickable actions
  - `<input>` for form fields
  - `<label>` for input labels
  - `<fieldset>` for grouped inputs
- [ ] Add keyboard navigation support:
  - `tabIndex` for focusable elements
  - `onKeyDown` for keyboard handlers
- [ ] Implement focus indicators
- [ ] Add screen reader text where needed

**Files**:
- `backend/src/generation/a11y_enhancer.py`

**A11y Enhancement**:
```python
class A11yEnhancer:
    def enhance(self, ast: dict, component_type: str,
                requirements: dict) -> dict:
        """Add accessibility attributes to component."""
        modified_ast = ast.copy()

        # Add ARIA attributes based on component type
        if component_type == "button":
            modified_ast = self._add_button_a11y(modified_ast, requirements)
        elif component_type == "input":
            modified_ast = self._add_input_a11y(modified_ast, requirements)

        # Add keyboard navigation
        modified_ast = self._add_keyboard_nav(modified_ast)

        return modified_ast

    def _add_button_a11y(self, ast: dict, requirements: dict) -> dict:
        """Add button-specific ARIA attributes."""
        aria_attrs = []

        # Check for icon-only variant
        if "icon-only" in requirements.get("variants", []):
            aria_attrs.append('aria-label="{label}"')

        # Add disabled state
        aria_attrs.append('aria-disabled={disabled}')

        # Add loading state if required
        if "loading" in requirements.get("states", []):
            aria_attrs.append('aria-busy={loading}')

        return ast
```

**Tests**:
- ARIA attributes added correctly
- Semantic HTML used appropriately
- Keyboard navigation works
- Focus indicators visible

---

### Task 6: TypeScript Type Safety
**Acceptance Criteria**:
- [ ] Generate strict TypeScript with no `any` types
- [ ] Define prop interfaces with proper types
- [ ] Add return type annotations for functions
- [ ] Use TypeScript utility types where appropriate:
  - `Omit`, `Pick`, `Partial`, etc.
- [ ] Add JSDoc comments for complex types
- [ ] Generate union types for variants
- [ ] Handle ref forwarding with proper types
- [ ] Validate generated code with `tsc --noEmit`
- [ ] Fix common TypeScript errors automatically

**Files**:
- `backend/src/generation/type_generator.py`

**Type Generation**:
```python
class TypeGenerator:
    def generate_types(self, requirements: dict) -> str:
        """Generate TypeScript type definitions."""
        types = []

        # Variant union type
        if "variant" in requirements.get("props", []):
            variants = requirements["props"]["variant"]["values"]
            variant_type = " | ".join(f'"{v}"' for v in variants)
            types.append(f'type Variant = {variant_type};')

        # Props interface
        props_interface = self._generate_props_interface(requirements)
        types.append(props_interface)

        return "\n\n".join(types)

    def _generate_props_interface(self, requirements: dict) -> str:
        """Generate props interface."""
        code = "interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n"

        for prop in requirements.get("props", []):
            prop_name = prop["name"]
            prop_type = self._get_prop_type(prop)
            optional = "?" if not prop.get("required") else ""

            # Add JSDoc if available
            if "description" in prop:
                code += f'  /** {prop["description"]} */\n'

            code += f"  {prop_name}{optional}: {prop_type};\n"

        code += "}"
        return code

    def _get_prop_type(self, prop: dict) -> str:
        """Infer TypeScript type from prop definition."""
        if prop.get("values"):
            # Union type for enums
            return " | ".join(f'"{v}"' for v in prop["values"])
        elif prop.get("type") == "boolean":
            return "boolean"
        elif prop.get("type") == "function":
            return "() => void"
        else:
            return "string"
```

**Tests**:
- TypeScript compilation succeeds
- No `any` types in generated code
- Union types correct for variants
- Ref forwarding typed correctly

---

### Task 7: Storybook Story Generation
**Acceptance Criteria**:
- [ ] Generate Storybook stories for component
- [ ] Create stories for all variants
- [ ] Include interactive controls for props
- [ ] Add documentation in MDX format
- [ ] Generate example code snippets
- [ ] Include accessibility testing addon config
- [ ] Add story for each state (default, hover, disabled, loading)
- [ ] Use Storybook 8 format (CSF 3.0)
- [ ] Generate play functions for interaction testing

**Files**:
- `backend/src/generation/storybook_generator.py`

**Storybook Generation**:
```python
class StorybookGenerator:
    def generate_stories(self, component_name: str,
                        requirements: dict, tokens: dict) -> str:
        """Generate Storybook stories file."""
        stories = f"""import type {{ Meta, StoryObj }} from '@storybook/react';
import {{ {component_name} }} from './{component_name}';

const meta: Meta<typeof {component_name}> = {{
  title: 'Components/{component_name}',
  component: {component_name},
  tags: ['autodocs'],
  argTypes: {{
{self._generate_arg_types(requirements)}
  }},
}};

export default meta;
type Story = StoryObj<typeof {component_name}>;

{self._generate_variant_stories(component_name, requirements)}
"""
        return stories

    def _generate_arg_types(self, requirements: dict) -> str:
        """Generate argTypes for controls."""
        arg_types = []
        for prop in requirements.get("props", []):
            if prop.get("values"):
                # Enum control
                arg_types.append(f"""    {prop['name']}: {{
      control: 'select',
      options: {prop['values']},
    }}""")
            elif prop.get("type") == "boolean":
                arg_types.append(f"""    {prop['name']}: {{
      control: 'boolean',
    }}""")
        return ",\n".join(arg_types)

    def _generate_variant_stories(self, component_name: str,
                                  requirements: dict) -> str:
        """Generate story for each variant."""
        stories = []

        # Default story
        stories.append(f"""export const Default: Story = {{
  args: {{
    children: 'Button',
  }},
}};""")

        # Variant stories
        variants = next((p["values"] for p in requirements.get("props", [])
                        if p["name"] == "variant"), [])
        for variant in variants:
            story_name = variant.capitalize()
            stories.append(f"""
export const {story_name}: Story = {{
  args: {{
    variant: '{variant}',
    children: '{story_name} Button',
  }},
}};""")

        return "\n".join(stories)
```

**Tests**:
- Storybook stories render correctly
- All variants have stories
- Controls work for interactive props
- Documentation renders properly

---

### Task 8: Provenance Headers & Metadata
**Acceptance Criteria**:
- [ ] Add provenance header comment to generated files:
  ```typescript
  /**
   * Generated by ComponentForge
   * Pattern: shadcn-ui-button-v1.2.0
   * Pattern ID: pattern-button-001
   * Generated: 2025-10-03T10:00:00Z
   * Tokens Hash: abc123def456
   * Requirements Hash: def789ghi012
   * DO NOT EDIT: Regenerate instead
   */
  ```
- [ ] Include generation metadata in header
- [ ] Add warning about manual edits
- [ ] Track pattern version for regeneration
- [ ] Store provenance data in PostgreSQL
- [ ] Enable version comparison for updates

**Files**:
- `backend/src/generation/provenance.py`

**Provenance Header**:
```python
import hashlib
from datetime import datetime

class ProvenanceGenerator:
    def generate_header(self, pattern: dict, tokens: dict,
                       requirements: dict) -> str:
        """Generate provenance header comment."""
        tokens_hash = self._hash_dict(tokens)
        requirements_hash = self._hash_dict(requirements)
        timestamp = datetime.utcnow().isoformat() + "Z"

        return f"""/**
 * Generated by ComponentForge
 * Pattern: {pattern['name']}-{pattern['version']}
 * Pattern ID: {pattern['id']}
 * Generated: {timestamp}
 * Tokens Hash: {tokens_hash}
 * Requirements Hash: {requirements_hash}
 * DO NOT EDIT: Regenerate with `componentforge regenerate`
 */
"""

    def _hash_dict(self, data: dict) -> str:
        """Generate hash of dictionary for change detection."""
        json_str = json.dumps(data, sort_keys=True)
        return hashlib.sha256(json_str.encode()).hexdigest()[:16]
```

**Tests**:
- Provenance header added to all files
- Hashes calculated correctly
- Metadata stored in database
- Version tracking works

---

### Task 9: Import Resolution & Dependencies
**Acceptance Criteria**:
- [ ] Resolve all import statements correctly:
  - React imports
  - shadcn/ui component imports
  - Utility imports (cn, clsx)
  - Icon imports (lucide-react)
- [ ] Generate import statements in correct order:
  1. External libraries
  2. Internal components
  3. Utilities
  4. Types
- [ ] Handle alias imports (@/ for src/)
- [ ] Add missing imports automatically
- [ ] Remove unused imports
- [ ] Validate import paths exist
- [ ] Generate package.json dependencies list

**Files**:
- `backend/src/generation/import_resolver.py`

**Import Resolution**:
```python
class ImportResolver:
    def resolve(self, ast: dict, component_type: str) -> list[str]:
        """Resolve and generate import statements."""
        imports = []

        # React imports
        react_imports = ["React"]
        if "useState" in ast or "useEffect" in ast:
            react_imports.append("{ useState }")
        imports.append(f"import {', '.join(react_imports)} from 'react';")

        # shadcn/ui imports
        if component_type == "button":
            imports.append("import { cva, type VariantProps } from 'class-variance-authority';")

        # Utility imports
        imports.append("import { cn } from '@/lib/utils';")

        # Icon imports if needed
        if self._has_icons(ast):
            imports.append("import { Loader2 } from 'lucide-react';")

        return imports

    def _has_icons(self, ast: dict) -> bool:
        """Check if component uses icons."""
        # Analyze AST for icon components
        return False
```

**Tests**:
- All imports resolved correctly
- Import order matches convention
- Unused imports removed
- Missing imports added

---

### Task 10: Code Assembly & Validation
**Acceptance Criteria**:
- [ ] Assemble final component code from:
  - Imports
  - Provenance header
  - Type definitions
  - CSS variables
  - Component implementation
- [ ] Format code with Prettier
- [ ] Validate TypeScript compilation with `tsc --noEmit`
- [ ] Run ESLint and fix auto-fixable issues
- [ ] Generate component file and Storybook stories
- [ ] Measure generation latency (p50, p95, p99)
- [ ] Target: p50 ≤60s for Button/Card
- [ ] Store generated files to S3
- [ ] Store metadata to PostgreSQL
- [ ] Return generation result with timing and cost

**Files**:
- `backend/src/generation/code_assembler.py`
- `backend/src/generation/generator_service.py`

**Code Assembly**:
```python
class CodeAssembler:
    async def assemble(self, parts: dict) -> dict:
        """Assemble final component code."""
        # Build component file
        component_code = "\n\n".join([
            parts["provenance_header"],
            "\n".join(parts["imports"]),
            parts["css_variables"],
            parts["type_definitions"],
            parts["component_code"]
        ])

        # Format with Prettier
        formatted = await self._format_code(component_code)

        # Build stories file
        stories_code = parts["storybook_stories"]
        formatted_stories = await self._format_code(stories_code)

        return {
            "component": formatted,
            "stories": formatted_stories,
            "files": {
                f"{parts['component_name']}.tsx": formatted,
                f"{parts['component_name']}.stories.tsx": formatted_stories
            }
        }

    async def _format_code(self, code: str) -> str:
        """Format code with Prettier."""
        result = await asyncio.create_subprocess_exec(
            'npx', 'prettier', '--parser', 'typescript',
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await result.communicate(code.encode())
        if result.returncode != 0:
            raise ValueError(f"Prettier failed: {stderr.decode()}")
        return stdout.decode()
```

**Tests**:
- Component assembles correctly
- Prettier formatting succeeds
- TypeScript compilation passes
- ESLint validation passes
- Latency within targets

---

## Dependencies

**Requires**:
- Epic 1: Design tokens for injection
- Epic 2: Requirements for implementation
- Epic 3: Retrieved patterns for adaptation

**Blocks**:
- Epic 5: Quality validation needs generated code

---

## Technical Architecture

### Code Generation Flow

```
Retrieved Pattern + Tokens + Requirements
              ↓
         AST Parsing
              ↓
         Token Injection
              ↓
      Tailwind Generation
              ↓
    Requirements Implementation
              ↓
       A11y Enhancement
              ↓
      Type Generation
              ↓
    Storybook Generation
              ↓
    Provenance Header
              ↓
     Import Resolution
              ↓
      Code Assembly
              ↓
   Format + Validate
              ↓
   Store to S3 + PostgreSQL
```

---

## Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Latency (p50)** | ≤60s | LangSmith traces for Button/Card |
| **Latency (p95)** | ≤90s | 95th percentile generation time |
| **TypeScript Compilation** | 100% | All generated components compile |
| **Token Injection Accuracy** | ≥95% | Correct token values in code |
| **Requirements Implementation** | 100% | All approved requirements present |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Generation too slow (>60s) | High | Optimize AST operations, cache patterns |
| TypeScript compilation errors | High | Better AST manipulation, validation step |
| Incorrect token injection | Medium | Comprehensive tests, manual review |
| Import resolution failures | Medium | Fallback to common imports, validation |
| Storybook stories broken | Low | Test story rendering, simpler stories |

---

## Definition of Done

- [ ] All 10 tasks completed with acceptance criteria met
- [ ] Generate Button and Card components successfully
- [ ] TypeScript strict compilation passes
- [ ] Tokens injected correctly (≥95% accuracy)
- [ ] All approved requirements implemented
- [ ] ARIA attributes added appropriately
- [ ] Storybook stories render correctly
- [ ] Provenance headers present
- [ ] Imports resolved correctly
- [ ] p50 latency ≤60s for Button/Card
- [ ] Integration tests with Epic 5 passing
- [ ] Documentation updated

---

## Related Epics

- **Depends On**: Epic 1, Epic 2, Epic 3
- **Blocks**: Epic 5
- **Related**: Epic 8 (regeneration uses same pipeline)
- **Superseded By**: Epic 4.5 (LLM-First Refactor)

---

## Notes

**Critical Path**: This is the core value delivery epic. Quality here determines product success.

**Performance**: 60s target is aggressive. Monitor carefully and optimize AST operations first.

**Type Safety**: Zero tolerance for `any` types. This is a quality differentiator.

---

## Migration to Epic 4.5

**Date Completed**: Epic 4 (Original implementation)
**Date Refactored**: Epic 4.5 (LLM-First pipeline)

### What Changed

**Old Pipeline (8 stages)**:
1. Pattern Parser → Extract structure
2. Token Injector → Inject design tokens
3. Tailwind Generator → Generate CSS classes
4. Requirement Implementer → Add props, events, states
5. A11y Enhancer → Add ARIA attributes
6. Type Generator → Generate TypeScript types
7. Storybook Generator → Generate stories
8. Code Assembler → Combine & format code

**New Pipeline (3 stages)**:
1. **LLM Generation** - Single-pass GPT-4 generation with full context
2. **Validation** - TypeScript/ESLint with automatic LLM fixes
3. **Post-Processing** - Import resolution, provenance, formatting

### Migration Path

No code changes required for API consumers - the API remains backward compatible.

Backend changes:
- Removed 6 modules: `token_injector.py`, `tailwind_generator.py`, `requirement_implementer.py`, `a11y_enhancer.py`, `type_generator.py`, `storybook_generator.py`
- Added 4 modules: `llm_generator.py`, `code_validator.py`, `prompt_builder.py`, `exemplar_loader.py`
- Refactored `generator_service.py` to use 3-stage pipeline
- Added comprehensive LangSmith tracing

### Results

- **Performance**: 3x faster (60s → 20s p50)
- **Quality**: Higher first-time valid rate (60% → 85%)
- **Automation**: LLM-driven fix loops (manual → automatic)
- **Observability**: Full LangSmith tracing
- **Maintainability**: Fewer modules, clearer pipeline

**See**: 
- `.claude/epics/04.5-llm-first-generation-refactor.md` - Epic 4.5 details
- `backend/src/generation/README.md` - Updated architecture
- `backend/src/generation/PROMPTING_GUIDE.md` - Prompt engineering
- `backend/src/generation/TROUBLESHOOTING.md` - Common issues
