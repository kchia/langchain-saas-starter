# Code Generation

Production-ready React/TypeScript component generation using LLM-first architecture with validation and quality scoring.

## Overview

The Code Generation system (Epic 4) transforms shadcn/ui patterns into customized, production-ready React components based on design tokens and requirements. It uses a modern **LLM-first 3-stage pipeline** that generates complete components in a single pass, then validates and refines them.

**Key Features:**
- 🤖 **LLM-First Generation** - GPT-4 generates complete components with full context
- ✅ **Automatic Validation** - TypeScript + ESLint validation with LLM-based fixes
- 📊 **Quality Scoring** - Comprehensive quality metrics (0-100 scale)
- ⚡ **Fast Performance** - p50 <60s, p95 <90s target
- 📦 **Complete Output** - Component, Stories, Showcase, and App template
- 🔍 **Full Observability** - LangSmith tracing for debugging

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               Code Generation Pipeline (Epic 4)             │
└─────────────────────────────────────────────────────────────┘

Pattern + Tokens + Requirements (Epic 3 output)
       ↓
┌──────────────────────────────────────────────────────┐
│ Stage 1: LLM Generation (~20-40s)                    │
├──────────────────────────────────────────────────────┤
│  ┌────────────────┐    ┌──────────────────┐        │
│  │ PromptBuilder  │ →  │  LLM Generator   │        │
│  │                │    │  (GPT-4)         │        │
│  │ - Pattern ref  │    │                  │        │
│  │ - Tokens       │    │  Structured      │        │
│  │ - Requirements │    │  JSON Output     │        │
│  │ - Examples     │    │                  │        │
│  └────────────────┘    └─────────┬────────┘        │
│                                  ↓                  │
│                    Component.tsx + Stories.tsx      │
│                    + Showcase.tsx                   │
└──────────────────────────────────┼──────────────────┘
                                   ↓
┌──────────────────────────────────────────────────────┐
│ Stage 2: Validation (~10-20s)                        │
├──────────────────────────────────────────────────────┤
│  ┌─────────────────┐   ┌──────────────────┐        │
│  │   TypeScript    │   │     ESLint       │        │
│  │  Validation     │   │   Validation     │        │
│  │                 │   │                  │        │
│  │  tsc --noEmit   │   │  eslint --format │        │
│  └────────┬────────┘   └────────┬─────────┘        │
│           │                     │                  │
│           └──────────┬──────────┘                  │
│                      ↓                             │
│           ┌──────────────────────┐                 │
│           │  CodeValidator       │                 │
│           │  - Parse errors      │                 │
│           │  - Quality scoring   │                 │
│           │  - LLM fix loop      │                 │
│           │    (if max_retries>0)│                 │
│           └──────────┬───────────┘                 │
│                      ↓                             │
│           Validated code + Quality scores          │
└──────────────────────────────────┼─────────────────┘
                                   ↓
┌──────────────────────────────────────────────────────┐
│ Stage 3: Post-Processing (<5s)                      │
├──────────────────────────────────────────────────────┤
│  ┌──────────────────┐   ┌──────────────────┐       │
│  │  Provenance      │   │  Code Assembler  │       │
│  │  Generator       │   │  - Format code   │       │
│  │  - Add metadata  │   │  - Organize files│       │
│  │  - Track origin  │   │  - Add App.tsx   │       │
│  └────────┬─────────┘   └────────┬─────────┘       │
│           └──────────┬────────────┘                 │
│                      ↓                              │
│          Final Component Package                    │
└──────────────────────────────────┼──────────────────┘
                                   ↓
          Complete Component Files Ready for Use
```

### Components

**1. GeneratorService** (`generator_service.py`)
- Orchestrates the full 3-stage pipeline
- Manages stage transitions and latency tracking
- Normalizes requirements from frontend format
- Generates App.tsx template for auto-discovery

**2. PromptBuilder** (`prompt_builder.py`)
- Constructs comprehensive system + user prompts
- Includes pattern reference code
- Embeds design tokens with semantic meaning
- Adds requirements (props, events, states, a11y)
- Enforces validation constraints (no dynamic classes, inline utilities)

**3. LLMComponentGenerator** (`llm_generator.py`)
- Uses OpenAI GPT-4 for code generation
- Structured JSON output for reliable parsing
- Automatic retries with exponential backoff
- Token usage tracking
- LangSmith tracing for observability

**4. CodeValidator** (`code_validator.py`)
- Parallel TypeScript and ESLint validation
- Quality scoring (0.0-1.0 scale, converted to 0-100)
- LLM-based error fixing (configurable retries)
- Error categorization (errors vs warnings)

**5. PatternParser** (`pattern_parser.py`)
- Loads shadcn/ui patterns from JSON
- Extracts component metadata
- Lists available patterns

**6. CodeAssembler** (`code_assembler.py`)
- Formats and organizes generated code
- Creates file structure
- Ensures consistent code style

**7. ProvenanceGenerator** (`provenance.py`)
- Adds generation metadata headers
- Tracks pattern source, tokens, requirements
- Enables traceability

## How It Works

### Step 1: LLM Generation

**Input:**
```python
{
  "pattern_id": "shadcn-button",
  "component_name": "PrimaryButton",
  "tokens": {
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#6B7280"
    },
    "spacing": {
      "sm": "0.5rem",
      "md": "1rem"
    }
  },
  "requirements": [
    {"name": "variant", "category": "props"},
    {"name": "size", "category": "props"},
    {"name": "aria-label", "category": "accessibility"}
  ]
}
```

**Process:**
1. PatternParser loads shadcn-button.json as reference
2. PromptBuilder creates comprehensive prompt:
   - System prompt: Role, constraints, best practices
   - User prompt: Pattern reference, tokens, requirements, examples
3. LLMComponentGenerator calls OpenAI GPT-4:
   - Model: `gpt-4o`
   - Temperature: 0.7
   - Structured JSON output
4. LLM generates 3 files:
   - `PrimaryButton.tsx` - Complete component with TypeScript types
   - `PrimaryButton.stories.tsx` - Storybook stories
   - `PrimaryButton.showcase.tsx` - Live preview with variants

**Output:**
```typescript
// PrimaryButton.tsx
// Generated with ComponentForge
// Pattern: shadcn-button | Tokens: {...} | Requirements: [...]

// Inline utility for merging classes
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(' ');

interface PrimaryButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  'aria-label'?: string;
}

export const PrimaryButton = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  'aria-label': ariaLabel,
}: PrimaryButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "primary" && "bg-[#3B82F6] text-white hover:bg-[#2563EB]",
        variant === "secondary" && "bg-[#6B7280] text-white hover:bg-[#4B5563]",
        variant === "outline" && "border border-gray-300 hover:bg-gray-50",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-base",
        size === "lg" && "px-6 py-3 text-lg",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
};
```

### Step 2: Validation

**TypeScript Validation** (Parallel):
```bash
# Run TypeScript compiler in check mode
node validate_typescript.js --code="..." --format=json
```

**ESLint Validation** (Parallel):
```bash
# Run ESLint with React/TypeScript config
node validate_eslint.js --code="..." --format=json
```

**Validation Results:**
```json
{
  "typescript": {
    "valid": false,
    "errorCount": 2,
    "warningCount": 1,
    "errors": [
      {"line": 15, "column": 3, "message": "Type 'string' is not assignable to type 'never'", "code": 2322}
    ],
    "warnings": [
      {"line": 20, "column": 5, "message": "Prefer interface over type", "code": 2304}
    ]
  },
  "eslint": {
    "valid": true,
    "errorCount": 0,
    "warningCount": 0
  }
}
```

**Quality Scoring:**
```python
# TypeScript quality score
ts_score = 1.0 - (error_count * 0.25) - (warning_count * 0.05)
ts_score = max(0.0, min(1.0, ts_score))

# ESLint quality score
eslint_score = 1.0 - (error_count * 0.25) - (warning_count * 0.05)
eslint_score = max(0.0, min(1.0, eslint_score))

# Overall quality score (average)
overall_score = (ts_score + eslint_score) / 2

# Convert to 0-100 scale for API response
final_score = int(overall_score * 100)
```

**LLM Fix Loop** (if `max_retries > 0`):
1. Parse validation errors
2. Build fix prompt with error context
3. LLM generates corrected code
4. Validate again
5. Repeat up to `max_retries` times

**Note**: By default, `max_retries=0` for faster generation (~35s vs ~97s with retries). Validation still runs once to provide quality scores.

### Step 3: Post-Processing

**Provenance Header:**
```typescript
/**
 * Generated by ComponentForge
 *
 * Pattern: shadcn-button (v1.0.0)
 * Generated: 2025-01-09T10:30:45Z
 *
 * Design Tokens Applied:
 * - colors.primary: #3B82F6
 * - colors.secondary: #6B7280
 * - spacing.md: 1rem
 *
 * Requirements Implemented:
 * - Props: variant, size, disabled
 * - Accessibility: aria-label support
 */
```

**App.tsx Template:**
- Auto-discovers all `.showcase.tsx` files
- Provides tabbed interface for viewing components
- Enables live preview in browser

**Final File Structure:**
```
PrimaryButton.tsx         # Component with provenance
PrimaryButton.stories.tsx # Storybook stories
PrimaryButton.showcase.tsx # Live preview
App.tsx                   # Auto-discovery template
```

## API Endpoints

### POST /api/v1/generation/generate

Generate production-ready component code.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/generation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "pattern_id": "shadcn-button",
    "component_name": "PrimaryButton",
    "tokens": {
      "colors": {
        "primary": "#3B82F6",
        "secondary": "#6B7280"
      },
      "spacing": {
        "md": "1rem"
      }
    },
    "requirements": [
      {"name": "variant", "category": "props", "approved": true},
      {"name": "size", "category": "props", "approved": true},
      {"name": "aria-label", "category": "accessibility", "approved": true}
    ]
  }'
```

**Response:**
```json
{
  "code": {
    "component": "...", // Full component code
    "stories": "...",   // Storybook stories
    "showcase": "...",  // Live preview component
    "app": "..."        // App.tsx template
  },
  "metadata": {
    "pattern_used": "shadcn-button",
    "pattern_version": "1.0.0",
    "tokens_applied": 3,
    "requirements_implemented": 3,
    "lines_of_code": 120,
    "imports_count": 5,
    "has_typescript_errors": false,
    "has_accessibility_warnings": false
  },
  "timing": {
    "total_ms": 35420,
    "llm_generation_ms": 28000,
    "validation_ms": 6500,
    "post_processing_ms": 920,
    "stage_breakdown": {
      "llm_generating": 28000,
      "validating": 6500,
      "post_processing": 920
    }
  },
  "validation_results": {
    "attempts": 1,
    "final_status": "passed",
    "typescript_passed": true,
    "typescript_errors": [],
    "typescript_warnings": [],
    "eslint_passed": true,
    "eslint_errors": [],
    "eslint_warnings": [],
    "linting_score": 100,
    "type_safety_score": 100,
    "overall_score": 100,
    "compilation_success": true,
    "lint_success": true
  },
  "provenance": {
    "generated_at": "2025-01-09T10:30:45Z",
    "generator_version": "1.0.0",
    "model_used": "gpt-4o"
  },
  "success": true
}
```

### GET /api/v1/generation/patterns

List available patterns for generation.

**Request:**
```bash
curl http://localhost:8000/api/v1/generation/patterns
```

**Response:**
```json
{
  "patterns": [
    {
      "id": "shadcn-button",
      "name": "Button",
      "type": "button",
      "variants": ["default", "primary", "secondary", "ghost", "destructive"],
      "dependencies": ["@radix-ui/react-slot"]
    },
    {
      "id": "shadcn-card",
      "name": "Card",
      "type": "card",
      "variants": ["default", "elevated", "outlined"],
      "dependencies": []
    }
  ]
}
```

## Quality Scoring

### Score Calculation

Quality scores are calculated for each validation dimension:

**TypeScript Quality Score:**
```python
ts_score = 1.0
ts_score -= (error_count * ERROR_PENALTY)     # 0.25 per error
ts_score -= (warning_count * WARNING_PENALTY) # 0.05 per warning
ts_score = max(0.0, min(1.0, ts_score))
```

**ESLint Quality Score:**
```python
eslint_score = 1.0
eslint_score -= (error_count * ERROR_PENALTY)     # 0.25 per error
eslint_score -= (warning_count * WARNING_PENALTY) # 0.05 per warning
eslint_score = max(0.0, min(1.0, eslint_score))
```

**Overall Quality Score:**
```python
overall_score = (ts_score + eslint_score) / 2
# Converted to 0-100 scale for API response
final_score = int(overall_score * 100)
```

### Score Ranges

| Range | Interpretation | Action |
|-------|---------------|---------|
| 95-100 | **Excellent** | Production-ready |
| 85-94 | **Good** | Minor issues, safe to use |
| 70-84 | **Fair** | Review warnings, consider fixes |
| 50-69 | **Poor** | Significant issues, needs fixes |
| 0-49 | **Critical** | Major errors, not usable |

### Validation Statuses

- **passed**: All validations succeeded (0 errors)
- **failed**: Validation errors exist after max retries
- **skipped**: Validation was skipped (should not happen)

## Usage Examples

### Python Backend

```python
from generation.generator_service import GeneratorService

# Initialize service
service = GeneratorService(use_llm=True)

# Prepare request
request = GenerationRequest(
    pattern_id="shadcn-button",
    component_name="PrimaryButton",
    tokens={
        "colors": {"primary": "#3B82F6"},
        "spacing": {"md": "1rem"}
    },
    requirements=[
        {"name": "variant", "category": "props"},
        {"name": "size", "category": "props"}
    ]
)

# Generate component
result = await service.generate(request)

# Check result
if result.success:
    print(f"Generated {result.metadata.lines_of_code} lines")
    print(f"Quality score: {result.metadata.quality_score}/100")
    print(f"Latency: {result.metadata.latency_ms}ms")

    # Access generated code
    component_code = result.component_code
    stories_code = result.stories_code
    showcase_code = result.files["showcase"]
else:
    print(f"Generation failed: {result.error}")
```

### TypeScript Frontend

```typescript
import { GenerationRequest, GenerationResponse } from '@/types/generation';

async function generateComponent(
  patternId: string,
  tokens: Record<string, any>,
  requirements: Array<any>
): Promise<GenerationResponse> {
  const response = await fetch('/api/v1/generation/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pattern_id: patternId,
      component_name: 'GeneratedComponent',
      tokens,
      requirements
    })
  });

  const data = await response.json();
  return data;
}

// Usage
const result = await generateComponent(
  'shadcn-button',
  { colors: { primary: '#3B82F6' } },
  [{ name: 'variant', category: 'props' }]
);

console.log('Component code:', result.code.component);
console.log('Quality score:', result.validation_results.overall_score);
console.log('Total time:', result.timing.total_ms, 'ms');
```

## Performance

### Latency Targets

- **Target**: p50 <60s, p95 <90s
- **Typical with retries disabled**: 30-40s
- **Typical with retries enabled**: 80-100s
- **Breakdown**:
  - LLM Generation: 20-40s (depends on OpenAI API)
  - Validation: 5-15s (parallel TypeScript + ESLint)
  - Post-Processing: <5s

### Optimization Tips

1. **Disable Validation Retries**
   - Set `max_retries=0` in CodeValidator
   - Reduces latency from ~97s to ~35s
   - Still provides quality scores and error details
   - Recommended for production (faster user experience)

2. **Use Faster Models**
   - GPT-4 Turbo is faster than GPT-4
   - Trade-off: slightly lower quality
   - Configure via `model` parameter

3. **Cache Patterns**
   - PatternParser loads from disk
   - Consider caching in Redis for high traffic
   - Reduces disk I/O overhead

4. **Parallel Validation**
   - TypeScript and ESLint run in parallel
   - Already optimized in CodeValidator
   - No further optimization needed

5. **Monitor OpenAI API**
   - Majority of time spent in LLM generation
   - Use LangSmith to track API latency
   - Consider dedicated API key for lower rate limits

### Monitoring

Track these metrics with LangSmith:

```python
# Generation metrics
- generation_total_latency_ms: p50, p95, p99
- generation_llm_latency_ms: LLM generation time
- generation_validation_latency_ms: Validation time
- generation_success_rate: % of successful generations

# Quality metrics
- generation_quality_score: Overall quality score
- generation_typescript_score: TypeScript quality
- generation_eslint_score: ESLint quality
- validation_attempts: Average validation attempts

# Token usage
- llm_prompt_tokens: Tokens in prompt
- llm_completion_tokens: Tokens in completion
- llm_total_cost_usd: Estimated cost per generation
```

## Integration with Other Epics

**Input from Epic 3:**
- Selected pattern with metadata
- Pattern match confidence score
- Match highlights (props, variants, a11y)

**Input from Epic 2:**
- Extracted requirements
- Component classification
- Requirement proposals

**Input from Epic 1:**
- Design tokens (colors, typography, spacing, borders)
- Token confidence scores

**Output to Epic 5:**
- Generated component code
- Validation results
- Quality scores
- Files for accessibility testing

**Epic 3 → Epic 4 → Epic 5 Data Flow:**
```json
{
  "pattern": {
    "id": "shadcn-button",
    "confidence": 0.92
  },
  "requirements": [
    {"name": "variant", "category": "props"}
  ],
  "tokens": {
    "colors": {"primary": "#3B82F6"}
  },
  "generated_code": {
    "component": "...",
    "stories": "..."
  },
  "validation": {
    "typescript_passed": true,
    "eslint_passed": true,
    "quality_score": 95
  }
}
```

## Troubleshooting

### Generation Fails with OpenAI Error

**Problem**: `OpenAI API error: Rate limit exceeded`

**Solutions**:
1. Check OpenAI API key is valid: `echo $OPENAI_API_KEY`
2. Verify API key has sufficient quota
3. Implement exponential backoff (already built-in)
4. Use dedicated API key for ComponentForge

### Validation Always Fails

**Problem**: TypeScript or ESLint errors persist after retries

**Solutions**:
1. Check validation scripts exist:
   ```bash
   ls backend/scripts/validate_typescript.js
   ls backend/scripts/validate_eslint.js
   ```
2. Verify Node.js is installed and accessible
3. Check LLM is able to fix errors (inspect LangSmith traces)
4. Increase `max_retries` if needed
5. Review error messages in validation results

### Low Quality Scores

**Problem**: Quality scores consistently <70

**Solutions**:
1. Review prompt engineering in PromptBuilder
2. Check if pattern reference is high quality
3. Verify design tokens are well-formed
4. Inspect generated code for common issues
5. Use LangSmith to debug LLM output

### Slow Generation

**Problem**: Generation takes >90s

**Solutions**:
1. Disable validation retries: `max_retries=0`
2. Check OpenAI API latency in LangSmith
3. Verify network connectivity to OpenAI
4. Consider using GPT-4 Turbo for speed
5. Monitor database/disk I/O for bottlenecks

## See Also

- [Pattern Retrieval](./pattern-retrieval.md) - Provides patterns for generation
- [Quality Validation](./quality-validation.md) - Extended validation and accessibility testing
- [Token Extraction](./token-extraction.md) - Provides design tokens
- [Observability](./observability.md) - LangSmith tracing and monitoring
- [Backend Generation Module](../../backend/src/generation/) - Implementation details
