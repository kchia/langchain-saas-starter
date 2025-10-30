# Authentication

ComponentForge uses Auth.js v5 (NextAuth) for authentication with JWT tokens.

## Overview

- **JWT-based authentication** with secure httpOnly cookies
- **Session management** with Redis backend
- **Multiple auth providers** supported
- **Automatic token refresh** for seamless UX

## Authentication Flow

### 1. User Login

```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "session": {
      "expires": "2025-10-15T14:00:00Z"
    }
  }
}
```

### 2. Token Storage

- JWT token stored in **secure httpOnly cookie**
- Not accessible via JavaScript (XSS protection)
- Automatic inclusion in subsequent requests

### 3. Protected Requests

```bash
# Token automatically sent via cookie
curl http://localhost:8000/api/v1/generate/screenshot \
  -X POST \
  -F "file=@screenshot.png"
```

### 4. Token Refresh

Tokens are automatically refreshed before expiration. No manual refresh needed.

### 5. User Logout

```bash
POST /api/auth/signout
```

## Environment Setup

### Backend Configuration

```bash
# backend/.env
AUTH_SECRET=your-32-char-secret-key-here
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db

# Generate secret
openssl rand -base64 32
```

### Frontend Configuration

```bash
# app/.env.local
AUTH_SECRET=same-as-backend-secret
NEXTAUTH_URL=http://localhost:3000
API_URL=http://localhost:8000
```

## Session Management

### Session Storage

- **Backend**: Redis with 7-day TTL
- **Cookie**: Secure, httpOnly, sameSite=lax
- **Refresh**: Automatic before expiration

### Session Structure

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "expires": "2025-10-15T14:00:00Z",
  "sessionToken": "..."
}
```

## Security Features

### Token Security

- ✅ **Secure httpOnly cookies** - No JavaScript access
- ✅ **CSRF protection** - Built-in token validation
- ✅ **Short expiration** - 7-day max lifetime
- ✅ **Automatic refresh** - Seamless token rotation

### Password Security

- ✅ **bcrypt hashing** - Industry-standard hashing
- ✅ **Salt rounds: 12** - Strong against brute force
- ✅ **Never logged** - Passwords never in logs
- ✅ **TLS encryption** - HTTPS in production

### API Security

- ✅ **Rate limiting** - Prevents abuse
- ✅ **CORS configuration** - Allowed origins only
- ✅ **Input validation** - Pydantic models
- ✅ **SQL injection prevention** - Parameterized queries

## Authentication Middleware

### FastAPI Dependency

```python
from src.core.auth import get_current_user

@router.post("/generate/screenshot")
async def generate_from_screenshot(
    file: UploadFile,
    current_user: User = Depends(get_current_user)
):
    # Only authenticated users reach here
    ...
```

### Next.js Middleware

```typescript
import { auth } from "@/auth"

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/signin") {
    return Response.redirect("/signin")
  }
})
```

## Error Responses

### Unauthorized (401)

```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### Invalid Token (401)

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token has expired or is invalid"
  }
}
```

### Forbidden (403)

```json
{
  "status": "error",
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

## Production Considerations

### HTTPS Required

```bash
# Force HTTPS in production
NEXTAUTH_URL=https://app.componentforge.com
```

### Cookie Configuration

```javascript
cookies: {
  sessionToken: {
    name: '__Secure-next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true  // HTTPS only
    }
  }
}
```

### Session Cleanup

Redis automatically expires sessions after TTL. Manual cleanup not needed.

## Troubleshooting

### "Invalid session" errors

1. Check AUTH_SECRET matches between frontend and backend
2. Verify Redis is running: `docker-compose ps`
3. Clear cookies and re-login
4. Check backend logs: `docker-compose logs backend`

### CORS errors

1. Add frontend URL to ALLOWED_ORIGINS in backend config
2. Verify credentials: 'include' in fetch requests
3. Check CORS middleware configuration

## See Also

- [API Overview](./overview.md)
- [Architecture Overview](../architecture/overview.md)
- [Security Guidelines](../deployment/security.md)
