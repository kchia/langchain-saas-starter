# Security Module

This module implements safety guardrails for ComponentForge as specified in Epic 003 - Story 3.1.

## Components

### Input Validator (`input_validator.py`)

Provides comprehensive validation for file uploads and text inputs with **multi-layer security**:

**Features:**
- **Magic number detection**: Validates actual file content, not just headers
- **Content-Type verification**: Detects and logs header spoofing attempts
- **SVG bypass prevention**: SVG files are validated regardless of declared type
- Image file validation (PNG, JPG, JPEG, SVG)
- File size limits (10MB max)
- Image dimension validation (min 50x50, max 25MP)
- SVG security checks (detects embedded scripts, event handlers, XSS)
- Text input sanitization using nh3
- Protection against decompression bombs

**Security Improvements (v2):**
- ✅ Uses `python-magic` for content-based file type detection
- ✅ Prevents MIME type spoofing (e.g., SVG uploaded as PNG)
- ✅ Validates actual file content, not just HTTP headers
- ✅ Logs Content-Type mismatches for security auditing
- ✅ SVG validation runs on all SVG content, regardless of extension/header

**Classes:**
- `ImageUploadValidator`: Main validator for image uploads with magic number detection
- `RequirementInputValidator`: Validates and sanitizes requirement text inputs
- `PatternNameValidator`: Validates pattern/component names
- `DescriptionValidator`: Validates and sanitizes descriptions

**Example Usage:**

```python
from src.security.input_validator import ImageUploadValidator, InputValidationError
from fastapi import UploadFile

# Validate image upload with content verification
try:
    metadata = await ImageUploadValidator.validate_upload(file)
    print(f"✓ Image validated: {metadata}")
    print(f"  Declared type: {metadata['declared_mime']}")
    print(f"  Actual type: {metadata['actual_mime']}")
    print(f"  Content verified: {metadata['content_verified']}")
except InputValidationError as e:
    print(f"✗ Validation failed: {e}")

# Validate text input
from src.security.input_validator import RequirementInputValidator

validator = RequirementInputValidator(text="Create a button component")
sanitized_text = validator.text  # HTML tags removed
```

### PII Detector (`pii_detector.py`)

Uses GPT-4V to detect personally identifiable information (PII) in uploaded images:

**Features:**
- OCR and PII detection in a single API call
- Detects: emails, phone numbers, SSNs, credit cards, addresses, etc.
- Contextual analysis (distinguishes real PII from UI placeholders)
- Auto-block capability for uploads containing PII
- Compliance logging for audit trails

**Configuration:**
- Set `PII_DETECTION_ENABLED=true` in `.env` to enable PII scanning
- Uses OpenAI API key from `OPENAI_API_KEY` environment variable

**Example Usage:**

```python
from src.security.pii_detector import PIIDetector, PIIDetectionError
from PIL import Image

detector = PIIDetector()

# Scan image (auto-block if PII found)
try:
    result = await detector.scan_image(image, auto_block=True)
    if result.has_pii:
        print(f"Warning: PII detected - {result.entities_found}")
except PIIDetectionError as e:
    print(f"Blocked: {e}")

# Scan without blocking (for logging/warnings)
result = await detector.scan_image(image, auto_block=False)
if result.has_pii:
    logger.warning(f"PII detected: {result.entities_found}")
```

## Integration with API Endpoints

The security module is integrated into the token extraction endpoint (`/api/v1/tokens/extract/screenshot`):

1. **Security Validation**: File type, size, and content validation
2. **Image Processing**: Standard image validation and processing
3. **PII Detection**: Optional scanning for sensitive data (controlled by env var)
4. **Token Extraction**: Proceed with GPT-4V token extraction

## Environment Variables

```bash
# Enable PII detection (optional, defaults to false)
PII_DETECTION_ENABLED=true

# Required for PII detection
OPENAI_API_KEY=your_api_key_here
```

## Testing

Run security tests:

```bash
cd backend
source venv/bin/activate
pytest tests/security/ -v
```

**Test Coverage:**
- File type validation (PNG, JPG, JPEG, SVG)
- Magic number detection (content-based validation)
- Content-Type spoofing prevention
- SVG bypass prevention
- File size limits
- SVG script detection
- Image dimension validation
- Text sanitization
- PII detection with mocked responses
- Error handling

## Security Considerations

### Input Validation (Enhanced v2)
- **Content-Based Validation**: Uses `python-magic` to verify actual file content via magic numbers
- **MIME Type Verification**: Validates both HTTP headers and actual file content
- **Spoofing Prevention**: Detects when Content-Type header doesn't match actual content
- **SVG Bypass Prevention**: SVG files are validated regardless of declared MIME type or extension
- **File Type Whitelist**: Only PNG, JPG, JPEG, SVG allowed (verified by content, not headers)
- **Size Limits**: 10MB max file size, 25MP max resolution
- **SVG Sanitization**: Blocks `<script>`, `javascript:`, event handlers in all SVG content
- **Text Sanitization**: Removes all HTML tags using nh3

**Attack Vectors Mitigated:**
1. ✅ MIME type spoofing (e.g., PHP file with `Content-Type: image/png`)
2. ✅ SVG XSS bypass (e.g., SVG uploaded as PNG to skip validation)
3. ✅ Malicious file extensions (e.g., `malicious.svg.png`)
4. ✅ Decompression bombs (pixel limit enforcement)
5. ✅ HTML injection in text inputs (nh3 sanitization)

### PII Detection
- **Privacy**: Images are sent to OpenAI API for analysis
- **Auto-Block**: Optionally block uploads containing PII
- **Logging**: All PII detections are logged for compliance
- **Context-Aware**: Distinguishes real PII from UI placeholders

### Best Practices
1. Always validate inputs before processing
2. Monitor Content-Type mismatch logs for suspicious activity
3. Use auto-block for sensitive uploads (e.g., user-generated content)
4. Monitor PII detection logs for compliance
5. Keep nh3 and python-magic libraries updated for security patches
6. Review security logs regularly for attack patterns

## Dependencies

Required packages (in `requirements.txt`):
```
nh3>=0.2.0           # Modern HTML sanitizer
python-magic>=0.4.27 # File type detection
slowapi>=0.1.9       # Rate limiting (for future use)
Pillow               # Image processing
fastapi              # Web framework
pydantic             # Data validation
openai               # GPT-4V API (for PII detection)
```

## Future Enhancements

Story 3.1 and 3.2 are complete. Future stories will add:

- **Story 3.3**: Rate limiting with Redis
- **Story 3.4**: Prompt injection protection
- **Story 3.5**: Security monitoring dashboard

### Code Sanitizer (`code_sanitizer.py`)

Scans generated code for security vulnerabilities before returning to clients:

**Features:**
- Detects arbitrary code execution patterns (eval, Function constructor)
- Identifies XSS vulnerabilities (dangerouslySetInnerHTML, innerHTML)
- Checks for prototype pollution (__proto__)
- Detects SQL injection vulnerabilities (template literals, string concatenation)
- Finds hardcoded secrets and API keys (20+ character minimum)
- Flags suspicious environment variable access in client-side code
- Provides detailed issue tracking with line numbers and code snippets
- Categorizes issues by severity (critical, high, medium, low)

**Security Patterns Detected:**
- `eval()` - Critical: Arbitrary code execution
- `new Function()` - Critical: Code injection
- SQL injection (template literals) - Critical: Database attacks
- SQL injection (concatenation) - High: Database attacks
- `dangerouslySetInnerHTML` - High: XSS risk
- `innerHTML =` - High: XSS vulnerability
- `document.write()` - High: XSS risk
- `__proto__` - High: Prototype pollution
- Hardcoded API keys/secrets (20+ chars) - Critical: Credential exposure
- `process.env` in client code - Medium: Secret exposure

**Example Usage:**

```python
from src.security.code_sanitizer import CodeSanitizer

sanitizer = CodeSanitizer()

# Scan generated code
result = sanitizer.sanitize(
    generated_code,
    include_snippets=True
)

if not result.is_safe:
    print(f"⚠ Found {result.issues_count} security issues:")
    print(f"  Critical: {result.critical_count}")
    print(f"  High: {result.high_count}")
    print(f"  Medium: {result.medium_count}")
    
    for issue in result.issues:
        print(f"  Line {issue.line}: {issue.type.value} - {issue.message}")
else:
    print("✓ Code is safe")
```

**Integration:**
The code sanitizer is automatically run on all generated components in the `/api/v1/generate` endpoint. Results are included in the API response under `security_issues`.

### Security Metrics (`metrics.py`)

Prometheus metrics for monitoring security events:

**Metrics:**
- `code_sanitization_failures_total` - Counter for unsafe code patterns detected
- `pii_detections_total` - Counter for PII found in uploads
- `input_validation_failures_total` - Counter for input validation errors
- `security_events_total` - Counter for all security events

**Example Usage:**

```python
from src.security.metrics import record_code_sanitization_failure

# Record a security issue
record_code_sanitization_failure(pattern="eval", severity="critical")
```

## References

- Epic: `.claude/epics/epic-003-safety-guardrails.md`
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- nh3 docs: https://github.com/messense/nh3
