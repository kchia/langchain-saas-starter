# LLM Prompting Guide

## Overview

This guide covers prompt engineering strategies for the LLM-first code generation pipeline. It includes system prompt templates, user prompt structure, exemplar selection, and optimization techniques.

## System Prompt Template

The system prompt sets the context and expectations for the LLM:

```text
You are an expert React/TypeScript component developer specializing in shadcn/ui components.

Your task is to generate production-ready React components with:
- **TypeScript**: Strict typing, no `any` types
- **Accessibility**: WCAG 2.1 AA compliance with proper ARIA attributes
- **Styling**: Tailwind CSS with design token CSS variables
- **Quality**: Clean, maintainable, well-documented code
- **Testing**: Storybook stories in CSF 3.0 format

Always:
1. Use semantic HTML elements
2. Include proper TypeScript interfaces
3. Apply design tokens via CSS variables
4. Add accessibility features (ARIA, keyboard support)
5. Generate comprehensive Storybook stories
6. Follow React best practices

Output Format: JSON with keys 'component_code' and 'stories_code'
```

### Key Elements

- **Role**: Expert developer with specific domain
- **Task**: Clear, actionable objective
- **Requirements**: Bullet list of must-haves
- **Always Rules**: Explicit do's and don'ts
- **Output Format**: Structured JSON format

## User Prompt Structure

The user prompt provides the specific generation context:

### Template

```text
Generate a React component based on:

**Pattern Reference**:
{pattern_code}

**Component Name**: {component_name}
**Component Type**: {component_type}

**Design Tokens**:
{tokens_json}

**Requirements**:
{requirements_json}

**Examples** (for reference):
{exemplar_code}

Generate complete component code and Storybook stories following the pattern structure.
Use the design tokens as CSS variables.
Implement all requirements as specified.
```

### Variable Breakdown

1. **Pattern Reference**: The shadcn/ui base pattern code (for structure)
2. **Component Name**: Custom name (e.g., "PrimaryButton")
3. **Component Type**: Type category (e.g., "button", "card")
4. **Design Tokens**: JSON with colors, spacing, typography, etc.
5. **Requirements**: JSON with props, events, states, accessibility needs
6. **Exemplar Code**: High-quality example for few-shot learning

## Exemplar Format

Exemplars provide concrete examples for the LLM to learn from:

### Structure

```json
{
  "component_type": "button",
  "pattern": "shadcn-button",
  "requirements": {
    "props": ["variant", "size", "disabled"],
    "events": ["onClick"],
    "accessibility": ["keyboard support", "ARIA labels"]
  },
  "output": {
    "component_code": "...",
    "stories_code": "..."
  }
}
```

### Best Practices

1. **Quality First**: Only include high-quality, validated examples
2. **Diversity**: Cover different component types and complexity levels
3. **Completeness**: Include all required features (types, a11y, stories)
4. **Relevance**: Match component type to current generation task
5. **Recency**: Keep exemplars up-to-date with latest patterns

### Exemplar Selection

```python
# Load type-specific exemplar
exemplar = exemplar_loader.load_exemplar(component_type="button")

# Multiple exemplars for complex components
exemplars = [
    exemplar_loader.load_exemplar("button"),  # Base
    exemplar_loader.load_exemplar("button-with-icon"),  # Variant
]
```

## Few-Shot Learning Strategy

### Zero-Shot (Not Recommended)

❌ No examples → Inconsistent output
- Higher error rates
- More validation failures
- Unpredictable quality

### One-Shot (Recommended for Simple)

✅ One exemplar → Good for simple components
- Button, Input, Badge
- Clear, single-purpose components
- Consistent patterns

### Few-Shot (Recommended for Complex)

✅✅ 2-3 exemplars → Best for complex components
- Card, Modal, Dropdown
- Multiple variants
- Complex interactions

### Example

```python
# Simple component (one-shot)
prompt = build_prompt(
    pattern=pattern,
    tokens=tokens,
    requirements=requirements,
    exemplars=[button_exemplar]
)

# Complex component (few-shot)
prompt = build_prompt(
    pattern=pattern,
    tokens=tokens,
    requirements=requirements,
    exemplars=[
        card_exemplar,
        card_with_header_exemplar,
        card_with_footer_exemplar
    ]
)
```

## Token Optimization Tips

### 1. Minimize Pattern Code

```python
# ❌ Bad: Include full pattern with comments
pattern_code = load_full_pattern()  # ~5000 tokens

# ✅ Good: Extract essential structure only
pattern_code = extract_minimal_structure(pattern)  # ~1000 tokens
```

### 2. Compress Design Tokens

```python
# ❌ Bad: Verbose token names
tokens = {
    "primary_button_background_color": "#3B82F6",
    "primary_button_text_color": "#FFFFFF"
}

# ✅ Good: Concise structure
tokens = {
    "colors": {"primary": "#3B82F6", "text": "#FFFFFF"}
}
```

### 3. Limit Exemplar Count

```python
# ❌ Bad: Too many exemplars
exemplars = load_all_exemplars()  # 10+ examples

# ✅ Good: Relevant subset
exemplars = load_top_n_exemplars(component_type, n=2)
```

### 4. Token Budget

| Component | Max Tokens | Recommended |
|-----------|-----------|-------------|
| System Prompt | 500 | 300 |
| Pattern Reference | 2000 | 1000 |
| Design Tokens | 500 | 300 |
| Requirements | 500 | 300 |
| Exemplars | 3000 | 2000 |
| **Total Prompt** | **6500** | **3900** |

Target: **≤4000 prompt tokens** for cost efficiency

## Prompt Versioning Guide

### Version Format

```
v{major}.{minor}.{patch}

v1.0.0 - Initial LLM-first prompts
v1.1.0 - Added accessibility focus
v1.1.1 - Fixed TypeScript strict mode
```

### When to Version

- **Major**: Complete prompt restructure
- **Minor**: Add/remove requirements or exemplars
- **Patch**: Small wording or formatting changes

### Tracking Versions

```python
class PromptBuilder:
    PROMPT_VERSION = "v1.2.0"
    
    def build_prompt(self, ...):
        prompt = {
            "version": self.PROMPT_VERSION,
            "system": system_prompt,
            "user": user_prompt
        }
        return prompt
```

### A/B Testing

```python
# Test prompt variations in parallel
variants = [
    ("v1.0.0", build_prompt_v1),
    ("v1.1.0", build_prompt_v1_1),
]

# Compare quality scores
for version, builder in variants:
    result = await generate_with_prompt(builder)
    log_quality_metric(version, result.quality_score)
```

## Testing Prompts

### Unit Tests

```python
def test_prompt_includes_tokens():
    prompt = builder.build_prompt(tokens={"primary": "#000"})
    assert "#000" in prompt["user"]

def test_prompt_includes_requirements():
    prompt = builder.build_prompt(requirements={"props": ["variant"]})
    assert "variant" in prompt["user"]
```

### Integration Tests

```python
@pytest.mark.integration
async def test_prompt_generates_valid_code():
    prompt = builder.build_prompt(...)
    result = await llm_generator.generate(prompt)
    assert result.valid
    assert result.quality_score >= 80
```

### Quality Metrics

Track prompt effectiveness:

```python
metrics = {
    "first_time_valid_rate": 0.85,  # 85% valid without fixes
    "avg_quality_score": 87,         # Average quality
    "avg_token_usage": 3500,         # Token efficiency
    "avg_latency_ms": 12000,         # Generation speed
}
```

## A/B Testing Strategy

### Setup

```python
# Define variants
prompts = {
    "baseline": PromptBuilderV1(),
    "variant_a": PromptBuilderV1_1_Short(),
    "variant_b": PromptBuilderV1_1_Detailed(),
}

# Random assignment
variant = random.choice(list(prompts.keys()))
builder = prompts[variant]
```

### Metrics to Compare

1. **Quality Score**: Which produces higher quality?
2. **Token Usage**: Which is more efficient?
3. **First-Time Valid Rate**: Which needs fewer fixes?
4. **Latency**: Which is faster?
5. **Cost**: Which is cheaper to run?

### Sample Size

- Minimum: 50 generations per variant
- Recommended: 200+ for statistical significance

### Analysis

```python
from scipy import stats

# Compare quality scores
baseline_scores = [85, 87, 82, ...]
variant_scores = [88, 91, 86, ...]

# T-test for significance
t_stat, p_value = stats.ttest_ind(baseline_scores, variant_scores)

if p_value < 0.05:
    print(f"Variant is significantly better (p={p_value})")
```

## Common Issues and Solutions

### Issue 1: Low Quality Scores

**Symptoms**: Average quality score < 70

**Solutions**:
- Add more specific requirements to system prompt
- Include higher-quality exemplars
- Add explicit "avoid" rules (e.g., "never use `any` type")

### Issue 2: High Token Usage

**Symptoms**: Prompt tokens > 5000

**Solutions**:
- Compress pattern reference
- Limit exemplar count to 2-3
- Remove redundant instructions

### Issue 3: Inconsistent Output

**Symptoms**: Output format varies between runs

**Solutions**:
- Use structured output (JSON mode)
- Add explicit output format examples
- Set temperature=0 for deterministic output

### Issue 4: Accessibility Issues

**Symptoms**: Missing ARIA attributes, poor keyboard support

**Solutions**:
- Add accessibility-focused exemplars
- Explicit "always include" list in system prompt
- Add accessibility checklist to requirements

## Best Practices Summary

### ✅ Do

- Use structured JSON output format
- Include 2-3 relevant exemplars
- Set clear, explicit requirements
- Version your prompts
- A/B test prompt variations
- Monitor quality metrics
- Keep token usage ≤4000
- Use temperature=0 for consistency

### ❌ Don't

- Use zero-shot for complex components
- Include too many exemplars (>3)
- Make vague requirements
- Ignore token costs
- Skip prompt versioning
- Deploy without A/B testing
- Exceed 6000 prompt tokens
- Use temperature >0.3 for production

## Resources

- **OpenAI Prompt Engineering Guide**: https://platform.openai.com/docs/guides/prompt-engineering
- **LangChain Prompting**: https://python.langchain.com/docs/modules/prompts/
- **Few-Shot Learning**: https://arxiv.org/abs/2005.14165
- **LangSmith Prompting**: https://docs.smith.langchain.com/

## Related Documentation

- `README.md` - Module overview and architecture
- `TROUBLESHOOTING.md` - Debugging and common issues
- `.claude/epics/04.5-llm-first-generation-refactor.md` - Epic details
