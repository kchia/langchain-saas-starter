# Security Guidelines

Security best practices and guidelines for ComponentForge deployment.

## Authentication & Authorization

### JWT Security

- ✅ **Secure httpOnly cookies** - Prevents XSS attacks
- ✅ **Short token lifetime** - Maximum 7 days
- ✅ **Automatic rotation** - Tokens refreshed before expiry
- ✅ **Redis session storage** - Centralized session management

### Password Security

- ✅ **bcrypt hashing** - Industry-standard, salt rounds: 12
- ✅ **Password requirements** - Minimum 8 characters
- ✅ **Rate limiting** - Login attempt throttling
- ✅ **Never logged** - Passwords excluded from all logs

### Implementation

```python
# backend/src/core/security.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

## API Security

### Input Validation

All inputs validated with **Pydantic models**:

```python
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
```

### SQL Injection Prevention

- ✅ **Parameterized queries** - SQLAlchemy ORM
- ✅ **No raw SQL** - Unless absolutely necessary
- ✅ **Input sanitization** - Pydantic validation layer

```python
# Safe: Parameterized query
user = await db.execute(
    select(User).where(User.email == email)
)

# Unsafe: Never do this
# user = await db.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

### Rate Limiting

**Per-user rate limits:**

```python
# 100 requests per minute per user
@limiter.limit("100/minute")
@router.post("/generate/screenshot")
async def generate(...):
    ...
```

**Per-IP rate limits:**

```python
# 20 requests per minute for unauthenticated
@limiter.limit("20/minute")
@router.get("/health")
async def health_check():
    ...
```

### CORS Configuration

```python
# backend/src/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "https://app.componentforge.com"  # Production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

## Data Protection

### Environment Variables

**Never commit secrets to git:**

```bash
# .env (gitignored)
OPENAI_API_KEY=sk-proj-...
LANGCHAIN_API_KEY=lsv2_pt_...
AUTH_SECRET=your-32-char-secret
DATABASE_URL=postgresql+asyncpg://...
```

**Use .env.example for templates:**

```bash
# .env.example (committed)
OPENAI_API_KEY=your-openai-api-key
LANGCHAIN_API_KEY=your-langchain-api-key
AUTH_SECRET=generate-with-openssl-rand
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db
```

### Database Encryption

**At rest:**
- PostgreSQL encryption enabled in production
- Managed database services handle encryption automatically

**In transit:**
- TLS/SSL required for database connections
- `sslmode=require` in connection string

```python
DATABASE_URL = "postgresql+asyncpg://user:pass@host:5432/db?ssl=require"
```

### Sensitive Data Handling

- ✅ **API keys** - Never logged, never sent to frontend
- ✅ **User passwords** - Hashed, never stored plain
- ✅ **Session tokens** - Stored in Redis with TTL
- ✅ **Generated code** - User-owned, access-controlled

## HTTPS in Production

### Frontend (Vercel/Netlify)

Automatic HTTPS with managed certificates.

### Backend (Railway/Render)

```bash
# Force HTTPS
HTTPS_ONLY=true

# Set secure headers
app.add_middleware(
    SecurityHeadersMiddleware,
    hsts_max_age=31536000,
    frame_deny=True,
    content_type_nosniff=True,
    xss_protection=True
)
```

### Security Headers

```python
# backend/src/middleware/security.py
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response
```

## Monitoring & Logging

### Security Event Logging

```python
import logging

security_logger = logging.getLogger("security")

# Log authentication failures
security_logger.warning(
    "Failed login attempt",
    extra={"email": email, "ip": request.client.host}
)

# Log unauthorized access
security_logger.error(
    "Unauthorized access attempt",
    extra={"user_id": user.id, "endpoint": request.url.path}
)
```

### Log Sanitization

**Never log sensitive data:**

```python
# Bad: Logs password
logger.info(f"User login: {email}, password: {password}")

# Good: Logs only non-sensitive info
logger.info(f"User login attempt: {email}")
```

### Audit Trails

Track sensitive operations:

```python
@router.delete("/components/{id}")
async def delete_component(id: str, user: User = Depends(get_current_user)):
    audit_logger.info(
        "Component deleted",
        extra={
            "user_id": user.id,
            "component_id": id,
            "timestamp": datetime.utcnow()
        }
    )
```

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit
pip-audit

# Update dependencies
npm update
pip install --upgrade -r requirements.txt
```

### Vulnerability Scanning

**GitHub Dependabot** - Automatic PR for security updates

**Snyk** - Continuous vulnerability monitoring

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/app"
    schedule:
      interval: "weekly"

  - package-ecosystem: "pip"
    directory: "/backend"
    schedule:
      interval: "weekly"
```

## Docker Security

### Image Security

```dockerfile
# Use official base images
FROM python:3.11-slim

# Run as non-root user
RUN useradd -m -u 1000 appuser
USER appuser

# Copy only necessary files
COPY --chown=appuser:appuser requirements.txt .
```

### Container Scanning

```bash
# Scan for vulnerabilities
docker scan component-forge-backend:latest
```

## Incident Response

### Security Incident Checklist

1. **Identify** - Confirm the incident
2. **Contain** - Isolate affected systems
3. **Investigate** - Analyze logs and traces
4. **Remediate** - Fix vulnerability
5. **Document** - Record incident details
6. **Review** - Post-mortem and prevention

### Emergency Contacts

- **Security Team**: security@componentforge.com
- **On-Call**: Check internal docs for rotation

## Compliance

### Data Privacy

- ✅ **GDPR compliant** - User data export/deletion
- ✅ **Minimal data collection** - Only necessary info
- ✅ **Clear privacy policy** - Transparent practices

### Accessibility

- ✅ **WCAG 2.1 AA compliance** - Built-in axe-core testing
- ✅ **Keyboard navigation** - All features accessible
- ✅ **Screen reader support** - Proper ARIA attributes

## Security Checklist

### Development

- [ ] Use environment variables for secrets
- [ ] Validate all inputs with Pydantic
- [ ] Use parameterized queries (SQLAlchemy)
- [ ] Implement rate limiting on endpoints
- [ ] Hash passwords with bcrypt
- [ ] Enable CORS only for trusted origins

### Deployment

- [ ] Enable HTTPS/TLS
- [ ] Set security headers
- [ ] Configure firewall rules
- [ ] Enable database encryption
- [ ] Set up log monitoring
- [ ] Configure automated backups

### Ongoing

- [ ] Regular dependency updates
- [ ] Security vulnerability scanning
- [ ] Access log review
- [ ] Incident response drills
- [ ] Security training for team

## See Also

- [Authentication Guide](../api/authentication.md)
- [API Security](../api/overview.md)
- [Architecture Overview](../architecture/overview.md)
- [Deployment Guide](./overview.md)
