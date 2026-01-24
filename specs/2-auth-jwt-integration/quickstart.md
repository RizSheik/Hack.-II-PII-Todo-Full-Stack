# Quickstart Guide: Authentication & JWT Security Integration

**Feature**: 2-auth-jwt-integration
**Date**: 2026-01-09
**Purpose**: Setup and verification guide for JWT-based authentication integration

## Overview

This guide walks you through setting up JWT-based authentication between Better Auth (Next.js frontend) and FastAPI (Python backend). By the end, you'll have a working authentication system where users can log in, receive JWT tokens, and make authenticated API requests.

## Prerequisites

### Required Software
- **Node.js**: 18.0+ (for Next.js frontend)
- **Python**: 3.11+ (for FastAPI backend)
- **PostgreSQL**: 15+ (Neon Serverless or local)
- **Git**: For version control

### Required Knowledge
- Basic understanding of JWT tokens
- Familiarity with Next.js and FastAPI
- Understanding of REST APIs

### Existing Setup
- **Spec-1 Backend**: Todo Backend API must be implemented and working
- **Database**: PostgreSQL database with users and todos tables
- **Environment**: Development environment configured

## Setup Steps

### Step 1: Generate Shared Secret

Generate a secure shared secret for JWT signing/verification:

```bash
# Generate a random 32-character secret
openssl rand -base64 32
```

**Output Example**:
```
Kv8x7Y2mN9pQ3rT5wU6zA8bC1dE4fG7h
```

**Important**: Save this secret - you'll need it for both frontend and backend.

---

### Step 2: Configure Backend (FastAPI)

#### 2.1 Install Dependencies

Add PyJWT to backend requirements:

```bash
cd backend
echo "PyJWT==2.8.0" >> requirements.txt
pip install -r requirements.txt
```

#### 2.2 Update Environment Variables

Edit `backend/.env`:

```bash
# Existing variables
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-existing-jwt-secret  # Keep for backward compatibility

# NEW: Add Better Auth secret (use the generated secret from Step 1)
BETTER_AUTH_SECRET=Kv8x7Y2mN9pQ3rT5wU6zA8bC1dE4fG7h
```

**Important**: Use the SAME secret value in both frontend and backend.

#### 2.3 Update Configuration

Edit `backend/src/config.py`:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str  # Existing
    BETTER_AUTH_SECRET: str  # NEW
    APP_ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

#### 2.4 Create JWT Verification Module

Create `backend/src/core/auth.py`:

```python
import jwt
from fastapi import HTTPException, Header, Depends
from src.config import settings

async def verify_jwt_token(authorization: str = Header(None)) -> dict:
    """
    Verify JWT token from Authorization header.

    Args:
        authorization: Authorization header value (Bearer <token>)

    Returns:
        dict: JWT payload containing user_id, email, iat, exp

    Raises:
        HTTPException(401): If token is missing, invalid, or expired
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Missing authentication token",
                    "details": []
                }
            }
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Invalid token format",
                    "details": [{"field": "authorization", "message": "Must use Bearer token format"}]
                }
            }
        )

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )

        if "user_id" not in payload:
            raise HTTPException(
                status_code=401,
                detail={
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Invalid token claims",
                        "details": [{"field": "user_id", "message": "Missing user_id claim"}]
                    }
                }
            )

        if not isinstance(payload["user_id"], int):
            raise HTTPException(
                status_code=401,
                detail={
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Invalid user_id in token",
                        "details": [{"field": "user_id", "message": "user_id must be an integer"}]
                    }
                }
            )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Token expired",
                    "details": []
                }
            }
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Invalid token signature",
                    "details": [{"field": "token", "message": str(e)}]
                }
            }
        )


async def get_current_user_id(
    token_payload: dict = Depends(verify_jwt_token)
) -> int:
    """
    Extract user ID from verified JWT payload.

    Args:
        token_payload: Verified JWT payload

    Returns:
        int: Authenticated user ID
    """
    return token_payload["user_id"]
```

#### 2.5 Update Authorization Helper

Edit `backend/src/core/security.py` (add if not exists):

```python
from fastapi import HTTPException

def validate_user_access(token_user_id: int, resource_user_id: int) -> None:
    """
    Validate that authenticated user can access requested resource.

    Args:
        token_user_id: User ID from verified JWT token
        resource_user_id: User ID from route parameter

    Raises:
        HTTPException(403): If user IDs don't match
    """
    if token_user_id != resource_user_id:
        raise HTTPException(
            status_code=403,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "You can only access your own resources",
                    "details": []
                }
            }
        )
```

#### 2.6 Update Todo Endpoints

Edit `backend/src/api/routes/todos.py` to add authentication:

```python
from fastapi import APIRouter, Depends
from src.core.auth import get_current_user_id
from src.core.security import validate_user_access

router = APIRouter()

@router.get("/api/users/{user_id}/todos")
async def list_todos(
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),  # NEW
    db: Session = Depends(get_db)
):
    # NEW: Validate authorization
    validate_user_access(current_user_id, user_id)

    # Existing logic
    todos = db.query(Todo).filter(Todo.user_id == user_id).all()
    return todos

# Update all other endpoints similarly (POST, GET by ID, PUT, DELETE)
```

#### 2.7 Restart Backend

```bash
cd backend
uvicorn src.main:app --reload --port 8001
```

**Verify**: Backend starts without errors and logs show "Application startup complete"

---

### Step 3: Configure Frontend (Next.js + Better Auth)

#### 3.1 Install Dependencies

```bash
cd frontend
npm install better-auth
npm install @better-auth/jwt  # JWT plugin
```

#### 3.2 Update Environment Variables

Create/edit `frontend/.env.local`:

```bash
# Use the SAME secret from Step 1
BETTER_AUTH_SECRET=Kv8x7Y2mN9pQ3rT5wU6zA8bC1dE4fG7h

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8001
```

#### 3.3 Configure Better Auth

Create `frontend/src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { jwt } from "@better-auth/jwt";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,

  plugins: [
    jwt({
      algorithm: "HS256",
      expiresIn: "7d",  // 7 days
      claims: (user) => ({
        user_id: user.id,
        email: user.email,
      }),
    }),
  ],

  // Other Better Auth configuration...
});
```

#### 3.4 Create API Client

Create `frontend/src/lib/api-client.ts`:

```typescript
import { auth } from "./auth";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  // Get JWT token from Better Auth session
  const session = await auth.getSession();

  if (!session?.token) {
    throw new Error("Not authenticated");
  }

  // Add Authorization header
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.token}`,
    ...options.headers,
  };

  // Make request to backend
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  // Handle 401 (redirect to login)
  if (response.status === 401) {
    window.location.href = "/auth/signin";
    throw new Error("Authentication required");
  }

  return response;
}

// Example usage functions
export async function getTodos(userId: number) {
  const response = await apiRequest(`/api/users/${userId}/todos`);
  return response.json();
}

export async function createTodo(userId: number, todo: { title: string }) {
  const response = await apiRequest(`/api/users/${userId}/todos`, {
    method: "POST",
    body: JSON.stringify(todo),
  });
  return response.json();
}
```

#### 3.5 Start Frontend

```bash
cd frontend
npm run dev
```

**Verify**: Frontend starts on http://localhost:3000

---

## Verification Checklist

### ✅ Backend Verification

1. **Configuration Check**:
   ```bash
   cd backend
   python -c "from src.config import settings; print(f'BETTER_AUTH_SECRET: {settings.BETTER_AUTH_SECRET[:10]}...')"
   ```
   **Expected**: Prints first 10 characters of secret

2. **JWT Verification Test**:
   ```bash
   # Generate a test token (use Python)
   python -c "
   import jwt
   from datetime import datetime, timedelta
   secret = 'Kv8x7Y2mN9pQ3rT5wU6zA8bC1dE4fG7h'
   payload = {
       'user_id': 123,
       'email': 'test@example.com',
       'iat': int(datetime.utcnow().timestamp()),
       'exp': int((datetime.utcnow() + timedelta(days=7)).timestamp())
   }
   token = jwt.encode(payload, secret, algorithm='HS256')
   print(token)
   "
   ```
   **Expected**: Prints JWT token

3. **API Request Test**:
   ```bash
   # Use the token from step 2
   curl -X GET http://localhost:8001/api/users/123/todos \
     -H "Authorization: Bearer <TOKEN_FROM_STEP_2>"
   ```
   **Expected**: 200 OK with todos list (or empty array)

4. **Unauthorized Test**:
   ```bash
   curl -X GET http://localhost:8001/api/users/123/todos
   ```
   **Expected**: 401 Unauthorized with error message

5. **Forbidden Test**:
   ```bash
   # Generate token for user 123, try to access user 456's todos
   curl -X GET http://localhost:8001/api/users/456/todos \
     -H "Authorization: Bearer <TOKEN_FOR_USER_123>"
   ```
   **Expected**: 403 Forbidden with error message

### ✅ Frontend Verification

1. **Configuration Check**:
   - Open browser console
   - Navigate to http://localhost:3000
   - Check for any configuration errors

2. **Login Flow Test**:
   - Navigate to sign-in page
   - Enter valid credentials
   - Verify JWT token is issued
   - Check browser storage (cookies or localStorage)

3. **API Request Test**:
   - After login, navigate to todos page
   - Open browser DevTools → Network tab
   - Verify API requests include Authorization header
   - Verify header format: `Bearer <token>`

4. **Token Persistence Test**:
   - Log in
   - Refresh page
   - Verify still authenticated (no redirect to login)

### ✅ End-to-End Verification

1. **Complete Flow**:
   - User logs in on frontend
   - Frontend receives JWT token
   - User navigates to todos page
   - Frontend makes API request with JWT
   - Backend verifies JWT and returns todos
   - User sees their todos

2. **Security Verification**:
   - User A logs in (user_id: 123)
   - User A tries to access User B's todos (user_id: 456)
   - Backend returns 403 Forbidden
   - User A cannot see User B's data

3. **Token Expiration Test**:
   - Generate expired token (exp in the past)
   - Make API request with expired token
   - Backend returns 401 Unauthorized with "Token expired"

---

## Troubleshooting

### Issue: "Invalid token signature"

**Cause**: BETTER_AUTH_SECRET mismatch between frontend and backend

**Solution**:
1. Verify both .env files have identical BETTER_AUTH_SECRET
2. Restart both frontend and backend
3. Clear browser storage and re-login

### Issue: "Missing authentication token"

**Cause**: Authorization header not included in request

**Solution**:
1. Verify API client includes Authorization header
2. Check Better Auth session exists
3. Verify token is stored correctly

### Issue: "Token expired"

**Cause**: Token expiration time has passed

**Solution**:
1. User must re-authenticate (log in again)
2. Consider implementing token refresh (future enhancement)

### Issue: "You can only access your own resources" (403)

**Cause**: User trying to access another user's resources

**Solution**:
1. This is expected behavior (security working correctly)
2. Verify frontend uses correct user_id in API requests
3. Ensure user_id matches authenticated user

### Issue: Backend returns 500 Internal Server Error

**Cause**: Configuration error or missing dependency

**Solution**:
1. Check backend logs for detailed error
2. Verify PyJWT is installed: `pip list | grep PyJWT`
3. Verify BETTER_AUTH_SECRET is set in .env
4. Check database connection

---

## Performance Benchmarks

### Expected Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| JWT Verification | <50ms | Time from request to user_id extraction |
| Login Flow | <2s | Time from credentials submit to token receipt |
| Concurrent Requests | 1000 | Number of simultaneous authenticated requests |

### Performance Testing

```bash
# Install Apache Bench
brew install httpd  # macOS
apt-get install apache2-utils  # Linux

# Generate test token
TOKEN="<your-test-token>"

# Test JWT verification performance
ab -n 1000 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/users/123/todos
```

**Expected Results**:
- Mean response time: <100ms (includes DB query)
- JWT verification overhead: <50ms
- No failed requests

---

## Security Checklist

Before deploying to production:

- [ ] BETTER_AUTH_SECRET is at least 32 characters
- [ ] BETTER_AUTH_SECRET is loaded from environment variables (not hardcoded)
- [ ] BETTER_AUTH_SECRET is identical in frontend and backend
- [ ] BETTER_AUTH_SECRET is NOT committed to version control
- [ ] HTTPS is enforced in production
- [ ] Token storage uses httpOnly cookies (if possible)
- [ ] Content Security Policy (CSP) is configured
- [ ] CORS is properly configured
- [ ] Error messages don't leak sensitive information
- [ ] Authentication failures are logged
- [ ] Rate limiting is configured (future enhancement)

---

## Next Steps

After successful verification:

1. **Run `/sp.tasks`**: Generate actionable implementation tasks
2. **Implement Tasks**: Follow task list in priority order
3. **Write Tests**: Unit and integration tests for JWT verification
4. **Performance Testing**: Verify <50ms verification latency
5. **Security Audit**: Review JWT verification code for vulnerabilities
6. **Documentation**: Update API documentation with authentication requirements
7. **Deployment**: Deploy to staging environment for testing

---

## Additional Resources

### Documentation
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

### Tools
- [JWT.io](https://jwt.io/) - JWT token decoder and debugger
- [Postman](https://www.postman.com/) - API testing tool
- [curl](https://curl.se/) - Command-line HTTP client

### Support
- Spec-1 Backend: See `specs/1-todo-backend/quickstart.md`
- Constitution: See `.specify/memory/constitution.md`
- Planning: See `specs/2-auth-jwt-integration/plan.md`

---

**Setup Status**: ✅ COMPLETE - Ready for implementation
**Next Command**: `/sp.tasks` to generate actionable tasks
