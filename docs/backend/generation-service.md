# Code Generation Module

## Overview

The code generation module transforms retrieved shadcn/ui patterns into production-ready React/TypeScript components using an **LLM-first 3-stage pipeline** with comprehensive validation and observability.

**Epic 4.5 Refactor**: Previously used an 8-stage template-based approach. Now uses LLM-first generation with structured output parsing and iterative validation.

## Architecture

### LLM-First 3-Stage Pipeline

```
Generation Pipeline Flow:
┌─────────────┐
│   Pattern   │ (from Epic 3: Pattern Retrieval)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Tokens     │ (from Epic 1: Design Token Extraction)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Requirements │ (from Epic 2: Requirement Proposal)
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│        LLM-First Code Generation Pipeline            │
│                                                       │
│  STAGE 1: LLM Generation                             │
│  ├─ Load pattern as reference                        │
│  ├─ Build comprehensive prompt with exemplars        │
│  ├─ Call LLM (GPT-4) for single-pass generation      │
│  └─ Parse structured output                          │
│                                                       │
│  STAGE 2: Validation & Iterative Fixes               │
│  ├─ TypeScript validation (tsc)                      │
│  ├─ ESLint validation                                │
│  ├─ If invalid: LLM fix loop (max 2 retries)         │
│  └─ Quality scoring                                  │
│                                                       │
│  STAGE 3: Post-Processing                            │
│  ├─ Import resolution & ordering                     │
│  ├─ Provenance header injection                      │
│  ├─ Code formatting (Prettier)                       │
│  └─ File assembly                                    │
│                                                       │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
               ┌────────────────┐
               │Generated Code  │
               │  - Component   │
               │  - Stories     │
               │  - Types       │
               │  - Metadata    │
               └────────────────┘
```

### Key Improvements Over Old Pipeline

| Aspect | Old (8-stage) | New (LLM-first) |
|--------|---------------|-----------------|
| **Approach** | Template-based | LLM-based with structured output |
| **Stages** | 8 sequential steps | 3 stages (Generate → Validate → Post-process) |
| **Flexibility** | Rigid templates | Adaptive to requirements |
| **Quality** | Manual rules | LLM understanding + validation |
| **Observability** | Limited | Full LangSmith tracing |
| **Fix Loop** | Manual | Automated LLM-driven fixes |

## Modules

### Core Pipeline Components

### 1. Pattern Parser (`pattern_parser.py`)
- **Purpose**: Parse pattern JSON and extract component structure  
- **Input**: Pattern JSON from pattern library
- **Output**: `PatternStructure` with component name, props, imports, variants
- **Performance**: <100ms per pattern
- **Status**: ✅ Kept (used as reference for LLM)

### 2. LLM Generator (`llm_generator.py`) ⭐ NEW
- **Purpose**: Generate complete component code using GPT-4 with structured output
- **Input**: Comprehensive prompt with pattern, tokens, requirements, exemplars
- **Output**: Structured JSON with component code, stories, types
- **Features**: 
  - Single-pass generation with full context
  - Few-shot learning with exemplars
  - Structured output parsing (JSON mode)
  - Token usage tracking
  - Retry logic with exponential backoff
- **Performance**: ~5-15s per generation
- **Model**: GPT-4 (default), configurable

### 3. Code Validator (`code_validator.py`) ⭐ NEW
- **Purpose**: Validate generated code and drive LLM fix iterations
- **Input**: Generated component and stories code
- **Output**: Validation result with errors and quality score
- **Features**:
  - TypeScript compilation validation (tsc)
  - ESLint rule validation
  - Iterative LLM-driven fixes (max 2 retries)
  - Quality scoring (0-100)
  - Parallel validation
- **Performance**: ~2-5s per validation
- **Fix Loop**: Automatic convergence with LLM

### 4. Prompt Builder (`prompt_builder.py`) ⭐ NEW
- **Purpose**: Build comprehensive generation prompts with context
- **Input**: Pattern code, tokens, requirements, component metadata
- **Output**: System and user prompts with exemplars
- **Features**:
  - Exemplar selection based on component type
  - Token injection into prompt
  - Requirement formatting
  - Prompt versioning
  - Token counting (for optimization)
- **Performance**: <100ms per prompt build

### 5. Exemplar Loader (`exemplar_loader.py`) ⭐ NEW
- **Purpose**: Load and manage high-quality component exemplars for few-shot learning
- **Input**: Component type (button, card, input, etc.)
- **Output**: Exemplar code with pattern, requirements, output
- **Features**:
  - Type-specific exemplars
  - Quality-ranked examples
  - Caching for performance
  - Exemplar validation
- **Performance**: <50ms per load (cached)

### 6. Provenance Generator (`provenance.py`)
- **Purpose**: Generate provenance headers for traceability
- **Input**: Pattern ID, tokens, requirements
- **Output**: Header comment with metadata, timestamps, SHA-256 hashes
- **Features**: ISO 8601 timestamps, content hashing, warning messages
- **Status**: ✅ Kept (used in post-processing)

### 7. Import Resolver (`import_resolver.py`)
- **Purpose**: Resolve and order imports correctly
- **Input**: List of import statements
- **Output**: Ordered imports (external, internal, utils, types)
- **Features**: Deduplication, missing import detection, package.json generation
- **Status**: ✅ Kept (used in post-processing)

### 8. Code Assembler (`code_assembler.py`)
- **Purpose**: Assemble final component code and format with Prettier
- **Input**: All code parts (imports, CSS vars, types, component)
- **Output**: Formatted component.tsx and stories.tsx files
- **Performance**: <2s for formatting
- **Status**: ✅ Updated for LLM-first pipeline

### 9. Generator Service (`generator_service.py`)
- **Purpose**: Orchestrate the full LLM-first generation pipeline
- **Input**: `GenerationRequest` (pattern_id, tokens, requirements)
- **Output**: `GenerationResult` with generated code and metadata
- **Performance**: p50 ≤20s, p95 ≤30s (significant improvement)
- **Observability**: Full LangSmith tracing on all operations
- **Status**: ✅ Refactored for 3-stage pipeline

### Deprecated Modules (Removed in Epic 4.5)

The following modules were part of the old 8-stage template-based pipeline and have been removed:

- ❌ `token_injector.py` - Replaced by LLM understanding of tokens
- ❌ `tailwind_generator.py` - LLM generates Tailwind classes directly
- ❌ `requirement_implementer.py` - LLM implements requirements in single pass
- ❌ `a11y_enhancer.py` - LLM includes accessibility in generation
- ❌ `type_generator.py` - LLM generates TypeScript types directly
- ❌ `storybook_generator.py` - LLM generates stories in single pass

## Usage

### Basic Generation

```python
from src.generation.generator_service import GeneratorService

# Initialize service with LLM
generator = GeneratorService(use_llm=True)

# Generate component
result = await generator.generate(
    GenerationRequest(
        pattern_id="shadcn-button",
        tokens={
            "colors": {"primary": "#3B82F6"},
            "spacing": {"padding": "16px"}
        },
        requirements=[
            {"name": "variant", "category": "props", "approved": True},
            {"name": "onClick", "category": "events", "approved": True}
        ]
    )
)

# Access generated code
print(result.component_code)  # Component.tsx
print(result.stories_code)    # Component.stories.tsx
print(result.metadata.latency_ms)  # Performance metrics
print(result.validation_results.quality_score)  # Quality score (0-100)
```

### Pipeline Stages

The LLM-first generator tracks 3 main stages with LangSmith tracing:

1. **LLM_GENERATING** - Single-pass LLM generation with full context
   - Pattern loading
   - Prompt building with exemplars
   - LLM API call
   - Structured output parsing

2. **VALIDATING** - Code validation with iterative fixes
   - TypeScript validation (tsc)
   - ESLint validation
   - LLM fix loop (if needed, max 2 retries)
   - Quality scoring

3. **POST_PROCESSING** - Final assembly and formatting
   - Import resolution
   - Provenance injection
   - Code formatting
   - File assembly

### Generated Output

Each component generation produces:

1. **Component.tsx** - Main component file with:
   - Provenance header (pattern ID, timestamp, hashes)
   - Ordered imports (external, internal, utils, types)
   - TypeScript interfaces with strict types
   - Accessibility-enhanced component code
   - No `any` types
   - LLM-generated with validation

2. **Component.stories.tsx** - Storybook stories with:
   - CSF 3.0 format
   - Meta object with argTypes
   - Default story
   - Variant stories (Primary, Secondary, Ghost, etc.)
   - State stories (Disabled, Loading, Error)
   - LLM-generated with examples

3. **Metadata** - Generation metadata with:
   - Total latency (ms)
   - Stage latencies
   - Validation attempts (0 = valid first try)
   - Quality score (0-100)
   - Token usage (prompt + completion)
   - LangSmith trace URL

## Performance Targets

| Metric | Old Pipeline | New LLM-First | Status |
|--------|--------------|---------------|--------|
| Total Latency (p50) | ~60s | ≤20s | ✅ 3x faster |
| Total Latency (p95) | ~90s | ≤30s | ✅ 3x faster |
| First-Time Valid | ~60% | ≥85% | ✅ Better quality |
| Validation Fixes | Manual | 0-2 auto | ✅ Automated |
| Token Usage | N/A | ~2000-4000 | ✅ Tracked |
| Quality Score | N/A | ≥80/100 | ✅ Measured |

## Observability with LangSmith

All LLM operations are traced with LangSmith for debugging and optimization:

### Accessing Traces

```python
# Traces are automatically created with metadata
result = await generator.generate(request)

# Access trace URL from metadata (if available)
if hasattr(result.metadata, 'trace_url'):
    print(f"View trace: {result.metadata.trace_url}")
```

### Key Metrics Tracked

- **Token Usage**: Prompt tokens, completion tokens, total cost
- **Latency**: Per-stage and total latency
- **Quality**: Validation attempts, quality score, error types
- **Success Rate**: Valid first-time vs. needs fixes
- **Error Patterns**: Common validation errors, fix effectiveness

### LangSmith Dashboard

Access the LangSmith dashboard to:
- View all generation traces
- Analyze prompt effectiveness
- Debug validation failures
- Track token usage and costs
- Monitor quality trends
- A/B test prompt variations

**See**: `PROMPTING_GUIDE.md` for prompt optimization strategies

## Testing

### Unit Tests

```bash
# Run all generation tests
pytest backend/tests/generation/ -v

# Run LLM-first component tests
pytest backend/tests/generation/test_llm_generator.py -v
pytest backend/tests/generation/test_code_validator.py -v
pytest backend/tests/generation/test_prompt_builder.py -v
pytest backend/tests/generation/test_exemplar_loader.py -v

# Run kept module tests
pytest backend/tests/generation/test_pattern_parser.py -v
pytest backend/tests/generation/test_provenance.py -v
pytest backend/tests/generation/test_import_resolver.py -v
pytest backend/tests/generation/test_code_assembler.py -v
```

### Integration Tests

```bash
# Run end-to-end generation tests
pytest backend/tests/generation/test_generator_service.py -v

# Run with coverage
pytest backend/tests/generation/ --cov=src.generation --cov-report=html

# Integration tests with real LLM (requires API key)
pytest backend/tests/generation/ -v -m integration

# Integration tests with real LLM (requires API key)
pytest backend/tests/generation/ -v -m integration
```

### Test Coverage

Target test coverage for LLM-first components:
- LLM Generator: ≥95%
- Code Validator: ≥95%
- Prompt Builder: ≥95%
- Exemplar Loader: ≥90%
- Pattern Parser: 100% (kept)
- Provenance Generator: 100% (kept)
- Import Resolver: 98% (kept)
- Code Assembler: ≥90% (updated)

## Error Handling

The module uses structured error handling with automatic recovery:

```python
class GenerationError(Exception):
    """Base exception for generation errors."""
    pass

class LLMGenerationError(GenerationError):
    """Failed to generate code with LLM."""
    pass

class ValidationError(GenerationError):
    """Code validation failed."""
    pass

class CodeAssemblyError(GenerationError):
    """Failed to assemble code."""
    pass
```

### Automatic Recovery

- **LLM Errors**: Retry with exponential backoff (max 3 attempts)
- **Validation Errors**: Automatic LLM fix loop (max 2 iterations)
- **Rate Limits**: Exponential backoff with jitter
- **Timeouts**: Configurable per-stage timeouts

**See**: `TROUBLESHOOTING.md` for common issues and solutions

## Migration from Old Pipeline

If migrating from the old 8-stage pipeline:

1. **Code Changes**: No changes needed - API is backward compatible
2. **Configuration**: Set `use_llm=True` (default) to use new pipeline
3. **Environment**: Add `OPENAI_API_KEY` and `LANGSMITH_API_KEY`
4. **Testing**: Run full test suite to verify behavior
5. **Monitoring**: Set up LangSmith dashboard for observability

### Backward Compatibility

```python
# Old API still works
generator = GeneratorService()
result = await generator.generate(request)

# New API with explicit LLM flag
generator = GeneratorService(use_llm=True, api_key="sk-...")
result = await generator.generate(request)
```

## Related Documentation

- **PROMPTING_GUIDE.md** - Prompt engineering and optimization strategies
- **TROUBLESHOOTING.md** - Common issues, debugging, and solutions
- **.claude/epics/04-code-generation.md** - Original Epic 4 (completed)
- **.claude/epics/04.5-llm-first-generation-refactor.md** - Epic 4.5 refactor details

## API Endpoint

The generation module is exposed via REST API:

```bash
# Generate component
POST /api/v1/generation/generate
{
  "pattern_id": "shadcn-button",
  "tokens": {...},
  "requirements": [...]
}

# Response
{
  "component_code": "...",
  "stories_code": "...",
  "files": {
    "Button.tsx": "...",
    "Button.stories.tsx": "..."
  },
  "metadata": {
    "latency_ms": 18000,
    "validation_attempts": 0,
    "quality_score": 92
  },
  "validation_results": {
    "valid": true,
    "quality_score": 92,
    "errors": []
  }
}
```

## Dependencies

- **Python**: 3.11+
- **FastAPI**: Web framework
- **Pydantic**: Data validation
- **LangChain**: LLM integration
- **LangSmith**: AI observability and tracing
- **OpenAI**: GPT-4 for code generation
- **Node.js**: For TypeScript/ESLint validation and Prettier formatting

## Configuration

Environment variables:
- `OPENAI_API_KEY`: Required for LLM generation
- `LANGSMITH_API_KEY`: Optional for tracing (recommended)
- `LANGSMITH_PROJECT`: Project name for traces (default: "component-forge")

```bash
# LangSmith (for tracing)
LANGSMITH_API_KEY=your_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=component-forge

# OpenAI (if using AI enhancement in future)
OPENAI_API_KEY=your_key
```

## Future Enhancements

- [ ] AI-powered code optimization (Epic 8)
- [ ] TypeScript compilation validation (Epic 5)
- [ ] ESLint auto-fixing (Epic 5)
- [ ] Component preview generation
- [ ] Multi-framework support (Vue, Angular)

## Polish Stream Features (Epic 4 - Complete)

The Polish Stream adds production-quality enhancements:

### ✅ Provenance Tracking (P1)
- Pattern ID and version tracking
- ISO 8601 UTC timestamps
- SHA-256 content hashes for tokens and requirements
- Warning about manual edits
- Metadata for future regeneration (Epic 8)

### ✅ Import Resolution (P2)
- Automatic import ordering (external → internal → utils → types)
- Deduplication of identical imports
- Missing import detection and addition
- Package.json dependency generation
- Alias handling (@/ for src/)

### ✅ Accessibility Enhancement (P3)
- Component-specific ARIA attributes
- Semantic HTML elements
- Keyboard navigation support
- Focus indicators
- Screen reader support
- Supports: Button, Input, Card, Checkbox, Radio, Select, Switch, Tabs, Alert, Badge

### ✅ TypeScript Type Generation (P4)
- Strict TypeScript interfaces
- Zero `any` types
- Return type annotations
- Ref forwarding types
- JSDoc comments
- Variant union types
- Utility type usage (Omit, Pick, Partial, etc.)

### ✅ Storybook Story Generation (P5)
- CSF 3.0 format
- Meta object with component info
- ArgTypes for interactive controls
- Default story
- Variant stories for all component variants
- State stories (Disabled, Loading, Error)
- Play functions for interaction testing (buttons)
- Documentation parameters

### Example Generated Component

```typescript
/**
 * Generated by ComponentForge
 * Version: 1.0.0
 * Pattern: shadcn-button
 * Generated: 2024-01-15T10:30:00.000Z
 * Tokens Hash: a1b2c3d4e5f6
 * Requirements Hash: f6e5d4c3b2a1
 *
 * WARNING: This file was automatically generated.
 * Manual edits may be lost when regenerating.
 * Use ComponentForge to make changes instead.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

interface ButtonProps {
  /** Visual variant of the button */
  variant?: "default" | "primary" | "secondary" | "ghost";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Whether the button is disabled */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", disabled, className, children, ...props }, ref): React.ReactElement => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
```

## References

- [Epic 4 Specification](../../.claude/epics/04-code-generation.md)
- [Epic 4 Commit Strategy](../../.claude/epics/04-commit-strategy.md)
- [Pattern Library](/backend/data/patterns/)
- [LangSmith Documentation](https://docs.smith.langchain.com/)
