# Quality Report Generator

## Overview

The Quality Report Generator aggregates validation results from Epic 4.5 (TypeScript, ESLint) and Epic 5 (Accessibility, Keyboard, Focus, Contrast, Token Adherence) into comprehensive quality reports.

## Features

- **Overall Status Determination**: PASS/FAIL based on critical validations
- **Comprehensive Summary**: Aggregates all validation results
- **Auto-fix Tracking**: Lists all automatically applied fixes
- **Smart Recommendations**: Generates actionable recommendations
- **Multiple Formats**: Exports as JSON and HTML
- **Responsive HTML**: Beautiful, responsive HTML reports with visualizations

## Usage

```python
from validation.report_generator import QualityReportGenerator

# Initialize generator
generator = QualityReportGenerator()

# Sample validation results
validation_results = {
    "typescript": {"valid": True, "errorCount": 0, "errors": [], "warnings": []},
    "eslint": {"valid": True, "errorCount": 0, "errors": [], "warnings": []},
    "a11y": {"valid": True, "violations": [], "passes": []},
    "keyboard": {"valid": True, "issues": []},
    "focus": {"valid": True, "issues": []},
    "contrast": {"valid": True, "violations": []},
    "tokens": {"valid": True, "overall_score": 0.95, "adherence": {}},
    "auto_fixes": ["removed_unused_import", "added_aria_label"]
}

# Generate report
report = generator.generate(validation_results, "Button")

# Get JSON format
json_report = generator.generate_json(report)

# Get HTML format
html_report = generator.generate_html(report)
```

## Validation Results Schema

### TypeScript Results
```python
{
    "valid": bool,
    "errorCount": int,
    "warningCount": int,
    "errors": [{"line": int, "column": int, "message": str, "code": int}],
    "warnings": [{"line": int, "column": int, "message": str, "code": int}]
}
```

### ESLint Results
```python
{
    "valid": bool,
    "errorCount": int,
    "warningCount": int,
    "errors": [{"line": int, "column": int, "message": str, "ruleId": str}],
    "warnings": [{"line": int, "column": int, "message": str, "ruleId": str}]
}
```

### Accessibility Results (axe-core)
```python
{
    "valid": bool,
    "violations": [{"id": str, "impact": str, "description": str, "nodes": list}],
    "passes": [{"id": str, "impact": str, "description": str}]
}
```

### Keyboard/Focus/Contrast Results
```python
{
    "valid": bool,
    "issues": [{"type": str, "message": str, "severity": str}]
}
```

### Token Adherence Results
```python
{
    "valid": bool,
    "overall_score": float,  # 0.0 to 1.0
    "adherence": {
        "colors": {"score": float, "matches": int, "total": int},
        "typography": {"score": float, "matches": int, "total": int},
        "spacing": {"score": float, "matches": int, "total": int}
    }
}
```

## Status Determination

The overall status is determined by these critical checks:

1. **TypeScript Compilation**: Must pass (no errors)
2. **ESLint Validation**: Must pass (no errors)
3. **Accessibility**: Must pass (no critical violations)
4. **Token Adherence**: Must be ≥90%

If all critical checks pass, status is `PASS`. Otherwise, status is `FAIL`.

## Report Structure

```python
{
    "timestamp": str,  # ISO format
    "overall_status": str,  # "PASS" or "FAIL"
    "component_name": str,
    "summary": {
        "typescript": bool,
        "eslint": bool,
        "accessibility": bool,
        "keyboard": bool,
        "focus": bool,
        "contrast": bool,
        "token_adherence": float,
        "total_errors": int,
        "total_warnings": int
    },
    "details": dict,  # Full validation results
    "auto_fixes": list[str],
    "recommendations": list[str]
}
```

## HTML Report Features

- **Header**: Component name, timestamp, overall status badge
- **Summary Cards**: Total errors, warnings, token adherence with progress bar
- **Validation Checks**: Visual checklist with ✓/✗ icons
- **Auto-Fixes Section**: Lists all automatically applied fixes
- **Recommendations Section**: Actionable items for failed validations
- **Detailed Results**: Collapsible JSON view of full validation data
- **Responsive Design**: Works on all screen sizes
- **Professional Styling**: Gradient headers, badges, progress bars

## Testing

Run tests with:
```bash
cd backend
source venv/bin/activate
pytest tests/validation/test_report_generator.py -v
```

Test coverage includes:
- Report generation with valid/invalid results
- Status determination logic
- Summary creation
- Error/warning counting
- Recommendation generation
- HTML/JSON formatting
- Edge cases and missing fields

## Integration

The Quality Report Generator is designed to be integrated with:

1. **Epic 4.5 Code Validator**: Receives TypeScript and ESLint results
2. **Epic 5 Frontend Validators**: Receives accessibility, keyboard, focus, contrast, and token results
3. **Backend API**: Returns reports via FastAPI endpoints
4. **Frontend UI**: Displays reports in the component preview page

## Dependencies

- **jinja2**: For HTML template rendering
- **Python 3.11+**: For type hints and modern Python features

## Files

```
backend/src/validation/
├── __init__.py                    # Module exports
├── report_generator.py            # Main generator class
└── templates/
    └── quality_report.html        # Jinja2 HTML template

backend/tests/validation/
├── __init__.py
└── test_report_generator.py       # Comprehensive test suite
```

## Epic 5 Integration

This is **Task B1** of Epic 5: Extended Quality Validation & Accessibility Testing.

Related tasks:
- F1-F6: Frontend validators (TypeScript)
- I1: Integration with Code Validator
- T2: Backend integration tests

See `.claude/epics/05-quality-validation.md` for full epic details.
