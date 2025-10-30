# Code Sanitization Testing Guide

This document describes how to test the code sanitization module for Story 3.2.

## Prerequisites

Install backend dependencies:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Running Tests

### Run all security tests:
```bash
cd backend
source venv/bin/activate
pytest tests/security/ -v
```

### Run only code sanitization tests:
```bash
cd backend
source venv/bin/activate
pytest tests/security/test_code_sanitization.py -v
```

### Run with coverage:
```bash
cd backend
source venv/bin/activate
pytest tests/security/test_code_sanitization.py -v --cov=src.security.code_sanitizer
```

## Test Coverage

The test suite (`tests/security/test_code_sanitization.py`) covers:

### 1. Safe Code Detection
- ✅ Safe React components pass validation
- ✅ Empty code passes
- ✅ Whitespace-only code passes

### 2. Code Injection Detection
- ✅ `eval()` usage detected as CRITICAL
- ✅ `new Function()` constructor detected as CRITICAL
- ✅ Line numbers tracked accurately

### 3. XSS Vulnerability Detection
- ✅ `dangerouslySetInnerHTML` detected as HIGH
- ✅ `innerHTML =` assignment detected as HIGH
- ✅ `document.write()` detected as HIGH
- ✅ `outerHTML =` assignment detected as MEDIUM

### 4. Prototype Pollution Detection
- ✅ `__proto__` access detected as HIGH
- ✅ `.constructor.prototype` manipulation detected as MEDIUM

### 5. Hardcoded Secret Detection
- ✅ API keys (sk-xxxxx format) detected as CRITICAL
- ✅ Password assignments detected as CRITICAL
- ✅ Generic secret/token patterns detected as CRITICAL

### 6. Environment Variable Exposure
- ✅ `process.env` access detected as MEDIUM

### 7. Multiple Issues
- ✅ Multiple issues in same code detected
- ✅ Issue counts by severity calculated correctly

### 8. Code Snippets
- ✅ Code snippets included when requested
- ✅ Line markers (>>>) shown in snippets
- ✅ Context lines included

### 9. Edge Cases
- ✅ Case-insensitive pattern matching
- ✅ Patterns in comments detected
- ✅ Realistic safe components pass
- ✅ Realistic unsafe components flagged

## Example Test Execution

```bash
$ pytest tests/security/test_code_sanitization.py -v

tests/security/test_code_sanitization.py::TestCodeSanitizer::test_safe_code_passes PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_detect_eval PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_detect_function_constructor PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_detect_dangerously_set_inner_html PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_detect_inner_html_assignment PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_detect_document_write PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_detect_proto_pollution PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_detect_hardcoded_api_key PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_detect_hardcoded_password PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_detect_hardcoded_secret PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_detect_process_env_exposure PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_detect_outer_html_assignment PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_multiple_issues_detected PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_line_number_tracking PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_case_insensitive_detection PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_include_code_snippets PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_no_code_snippets_by_default PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_get_forbidden_patterns_info PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_empty_code PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_whitespace_only_code PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_comments_with_patterns PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_realistic_safe_component PASSED
tests/security/test_code_sanitization.py::TestCodeSanitizer::test_realistic_unsafe_component PASSED

======================== 23 tests passed in 0.15s =========================
```

## Integration Testing

To test the integration with the generation endpoint:

```bash
# Start the backend server
cd backend
source venv/bin/activate
uvicorn src.main:app --reload

# In another terminal, test the endpoint
curl -X POST http://localhost:8000/api/v1/generation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "pattern_id": "button",
    "tokens": {},
    "requirements": []
  }' | jq '.security_issues'
```

Expected response structure:
```json
{
  "security_issues": {
    "is_safe": true,
    "issues_count": 0,
    "critical_count": 0,
    "high_count": 0,
    "medium_count": 0,
    "low_count": 0,
    "issues": []
  }
}
```

## Metrics Testing

To verify Prometheus metrics are recorded:

```bash
# Generate some code to trigger sanitization
curl -X POST http://localhost:8000/api/v1/generation/generate \
  -H "Content-Type: application/json" \
  -d '{"pattern_id": "button", "tokens": {}, "requirements": []}'

# Check metrics endpoint
curl http://localhost:8000/metrics | grep code_sanitization
```

Expected output:
```
# HELP code_sanitization_failures_total Unsafe code patterns detected in generated code
# TYPE code_sanitization_failures_total counter
code_sanitization_failures_total{pattern="code_injection",severity="critical"} 0.0
code_sanitization_failures_total{pattern="xss_risk",severity="high"} 0.0
```

## Manual Testing Scenarios

### Scenario 1: Safe Component Generation
**Input:** Generate a simple Button component
**Expected:** `security_issues.is_safe = true`

### Scenario 2: Unsafe Code Detection
**Input:** Manually modify generated code to include `eval()`
**Expected:** `security_issues.is_safe = false`, critical issue detected

### Scenario 3: Multiple Issues
**Input:** Code with both XSS and hardcoded secrets
**Expected:** Multiple issues detected with correct severity levels

## Troubleshooting

### Tests fail with import errors
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Tests pass but integration fails
- Check that `CodeSanitizer` is imported in `generation.py`
- Verify Prometheus metrics are optional (wrapped in try/except)

### Metrics not appearing
- Ensure `prometheus-client` is installed
- Check that metrics endpoint is enabled in FastAPI app
