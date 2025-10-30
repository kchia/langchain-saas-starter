# Troubleshooting Guide

## Overview

This guide covers common issues, debugging techniques, and solutions for the LLM-first code generation pipeline.

## Quick Diagnostic Checklist

Before diving into specific issues:

- [ ] Is `OPENAI_API_KEY` set correctly?
- [ ] Is `LANGSMITH_API_KEY` set (for tracing)?
- [ ] Is the backend service running?
- [ ] Are Node.js tools (tsc, eslint) installed?
- [ ] Can you access LangSmith traces?
- [ ] Is the pattern library accessible?

## Common Issues and Solutions

### 1. Generation Fails - OpenAI API Error

**Symptoms**:
```
Error: OpenAI API error: Invalid API key
```

**Root Causes**:
- Missing or invalid `OPENAI_API_KEY`
- API key doesn't have access to GPT-4
- Rate limit exceeded
- Network issues

**Solutions**:

```bash
# Check API key is set
echo $OPENAI_API_KEY

# Verify key format (should start with sk-)
# Valid: sk-proj-...
# Invalid: missing or corrupted

# Test API access
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Update .env file
cd backend
echo "OPENAI_API_KEY=sk-your-key-here" >> .env
source venv/bin/activate
```

**Prevention**:
- Use environment variable validation on startup
- Implement API key rotation
- Monitor rate limits with alerts

---

### 2. Validation Failures - TypeScript Errors

**Symptoms**:
```
ValidationError: tsc compilation failed
- Cannot find module 'react'
- Type 'any' is not assignable
```

**Root Causes**:
- Missing imports in generated code
- Incorrect TypeScript syntax
- LLM generated invalid types

**Solutions**:

1. **Check LangSmith Trace**:
   - View the exact code that was generated
   - Check if LLM fix attempts were made
   - Review validation error messages

2. **Verify Node.js Tools**:
```bash
# Check tsc is installed
which tsc

# Check eslint is installed
which eslint

# Install if missing
cd backend
npm install -g typescript eslint
```

3. **Review Validation Settings**:
```python
# code_validator.py
validator = CodeValidator(
    typescript_strict=True,  # May need to relax
    eslint_rules="recommended"  # Try "basic"
)
```

4. **Manual Fix**:
```python
# If auto-fix fails, get the code and fix manually
result = await generator.generate(request)
if not result.success:
    print(result.validation_results.errors)
    # Fix and retry
```

**Prevention**:
- Improve system prompt with TypeScript examples
- Add TypeScript-focused exemplars
- Lower validation strictness initially
- Increase max fix attempts from 2 to 3

---

### 3. Low Quality Scores

**Symptoms**:
```
Quality score: 65/100 (target: ≥80)
```

**Root Causes**:
- Poor LLM output quality
- Weak prompt engineering
- Missing or low-quality exemplars

**Solutions**:

1. **Analyze LangSmith Traces**:
```python
# Check what went wrong
trace_url = result.metadata.trace_url
# Look for:
# - Prompt quality
# - LLM response
# - Validation errors
# - Fix attempts
```

2. **Improve Prompts**:
```python
# Add more specific requirements
prompt_builder = PromptBuilder(
    include_accessibility=True,
    include_typescript_strict=True,
    include_storybook_examples=True
)
```

3. **Add Better Exemplars**:
```python
# Use higher quality examples
exemplar_loader.add_exemplar(
    component_type="button",
    quality_score=95,  # Only high-quality
    code="..."
)
```

4. **Adjust Quality Thresholds**:
```python
# code_validator.py
# Temporarily lower threshold while improving
MIN_QUALITY_SCORE = 70  # Down from 80
```

**Prevention**:
- Maintain high-quality exemplar library
- A/B test prompt variations
- Monitor quality trends over time
- Set up alerts for quality drops

---

### 4. Slow Generation (>30s)

**Symptoms**:
```
Latency: 45000ms (target: ≤20000ms)
```

**Root Causes**:
- Large prompt tokens (>5000)
- Multiple validation fix loops
- Slow LLM API response
- Network latency

**Solutions**:

1. **Check Token Usage**:
```python
# View token breakdown in trace
result.metadata.token_usage
# {
#   "prompt_tokens": 5000,  # Too high!
#   "completion_tokens": 2000,
#   "total_tokens": 7000
# }
```

2. **Optimize Prompt**:
```python
# Reduce prompt size
- Remove verbose pattern code
- Limit exemplars to 2 (instead of 3+)
- Compress design tokens JSON
```

3. **Reduce Validation Time**:
```bash
# Use faster validation tools
tsc --noEmit --skipLibCheck  # Skip lib checks

# Parallel validation
# Run tsc and eslint in parallel (already implemented)
```

4. **Check LLM Response Time**:
```python
# If OpenAI API is slow
# - Check status.openai.com
# - Try different region
# - Use cached responses for testing
```

**Prevention**:
- Set max_tokens limit on LLM calls
- Implement timeout with fallback
- Cache validation results
- Monitor latency trends

---

### 5. Fix Loop Not Converging

**Symptoms**:
```
Validation attempts: 3 (max retries reached)
Still invalid after fixes
```

**Root Causes**:
- LLM cannot fix the specific error
- Validation too strict
- Circular fix attempts

**Solutions**:

1. **Review Fix Attempts in LangSmith**:
```
Trace → Fix Loop
- Attempt 1: Missing import
- Attempt 2: Added import, new type error
- Attempt 3: Fixed type, broke other code
```

2. **Provide Better Error Context**:
```python
# code_validator.py
def _build_fix_prompt(self, code, errors):
    return f"""
Fix these specific errors:
{errors}

Current code:
{code}

Focus only on fixing the listed errors.
Do not refactor or change working code.
"""
```

3. **Increase Max Attempts**:
```python
# code_validator.py
MAX_FIX_ATTEMPTS = 3  # Up from 2
```

4. **Fallback to Manual Fix**:
```python
if result.validation_results.attempts >= MAX_ATTEMPTS:
    logger.warning("Auto-fix failed, returning partial result")
    # Return best attempt so far
    return result
```

**Prevention**:
- Improve fix prompt clarity
- Add "before/after" fix examples
- Track common fix failure patterns
- Add validation bypass for edge cases

---

### 6. Missing Accessibility Features

**Symptoms**:
```
Generated code missing:
- ARIA labels
- Keyboard handlers
- Focus management
```

**Root Causes**:
- Accessibility not emphasized in prompt
- Missing a11y exemplars
- LLM skipping a11y features

**Solutions**:

1. **Enhance System Prompt**:
```python
SYSTEM_PROMPT = """
...
CRITICAL: Always include accessibility:
1. ARIA labels (aria-label, aria-describedby)
2. Keyboard support (onKeyDown, tabIndex)
3. Focus management (ref, focus states)
4. Screen reader text (sr-only)
...
"""
```

2. **Add A11y Exemplars**:
```python
exemplars = [
    load_exemplar("button-accessible"),  # Has all a11y features
    load_exemplar("card-accessible"),
]
```

3. **Validate Accessibility**:
```python
# Add a11y validation step
validator = CodeValidator(
    check_accessibility=True,  # Enable a11y checks
    required_aria_attributes=["aria-label", "role"]
)
```

**Prevention**:
- Make a11y mandatory in requirements
- Add a11y checklist to validation
- Include a11y in quality scoring
- Regular a11y audits

---

### 7. LangSmith Tracing Not Working

**Symptoms**:
```
Traces not appearing in LangSmith dashboard
No trace URL in metadata
```

**Root Causes**:
- `LANGSMITH_API_KEY` not set
- Incorrect project configuration
- Network issues

**Solutions**:

1. **Verify Environment Variables**:
```bash
# Check environment
echo $LANGSMITH_API_KEY
echo $LANGSMITH_PROJECT

# Set if missing
export LANGSMITH_API_KEY="lsv2_pt_..."
export LANGSMITH_PROJECT="component-forge"
```

2. **Test LangSmith Connection**:
```python
from langsmith import Client

client = Client()
try:
    client.list_runs(project_name="component-forge", limit=1)
    print("✅ LangSmith connected")
except Exception as e:
    print(f"❌ LangSmith error: {e}")
```

3. **Check Decorator Usage**:
```python
# Ensure @traceable is used
from langsmith import traceable

@traceable(run_type="chain", name="generate")
async def generate(self, request):
    # Function will be traced
    pass
```

**Prevention**:
- Validate LangSmith config on startup
- Set up environment variable checks
- Add fallback for missing tracing

---

## Debugging with LangSmith

### Accessing Traces

1. **Get Trace URL**:
```python
result = await generator.generate(request)
if hasattr(result.metadata, 'trace_url'):
    print(f"Trace: {result.metadata.trace_url}")
```

2. **Dashboard Navigation**:
```
https://smith.langchain.com/
→ Projects
→ component-forge
→ Runs
→ Filter by status/latency/error
```

### Key Metrics to Check

1. **Latency Breakdown**:
   - LLM generation time
   - Validation time
   - Fix loop iterations
   - Total time

2. **Token Usage**:
   - Prompt tokens
   - Completion tokens
   - Cost per generation

3. **Quality Indicators**:
   - Validation attempts (0 = perfect)
   - Quality score trend
   - Error types

4. **Error Patterns**:
   - Common validation errors
   - Fix success rate
   - Circular fix loops

### Debugging Workflow

```
1. Identify failing generation
   ↓
2. Open LangSmith trace
   ↓
3. Review prompt → Was it clear?
   ↓
4. Check LLM response → Valid JSON?
   ↓
5. View validation errors → Specific issues?
   ↓
6. Analyze fix attempts → Did they help?
   ↓
7. Identify root cause
   ↓
8. Implement solution
   ↓
9. Test fix
   ↓
10. Monitor for recurrence
```

---

## Log Analysis

### Enable Debug Logging

```python
import logging

# Enable debug logs
logging.basicConfig(level=logging.DEBUG)

# Module-specific logging
logger = logging.getLogger("src.generation")
logger.setLevel(logging.DEBUG)
```

### Key Log Messages

```bash
# Successful generation
INFO: Generation started for pattern: shadcn-button
INFO: LLM generated code in 12000ms
INFO: Validation passed (0 fixes needed)
INFO: Generation complete - quality: 92/100

# Validation issues
WARNING: Validation failed - TypeScript errors
INFO: Starting fix attempt 1/2
INFO: Fix applied, retrying validation
INFO: Validation passed after 1 fix

# Errors
ERROR: LLM generation failed: API timeout
ERROR: Validation failed after 2 fix attempts
ERROR: Generation aborted - max retries exceeded
```

### Log Locations

```bash
# Application logs
backend/logs/generation.log

# LangSmith traces (web UI)
https://smith.langchain.com/component-forge

# System logs
journalctl -u component-forge-backend -f
```

---

## Performance Profiling

### Measure Stage Latencies

```python
result = await generator.generate(request)

# View breakdown
print(result.metadata.stage_latencies)
# {
#   "llm_generating": 12000,  # LLM call
#   "validating": 3000,       # Validation
#   "post_processing": 2000   # Assembly
# }
```

### Identify Bottlenecks

```python
# Find slowest stage
slowest = max(
    result.metadata.stage_latencies.items(),
    key=lambda x: x[1]
)
print(f"Bottleneck: {slowest[0]} ({slowest[1]}ms)")
```

### Optimization Targets

| Stage | Current | Target | Action |
|-------|---------|--------|--------|
| LLM | 15s | 10s | Reduce tokens |
| Validation | 5s | 3s | Parallel checks |
| Fixes | 10s | 5s | Better prompts |
| Post-process | 2s | 2s | ✅ Optimal |

---

## Quality Debugging

### Low Quality Checklist

- [ ] Are exemplars high-quality (≥90)?
- [ ] Is system prompt clear and specific?
- [ ] Are requirements well-defined?
- [ ] Is component type matched to exemplar?
- [ ] Are validation rules appropriate?
- [ ] Is LLM temperature set correctly (0-0.3)?

### Quality Scoring Breakdown

```python
quality_score = (
    typescript_validity * 0.3 +
    eslint_compliance * 0.2 +
    accessibility_score * 0.2 +
    code_complexity * 0.15 +
    storybook_coverage * 0.15
)
```

### Improve Quality

1. **TypeScript**: Add strict type exemplars
2. **ESLint**: Use recommended rules
3. **A11y**: Include a11y checklist
4. **Complexity**: Keep components simple
5. **Stories**: Provide story templates

---

## Getting Help

### Resources

- **Documentation**: `README.md`, `PROMPTING_GUIDE.md`
- **Epic Details**: `.claude/epics/04.5-llm-first-generation-refactor.md`
- **LangSmith Docs**: https://docs.smith.langchain.com/
- **OpenAI Status**: https://status.openai.com/

### Support Channels

1. **Check LangSmith Traces**: Most issues visible in traces
2. **Review Logs**: Enable debug logging
3. **Consult Epic**: Task breakdown and acceptance criteria
4. **GitHub Issues**: Report bugs or request features

### Reporting Issues

Include:
- Error message and stack trace
- LangSmith trace URL
- Input request (pattern, tokens, requirements)
- Expected vs. actual output
- Environment (Python version, Node version, OS)

---

## Best Practices for Prevention

### ✅ Do

- Monitor LangSmith dashboard regularly
- Set up alerts for quality drops
- Keep exemplars up-to-date
- Version prompts and track changes
- Test with integration tests
- Profile performance regularly
- Log all errors with context

### ❌ Don't

- Ignore validation errors
- Skip LangSmith trace review
- Deploy without testing
- Use outdated exemplars
- Exceed token budgets
- Disable error logging
- Skip quality monitoring

---

## Emergency Procedures

### Service Down

```bash
# Check service status
curl http://localhost:8000/health

# Restart backend
cd backend
source venv/bin/activate
uvicorn src.main:app --reload

# Check logs
tail -f backend/logs/generation.log
```

### High Error Rate

```bash
# Switch to mock LLM (for testing)
export USE_MOCK_LLM=true

# Disable LLM generation (pattern-only)
export DISABLE_LLM=true

# Restart service
# Service will use fallback/mock mode
```

### Cost Runaway

```bash
# Set token limits
export MAX_PROMPT_TOKENS=4000
export MAX_COMPLETION_TOKENS=3000

# Monitor costs in OpenAI dashboard
open https://platform.openai.com/usage

# Implement rate limiting
# (already in place, check configuration)
```

---

This guide is a living document. Update it as you discover new issues and solutions.
