# Manual Testing Guide - Story 3.2: Code Security Validation

## Overview
This document provides step-by-step instructions for manually testing the security validation features in the code generation workflow.

## Prerequisites
- Frontend server running: `npm run dev` (port 3000)
- Backend server running: `uvicorn src.main:app --reload` (port 8000)
- Backend has `code_sanitizer.py` implemented (Story 3.2 backend task)

## Test Scenarios

### Scenario 1: View Storybook Components

**Purpose:** Verify that security components render correctly in isolation

**Steps:**
1. Start Storybook: `npm run storybook`
2. Navigate to http://localhost:6006
3. Browse to "Preview/SecurityBadge"
   - View "Safe" story - should show green shield with "Security Verified"
   - View "One Issue" story - should show red shield with "1 Security Issue"
   - View "Multiple Issues" story - should show red shield with "2 Security Issues"
   - View "Not Checked" story - should show gray shield with "Security Check Skipped"
   - View "Compact" story - should show icon only, no text
4. Browse to "Preview/SecurityIssuesPanel"
   - View "Safe" story - should show green success state
   - View "Eval Violation" story - should show line 10, HIGH severity, pattern explanation
   - View "Multiple Issues" story - should show all 4 issues with different severities
   - View "With Sanitized Code" story - should show sanitized code alert

**Expected Results:**
- All stories render without errors
- Colors and icons match the design
- Text is readable and properly formatted
- Badges show correct variants (success/error/neutral)

---

### Scenario 2: Security Validation with Safe Code

**Purpose:** Test the UI when generated code passes all security checks

**Setup:**
Backend should return security validation results in the generation response:
```json
{
  "code": { ... },
  "metadata": {
    "validation_results": {
      "security_sanitization": {
        "is_safe": true,
        "issues": []
      }
    }
  }
}
```

**Steps:**
1. Navigate to http://localhost:3000
2. Complete the token extraction flow (upload screenshot or use Figma)
3. Complete the requirements flow
4. Complete the pattern selection flow
5. Wait for code generation on the preview page
6. Observe the metrics dashboard

**Expected Results:**
- Security metric card shows "✓ Safe" with green shield icon
- Quality tab contains "Security Analysis" panel
- Security panel shows green "Safe" badge
- Success message: "No security vulnerabilities detected!"
- No security issues listed

---

### Scenario 3: Security Validation with Single Issue

**Purpose:** Test the UI when one security violation is detected

**Setup:**
Backend should return:
```json
{
  "metadata": {
    "validation_results": {
      "security_sanitization": {
        "is_safe": false,
        "issues": [
          {
            "type": "security_violation",
            "pattern": "eval\\s*\\(",
            "line": 10,
            "severity": "high"
          }
        ]
      }
    }
  }
}
```

**Steps:**
1. Complete workflow to preview page
2. Observe metrics dashboard
3. Click on "Quality" tab
4. Scroll to Security Analysis panel

**Expected Results:**
- Security metric card shows "1 Issue" with red shield icon
- Security Analysis panel shows:
  - Red "1 Issue Found" badge in header
  - Warning alert: "Security violations detected..."
  - Issue details:
    - "Line 10"
    - "HIGH" severity badge (red)
    - Pattern: `eval\s*\(`
    - Explanation about arbitrary code execution
  - Recommendations section with actionable advice

---

### Scenario 4: Security Validation with Multiple Issues

**Purpose:** Test the UI with multiple security violations of different severities

**Setup:**
Backend should return:
```json
{
  "metadata": {
    "validation_results": {
      "security_sanitization": {
        "is_safe": false,
        "issues": [
          {
            "type": "security_violation",
            "pattern": "eval\\s*\\(",
            "line": 10,
            "severity": "high"
          },
          {
            "type": "security_violation",
            "pattern": "dangerouslySetInnerHTML",
            "line": 25,
            "severity": "high"
          },
          {
            "type": "security_violation",
            "pattern": "__proto__",
            "line": 42,
            "severity": "medium"
          },
          {
            "type": "security_violation",
            "pattern": "process\\.env\\.",
            "line": 55,
            "severity": "low"
          }
        ]
      }
    }
  }
}
```

**Steps:**
1. Complete workflow to preview page
2. Check metrics dashboard
3. Navigate to Quality tab
4. Review all security issues

**Expected Results:**
- Security metric shows "4 Issues"
- Security Analysis panel lists all 4 violations
- Each issue shows:
  - Correct line number
  - Correct severity badge color (HIGH=red, MEDIUM=yellow, LOW=gray)
  - Pattern name
  - Human-readable explanation
- Issues are ordered or grouped logically
- Recommendations section present

---

### Scenario 5: Security Validation with Sanitized Code

**Purpose:** Test the display when backend provides a sanitized version

**Setup:**
Backend should return:
```json
{
  "metadata": {
    "validation_results": {
      "security_sanitization": {
        "is_safe": false,
        "issues": [ ... ],
        "sanitized_code": "const Button = () => <button>Safe</button>;"
      }
    }
  }
}
```

**Steps:**
1. Complete workflow to preview page
2. Navigate to Quality tab
3. Look for sanitized code alert

**Expected Results:**
- Security issues listed as usual
- Additional alert box appears:
  - "Sanitized version available"
  - Explanation about reviewing sanitized code
  - Clear warning to review before use

---

### Scenario 6: Security Check Not Run

**Purpose:** Test the UI when security validation is skipped or not available

**Setup:**
Backend should return:
```json
{
  "metadata": {
    "validation_results": {
      // No security_sanitization field
    }
  }
}
```

**Steps:**
1. Complete workflow to preview page
2. Check metrics dashboard
3. Navigate to Quality tab

**Expected Results:**
- Security metric shows "Not Checked" with gray shield
- Security Analysis panel may not appear, or shows neutral state

---

### Scenario 7: Responsive Layout Testing

**Purpose:** Ensure security components work on different screen sizes

**Steps:**
1. Complete workflow to preview page
2. Resize browser window to mobile size (375px width)
3. Check metrics dashboard layout
4. Navigate to Quality tab
5. Resize to tablet size (768px width)
6. Resize to desktop size (1920px width)

**Expected Results:**
- Metrics cards stack vertically on mobile (1 column)
- Metrics show 2 columns on tablet
- Metrics show 5 columns on desktop
- Security issues panel is readable on all sizes
- Line numbers and badges don't overflow
- Recommendations list is formatted correctly

---

## Visual Regression Testing

### Screenshots to Capture

1. **Metrics Dashboard - Safe Code**
   - Full width view showing 5 metrics including security
   - Security metric shows green "✓ Safe"

2. **Metrics Dashboard - Unsafe Code**
   - Security metric shows red "2 Issues"

3. **Security Analysis Panel - Safe**
   - Green success state with checkmark
   - Success message visible

4. **Security Analysis Panel - Multiple Issues**
   - Multiple violations listed
   - Different severity badges visible
   - Patterns and explanations shown

5. **Mobile View - Security Issues**
   - Panel readable on 375px width
   - Badges don't overflow

---

## Accessibility Testing

### Keyboard Navigation
1. Tab through the preview page
2. Security metric card should be focusable (if clickable)
3. Quality tab should be keyboard accessible
4. Security issues panel content should be readable with screen reader

### Screen Reader Testing
1. Use VoiceOver (Mac) or NVDA (Windows)
2. Navigate to preview page
3. Listen to security metric announcement
4. Navigate to Quality tab
5. Listen to security issues announcements

**Expected Announcements:**
- "Security: Safe" or "Security: 2 Issues"
- Each violation should announce: "Line X, HIGH severity, Pattern: eval..."
- Recommendations should be announced clearly

### Color Contrast
1. Use browser dev tools contrast checker
2. Verify all text meets WCAG AA standards
3. Check severity badges (HIGH/MEDIUM/LOW) for sufficient contrast

---

## Common Issues & Troubleshooting

### Issue: Security metric always shows "Not Checked"
**Cause:** Backend not returning `security_sanitization` in response
**Fix:** Verify backend has `code_sanitizer.py` implemented and integrated

### Issue: Security panel not visible in Quality tab
**Cause:** `securityResults` is undefined
**Fix:** Check that backend includes `validation_results.security_sanitization` in metadata

### Issue: Patterns show regex instead of friendly names
**Cause:** This is expected - patterns are shown as regex
**Solution:** Update `getPatternExplanation()` to map more patterns to friendly names

### Issue: TypeScript errors in console
**Cause:** Missing type definitions
**Fix:** Ensure `SecurityIssue` and `CodeSanitizationResults` types are imported correctly

---

## Testing Checklist

Before marking Story 3.2 frontend as complete:

- [ ] All Storybook stories render without errors
- [ ] Unit tests pass: `npm test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Lint passes: `npm run lint`
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] Safe code shows green success state
- [ ] Unsafe code shows red error state with issue details
- [ ] Multiple issues are displayed correctly
- [ ] Severity badges show correct colors
- [ ] Line numbers are accurate
- [ ] Pattern explanations are helpful
- [ ] Recommendations section appears for unsafe code
- [ ] Sanitized code alert appears when available
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Keyboard navigation works
- [ ] Screen reader announcements are clear
- [ ] Color contrast meets WCAG AA standards

---

## Notes for Developers

**Customizing Pattern Explanations:**
To add more security pattern explanations, edit `SecurityIssuesPanel.tsx`:

```typescript
const getPatternExplanation = (pattern: string): string => {
  const explanations: Record<string, string> = {
    'eval\\s*\\(': 'Use of eval() allows arbitrary code execution...',
    // Add more patterns here
  }
  return explanations[pattern] || 'This pattern has been flagged...'
}
```

**Adjusting Severity Colors:**
Severity variants are defined in the Badge component:
- `high` → `variant="error"` (red)
- `medium` → `variant="warning"` (yellow)
- `low` → `variant="neutral"` (gray)

**Testing with Mock Data:**
For quick testing without backend, you can mock the generation store response in `useWorkflowStore` or use Storybook.

---

## References

- Epic Document: `.claude/epics/epic-003-safety-guardrails.md`
- Backend Code Sanitizer: `backend/src/security/code_sanitizer.py` (to be implemented)
- SecurityBadge Component: `app/src/components/preview/SecurityBadge.tsx`
- SecurityIssuesPanel Component: `app/src/components/preview/SecurityIssuesPanel.tsx`
- E2E Tests: `app/e2e/code-security-validation.spec.ts`
