---
name: auth-skill
description: Implement secure authentication systems including signup, signin, password hashing, JWT tokens, and Better Auth integration for Next.js + FastAPI architecture.
---

# Authentication Skill: Better Auth + FastAPI Integration

## Overview

This skill implements authentication for a full-stack application with:
- **Frontend**: Next.js with Better Auth (JWT token generation)
- **Backend**: FastAPI with JWT verification
- **Database**: Neon Serverless PostgreSQL

## Architecture Pattern

```
User → Next.js (Better Auth) → JWT Token → FastAPI (JWT Verify) → Database
```

## Core Responsibilities

### 1. Frontend Authentication (Next.js + Better Auth)

**Setup Better Auth:**
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    // Neon connection
  },
  emailAndPassword: {
    enabled: true,
  },
  jwt: {
    enabled: true,
    secret: process.env.JWT_SECRET!,
    expiresIn: "7d",
  },
})
```

**Signup Implementation:**
```typescript
// app/api/auth/signup/route.ts
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  const { email, password, name } = await request.json()

  // Better Auth handles:
  // - Email validation
  // - Password hashing (bcrypt)
  // - User creation
  // - JWT generation

  const result = await auth.api.signUp({
    email,
    password,
    name,
  })

  return Response.json(result)
}
```

**Signin Implementation:**
```typescript
// app/api/auth/signin/route.ts
export async function POST(request: Request) {
  const { email, password } = await request.json()

  const result = await auth.api.signIn({
    email,
    password,
  })

  // Returns JWT token in response
  return Response.json(result)
}
```

**Client-Side Token Management:**
```typescript
// Store token securely (httpOnly cookie preferred)
// Include in all API requests
const response = await fetch('/api/users/1/todos', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
```

### 2. Backend Authentication (FastAPI + JWT Verification)

**JWT Verification Dependency:**
```python
# app/auth.py
from fastapi import HTTPException, Header, Depends
import jwt
import os
from typing import Dict

async def verify_token(authorization: str = Header(None)) -> Dict:
    """
    Verify JWT token from Authorization header.
    Returns decoded token payload with user info.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET"),
            algorithms=["HS256"]
        )
        return payload  # Contains: user_id, email, exp, etc.

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Authorization Helper:**
```python
# app/auth.py
def validate_user_access(token_user_id: int, resource_user_id: int):
    """
    Ensure authenticated user can only access their own resources.
    Raises 403 if user IDs don't match.
    """
    if token_user_id != resource_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own resources"
        )
```

**Protected Endpoint Pattern:**
```python
# app/main.py
from fastapi import FastAPI, Depends
from app.auth import verify_token, validate_user_access

@app.get("/api/users/{user_id}/todos")
async def get_user_todos(
    user_id: int,
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    # 1. Verify user can access this resource
    validate_user_access(token_data["user_id"], user_id)

    # 2. Query only this user's data
    todos = db.query(Todo).filter(Todo.user_id == user_id).all()

    return todos
```

### 3. Database Schema (SQLModel)

**User Model:**
```python
# app/models.py
from sqlmodel import SQLModel, Field
from datetime import datetime

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    password_hash: str  # Never store plain passwords
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Todo Model with User Relationship:**
```python
class Todo(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    description: str | None = None
    completed: bool = False
    user_id: int = Field(foreign_key="user.id")  # Link to user
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

## Security Checklist

Before deploying authentication:

- [ ] JWT_SECRET stored in environment variables (never hardcoded)
- [ ] Passwords hashed with bcrypt (min 10 rounds)
- [ ] Email validation on signup
- [ ] Password strength requirements enforced
- [ ] Token expiration set (7 days recommended)
- [ ] HTTPS enforced in production
- [ ] Rate limiting on auth endpoints
- [ ] Failed login attempts logged
- [ ] User enumeration prevented (same error for invalid email/password)
- [ ] CORS configured properly
- [ ] SQL injection prevented (use parameterized queries)
- [ ] XSS prevention (sanitize output)

## Common Patterns

### Pattern 1: Public Endpoint (No Auth)
```python
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
```

### Pattern 2: Protected Endpoint (Auth Required)
```python
@app.get("/api/users/{user_id}/profile")
async def get_profile(
    user_id: int,
    token_data: dict = Depends(verify_token)
):
    validate_user_access(token_data["user_id"], user_id)
    # ... return user profile
```

### Pattern 3: Admin-Only Endpoint
```python
@app.get("/api/admin/users")
async def list_all_users(
    token_data: dict = Depends(verify_token)
):
    if token_data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    # ... return all users
```

## Error Handling

**Standard Error Responses:**
```python
# 401 Unauthorized - Invalid/missing token
{
    "detail": "Invalid token"
}

# 403 Forbidden - Valid token but insufficient permissions
{
    "detail": "You can only access your own resources"
}

# 422 Validation Error - Invalid input
{
    "detail": [
        {
            "loc": ["body", "email"],
            "msg": "Invalid email format",
            "type": "value_error.email"
        }
    ]
}
```

## Testing Authentication

**Test Cases:**
1. Signup with valid credentials → Success
2. Signup with duplicate email → 409 Conflict
3. Signup with weak password → 422 Validation Error
4. Signin with valid credentials → JWT token returned
5. Signin with invalid credentials → 401 Unauthorized
6. Access protected endpoint without token → 401
7. Access protected endpoint with expired token → 401
8. Access another user's resources → 403
9. Access own resources with valid token → Success

## Environment Variables Required

```env
# Shared between Next.js and FastAPI
JWT_SECRET=your-super-secret-key-min-32-chars

# Database
DATABASE_URL=postgresql://user:pass@host/db

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=another-secret-key

# FastAPI
API_URL=http://localhost:8000
```

## Implementation Workflow

1. **Setup Phase:**
   - Install dependencies (better-auth, PyJWT, bcrypt)
   - Configure environment variables
   - Create database schema

2. **Frontend Phase:**
   - Configure Better Auth
   - Create signup/signin API routes
   - Build authentication UI components
   - Implement token storage and management

3. **Backend Phase:**
   - Create JWT verification dependency
   - Implement authorization helpers
   - Protect all user-scoped endpoints
   - Add error handling

4. **Testing Phase:**
   - Test signup/signin flows
   - Verify JWT token generation
   - Test protected endpoints
   - Verify user isolation (can't access others' data)

5. **Security Review:**
   - Run security checklist
   - Test for common vulnerabilities
   - Review error messages (no info leakage)
   - Verify rate limiting

## Quick Reference

**Frontend (Next.js):**
- Better Auth handles: signup, signin, password hashing, JWT generation
- Store JWT in httpOnly cookies
- Include JWT in Authorization header for API calls

**Backend (FastAPI):**
- Extract JWT from Authorization header
- Verify JWT signature with shared secret
- Decode JWT to get user_id
- Match user_id from token with resource user_id
- Filter all queries by authenticated user

**Key Security Rule:**
> Never trust user_id from URL/body without JWT verification. Always verify the authenticated user matches the requested resource owner.
