# Epic 9: Security & Authentication (Phase 2)

**Status**: Not Started
**Priority**: Medium
**Epic Owner**: Security/Backend Team
**Estimated Tasks**: 8
**Depends On**: Epic 0 (Project Setup)

---

## Overview

Build production-grade security infrastructure including secure Figma PAT storage in vault, OAuth 2.0 flow for better UX, JWT authentication for API access, API key management, input sanitization, rate limiting per user, MFA support, and comprehensive audit logging.

---

## Goals

1. Secure Figma PAT storage using secrets vault
2. Implement OAuth 2.0 flow for Figma integration
3. Add JWT authentication for API endpoints
4. Build API key management system
5. Implement input validation and sanitization
6. Add rate limiting per user/API key
7. Support MFA (multi-factor authentication)
8. Implement comprehensive audit logging

---

## Success Criteria

- ✅ Figma PATs never logged or exposed
- ✅ OAuth 2.0 flow works for Figma auth
- ✅ JWT tokens issued and validated correctly
- ✅ API keys managed securely with rotation
- ✅ All inputs validated and sanitized
- ✅ Rate limiting prevents abuse (per user/key)
- ✅ MFA supported via TOTP
- ✅ All sensitive actions logged in audit trail
- ✅ Security headers configured (CORS, CSP, etc.)
- ✅ Pass security audit with no critical findings

---

## Tasks

### Task 1: Figma PAT Secure Storage
**Acceptance Criteria**:
- [ ] Integrate secrets vault (HashiCorp Vault or AWS Secrets Manager)
- [ ] Encrypt PATs at rest with AES-256
- [ ] Encrypt PATs in transit with TLS
- [ ] Store PATs in vault, not database
- [ ] Reference PATs by vault path/ID
- [ ] Never log PAT values in plaintext
- [ ] Rotate vault encryption keys regularly
- [ ] Audit access to PATs
- [ ] Provide PAT deletion endpoint

**Files**:
- `backend/src/core/secrets_vault.py`
- `backend/src/services/figma_auth.py`

**Secrets Vault Integration**:
```python
import hvac
from cryptography.fernet import Fernet
import os

class SecretsVault:
    def __init__(self):
        # Use HashiCorp Vault
        self.client = hvac.Client(
            url=os.getenv('VAULT_ADDR'),
            token=os.getenv('VAULT_TOKEN')
        )

        # Verify vault is accessible
        if not self.client.is_authenticated():
            raise Exception("Vault authentication failed")

    async def store_figma_pat(self, user_id: str, pat: str) -> str:
        """Store Figma PAT securely in vault."""
        # Generate unique path for user's PAT
        secret_path = f"figma/pat/{user_id}"

        # Store in vault
        self.client.secrets.kv.v2.create_or_update_secret(
            path=secret_path,
            secret={'token': pat}
        )

        # Return reference (not the PAT itself)
        return secret_path

    async def retrieve_figma_pat(self, user_id: str) -> str:
        """Retrieve Figma PAT from vault."""
        secret_path = f"figma/pat/{user_id}"

        try:
            response = self.client.secrets.kv.v2.read_secret_version(
                path=secret_path
            )
            return response['data']['data']['token']
        except Exception as e:
            logger.error(f"Failed to retrieve PAT for {user_id}")
            raise

    async def delete_figma_pat(self, user_id: str):
        """Delete Figma PAT from vault."""
        secret_path = f"figma/pat/{user_id}"
        self.client.secrets.kv.v2.delete_metadata_and_all_versions(
            path=secret_path
        )

    async def rotate_encryption_key(self):
        """Rotate vault encryption key."""
        # Trigger vault key rotation
        self.client.sys.rotate_encryption_key()

# Usage in Figma client
class FigmaClient:
    def __init__(self, vault: SecretsVault):
        self.vault = vault

    async def fetch_file(self, user_id: str, file_key: str):
        """Fetch Figma file using user's PAT."""
        # Retrieve PAT from vault (never from database)
        pat = await self.vault.retrieve_figma_pat(user_id)

        # Use PAT for API call
        headers = {'X-Figma-Token': pat}
        response = await self.http.get(
            f'https://api.figma.com/v1/files/{file_key}',
            headers=headers
        )

        # Never log the PAT
        logger.info(f"Fetched Figma file {file_key} for user {user_id}")

        return response.json()
```

**Security Checklist**:
- [ ] PATs never in database
- [ ] PATs never in logs
- [ ] Vault access audited
- [ ] TLS for all vault communication
- [ ] Regular key rotation

**Tests**:
- PAT stored and retrieved correctly
- Vault communication encrypted
- Deletion works
- No PATs in logs

---

### Task 2: OAuth 2.0 Flow for Figma
**Acceptance Criteria**:
- [ ] Implement OAuth 2.0 authorization code flow
- [ ] Register OAuth app with Figma
- [ ] Redirect user to Figma authorization page
- [ ] Handle authorization callback
- [ ] Exchange code for access token
- [ ] Store access token in vault
- [ ] Refresh token when expired
- [ ] Handle OAuth errors gracefully
- [ ] Provide "Connect Figma" button in UI

**Files**:
- `backend/src/auth/figma_oauth.py`
- `app/src/components/auth/FigmaConnect.tsx`

**OAuth Implementation**:
```python
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from starlette.responses import RedirectResponse

oauth = OAuth()
oauth.register(
    name='figma',
    client_id=os.getenv('FIGMA_CLIENT_ID'),
    client_secret=os.getenv('FIGMA_CLIENT_SECRET'),
    authorize_url='https://www.figma.com/oauth',
    authorize_params={'scope': 'files:read'},
    access_token_url='https://www.figma.com/api/oauth/token',
    access_token_params=None,
    client_kwargs={'scope': 'files:read'}
)

class FigmaOAuth:
    def __init__(self, vault: SecretsVault):
        self.vault = vault

    async def authorize(self, request: Request):
        """Redirect to Figma authorization page."""
        redirect_uri = request.url_for('figma_callback')
        return await oauth.figma.authorize_redirect(request, redirect_uri)

    async def callback(self, request: Request, user_id: str):
        """Handle OAuth callback."""
        try:
            # Exchange code for token
            token = await oauth.figma.authorize_access_token(request)

            # Store access token in vault
            await self.vault.store_figma_pat(
                user_id=user_id,
                pat=token['access_token']
            )

            # Store refresh token if provided
            if 'refresh_token' in token:
                await self.vault.store_figma_refresh_token(
                    user_id=user_id,
                    refresh_token=token['refresh_token']
                )

            return RedirectResponse(url='/dashboard?figma=connected')

        except Exception as e:
            logger.error(f"OAuth callback error: {e}")
            return RedirectResponse(url='/dashboard?figma=error')

    async def refresh_token(self, user_id: str):
        """Refresh expired access token."""
        refresh_token = await self.vault.retrieve_figma_refresh_token(user_id)

        response = await self.http.post(
            'https://www.figma.com/api/oauth/refresh',
            data={
                'client_id': os.getenv('FIGMA_CLIENT_ID'),
                'client_secret': os.getenv('FIGMA_CLIENT_SECRET'),
                'refresh_token': refresh_token
            }
        )

        new_token = response.json()
        await self.vault.store_figma_pat(
            user_id=user_id,
            pat=new_token['access_token']
        )

        return new_token['access_token']

# API routes
@app.get('/auth/figma')
async def figma_auth(request: Request):
    return await figma_oauth.authorize(request)

@app.get('/auth/figma/callback')
async def figma_callback(request: Request, user: User = Depends(get_current_user)):
    return await figma_oauth.callback(request, user.id)
```

**Frontend Component**:
```tsx
'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function FigmaConnect() {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    // Redirect to OAuth endpoint
    window.location.href = '/api/auth/figma';
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={connecting}
      className="flex items-center gap-2"
    >
      {connecting ? 'Connecting...' : 'Connect Figma Account'}
    </Button>
  );
}
```

**Tests**:
- OAuth flow completes successfully
- Tokens stored in vault
- Token refresh works
- Error handling correct

---

### Task 3: JWT Authentication
**Acceptance Criteria**:
- [ ] Issue JWT tokens on login
- [ ] JWT payload includes: user_id, email, roles, exp
- [ ] Sign JWTs with RS256 (asymmetric)
- [ ] Validate JWT signature on every request
- [ ] Check token expiration
- [ ] Implement token refresh mechanism
- [ ] Support token revocation (blacklist)
- [ ] Add JWT to Authorization header
- [ ] Return 401 for invalid/expired tokens

**Files**:
- `backend/src/auth/jwt_handler.py`
- `backend/src/middleware/auth_middleware.py`

**JWT Implementation**:
```python
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

class JWTHandler:
    def __init__(self, secret_key: str, algorithm: str = "RS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire = timedelta(hours=1)
        self.refresh_token_expire = timedelta(days=30)

    def create_access_token(self, user_id: str, email: str,
                           roles: list[str]) -> str:
        """Create JWT access token."""
        payload = {
            "sub": user_id,
            "email": email,
            "roles": roles,
            "type": "access",
            "exp": datetime.utcnow() + self.access_token_expire,
            "iat": datetime.utcnow()
        }

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(self, user_id: str) -> str:
        """Create JWT refresh token."""
        payload = {
            "sub": user_id,
            "type": "refresh",
            "exp": datetime.utcnow() + self.refresh_token_expire,
            "iat": datetime.utcnow()
        }

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str) -> dict:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )

            # Check if token is blacklisted
            if await self._is_blacklisted(token):
                raise HTTPException(status_code=401, detail="Token revoked")

            return payload

        except JWTError as e:
            raise HTTPException(status_code=401, detail="Invalid token")

    async def _is_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted (revoked)."""
        # Check Redis for blacklisted tokens
        return await redis.exists(f"blacklist:{token}")

    async def revoke_token(self, token: str):
        """Revoke (blacklist) token."""
        # Decode to get expiration
        payload = jwt.decode(
            token,
            self.secret_key,
            algorithms=[self.algorithm],
            options={"verify_exp": False}
        )

        # Add to blacklist with TTL matching token expiration
        ttl = payload['exp'] - datetime.utcnow().timestamp()
        await redis.setex(f"blacklist:{token}", int(ttl), "1")

# Dependency for protected routes
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """Extract user from JWT token."""
    token = credentials.credentials
    payload = jwt_handler.verify_token(token)
    return payload

# Protected endpoint
@app.get('/api/v1/profile')
async def get_profile(user: dict = Depends(get_current_user)):
    return {
        "user_id": user['sub'],
        "email": user['email'],
        "roles": user['roles']
    }
```

**Tests**:
- Tokens issued correctly
- Signature validation works
- Expiration enforced
- Revocation works
- Protected endpoints reject invalid tokens

---

### Task 4: API Key Management
**Acceptance Criteria**:
- [ ] Generate API keys for programmatic access
- [ ] API key format: `cf_live_xxxxxxxxxxxx` (prefix + random)
- [ ] Hash API keys before storing (bcrypt)
- [ ] Support multiple keys per user
- [ ] Allow key naming and scoping (permissions)
- [ ] Implement key rotation (deprecate old, issue new)
- [ ] Track key usage (last used, request count)
- [ ] Provide API key management UI
- [ ] Revoke API keys endpoint

**Files**:
- `backend/src/auth/api_key_manager.py`
- `app/src/components/settings/APIKeys.tsx`

**API Key Manager**:
```python
import secrets
import bcrypt
from datetime import datetime

class APIKeyManager:
    def __init__(self, db):
        self.db = db

    def generate_key(self, user_id: str, name: str,
                    scopes: list[str] = None) -> dict:
        """Generate new API key."""
        # Generate random key
        random_part = secrets.token_urlsafe(32)
        api_key = f"cf_live_{random_part}"

        # Hash for storage
        key_hash = bcrypt.hashpw(api_key.encode(), bcrypt.gensalt())

        # Store in database
        key_record = APIKey(
            user_id=user_id,
            name=name,
            key_hash=key_hash.decode(),
            scopes=scopes or ["read", "write"],
            created_at=datetime.utcnow(),
            last_used=None,
            request_count=0,
            status="active"
        )

        self.db.add(key_record)
        self.db.commit()

        # Return plaintext key (only shown once)
        return {
            "key_id": key_record.id,
            "api_key": api_key,  # Show only at creation
            "name": name,
            "scopes": scopes,
            "created_at": key_record.created_at
        }

    async def verify_key(self, api_key: str) -> dict:
        """Verify API key and return associated user."""
        # Extract prefix
        if not api_key.startswith("cf_live_"):
            raise ValueError("Invalid API key format")

        # Query all active keys
        keys = await self.db.query(APIKey).filter(
            APIKey.status == "active"
        ).all()

        # Check each key hash
        for key_record in keys:
            if bcrypt.checkpw(api_key.encode(), key_record.key_hash.encode()):
                # Update last used
                key_record.last_used = datetime.utcnow()
                key_record.request_count += 1
                await self.db.commit()

                return {
                    "user_id": key_record.user_id,
                    "scopes": key_record.scopes,
                    "key_id": key_record.id
                }

        raise ValueError("Invalid API key")

    async def revoke_key(self, key_id: str, user_id: str):
        """Revoke API key."""
        key = await self.db.query(APIKey).filter(
            APIKey.id == key_id,
            APIKey.user_id == user_id
        ).first()

        if key:
            key.status = "revoked"
            key.revoked_at = datetime.utcnow()
            await self.db.commit()

    async def rotate_key(self, old_key_id: str, user_id: str) -> dict:
        """Rotate API key (deprecate old, create new)."""
        old_key = await self.db.query(APIKey).filter(
            APIKey.id == old_key_id,
            APIKey.user_id == user_id
        ).first()

        if not old_key:
            raise ValueError("Key not found")

        # Mark old key as deprecated (but still valid for grace period)
        old_key.status = "deprecated"
        old_key.deprecated_at = datetime.utcnow()

        # Create new key
        new_key = self.generate_key(
            user_id=user_id,
            name=f"{old_key.name} (rotated)",
            scopes=old_key.scopes
        )

        return new_key

# Middleware for API key authentication
async def verify_api_key(api_key: str = Header(...)):
    """Verify API key from header."""
    try:
        result = await api_key_manager.verify_key(api_key)
        return result
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid API key")

# Protected endpoint with API key
@app.post('/api/v1/generate')
async def generate(request: GenerateRequest,
                  api_auth: dict = Depends(verify_api_key)):
    user_id = api_auth['user_id']
    # ... generation logic
```

**Tests**:
- API keys generated correctly
- Verification works
- Revocation works
- Rotation creates new key
- Usage tracking accurate

---

### Task 5: Input Validation & Sanitization
**Acceptance Criteria**:
- [ ] Validate all user inputs using Pydantic models
- [ ] Sanitize strings to prevent XSS
- [ ] Validate URLs (Figma, screenshots)
- [ ] Limit file upload sizes (10MB max)
- [ ] Validate file types (PNG, JPG only)
- [ ] Sanitize JSON inputs
- [ ] Prevent SQL injection with parameterized queries
- [ ] Validate token values (hex colors, px values)
- [ ] Rate limit input validation failures

**Files**:
- `backend/src/validation/input_validator.py`
- `backend/src/validation/sanitizer.py`

**Input Validation**:
```python
from pydantic import BaseModel, validator, HttpUrl
import bleach
import re

class GenerateRequest(BaseModel):
    figma_url: HttpUrl
    component_type: str
    tokens: dict
    requirements: dict | None = None

    @validator('figma_url')
    def validate_figma_url(cls, v):
        """Ensure URL is from Figma domain."""
        if not v.host.endswith('figma.com'):
            raise ValueError('URL must be from figma.com')
        return v

    @validator('component_type')
    def validate_component_type(cls, v):
        """Validate component type."""
        allowed = ['Button', 'Card', 'Input', 'Select', 'Badge']
        if v not in allowed:
            raise ValueError(f'Component type must be one of {allowed}')
        return v

    @validator('tokens')
    def validate_tokens(cls, v):
        """Validate token structure and values."""
        if 'colors' in v:
            for name, value in v['colors'].items():
                if not re.match(r'^#[0-9A-Fa-f]{6}$', value):
                    raise ValueError(f'Invalid color value: {value}')

        if 'typography' in v:
            if 'fontSize' in v['typography']:
                if not re.match(r'^\d+px$', v['typography']['fontSize']):
                    raise ValueError('Font size must be in px')

        return v

class Sanitizer:
    @staticmethod
    def sanitize_html(text: str) -> str:
        """Remove HTML tags and dangerous content."""
        return bleach.clean(
            text,
            tags=[],  # No tags allowed
            strip=True
        )

    @staticmethod
    def sanitize_json(data: dict) -> dict:
        """Sanitize string values in JSON."""
        if isinstance(data, dict):
            return {
                k: Sanitizer.sanitize_json(v)
                for k, v in data.items()
            }
        elif isinstance(data, list):
            return [Sanitizer.sanitize_json(item) for item in data]
        elif isinstance(data, str):
            return Sanitizer.sanitize_html(data)
        else:
            return data

    @staticmethod
    def validate_file_upload(file: UploadFile):
        """Validate uploaded file."""
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        size = file.file.tell()
        file.file.seek(0)  # Reset

        if size > 10 * 1024 * 1024:  # 10MB
            raise ValueError('File too large (max 10MB)')

        # Check file type
        allowed_types = ['image/png', 'image/jpeg', 'image/jpg']
        if file.content_type not in allowed_types:
            raise ValueError(f'Invalid file type: {file.content_type}')

        return True

# Usage in endpoint
@app.post('/api/v1/generate')
async def generate(request: GenerateRequest):  # Pydantic validation automatic
    # Sanitize additional inputs
    sanitized_tokens = Sanitizer.sanitize_json(request.tokens)
    # ... generation logic
```

**Tests**:
- Invalid inputs rejected
- XSS attempts blocked
- SQL injection prevented
- File validation works
- Sanitization preserves valid data

---

### Task 6: Rate Limiting
**Acceptance Criteria**:
- [ ] Implement rate limiting per user/API key
- [ ] Limits by endpoint:
  - Token extraction: 100/hour
  - Pattern retrieval: 500/hour
  - Code generation: 50/hour
  - Validation: 200/hour
- [ ] Use Redis for rate limit counters
- [ ] Return 429 with Retry-After header
- [ ] Display remaining quota in response headers
- [ ] Support rate limit tiers (free, pro, enterprise)
- [ ] Allow temporary rate limit increases

**Files**:
- `backend/src/middleware/rate_limiter.py`

**Rate Limiter**:
```python
from fastapi import Request, HTTPException
from redis.asyncio import Redis
from datetime import datetime

class RateLimiter:
    def __init__(self, redis: Redis):
        self.redis = redis

    async def check_limit(self, user_id: str, endpoint: str,
                         limit: int, window: int = 3600):
        """Check if user has exceeded rate limit."""
        key = f"rate_limit:{user_id}:{endpoint}"
        current_time = datetime.utcnow().timestamp()
        window_start = current_time - window

        # Remove old entries
        await self.redis.zremrangebyscore(key, 0, window_start)

        # Count requests in window
        count = await self.redis.zcard(key)

        if count >= limit:
            # Get oldest entry to calculate retry-after
            oldest = await self.redis.zrange(key, 0, 0, withscores=True)
            if oldest:
                retry_after = int(oldest[0][1] + window - current_time)
            else:
                retry_after = window

            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded",
                headers={"Retry-After": str(retry_after)}
            )

        # Add current request
        await self.redis.zadd(key, {str(current_time): current_time})
        await self.redis.expire(key, window)

        # Return remaining quota
        remaining = limit - count - 1
        return remaining

# Dependency for rate-limited endpoints
async def rate_limit(
    request: Request,
    user: dict = Depends(get_current_user),
    limiter: RateLimiter = Depends(get_rate_limiter)
):
    """Rate limit middleware."""
    endpoint = request.url.path
    tier = user.get('tier', 'free')

    # Get limits for tier
    limits = {
        'free': {'generate': 50, 'extract': 100},
        'pro': {'generate': 500, 'extract': 1000},
        'enterprise': {'generate': 10000, 'extract': 10000}
    }

    limit_key = endpoint.split('/')[-1]  # e.g., 'generate'
    limit = limits[tier].get(limit_key, 100)

    remaining = await limiter.check_limit(
        user_id=user['sub'],
        endpoint=endpoint,
        limit=limit
    )

    # Add rate limit headers
    request.state.rate_limit_remaining = remaining
    request.state.rate_limit_limit = limit

# Endpoint with rate limiting
@app.post('/api/v1/generate')
async def generate(
    request: GenerateRequest,
    user: dict = Depends(get_current_user),
    rate_check = Depends(rate_limit)
):
    # ... generation logic
    pass

# Response middleware to add headers
@app.middleware("http")
async def add_rate_limit_headers(request: Request, call_next):
    response = await call_next(request)

    if hasattr(request.state, 'rate_limit_remaining'):
        response.headers['X-RateLimit-Remaining'] = str(
            request.state.rate_limit_remaining
        )
        response.headers['X-RateLimit-Limit'] = str(
            request.state.rate_limit_limit
        )

    return response
```

**Tests**:
- Rate limits enforced correctly
- 429 returned when exceeded
- Retry-After header set
- Different tiers have different limits
- Counters reset after window

---

### Task 7: Multi-Factor Authentication (MFA)
**Acceptance Criteria**:
- [ ] Support TOTP (Time-based One-Time Password) via apps like Google Authenticator
- [ ] Generate QR code for MFA setup
- [ ] Verify TOTP codes on login
- [ ] Provide backup codes (10 single-use codes)
- [ ] Allow MFA disable (with verification)
- [ ] Enforce MFA for sensitive operations
- [ ] Support recovery process if device lost

**Files**:
- `backend/src/auth/mfa.py`
- `app/src/components/settings/MFASetup.tsx`

**MFA Implementation**:
```python
import pyotp
import qrcode
import io
import base64

class MFAService:
    def __init__(self, db):
        self.db = db

    def generate_secret(self, user_id: str, email: str) -> dict:
        """Generate TOTP secret and QR code."""
        # Generate secret
        secret = pyotp.random_base32()

        # Create TOTP instance
        totp = pyotp.TOTP(secret)

        # Generate provisioning URI
        uri = totp.provisioning_uri(
            name=email,
            issuer_name="ComponentForge"
        )

        # Generate QR code
        qr = qrcode.make(uri)
        buffer = io.BytesIO()
        qr.save(buffer, format='PNG')
        qr_code = base64.b64encode(buffer.getvalue()).decode()

        # Generate backup codes
        backup_codes = self._generate_backup_codes()

        # Store secret (not yet enabled)
        mfa_record = MFASecret(
            user_id=user_id,
            secret=secret,
            backup_codes=[bcrypt.hashpw(code.encode(), bcrypt.gensalt()).decode()
                         for code in backup_codes],
            enabled=False
        )
        self.db.add(mfa_record)
        self.db.commit()

        return {
            "secret": secret,
            "qr_code": f"data:image/png;base64,{qr_code}",
            "backup_codes": backup_codes,
            "uri": uri
        }

    def verify_and_enable(self, user_id: str, code: str) -> bool:
        """Verify TOTP code and enable MFA."""
        mfa_record = self.db.query(MFASecret).filter(
            MFASecret.user_id == user_id
        ).first()

        if not mfa_record:
            return False

        # Verify code
        totp = pyotp.TOTP(mfa_record.secret)
        if totp.verify(code, valid_window=1):
            mfa_record.enabled = True
            self.db.commit()
            return True

        return False

    def verify_code(self, user_id: str, code: str) -> bool:
        """Verify TOTP code for login."""
        mfa_record = self.db.query(MFASecret).filter(
            MFASecret.user_id == user_id,
            MFASecret.enabled == True
        ).first()

        if not mfa_record:
            return False

        # Try TOTP code
        totp = pyotp.TOTP(mfa_record.secret)
        if totp.verify(code, valid_window=1):
            return True

        # Try backup codes
        for backup_hash in mfa_record.backup_codes:
            if bcrypt.checkpw(code.encode(), backup_hash.encode()):
                # Remove used backup code
                mfa_record.backup_codes.remove(backup_hash)
                self.db.commit()
                return True

        return False

    def _generate_backup_codes(self, count: int = 10) -> list[str]:
        """Generate backup codes."""
        return [
            ''.join(secrets.choice(string.digits) for _ in range(8))
            for _ in range(count)
        ]

# Login flow with MFA
@app.post('/auth/login')
async def login(email: str, password: str):
    user = await authenticate_user(email, password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check if MFA enabled
    mfa_enabled = await mfa_service.is_mfa_enabled(user.id)

    if mfa_enabled:
        # Return temporary token requiring MFA
        temp_token = create_temp_token(user.id)
        return {
            "mfa_required": True,
            "temp_token": temp_token
        }

    # No MFA, return access token
    access_token = jwt_handler.create_access_token(
        user_id=user.id,
        email=user.email,
        roles=user.roles
    )

    return {"access_token": access_token}

@app.post('/auth/mfa/verify')
async def verify_mfa(temp_token: str, code: str):
    """Verify MFA code and issue access token."""
    user_id = verify_temp_token(temp_token)

    if await mfa_service.verify_code(user_id, code):
        user = await get_user(user_id)
        access_token = jwt_handler.create_access_token(
            user_id=user.id,
            email=user.email,
            roles=user.roles
        )
        return {"access_token": access_token}

    raise HTTPException(status_code=401, detail="Invalid MFA code")
```

**Tests**:
- QR code generated correctly
- TOTP codes verified
- Backup codes work
- MFA enforced on login
- Recovery process works

---

### Task 8: Audit Logging
**Acceptance Criteria**:
- [ ] Log all sensitive actions:
  - Login/logout
  - API key creation/revocation
  - Component generation
  - Token changes
  - Settings changes
  - MFA enable/disable
- [ ] Audit log includes:
  - Timestamp
  - User ID
  - Action type
  - Resource ID
  - IP address
  - User agent
  - Result (success/failure)
- [ ] Store logs in PostgreSQL (append-only)
- [ ] Provide audit log viewer for admins
- [ ] Support log export (CSV, JSON)
- [ ] Retain logs for 1 year

**Files**:
- `backend/src/core/audit_logger.py`
- `backend/src/database/models.py` (AuditLog model)

**Audit Logger**:
```python
from sqlalchemy import Column, String, DateTime, JSON
from fastapi import Request

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)

    user_id = Column(String(255))
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50))
    resource_id = Column(String(255))

    ip_address = Column(String(45))
    user_agent = Column(String(500))

    details = Column(JSON)
    result = Column(String(20))  # success, failure

    __table_args__ = (
        Index('idx_user_id', 'user_id'),
        Index('idx_timestamp', 'timestamp'),
        Index('idx_action', 'action'),
    )

class AuditLogger:
    def __init__(self, db):
        self.db = db

    async def log(self, request: Request, user_id: str,
                 action: str, resource_type: str = None,
                 resource_id: str = None, details: dict = None,
                 result: str = "success"):
        """Log audit event."""
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=request.client.host,
            user_agent=request.headers.get('user-agent'),
            details=details,
            result=result
        )

        self.db.add(log_entry)
        await self.db.commit()

    async def get_user_logs(self, user_id: str,
                           start_date: datetime = None,
                           end_date: datetime = None,
                           limit: int = 100):
        """Get audit logs for user."""
        query = self.db.query(AuditLog).filter(
            AuditLog.user_id == user_id
        )

        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)

        return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

# Usage in endpoints
@app.post('/api/v1/generate')
async def generate(
    request: Request,
    data: GenerateRequest,
    user: dict = Depends(get_current_user)
):
    try:
        result = await generator.generate(data)

        # Log successful generation
        await audit_logger.log(
            request=request,
            user_id=user['sub'],
            action="component_generated",
            resource_type="component",
            resource_id=result['component_id'],
            details={"component_type": data.component_type}
        )

        return result

    except Exception as e:
        # Log failure
        await audit_logger.log(
            request=request,
            user_id=user['sub'],
            action="component_generation_failed",
            details={"error": str(e)},
            result="failure"
        )
        raise
```

**Tests**:
- All sensitive actions logged
- Log entries complete
- Query by user works
- Export works
- Logs immutable (append-only)

---

## Dependencies

**Requires**:
- Epic 0: Database and services set up

**Blocks**:
- Production deployment (security required)

---

## Technical Architecture

### Security Stack

```
User Request
     ↓
Rate Limiter
     ↓
Input Validation
     ↓
Authentication (JWT/API Key)
     ↓
Authorization (Roles/Scopes)
     ↓
MFA Check (if required)
     ↓
Business Logic
     ↓
Audit Logging
     ↓
Response
```

---

## Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Auth Failure Rate** | <1% | Failed auths / Total auths |
| **MFA Adoption** | ≥30% | Users with MFA enabled |
| **API Key Usage** | 40% of API calls | API key auths / Total |
| **Rate Limit Hits** | <5% | 429 responses / Total |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vault outage | Critical | Fallback to encrypted database, alerts |
| MFA lockout | Medium | Backup codes, recovery process |
| Rate limit too strict | Medium | Per-tier limits, temporary increases |
| Audit log storage costs | Low | Archival after 90 days, compression |

---

## Definition of Done

- [ ] All 8 tasks completed with acceptance criteria met
- [ ] Figma PATs secured in vault
- [ ] OAuth 2.0 flow functional
- [ ] JWT authentication working
- [ ] API key management complete
- [ ] Input validation comprehensive
- [ ] Rate limiting enforced
- [ ] MFA supported and tested
- [ ] Audit logging complete
- [ ] Security audit passed
- [ ] Documentation updated

---

## Related Epics

- **Depends On**: Epic 0
- **Blocks**: Production deployment
- **Related**: All epics (security applies everywhere)

---

## Notes

**Security First**: This epic is non-negotiable for production. Do not skip any tasks.

**Compliance**: Consider GDPR, SOC 2, and other compliance requirements early.

**Regular Audits**: Schedule quarterly security audits and penetration testing.
