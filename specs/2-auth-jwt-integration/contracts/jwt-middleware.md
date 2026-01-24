# JWT Verification Middleware Contract

**Feature**: 2-auth-jwt-integration
**Date**: 2026-01-09
**Purpose**: Define the contract for JWT token verification middleware in FastAPI backend

## Overview

This document specifies the contract for JWT verification middleware that authenticates requests to protected API endpoints. The middleware extracts JWT tokens from the Authorization header, verifies their signature and expiration, and provides the authenticated user identity to endpoint handlers.

## Middleware Components

### 1. JWT Verification Dependency

**Function**: `verify_jwt_token(authorization: str = Header(None)) -> dict`

**Purpose**: Extract and verify JWT token from Authorization header

**Input**:
- `authorization` (string, optional): HTTP Authorization header value
  - Format: `Bearer <JWT>`
  - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Processing**:
1. Check if Authorization header is present
2. Validate header format starts with "Bearer "
3. Extract token (everything after "Bearer ")
4. Decode JWT token using PyJWT
5. Verify signature using BETTER_AUTH_SECRET
6. Validate token expiration (current time < exp)
7. Extract and validate required claims (user_id, email, iat, exp)

**Output**:
- **Success**: Dictionary containing JWT payload
  ```python
  {
      "user_id": 123,
      "email": "user@example.com",
      "iat": 1704844800,
      "exp": 1705449600
  }
  ```
- **Failure**: Raises `HTTPException` with status code 401

**Error Scenarios**:

| Scenario | Status Code | Error Code | Error Message |
|----------|-------------|------------|---------------|
| Missing Authorization header | 401 | UNAUTHORIZED | "Missing authentication token" |
| Invalid Bearer format | 401 | UNAUTHORIZED | "Invalid token format" |
| Malformed JWT | 401 | UNAUTHORIZED | "Malformed token" |
| Invalid signature | 401 | UNAUTHORIZED | "Invalid token signature" |
| Expired token | 401 | UNAUTHORIZED | "Token expired" |
| Missing user_id claim | 401 | UNAUTHORIZED | "Invalid token claims" |
| Invalid user_id type | 401 | UNAUTHORIZED | "Invalid user_id in token" |

**Implementation Example**:
```python
import jwt
from fastapi import HTTPException, Header
from datetime import datetime
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
    # Check if Authorization header is present
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

    # Validate Bearer format
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

    # Extract token
    token = authorization.split(" ", 1)[1]

    try:
        # Decode and verify JWT
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )

        # Validate required claims
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

        # Validate user_id type
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
```

---

### 2. User Identity Extraction Dependency

**Function**: `get_current_user_id(token_payload: dict = Depends(verify_jwt_token)) -> int`

**Purpose**: Extract authenticated user ID from verified JWT payload

**Input**:
- `token_payload` (dict): Verified JWT payload from `verify_jwt_token`

**Processing**:
1. Extract user_id from payload
2. Return user_id as integer

**Output**:
- **Success**: User ID (integer)
  ```python
  123
  ```
- **Failure**: N/A (token already verified by `verify_jwt_token`)

**Implementation Example**:
```python
from fastapi import Depends

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

---

### 3. Authorization Validation Helper

**Function**: `validate_user_access(token_user_id: int, resource_user_id: int) -> None`

**Purpose**: Ensure authenticated user can only access their own resources

**Input**:
- `token_user_id` (int): User ID from verified JWT token
- `resource_user_id` (int): User ID from route parameter

**Processing**:
1. Compare token_user_id with resource_user_id
2. If mismatch, raise HTTPException(403)
3. If match, return (allow request to proceed)

**Output**:
- **Success**: None (function returns without error)
- **Failure**: Raises `HTTPException` with status code 403

**Error Scenario**:

| Scenario | Status Code | Error Code | Error Message |
|----------|-------------|------------|---------------|
| User ID mismatch | 403 | FORBIDDEN | "You can only access your own resources" |

**Implementation Example**:
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

---

## Endpoint Integration Pattern

### Protected Endpoint Example

```python
from fastapi import APIRouter, Depends
from src.core.auth import get_current_user_id, validate_user_access
from src.schemas.todo import TodoResponse

router = APIRouter()

@router.get("/api/users/{user_id}/todos", response_model=list[TodoResponse])
async def list_todos(
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    List all todos for authenticated user.

    Args:
        user_id: User ID from route parameter
        current_user_id: Authenticated user ID from JWT
        db: Database session

    Returns:
        list[TodoResponse]: List of user's todos

    Raises:
        HTTPException(401): If token is invalid or expired
        HTTPException(403): If user_id doesn't match current_user_id
    """
    # Validate authorization
    validate_user_access(current_user_id, user_id)

    # Query todos for authenticated user
    todos = db.query(Todo).filter(Todo.user_id == user_id).all()

    return todos
```

### Request Flow

```
1. Client sends request:
   GET /api/users/123/todos
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. FastAPI calls get_current_user_id dependency:
   → Calls verify_jwt_token dependency
   → Extracts Authorization header
   → Verifies JWT signature
   → Validates expiration
   → Returns payload: {"user_id": 123, "email": "user@example.com", ...}
   → Extracts user_id: 123

3. Endpoint handler receives:
   - user_id (from route): 123
   - current_user_id (from JWT): 123

4. Endpoint calls validate_user_access(123, 123):
   → Compares user IDs
   → Match: continues
   → Mismatch: raises HTTPException(403)

5. Endpoint queries database:
   → Filters by user_id = 123
   → Returns only user 123's todos

6. Response sent to client:
   200 OK
   [{"id": 1, "title": "Todo 1", ...}, ...]
```

---

## Error Response Format

All authentication and authorization errors follow the constitutional error format:

```json
{
  "error": {
    "code": "UNAUTHORIZED" | "FORBIDDEN",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "field_name",
        "message": "Field-specific error message"
      }
    ]
  }
}
```

### Example Error Responses

**Missing Token (401)**:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing authentication token",
    "details": []
  }
}
```

**Expired Token (401)**:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token expired",
    "details": []
  }
}
```

**Invalid Signature (401)**:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token signature",
    "details": [
      {
        "field": "token",
        "message": "Signature verification failed"
      }
    ]
  }
}
```

**User Mismatch (403)**:
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only access your own resources",
    "details": []
  }
}
```

---

## Configuration Requirements

### Environment Variables

**BETTER_AUTH_SECRET** (required):
- **Type**: String
- **Purpose**: Shared secret for JWT signing and verification
- **Format**: Base64-encoded string or plain text (minimum 32 characters)
- **Example**: `"your-secret-key-min-32-chars-long"`
- **Security**: MUST be loaded from environment variables, NEVER hardcoded
- **Consistency**: MUST be identical in frontend and backend

### Configuration Class

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    BETTER_AUTH_SECRET: str

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

---

## Testing Contract

### Unit Tests

**Test Cases**:
1. Valid token with correct signature → Returns payload
2. Missing Authorization header → Raises HTTPException(401)
3. Invalid Bearer format → Raises HTTPException(401)
4. Expired token → Raises HTTPException(401)
5. Invalid signature → Raises HTTPException(401)
6. Missing user_id claim → Raises HTTPException(401)
7. Invalid user_id type → Raises HTTPException(401)
8. User ID match → validate_user_access returns None
9. User ID mismatch → validate_user_access raises HTTPException(403)

### Integration Tests

**Test Cases**:
1. End-to-end request with valid token → 200 OK
2. End-to-end request with expired token → 401 Unauthorized
3. End-to-end request with invalid signature → 401 Unauthorized
4. End-to-end request with user mismatch → 403 Forbidden
5. End-to-end request without token → 401 Unauthorized

---

## Performance Requirements

**Benchmarks**:
- JWT verification: <50ms per request (SC-005)
- No database lookups during verification (stateless)
- Support 1000 concurrent requests (SC-006)

**Optimization Strategies**:
- Use PyJWT with C extensions for faster verification
- Avoid unnecessary payload validation (only validate required claims)
- Use FastAPI dependency caching where appropriate

---

## Security Considerations

### Threat Mitigation

1. **Token Tampering**: Signature verification detects modified tokens
2. **Token Expiration**: Expiration validation prevents use of old tokens
3. **Missing Claims**: Claim validation ensures required data is present
4. **Type Confusion**: Type validation prevents invalid user_id values

### Security Best Practices

1. **Constant-Time Comparison**: PyJWT uses constant-time comparison for signature verification (prevents timing attacks)
2. **Error Messages**: Don't leak sensitive information in error messages
3. **Logging**: Log authentication failures for security monitoring
4. **HTTPS**: Enforce HTTPS in production (tokens encrypted in transit)

---

## Summary

**Key Points**:
1. JWT verification is implemented as FastAPI dependency
2. Three components: token verification, user extraction, authorization validation
3. All errors follow constitutional error format
4. Stateless verification (no database lookups)
5. Performance target: <50ms per request
6. Security: signature verification, expiration validation, claim validation

**Next Steps**:
- Implement JWT verification in backend/src/core/auth.py
- Update existing endpoints to use authentication dependencies
- Write unit and integration tests
- Verify performance meets <50ms target
