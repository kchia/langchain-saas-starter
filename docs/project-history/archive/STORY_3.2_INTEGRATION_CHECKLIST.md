# Story 3.2 Integration Verification Checklist

## Quick Verification Steps

This checklist helps verify that the frontend and backend integration for Story 3.2 (Code Sanitization) is working correctly.

### Prerequisites

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Backend .env configured with:
  - `OPENAI_API_KEY=<your-key>` (required for code generation)
- [ ] Pattern files available in backend/data/patterns/
- [ ] Design tokens extracted (complete Story 1.1)
- [ ] Requirements defined (complete Story 2.1)

### 1. Type Safety Verification

**Check**: TypeScript types match backend response structure

```bash
cd app
npx tsc --noEmit src/types/generation.types.ts src/components/preview/SecurityBadge.tsx src/components/preview/SecurityIssuesPanel.tsx
```

**Expected**: ✅ No TypeScript errors related to security types

**Status**: ___ PASS / ___ FAIL

---

### 2. Backend Security Sanitization

**Test**: Backend detects security vulnerabilities in generated code

**Prerequisites**: Backend tests passing

```bash
cd backend
source venv/bin/activate
pytest tests/security/test_code_sanitization.py -v
```

**Expected**:
- ✅ All security pattern detection tests pass
- ✅ Tests detect: eval(), dangerouslySetInnerHTML, __proto__, hardcoded secrets
- ✅ Safe code passes without issues

**Status**: ___ PASS / ___ FAIL

---

### 3. Integration Tests

**Test**: Backend integration tests verify API contract

```bash
cd backend
source venv/bin/activate
pytest tests/integration/test_security_integration.py -v
```

**Expected**:
- ✅ Sanitizer detects unsafe patterns
- ✅ Response structure matches frontend types
- ✅ Multiple issues can be detected simultaneously

**Status**: ___ PASS / ___ FAIL

---

### 4. API Response Structure

**Test**: Generation endpoint includes security sanitization results

**Steps**:
1. Start backend: `cd backend && uvicorn src.main:app --reload`
2. Use API client or curl to generate component
3. Check response includes `validation_results.security_sanitization`

**Example API call**:
```bash
curl -X POST http://localhost:8000/api/v1/generation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "pattern_id": "shadcn-button",
    "tokens": {
      "colors": {"Primary": "#3B82F6"},
      "typography": {"fontSize": "14px"}
    },
    "requirements": []
  }'
```

**Expected Response Structure**:
```json
{
  "validation_results": {
    "attempts": 0,
    "final_status": "skipped",
    "typescript_passed": true,
    "typescript_errors": [],
    "eslint_passed": true,
    "eslint_errors": [],
    "security_sanitization": {
      "is_safe": true,
      "issues": [],
      "sanitized_code": null
    }
  }
}
```

**Status**: ___ PASS / ___ FAIL

---

### 5. Frontend Security Badge Display

**Test**: Security badge shows correct status

**Steps**:
1. Go to http://localhost:3000
2. Complete workflow: Upload → Extract → Patterns → Requirements
3. Click "Generate Component"
4. Observe metrics dashboard on preview page

**Expected**:
- ✅ Security metric card displays
- ✅ Shows green shield with "✓ Safe" for safe code
- ✅ Icon: `ShieldCheck` for safe, `ShieldAlert` for issues

**Status**: ___ PASS / ___ FAIL

---

### 6. Security Issues Panel - Safe Code

**Test**: No issues panel shown for safe generated code

**Steps**:
1. Generate a component (follow workflow)
2. Navigate to "Quality" tab
3. Check if SecurityIssuesPanel appears

**Expected**:
- ✅ If code is safe: Panel shows "✓ Code Security Verified - No vulnerabilities detected"
- ✅ Green success alert with shield check icon
- ✅ No security issues listed

**Status**: ___ PASS / ___ FAIL

---

### 7. Security Issues Panel - Unsafe Code (Mock Test)

**Test**: Security issues are displayed correctly for code with vulnerabilities

**Note**: Since the LLM shouldn't generate unsafe code, this test requires mocking or manual injection

**Note**: In the unlikely event that the LLM generates unsafe code in production:
1. The sanitizer acts as a safety net and flags the issues
2. Users see security warnings in the Quality tab
3. Metrics are recorded for monitoring
4. Users can decide whether to use the code or regenerate
5. The system does NOT automatically block code generation - it provides transparency

**Manual Test**:
1. Temporarily modify backend to inject unsafe code for testing:

```python
# In backend/src/api/v1/routes/generation.py, after line 100:
# ⚠️ TEST ONLY - REMOVE IMMEDIATELY AFTER TESTING ⚠️
# Better: Use environment variable: if os.getenv("ENABLE_SECURITY_TEST_MODE") == "true":
if request.pattern_id == "test-unsafe":
    result.component_code = '''
const Component = () => {
    const html = eval("userInput");  // Critical: Code injection
    return <div dangerouslySetInnerHTML={{__html: html}} />;  // High: XSS
};
'''
```

2. Generate with pattern_id "test-unsafe"
3. Check Quality tab

**Expected**:
- ✅ Security metric shows red alert with issue count
- ✅ SecurityIssuesPanel displays violations
- ✅ Each issue shows:
  - Line number
  - Severity badge (CRITICAL/HIGH/MEDIUM/LOW)
  - Pattern matched (e.g., `eval\s*\(`)
  - Explanation message
  - Optional code snippet

**Status**: ___ PASS / ___ FAIL / ___ SKIPPED (manual test)

---

### 8. Severity Level Display

**Test**: All severity levels render correctly

**Steps**:
1. Check that components handle all severity levels:
   - Critical (red)
   - High (red)
   - Medium (yellow/warning)
   - Low (gray/neutral)

**Expected**:
- ✅ Critical and High show red error badge
- ✅ Medium shows yellow/orange warning badge
- ✅ Low shows gray/neutral badge

**Status**: ___ PASS / ___ FAIL

---

### 9. Multiple Issues Detection

**Test**: Multiple security issues are detected and displayed

**Mock Test** (using same manual injection as Test #7):
```python
result.component_code = '''
const Component = ({ apiKey }) => {
    const key = "sk-1234567890abcdefghij";  // Critical: Hardcoded secret
    const result = eval(apiKey);  // Critical: Code injection
    return <div dangerouslySetInnerHTML={{__html: result}} />;  // High: XSS
};
'''
```

**Expected**:
- ✅ Security badge shows "3 Security Issues"
- ✅ All 3 issues listed in SecurityIssuesPanel
- ✅ Each issue has distinct line number
- ✅ Severities displayed correctly

**Status**: ___ PASS / ___ FAIL / ___ SKIPPED (manual test)

---

### 10. Metrics Recording

**Test**: Security violations are recorded in Prometheus metrics

**Steps**:
1. Generate code with security issues (use mock from Test #7)
2. Navigate to http://localhost:8000/metrics
3. Search for `code_sanitization_failures_total`

**Expected**:
```
# TYPE code_sanitization_failures_total counter
code_sanitization_failures_total{pattern="code_injection",severity="critical"} 1.0
code_sanitization_failures_total{pattern="xss_risk",severity="high"} 1.0
code_sanitization_failures_total{pattern="hardcoded_secret",severity="critical"} 1.0
```

**Status**: ___ PASS / ___ FAIL

---

### 11. End-to-End Happy Path (Safe Code)

**Test**: Complete flow from upload to generation with safe code

**Steps**:
1. Navigate to http://localhost:3000
2. Upload valid screenshot
3. Extract tokens
4. Select pattern
5. Define requirements (or use defaults)
6. Generate component
7. Check Preview page → Quality tab

**Expected**:
- ✅ Component generates successfully
- ✅ Security metric shows "✓ Safe"
- ✅ SecurityIssuesPanel shows success message
- ✅ No security issues listed
- ✅ Can copy/download code normally

**Status**: ___ PASS / ___ FAIL

---

### 12. Code Snippet Display

**Test**: Code snippets are shown for security violations (if available)

**Mock Test** (using manual injection):

**Expected**:
- ✅ If backend returns `code_snippet`, it's displayed in issue panel
- ✅ Snippet shows line number prefix (e.g., ">>> 42 |")
- ✅ Snippet uses monospace font

**Status**: ___ PASS / ___ FAIL / ___ SKIPPED

---

## Summary

**Total Tests**: 12
**Passed**: ___
**Failed**: ___
**Skipped**: ___

### Integration Status

- [ ] All critical tests pass (Tests 1-6, 11)
- [ ] Backend sanitization working (Tests 2-4)
- [ ] Frontend components display correctly (Tests 5-9)
- [ ] Metrics recording (Test 10)
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Backend logs show security events when issues detected

### Issues Found

_List any issues discovered during verification:_

1. 
2. 
3. 

### Next Steps

Based on verification results:

- [ ] Fix any failing tests
- [ ] Update documentation if behavior differs from spec
- [ ] Run E2E test suite: `cd app && npm run test:e2e`
- [ ] Remove test code injections if used
- [ ] Mark Story 3.2 integration as complete
- [ ] Proceed to Story 3.3 (Rate Limiting) integration

---

## Notes

- Tests 1-6 verify the integration contract
- Tests 7-9 require manual code injection for testing unsafe scenarios
- Test 10 requires Prometheus metrics enabled
- Tests 11-12 are end-to-end validation
- In production, the LLM should generate safe code by default
- Security sanitization acts as a safety net and provides transparency

---

## Test Fixtures

For manual testing, use these code samples:

### Safe Component (Should Pass)
```tsx
import React from 'react';

interface ButtonProps {
  variant?: 'default' | 'secondary';
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'default', 
  onClick,
  children 
}) => {
  return (
    <button 
      className={`btn-${variant}`}
      onClick={onClick}
      aria-label="Button"
    >
      {children}
    </button>
  );
};

export default Button;
```

### Unsafe Component (Should Fail)
```tsx
const UnsafeComponent = ({ html, apiKey }) => {
  // Critical: Hardcoded secret
  const key = "sk-1234567890abcdefghijklmnopqrstuvwxyz";
  
  // Critical: Code injection
  const result = eval(html);
  
  // High: XSS vulnerability
  return <div dangerouslySetInnerHTML={{ __html: result }} />;
};
```

---

## Debugging Tips

### If security results not showing:

1. Check browser Network tab → Response from `/api/v1/generation/generate`
2. Verify response contains `validation_results.security_sanitization`
3. Check browser console for JavaScript errors
4. Verify `SecurityIssuesPanel` component is imported correctly

### If backend not detecting issues:

1. Check sanitizer is initialized: `code_sanitizer = CodeSanitizer()`
2. Verify patterns in `backend/src/security/code_sanitizer.py`
3. Run unit tests: `pytest tests/security/test_code_sanitization.py -v`
4. Check backend logs for sanitization messages

### If types mismatch:

1. Verify `app/src/types/generation.types.ts` matches backend response
2. Run: `npx tsc --noEmit` to check all TypeScript errors
3. Compare backend `CodeSanitizationResult` model with frontend interface
