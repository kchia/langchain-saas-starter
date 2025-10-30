# Story 3.1 Integration Verification Checklist

## Quick Verification Steps

This checklist helps verify that the frontend and backend integration for Story 3.1 is working correctly.

### Prerequisites

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Backend .env configured with:
  - `OPENAI_API_KEY=<your-key>` (required for token extraction)
  - `PII_DETECTION_ENABLED=false` (or true to test PII detection)

### 1. Type Safety Verification

**Check**: TypeScript types match backend response structure

```bash
cd app
npx tsc --noEmit src/types/api.types.ts
```

**Expected**: ✅ No TypeScript errors

**Status**: ✅ PASS

---

### 2. Client-Side Validation

**Test**: Upload validation happens before server call

**Steps**:
1. Go to http://localhost:3000/extract
2. Try to upload a .txt file
3. Observe that error appears immediately without network request

**Expected**:
- ✅ Error appears instantly (no backend call)
- ✅ Error message: "📄 Invalid file type..."
- ✅ "Try Another File" button visible

**Status**: ___ PASS / ___ FAIL

---

### 3. Server-Side Validation

**Test**: Backend validates files even if client validation is bypassed

**Steps**:
1. Upload a valid PNG file (< 10MB)
2. Check browser DevTools Network tab
3. Verify POST request to `/api/v1/tokens/extract/screenshot`
4. Check response includes `metadata.security_validated: true`

**Expected**:
- ✅ Request sent to backend
- ✅ Response status: 200
- ✅ Response includes security metadata
- ✅ `metadata.security_validated: true`

**Response snippet**:
```json
{
  "metadata": {
    "security_validated": true,
    "filename": "...",
    "image": { ... }
  }
}
```

**Status**: ___ PASS / ___ FAIL

---

### 4. Error Message Transformation

**Test**: Backend errors are transformed into user-friendly messages

**Steps**:
1. Create a 15MB PNG file (or simulate by editing frontend max size)
2. Try to upload it
3. Observe error message

**Expected**:
- ✅ Error message is user-friendly, not raw API error
- ✅ Shows icon (📦) and helpful text
- ✅ Message: "File Too Large: Please compress your image to under 10MB"

**Status**: ___ PASS / ___ FAIL

---

### 5. SVG Security Validation

**Test**: Malicious SVG files are rejected

**Steps**:
1. Create `malicious.svg`:
   ```svg
   <svg xmlns="http://www.w3.org/2000/svg">
     <script>alert('xss')</script>
     <circle cx="50" cy="50" r="40" fill="red" />
   </svg>
   ```
2. Try to upload this file
3. Observe client-side rejection

**Expected**:
- ✅ File rejected by client-side validation
- ✅ Error message mentions security
- ✅ No backend request made

**Status**: ___ PASS / ___ FAIL

---

### 6. Safe SVG Acceptance

**Test**: Safe SVG files are accepted

**Steps**:
1. Create `safe.svg`:
   ```svg
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
     <circle cx="50" cy="50" r="40" fill="blue" />
     <rect x="25" y="25" width="50" height="50" fill="green" />
   </svg>
   ```
2. Upload this file
3. Click "Extract Tokens"

**Expected**:
- ✅ Client-side validation passes
- ✅ Backend validation passes
- ✅ Token extraction proceeds

**Status**: ___ PASS / ___ FAIL

---

### 7. PII Detection (Optional - if enabled)

**Test**: PII is detected but doesn't block screenshot uploads

**Prerequisites**: Set `PII_DETECTION_ENABLED=true` in backend/.env

**Steps**:
1. Create a screenshot containing fake PII text: "SSN: 123-45-6789"
2. Upload the screenshot
3. Click "Extract Tokens"
4. Check backend logs for PII warning
5. Verify tokens are still extracted

**Expected**:
- ✅ Upload succeeds
- ✅ Tokens extracted
- ✅ Response includes `metadata.pii_check.performed: true`
- ✅ Backend logs show PII warning (if detected)

**Backend log**:
```
WARNING: PII detected in screenshot (not blocking): ['ssn']
```

**Status**: ___ PASS / ___ FAIL / ___ SKIPPED (PII detection disabled)

---

### 8. Network Error Handling

**Test**: Graceful handling when backend is unavailable

**Steps**:
1. Stop backend server
2. Upload valid PNG file
3. Click "Extract Tokens"
4. Observe error message

**Expected**:
- ✅ Error message: "Unable to connect to server. Please check your connection."
- ✅ No console errors
- ✅ UI remains functional

**Status**: ___ PASS / ___ FAIL

---

### 9. Retry Flow

**Test**: User can retry after validation failure

**Steps**:
1. Upload invalid.txt
2. See error message
3. Click "Try Another File"
4. Upload valid.png
5. Verify upload succeeds

**Expected**:
- ✅ First upload rejected with clear message
- ✅ Retry button appears
- ✅ Second upload succeeds
- ✅ Previous error cleared

**Status**: ___ PASS / ___ FAIL

---

### 10. End-to-End Happy Path

**Test**: Complete flow from upload to token display

**Steps**:
1. Navigate to http://localhost:3000/extract
2. Upload a valid screenshot (PNG, < 10MB, shows UI elements)
3. Click "Extract Tokens"
4. Wait for extraction
5. Verify tokens are displayed

**Expected**:
- ✅ File validates (client-side)
- ✅ Upload succeeds
- ✅ Backend validates (server-side)
- ✅ Tokens extracted with GPT-4V
- ✅ Tokens displayed in editor
- ✅ Success message shown
- ✅ Can proceed to requirements page

**Status**: ___ PASS / ___ FAIL

---

## Summary

**Total Tests**: 10
**Passed**: ___
**Failed**: ___
**Skipped**: ___

### Integration Status

- [ ] All critical tests pass (Tests 1-6, 8-10)
- [ ] PII detection works (Test 7) or is intentionally disabled
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Backend logs show security events

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
- [ ] Mark Story 3.1 integration as complete

---

## Notes

- Tests 1-6 can be run without OpenAI API key (validation only)
- Test 7 requires OpenAI API key and PII_DETECTION_ENABLED=true
- Test 10 requires OpenAI API key for token extraction
- Some tests may need test fixtures (images, SVG files)

---

## Test Fixtures

Create these files in `app/__fixtures__/` for testing:

1. **valid-screenshot.png**: Small PNG file < 10MB
2. **large-image.png**: PNG file > 10MB (or create on-the-fly)
3. **malicious.svg**: SVG with `<script>` tag
4. **safe-icon.svg**: Clean SVG with simple shapes
5. **test.txt**: Text file for invalid type testing
6. **screenshot-with-pii.png**: Screenshot with fake SSN/email (for PII testing)

Most of these already exist from PR #74 frontend work.
