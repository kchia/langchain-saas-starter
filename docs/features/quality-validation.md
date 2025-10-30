# Quality Validation

Comprehensive quality validation system with TypeScript, ESLint, accessibility testing, and automated quality reporting.

## Overview

The Quality Validation system (Epic 5) ensures all generated components meet high standards for code quality, type safety, accessibility, and design adherence. It extends Epic 4.5's validation infrastructure with comprehensive accessibility testing and quality reporting.

**Key Features:**
- ✅ **TypeScript Compilation** - Strict mode type checking (Epic 4.5)
- 🔍 **ESLint Validation** - Code quality and style enforcement (Epic 4.5)
- ♿ **Accessibility Testing** - axe-core WCAG 2.1 AA compliance (Epic 5 Task F2)
- 📊 **Quality Scoring** - 0-100 scale with detailed breakdowns
- 📋 **Comprehensive Reports** - HTML/JSON reports with visualizations (Epic 5 Task B1)
- 🔧 **Auto-Fix Capable** - LLM-based error correction (Epic 4.5)
- ⚡ **Fast Validation** - <15s for complete validation pipeline

## Implementation Status

### ✅ Completed

**Epic 4.5 Task 2: Code Validator (Foundation)**
- TypeScript strict compilation validation
- ESLint and Prettier validation
- LLM-based auto-fix with max 2 retries
- Quality scoring (0.0-1.0 scale)
- Performance tracking and metrics

**Epic 5 Task F2: axe-core Accessibility Validator**
- Playwright-based component rendering
- axe-core v4.10 integration
- WCAG 2.1 Level AA compliance checks
- Critical/Serious violation blocking
- Multi-variant testing support

**Epic 5 Task B1: Quality Report Generator**
- Aggregates all validation results
- Status determination (PASS/FAIL)
- HTML report with visualizations
- JSON export for programmatic access
- Recommendation generation

### ⏳ Planned (Epic 5 Tasks F3-F6, I1, T1-T3)

**Task F3: Keyboard Navigation Validator** (2-3 days)
- Tab order verification
- Enter/Space activation testing
- Escape key handling
- Arrow key navigation

**Task F4: Focus Indicator Validator** (2 days)
- Focus visibility testing
- Contrast ratio verification (≥3:1)
- Focus outline rendering

**Task F5: Color Contrast Validator** (2-3 days)
- WCAG AA compliance (4.5:1 text, 3:1 UI)
- Foreground/background contrast analysis
- Interactive state contrast

**Task F6: Token Adherence Validator** (2-3 days)
- Design token usage measurement
- ≥90% adherence target
- Color, typography, spacing verification

**Task I1: Integration & Extended Auto-Fix** (3-4 days)
- Integrate all validators with pipeline
- Extend auto-fix for accessibility issues
- Unified validation API

**Tasks T1-T3: Testing** (4-7 days)
- Frontend unit tests
- Backend integration tests
- E2E validation tests

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│           Quality Validation Pipeline (Epic 5)              │
└─────────────────────────────────────────────────────────────┘

Generated Component Code (Epic 4)
       ↓
┌──────────────────────────────────────────────────────┐
│  Stage 1: Foundation Validators (✅ Epic 4.5)        │
├──────────────────────────────────────────────────────┤
│  ┌────────────────┐    ┌───────────────────┐        │
│  │  TypeScript    │    │     ESLint        │        │
│  │  Validator     │    │   Validator       │        │
│  │                │    │                   │        │
│  │  tsc --noEmit  │    │  eslint --format  │        │
│  │                │    │  json             │        │
│  └───────┬────────┘    └───────┬───────────┘        │
│          │                     │                    │
│          └──────────┬──────────┘                    │
│                     ↓                               │
│          ┌──────────────────────┐                   │
│          │  CodeValidator       │                   │
│          │  - Quality scoring   │                   │
│          │  - LLM auto-fix      │                   │
│          │  - max_retries=0     │                   │
│          └──────────┬───────────┘                   │
│                     ↓                               │
│  TypeScript + ESLint Results                        │
└──────────────────────┼───────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  Stage 2: Accessibility Validators (Epic 5)          │
├──────────────────────────────────────────────────────┤
│  ✅ Task F2: axe-core (IMPLEMENTED)                  │
│  ┌──────────────────────────────────────┐           │
│  │  A11yValidator                       │           │
│  │  - Playwright browser launch         │           │
│  │  - Component rendering               │           │
│  │  - axe-core injection & audit        │           │
│  │  - WCAG 2.1 AA compliance            │           │
│  └──────────────┬───────────────────────┘           │
│                 ↓                                    │
│  Critical/Serious violations → FAIL                 │
│  Moderate/Minor violations → WARN                   │
│                                                      │
│  ⏳ Task F3: Keyboard Navigation (PLANNED)          │
│  ⏳ Task F4: Focus Indicators (PLANNED)             │
│  ⏳ Task F5: Color Contrast (PLANNED)               │
│  ⏳ Task F6: Token Adherence (PLANNED)              │
└──────────────────────┼───────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  Stage 3: Quality Report Generation (Epic 5 Task B1)│
│  (✅ IMPLEMENTED)                                    │
├──────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐           │
│  │  QualityReportGenerator              │           │
│  │                                      │           │
│  │  Aggregates:                         │           │
│  │  ├─ TypeScript results               │           │
│  │  ├─ ESLint results                   │           │
│  │  ├─ Accessibility violations         │           │
│  │  ├─ Auto-fixes applied               │           │
│  │  └─ Future validator results         │           │
│  │                                      │           │
│  │  Generates:                          │           │
│  │  ├─ Overall status (PASS/FAIL)       │           │
│  │  ├─ Summary metrics                  │           │
│  │  ├─ Quality scores                   │           │
│  │  ├─ Recommendations                  │           │
│  │  └─ HTML/JSON reports                │           │
│  └──────────────┬───────────────────────┘           │
│                 ↓                                    │
│  Comprehensive Quality Report                       │
└──────────────────────────────────────────────────────┘
```

## How It Works

### Step 1: TypeScript Validation (Epic 4.5)

**Process**:
```bash
# Backend runs TypeScript compiler via Node.js script
node backend/scripts/validate_typescript.js \
  --code="<component_code>" \
  --format=json
```

**Output**:
```json
{
  "valid": false,
  "errorCount": 2,
  "warningCount": 1,
  "errors": [
    {
      "line": 15,
      "column": 5,
      "message": "Type 'string' is not assignable to type 'number'",
      "code": 2322,
      "severity": "error"
    }
  ],
  "warnings": [
    {
      "line": 8,
      "column": 10,
      "message": "Variable 'unused' is declared but never used",
      "code": 6133,
      "severity": "warning"
    }
  ]
}
```

**Quality Scoring**:
```python
ts_score = 1.0
ts_score -= (error_count * 0.25)     # 25% penalty per error
ts_score -= (warning_count * 0.05)   # 5% penalty per warning
ts_score = max(0.0, min(1.0, ts_score))

# Example: 2 errors, 1 warning
# ts_score = 1.0 - (2 * 0.25) - (1 * 0.05) = 0.45
```

### Step 2: ESLint Validation (Epic 4.5)

**Process**:
```bash
# Backend runs ESLint via Node.js script
node backend/scripts/validate_eslint.js \
  --code="<component_code>" \
  --format=json
```

**Output**:
```json
{
  "valid": true,
  "errorCount": 0,
  "warningCount": 3,
  "errors": [],
  "warnings": [
    {
      "line": 12,
      "column": 3,
      "message": "Unexpected console statement",
      "ruleId": "no-console",
      "severity": "warning"
    }
  ]
}
```

**Quality Scoring**:
```python
eslint_score = 1.0
eslint_score -= (error_count * 0.25)    # 25% penalty per error
eslint_score -= (warning_count * 0.05)  # 5% penalty per warning
eslint_score = max(0.0, min(1.0, eslint_score))

# Example: 0 errors, 3 warnings
# eslint_score = 1.0 - (0 * 0.25) - (3 * 0.05) = 0.85
```

### Step 3: LLM Auto-Fix (Epic 4.5)

**When Enabled** (`max_retries > 0`):

```python
async def validate_and_fix(code, max_retries=2):
    current_code = code
    for attempt in range(max_retries + 1):
        # Validate
        ts_result = await validate_typescript(current_code)
        eslint_result = await validate_eslint(current_code)

        if ts_result.valid and eslint_result.valid:
            return ValidationResult(valid=True, code=current_code)

        # If errors exist and retries remain, use LLM to fix
        if attempt < max_retries:
            fix_prompt = build_fix_prompt(
                code=current_code,
                ts_errors=ts_result.errors,
                eslint_errors=eslint_result.errors
            )
            current_code = await llm_generator.fix(fix_prompt)

    # Return final result after max retries
    return ValidationResult(valid=False, code=current_code, attempts=max_retries + 1)
```

**Performance Impact**:
- With `max_retries=0`: ~5s validation time
- With `max_retries=2`: ~15-30s validation time (includes LLM calls)

**Current Default**: `max_retries=0` for faster generation (~35s total vs ~97s with retries)

### Step 4: Accessibility Validation (Epic 5 Task F2)

**Process**:
```typescript
import { A11yValidator } from '@/services/validation/a11y-validator';

const validator = new A11yValidator();
const result = await validator.validate(
  componentCode,
  'Button',
  ['default', 'primary', 'secondary']
);
```

**Output**:
```json
{
  "valid": false,
  "errors": [
    "[CRITICAL] color-contrast: Elements must have sufficient color contrast (button.primary)"
  ],
  "warnings": [
    "[MODERATE] label: Form elements should have labels (input#email)"
  ],
  "details": {
    "violations": [
      {
        "id": "color-contrast",
        "impact": "critical",
        "description": "Ensures the contrast between foreground and background colors meets WCAG 2 AA",
        "target": ["button.primary"],
        "help": "Elements must have sufficient color contrast",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/color-contrast"
      }
    ],
    "violationsBySeverity": {
      "critical": 1,
      "serious": 0,
      "moderate": 1,
      "minor": 0
    }
  }
}
```

### Step 5: Quality Report Generation (Epic 5 Task B1)

**Process**:
```python
from validation.report_generator import QualityReportGenerator

generator = QualityReportGenerator()

# Aggregate all validation results
validation_results = {
    "typescript": {
        "valid": False,
        "errorCount": 2,
        "warningCount": 1,
        "errors": [...]
    },
    "eslint": {
        "valid": True,
        "errorCount": 0,
        "warningCount": 3,
        "warnings": [...]
    },
    "a11y": {
        "valid": False,
        "violations": [
            {"impact": "critical", "id": "color-contrast", ...}
        ]
    },
    "auto_fixes": [
        "removed_unused_import",
        "added_missing_semicolon"
    ]
}

# Generate comprehensive report
report = generator.generate(validation_results, component_name="Button")
```

**Quality Report Structure**:
```python
{
    "timestamp": "2025-01-09T10:30:45Z",
    "overall_status": "FAIL",  # "PASS" or "FAIL"
    "component_name": "Button",
    "summary": {
        "typescript": False,      # Passed TypeScript?
        "eslint": True,           # Passed ESLint?
        "accessibility": False,   # Passed A11y?
        "keyboard": None,         # Not yet implemented
        "focus": None,           # Not yet implemented
        "contrast": None,        # Not yet implemented
        "token_adherence": None, # Not yet implemented
        "total_errors": 3,       # TypeScript + ESLint + A11y critical/serious
        "total_warnings": 4      # All warnings
    },
    "details": {
        "typescript": {...},
        "eslint": {...},
        "a11y": {...}
    },
    "auto_fixes": [
        "removed_unused_import",
        "added_missing_semicolon"
    ],
    "recommendations": [
        "Fix TypeScript type errors for production readiness",
        "Fix critical color contrast violations for accessibility compliance",
        "Review ESLint warnings for code quality improvements"
    ]
}
```

### Step 6: Status Determination

**PASS/FAIL Logic**:
```python
def _determine_status(validation_results):
    # Critical checks that must pass
    typescript_passed = validation_results.get("typescript", {}).get("valid", False)
    eslint_passed = validation_results.get("eslint", {}).get("valid", False)

    # Accessibility must have 0 critical/serious violations
    a11y_passed = True
    a11y_result = validation_results.get("a11y", {})
    if a11y_result:
        a11y_passed = a11y_result.get("valid", True)

    # Token adherence must be ≥90% (when implemented)
    token_score = validation_results.get("tokens", {}).get("overall_score", 1.0)
    tokens_passed = token_score >= 0.90

    # Overall status
    all_passed = typescript_passed and eslint_passed and a11y_passed and tokens_passed

    return "PASS" if all_passed else "FAIL"
```

**Status Criteria**:

| Check | Requirement | Impact |
|-------|------------|---------|
| **TypeScript** | 0 errors | MUST PASS - Blocks delivery |
| **ESLint** | 0 errors | MUST PASS - Blocks delivery |
| **Accessibility** | 0 critical/serious violations | MUST PASS - Blocks delivery |
| **Token Adherence** | ≥90% | MUST PASS - Blocks delivery |
| **Keyboard Navigation** | All tests pass | Future - Will block delivery |
| **Focus Indicators** | ≥3:1 contrast | Future - Will block delivery |
| **Color Contrast** | WCAG AA (4.5:1 text) | Future - Will block delivery |

### Step 7: HTML Report Generation

**Features**:
- Responsive design for all screen sizes
- Gradient header with PASS/FAIL badge
- Summary cards (errors, warnings, token adherence)
- Progress bar for token adherence
- Validation checklist with ✓/✗ icons
- Auto-fixes section (when applicable)
- Recommendations section (when failures exist)
- Collapsible detailed JSON view

**Example HTML Report**:

<div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; max-width: 800px;">

# Quality Report: Button

**Generated**: 2025-01-09 10:30:45
**Status**: <span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">FAIL</span>

## Summary

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0;">
  <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px;">
    <div style="font-size: 24px; font-weight: bold; color: #dc2626;">3</div>
    <div style="font-size: 12px; color: #991b1b;">Total Errors</div>
  </div>
  <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px;">
    <div style="font-size: 24px; font-weight: bold; color: #d97706;">4</div>
    <div style="font-size: 12px; color: #92400e;">Total Warnings</div>
  </div>
  <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px; padding: 16px;">
    <div style="font-size: 24px; font-weight: bold; color: #16a34a;">N/A</div>
    <div style="font-size: 12px; color: #166534;">Token Adherence</div>
  </div>
</div>

## Validation Checks

- ✗ TypeScript: 2 errors
- ✓ ESLint: Passed
- ✗ Accessibility: 1 critical violation
- ⊗ Keyboard Navigation: Not yet validated
- ⊗ Focus Indicators: Not yet validated

## Auto-Fixes Applied

- Removed unused import on line 8
- Added missing semicolon on line 15

## Recommendations

1. Fix TypeScript type errors for production readiness
2. Fix critical color contrast violations for accessibility compliance
3. Review ESLint warnings for code quality improvements

</div>

## API Usage

### Backend API (FastAPI)

```python
from fastapi import APIRouter
from validation.report_generator import QualityReportGenerator

router = APIRouter()

@router.post("/api/v1/generation/validate")
async def validate_component(request: ValidationRequest):
    # Run all validators
    ts_result = await validate_typescript(request.code)
    eslint_result = await validate_eslint(request.code)
    a11y_result = await validate_accessibility(request.code, request.component_name)

    # Aggregate results
    validation_results = {
        "typescript": ts_result,
        "eslint": eslint_result,
        "a11y": a11y_result,
        "auto_fixes": []
    }

    # Generate quality report
    generator = QualityReportGenerator()
    report = generator.generate(validation_results, request.component_name)

    return {
        "validation": validation_results,
        "quality_report": report.to_dict(),
        "html_report": generator.generate_html(report),
        "status": report.overall_status
    }
```

### Frontend API (TypeScript)

```typescript
import { ValidationResult, QualityReport } from '@/types/validation';

async function validateComponent(
  code: string,
  componentName: string
): Promise<{ report: QualityReport; html: string }> {
  const response = await fetch('/api/v1/generation/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      component_name: componentName
    })
  });

  const data = await response.json();

  return {
    report: data.quality_report,
    html: data.html_report
  };
}

// Usage
const { report, html } = await validateComponent(generatedCode, 'Button');

if (report.overall_status === 'PASS') {
  console.log('✓ Component passed all quality checks');
} else {
  console.error('✗ Validation failed:', report.recommendations);
}

// Display HTML report
const reportWindow = window.open('', '_blank');
reportWindow?.document.write(html);
```

## Quality Scoring System

### Individual Validator Scores

Each validator produces a score from 0.0 to 1.0:

**TypeScript Quality Score**:
```python
ts_score = 1.0 - (errors * 0.25) - (warnings * 0.05)
ts_score = max(0.0, min(1.0, ts_score))

# Examples:
# 0 errors, 0 warnings: 1.00 (100%)
# 1 error, 0 warnings: 0.75 (75%)
# 2 errors, 2 warnings: 0.40 (40%)
# 4+ errors: 0.00 (0%)
```

**ESLint Quality Score**:
```python
eslint_score = 1.0 - (errors * 0.25) - (warnings * 0.05)
eslint_score = max(0.0, min(1.0, eslint_score))
```

**Accessibility Score** (Future):
```python
a11y_score = 1.0
a11y_score -= (critical_violations * 0.30)  # 30% per critical
a11y_score -= (serious_violations * 0.20)   # 20% per serious
a11y_score -= (moderate_violations * 0.05)  # 5% per moderate
a11y_score = max(0.0, min(1.0, a11y_score))
```

### Overall Quality Score

```python
# Average of all validator scores
overall_score = (
    ts_score +
    eslint_score +
    a11y_score +
    keyboard_score +  # Future
    focus_score +     # Future
    contrast_score +  # Future
    token_score       # Future
) / num_validators

# Convert to 0-100 scale
final_score = int(overall_score * 100)
```

### Score Interpretation

| Range | Grade | Interpretation | Action |
|-------|-------|----------------|---------|
| 95-100 | A+ | **Excellent** | Production-ready, no issues |
| 85-94 | A | **Good** | Minor warnings, safe to use |
| 70-84 | B | **Fair** | Review warnings, consider fixes |
| 50-69 | C | **Poor** | Significant issues, needs work |
| 0-49 | F | **Critical** | Major errors, not usable |

## Performance

### Latency Targets

- **TypeScript Validation**: 2-5s
- **ESLint Validation**: 2-5s (parallel with TypeScript)
- **Accessibility Validation**: 5-10s
- **Quality Report Generation**: <1s

**Total Validation Pipeline**:
- Without auto-fix: ~10-15s
- With auto-fix (max_retries=2): ~30-50s

### Optimization Tips

1. **Disable Auto-Fix Retries**
   ```python
   validator = CodeValidator(max_retries=0)
   ```
   - Reduces generation time from ~97s to ~35s
   - Still provides quality scores and error details

2. **Parallel Validation**
   - Run TypeScript and ESLint in parallel (already optimized)
   - Consider parallel accessibility validation

3. **Cache Validation Scripts**
   - Reuse Node.js processes for validation
   - Reduce script initialization overhead

4. **Batch Validations**
   - Validate multiple components in single session
   - Reuse browser instances for accessibility tests

## Troubleshooting

### Validation Always Fails

**Problem**: Components consistently fail validation

**Solutions**:
1. Check validation scripts are accessible
2. Verify Node.js is installed for TypeScript/ESLint
3. Review error messages in validation results
4. Inspect generated code for common issues
5. Use LangSmith to debug LLM generation

### Quality Reports Not Generated

**Problem**: Report generation fails or times out

**Solutions**:
1. Verify validation results are well-formed
2. Check Jinja2 is installed: `pip install jinja2`
3. Review report generator logs
4. Test with minimal validation results

### Low Quality Scores

**Problem**: Quality scores consistently <70

**Solutions**:
1. Review prompt engineering in PromptBuilder
2. Check if pattern reference is high quality
3. Verify design tokens are well-formed
4. Enable auto-fix with `max_retries=2`
5. Inspect validation details for patterns

### Accessibility Validation Fails

**Problem**: axe-core validation fails or times out

**Solutions**:
1. Verify Playwright is installed
2. Install browser binaries: `npx playwright install chromium`
3. Check component renders correctly
4. Review axe-core violations for false positives

## Roadmap

### ✅ Completed

- Epic 4.5 Task 2: TypeScript + ESLint validation with LLM auto-fix
- Epic 5 Task F2: axe-core accessibility validator
- Epic 5 Task B1: Quality report generator

### 🚧 In Progress

None currently

### ⏳ Planned (Next 3-4 Weeks)

**Short Term**:
- Task F3: Keyboard Navigation Validator (2-3 days)
- Task F4: Focus Indicator Validator (2 days)
- Task F5: Color Contrast Validator (2-3 days)
- Task F6: Token Adherence Validator (2-3 days)
- Task I1: Integration & Extended Auto-Fix (3-4 days)
- Tasks T1-T3: Testing (4-7 days)

**Medium Term** (1-2 months):
- Real-time validation feedback
- Incremental validation during editing
- Validation caching and memoization
- Custom validation rules configuration

**Long Term** (3-6 months):
- Machine learning-based quality prediction
- Automated quality improvement suggestions
- Historical quality tracking and trends
- Team quality metrics dashboard

## See Also

- [Accessibility](./accessibility.md) - WCAG compliance and a11y testing details
- [Code Generation](./code-generation.md) - How validation integrates with generation
- [Observability](./observability.md) - LangSmith tracing for debugging
- [Epic 5 Specification](../../.claude/epics/05-quality-validation.md) - Complete epic details
- [Epic 5 Task B1 Implementation](../project-history/archive/epic-implementations/epic-5-task-b1-complete.md) - Quality report generator
- [Epic 5 Integration Guide](../project-history/archive/epic-implementations/epic-5-task-b1-integration-guide.md) - Integration instructions
