# Story 3.1 Integration Tests

## Overview

This document describes integration tests for Epic 003 Story 3.1: Input Safety (Validation + PII Detection).
The integration connects backend security validation with frontend upload handling.

## Integration Architecture

```
Frontend (Client-Side)          Backend (Server-Side)
┌─────────────────────┐        ┌──────────────────────────┐
│ FileUploadValidator │   →    │ ImageUploadValidator     │
│ - File type check   │        │ - MIME type validation   │
│ - Size check        │        │ - Magic number detection │
│ - Dimension check   │        │ - SVG security scan      │
│ - SVG security scan │        │ - Dimension validation   │
└─────────────────────┘        └──────────────────────────┘
         ↓                               ↓
┌─────────────────────┐        ┌──────────────────────────┐
│ API Client          │   →    │ PIIDetector (optional)   │
│ - Error handling    │        │ - GPT-4V OCR + PII scan  │
│ - Retry logic       │        │ - Auto-block logic       │
└─────────────────────┘        └──────────────────────────┘
```

## Test Scenarios

### Test 1: Valid PNG Upload - Happy Path

**Description**: Upload a valid PNG file and successfully extract tokens.

**Steps**:
1. Select a valid PNG file (< 10MB, > 50x50px)
2. Frontend validates file (client-side)
3. Click "Extract Tokens"
4. Backend validates file (server-side)
5. Backend extracts tokens with GPT-4V
6. Frontend displays extracted tokens

**Expected Result**:
- ✅ Client-side validation passes
- ✅ File preview shown
- ✅ Backend validation passes
- ✅ Response includes `metadata.security_validated: true`
- ✅ Tokens displayed successfully

**API Response**:
```json
{
  "tokens": { ... },
  "metadata": {
    "filename": "design.png",
    "image": { "width": 1920, "height": 1080, ... },
    "extraction_method": "gpt-4v",
    "security_validated": true
  },
  "confidence": { ... }
}
```

---

### Test 2: Invalid File Type - PDF

**Description**: Attempt to upload a PDF file and verify rejection.

**Steps**:
1. Select a PDF file
2. Frontend validates file (client-side)

**Expected Result**:
- ❌ Client-side validation fails immediately
- ❌ Error message: "📄 Invalid file type. Please select PNG, JPG, or SVG."
- ❌ File is not uploaded to backend
- ✅ "Try Another File" button shown

**Backend**: Not called (client-side rejection)

---

### Test 3: Oversized File - 15MB PNG

**Description**: Attempt to upload a PNG file larger than 10MB.

**Steps**:
1. Select a PNG file > 10MB
2. Frontend validates file (client-side)

**Expected Result**:
- ❌ Client-side validation fails
- ❌ Error message: "📦 File size exceeds maximum of 10MB. Please compress your image."
- ❌ File is not uploaded to backend
- ✅ "Try Another File" button shown

**Backend**: Not called (client-side rejection)

---

### Test 4: SVG with Malicious Script

**Description**: Upload an SVG file containing embedded JavaScript.

**Steps**:
1. Select malicious.svg containing `<script>alert('xss')</script>`
2. Frontend validates file (client-side SVG scan)
3. Frontend detects script tag
4. File is rejected

**Expected Result**:
- ❌ Client-side validation fails
- ❌ Error message: "⚠️ This SVG file cannot be processed for security reasons..."
- ❌ File is not uploaded to backend

**Malicious SVG Example**:
```svg
<svg>
  <script>alert('xss')</script>
  <circle cx="50" cy="50" r="40" />
</svg>
```

**Fallback**: If client-side check misses it, backend will catch it:
- Backend returns 400 error
- Error detail: "SVG contains forbidden pattern..."
- Frontend displays: "⚠️ Security Alert: This SVG file contains potentially malicious content..."

---

### Test 5: MIME Type Spoofing Attack

**Description**: Upload a PHP file renamed as .png with fake MIME type.

**Steps**:
1. Create malicious.php.png with Content-Type: image/png
2. Frontend accepts it (trusts browser MIME type)
3. Backend validates with python-magic (magic number detection)
4. Backend detects actual file type is not an image

**Expected Result**:
- ✅ Client-side validation passes (trusts browser)
- ❌ Backend validation fails (content-based detection)
- ❌ Backend returns 400 error
- ❌ Error detail: "Content-Type mismatch detected..."
- ✅ Frontend displays: "⚠️ File Type Mismatch: The file extension doesn't match..."

**Backend Response**:
```json
{
  "detail": "Content-Type mismatch detected. Declared: image/png, Actual: text/x-php"
}
```

---

### Test 6: PII Detection Warning (PII_DETECTION_ENABLED=true)

**Description**: Upload screenshot containing SSN and verify PII detection.

**Prerequisites**: 
- Set `PII_DETECTION_ENABLED=true` in backend/.env
- Set `OPENAI_API_KEY` in backend/.env

**Steps**:
1. Select screenshot containing "SSN: 123-45-6789"
2. Frontend validates file (client-side)
3. Click "Extract Tokens"
4. Backend validates file
5. Backend runs PII detection with GPT-4V
6. Backend detects PII but doesn't block (auto_block=False for screenshots)
7. Backend logs warning
8. Backend returns tokens with PII metadata

**Expected Result**:
- ✅ Client-side validation passes
- ✅ Backend security validation passes
- ⚠️  Backend detects PII (logged but not blocking)
- ✅ Tokens extracted successfully
- ✅ Response includes `metadata.pii_check` with results

**API Response**:
```json
{
  "tokens": { ... },
  "metadata": {
    "filename": "screenshot-with-data.png",
    "image": { ... },
    "extraction_method": "gpt-4v",
    "security_validated": true,
    "pii_check": {
      "performed": true,
      "has_pii": true,
      "confidence": 0.95
    }
  }
}
```

**Backend Logs**:
```
WARNING: PII detected in screenshot (not blocking): ['ssn', 'phone_number']
```

---

### Test 7: Decompression Bomb Attack

**Description**: Upload an image with excessive resolution to exhaust memory.

**Steps**:
1. Upload image with 30 million pixels (e.g., 6000x5000)
2. Frontend validates dimensions
3. Frontend rejects file

**Expected Result**:
- ❌ Client-side validation fails
- ❌ Error message: "📐 Image resolution exceeds maximum..."
- ❌ File is not uploaded to backend

**Fallback**: If client-side check misses it, backend will catch it:
- Backend returns 400 error
- Error detail: "Image resolution too high: 6000x5000 = 30000000 pixels..."
- Frontend displays: "📐 Image Resolution Too High: Please use an image with fewer than 25 million pixels..."

---

### Test 8: Corrupted Image File

**Description**: Upload a corrupted PNG file that cannot be decoded.

**Steps**:
1. Upload corrupted.png with invalid data
2. Frontend uploads to backend (can't detect corruption client-side)
3. Backend attempts to validate with PIL
4. PIL raises exception

**Expected Result**:
- ✅ Client-side validation passes (file appears valid)
- ❌ Backend validation fails (PIL cannot decode)
- ❌ Backend returns 400 error
- ❌ Error detail: "Corrupted or invalid image file..."
- ✅ Frontend displays: "❌ Corrupted Image: This file appears to be corrupted..."

---

### Test 9: Retry After Validation Failure

**Description**: Upload invalid file, then retry with valid file.

**Steps**:
1. Upload invalid.txt
2. Client-side validation fails
3. Error displayed with "Try Another File" button
4. Click "Try Another File"
5. Upload valid.png
6. Validation passes
7. Extract tokens successfully

**Expected Result**:
- ❌ First upload rejected
- ✅ Error message shown
- ✅ Retry button visible
- ✅ Second upload succeeds
- ✅ Tokens extracted

---

### Test 10: Network Error Handling

**Description**: Backend is down or unreachable during upload.

**Steps**:
1. Stop backend server
2. Upload valid.png
3. Client-side validation passes
4. Click "Extract Tokens"
5. API request fails (network error)

**Expected Result**:
- ✅ Client-side validation passes
- ❌ API request fails
- ❌ Error message: "Unable to connect to server. Please check your connection."
- ✅ User can retry when server is back

---

## API Contract Verification

### Endpoint: POST /api/v1/tokens/extract/screenshot

**Request**:
```
Content-Type: multipart/form-data

file: <binary data>
```

**Success Response (200)**:
```json
{
  "tokens": {
    "colors": { ... },
    "typography": { ... },
    "spacing": { ... },
    "borderRadius": { ... }
  },
  "metadata": {
    "filename": "design.png",
    "image": {
      "width": 1920,
      "height": 1080,
      "format": "PNG",
      "mode": "RGB",
      "size_bytes": 524288
    },
    "extraction_method": "gpt-4v",
    "security_validated": true,
    "pii_check": {
      "performed": true,
      "has_pii": false,
      "confidence": 0.98
    }
  },
  "confidence": {
    "colors": 0.95,
    "typography": 0.88,
    "spacing": 0.92,
    "borderRadius": 0.85
  },
  "fallbacks_used": [],
  "review_needed": []
}
```

**Error Response (400 - Validation Error)**:
```json
{
  "detail": "File too large: 15.2MB. Maximum size is 10.0MB."
}
```

**Error Response (400 - Security Error)**:
```json
{
  "detail": "SVG contains forbidden pattern: <script[^>]*>. SVG files must not contain scripts or embedded content."
}
```

**Error Response (500 - Server Error)**:
```json
{
  "detail": "Failed to extract tokens: GPT-4V API error"
}
```

---

## Running Integration Tests

### Manual Testing

1. **Start backend**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn src.main:app --reload
   ```

2. **Start frontend**:
   ```bash
   cd app
   npm run dev
   ```

3. **Navigate to**: http://localhost:3000/extract

4. **Test each scenario** listed above

### E2E Tests (Automated)

```bash
cd app
npm run test:e2e
```

The E2E test suite in `app/e2e/upload-validation.spec.ts` covers most scenarios automatically.

---

## Success Criteria

### Backend (✅ Complete - PR #73)
- [x] Security validation implemented
- [x] PII detection implemented
- [x] Error responses follow standard format
- [x] Security events logged
- [x] Tests pass (27+ security tests)

### Frontend (✅ Complete - PR #74)
- [x] Client-side validation implemented
- [x] Error handling implemented
- [x] User-friendly error messages
- [x] Retry functionality
- [x] Tests pass (11+ validation tests)

### Integration (✅ Complete - This PR)
- [x] TypeScript types match backend response
- [x] API client handles all error scenarios
- [x] Error messages are user-friendly
- [x] End-to-end flow works
- [x] Integration documented

---

## Security Compliance

This integration addresses:

- ✅ **OWASP A03:2021** - Injection
  - XSS prevention (SVG script detection)
  - Code injection prevention (content-based validation)

- ✅ **OWASP A04:2021** - Insecure Design
  - Defense in depth (client + server validation)
  - Magic number validation (MIME spoofing prevention)

- ✅ **OWASP A05:2021** - Security Misconfiguration
  - Proper validation at all layers
  - Secure defaults (PII detection optional)

- ✅ **GDPR** - Privacy Protection
  - PII detection and logging
  - User data protection

- ✅ **SOC 2** - Security Monitoring
  - Structured security event logging
  - Audit trail for compliance

---

## Troubleshooting

### Issue: Backend returns 500 error on valid image

**Cause**: OpenAI API key not configured or GPT-4V unavailable.

**Solution**:
1. Check `OPENAI_API_KEY` in `backend/.env`
2. Check backend logs for specific error
3. Verify OpenAI account has GPT-4V access

### Issue: PII detection not running

**Cause**: `PII_DETECTION_ENABLED` not set to true.

**Solution**:
1. Set `PII_DETECTION_ENABLED=true` in `backend/.env`
2. Restart backend server
3. Check backend logs for "PII detection" messages

### Issue: Client-side validation too strict

**Cause**: Validation thresholds too conservative.

**Solution**: Adjust in `app/src/lib/validation/image-upload-validator.ts`:
```typescript
const MAX_FILE_SIZE_MB = 10; // Increase if needed
const MAX_PIXELS = 25_000_000; // Increase if needed
```

### Issue: SVG validation blocking valid files

**Cause**: SVG contains legitimate external references.

**Solution**: Update allowed patterns in validation logic or use PNG/JPG instead.

---

## Monitoring

### Backend Metrics (Epic 003 Story 3.5 - Optional)

When monitoring is implemented, track:
- `security_events_total{event_type="validation_failure"}`
- `pii_detections_total{entity_type="ssn"}`
- `security_events_total{event_type="svg_security_violation"}`

### Logs

**Security validation success**:
```
INFO: Security validation passed: {'mime_type': 'image/png', 'size': 524288, ...}
```

**Security validation failure**:
```
WARNING: Security validation failed: File too large: 15.2MB
```

**PII detection warning**:
```
WARNING: PII detected in screenshot (not blocking): ['email', 'phone_number']
```

---

## References

- Epic document: `.claude/epics/epic-003-safety-guardrails.md`
- Backend implementation: PR #73
- Frontend implementation: PR #74
- Integration implementation: This PR
- Security README: `backend/src/security/README.md`
