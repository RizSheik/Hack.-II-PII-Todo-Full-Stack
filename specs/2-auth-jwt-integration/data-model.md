# Data Model: Authentication & JWT Security Integration

**Feature**: 2-auth-jwt-integration
**Date**: 2026-01-09
**Purpose**: Define JWT token structure and authentication-related entities

## Overview

This feature introduces JWT-based authentication without adding new database entities. The primary data structure is the JWT token itself, which is stateless and self-contained. User entities already exist from Spec-1.

## JWT Token Structure

### Token Format

JWT tokens follow the standard three-part structure:
```
<header>.<payload>.<signature>
```

**Example**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTcwNDg0NDgwMCwiZXhwIjoxNzA1NDQ5NjAwfQ.signature_here
```

### Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Fields**:
- `alg` (string): Signing algorithm - MUST be "HS256"
- `typ` (string): Token type - MUST be "JWT"

### Payload (Claims)

```json
{
  "user_id": 123,
  "email": "user@example.com",
  "iat": 1704844800,
  "exp": 1705449600
}
```

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `user_id` | integer | Yes | Unique user identifier | Must match database user.id |
| `email` | string | Yes | User email address | Must be valid email format |
| `iat` | integer | Yes | Issued at timestamp (Unix epoch) | Must be valid Unix timestamp |
| `exp` | integer | Yes | Expiration timestamp (Unix epoch) | Must be > iat, typically iat + 604800 (7 days) |

**Validation Rules**:
1. `user_id` MUST be a positive integer
2. `email` MUST be a valid email address (RFC 5322)
3. `iat` MUST be a valid Unix timestamp (seconds since epoch)
4. `exp` MUST be greater than `iat`
5. `exp` MUST be in the future (current time < exp) for token to be valid
6. Token MUST be signed with BETTER_AUTH_SECRET using HS256 algorithm

### Signature

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  BETTER_AUTH_SECRET
)
```

**Verification**:
- Backend MUST verify signature using BETTER_AUTH_SECRET
- Signature verification MUST succeed before trusting payload
- Invalid signature MUST result in 401 Unauthorized response

## Token Lifecycle

### 1. Token Issuance (Frontend - Better Auth)

**Trigger**: User successfully authenticates (login)

**Process**:
1. Better Auth validates user credentials
2. Better Auth creates JWT payload with user_id, email, iat, exp
3. Better Auth signs payload with BETTER_AUTH_SECRET using HS256
4. Better Auth returns JWT token to client
5. Client stores token (httpOnly cookie or localStorage)

**Output**: JWT token string

### 2. Token Transmission (Frontend - API Client)

**Trigger**: Client makes API request to protected endpoint

**Process**:
1. Client retrieves JWT token from storage
2. Client adds Authorization header: `Bearer <token>`
3. Client sends HTTP request with Authorization header

**Output**: HTTP request with JWT in Authorization header

### 3. Token Verification (Backend - FastAPI)

**Trigger**: Backend receives request to protected endpoint

**Process**:
1. Extract Authorization header from request
2. Validate header format: `Bearer <token>`
3. Extract token from header
4. Decode JWT header and payload (without verification)
5. Verify signature using BETTER_AUTH_SECRET
6. Validate token expiration (current time < exp)
7. Extract user_id from payload
8. Provide user_id to endpoint via dependency injection

**Output**: Authenticated user_id (integer) or HTTPException(401)

### 4. Token Expiration

**Trigger**: Current time exceeds token exp claim

**Process**:
1. Backend validates token expiration on every request
2. If current time >= exp, reject token with 401 Unauthorized
3. Client receives 401 response
4. Client redirects user to login page
5. User re-authenticates and receives new token

**Output**: 401 Unauthorized response, user must re-authenticate

## Database Entities

### User Entity (Existing - No Changes)

**Table**: `users`

**Fields**:
- `id` (integer, primary key): Unique user identifier
- Other fields defined in Spec-1 (out of scope for this feature)

**Relationships**:
- One-to-many with `todos` table (defined in Spec-1)

**Notes**:
- User entity already exists from Spec-1
- No changes needed for authentication integration
- JWT `user_id` claim references `users.id`

### No New Database Entities

This feature does NOT introduce new database tables. Authentication is stateless and relies entirely on JWT tokens. No session storage, token storage, or authentication logs are persisted to the database.

## Authorization Model

### User-Resource Ownership

**Principle**: Users can only access resources they own

**Implementation**:
1. Every protected endpoint receives `user_id` from verified JWT
2. Every protected endpoint receives `user_id` from route parameter
3. Endpoint compares JWT `user_id` with route `user_id`
4. If mismatch, return 403 Forbidden
5. If match, proceed with request

**Example**:
```
GET /api/users/123/todos
Authorization: Bearer <JWT with user_id=123>

✅ ALLOWED: JWT user_id (123) matches route user_id (123)
```

```
GET /api/users/456/todos
Authorization: Bearer <JWT with user_id=123>

❌ FORBIDDEN: JWT user_id (123) does NOT match route user_id (456)
```

### Authorization Validation Function

```python
def validate_user_access(token_user_id: int, resource_user_id: int):
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
            detail="You can only access your own resources"
        )
```

## Token Security

### Threat Model

**Threats Mitigated**:
1. **Unauthorized Access**: JWT verification prevents unauthenticated requests
2. **Token Tampering**: Signature verification detects modified tokens
3. **Token Expiration**: Expiration validation prevents use of old tokens
4. **Cross-User Access**: Authorization validation prevents accessing other users' data

**Threats NOT Mitigated** (out of scope):
1. **Token Theft**: Stolen tokens are valid until expiration (mitigated by short lifetime, HTTPS)
2. **Token Revocation**: No mechanism to revoke individual tokens before expiration
3. **Replay Attacks**: Tokens can be reused until expiration (acceptable for stateless design)

### Security Best Practices

1. **HTTPS Only**: Tokens MUST be transmitted over HTTPS in production
2. **Secure Storage**: Use httpOnly cookies when possible (immune to XSS)
3. **Short Lifetime**: 7-day expiration limits damage from stolen tokens
4. **Secret Protection**: BETTER_AUTH_SECRET MUST be loaded from environment variables
5. **Constant-Time Comparison**: Use constant-time comparison for signature verification (prevents timing attacks)

## Token Validation Rules

### Frontend Validation (Better Auth)

1. Token MUST be signed with BETTER_AUTH_SECRET
2. Token MUST include user_id, email, iat, exp claims
3. Token expiration MUST be set to iat + 604800 seconds (7 days)
4. Token MUST be stored securely (httpOnly cookie or localStorage)

### Backend Validation (FastAPI)

1. Authorization header MUST be present
2. Authorization header MUST start with "Bearer "
3. Token MUST be valid JWT format (header.payload.signature)
4. Token signature MUST be valid (verified with BETTER_AUTH_SECRET)
5. Token MUST NOT be expired (current time < exp)
6. Token payload MUST include user_id claim
7. user_id claim MUST be a positive integer

### Validation Error Responses

| Validation Failure | HTTP Status | Error Code | Error Message |
|-------------------|-------------|------------|---------------|
| Missing Authorization header | 401 | UNAUTHORIZED | "Missing authentication token" |
| Invalid Bearer format | 401 | UNAUTHORIZED | "Invalid token format" |
| Invalid JWT structure | 401 | UNAUTHORIZED | "Malformed token" |
| Invalid signature | 401 | UNAUTHORIZED | "Invalid token signature" |
| Expired token | 401 | UNAUTHORIZED | "Token expired" |
| Missing user_id claim | 401 | UNAUTHORIZED | "Invalid token claims" |
| Invalid user_id type | 401 | UNAUTHORIZED | "Invalid user_id in token" |
| User ID mismatch | 403 | FORBIDDEN | "You can only access your own resources" |

## Token Examples

### Valid Token

**Payload**:
```json
{
  "user_id": 123,
  "email": "alice@example.com",
  "iat": 1704844800,
  "exp": 1705449600
}
```

**Full Token**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQ4NDQ4MDAsImV4cCI6MTcwNTQ0OTYwMH0.signature_here
```

**Usage**:
```http
GET /api/users/123/todos HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expired Token

**Payload**:
```json
{
  "user_id": 123,
  "email": "alice@example.com",
  "iat": 1704844800,
  "exp": 1704931200
}
```

**Current Time**: 1705000000 (after expiration)

**Result**: 401 Unauthorized - "Token expired"

### Tampered Token

**Original Payload**:
```json
{
  "user_id": 123,
  "email": "alice@example.com",
  "iat": 1704844800,
  "exp": 1705449600
}
```

**Tampered Payload** (user_id changed to 456):
```json
{
  "user_id": 456,
  "email": "alice@example.com",
  "iat": 1704844800,
  "exp": 1705449600
}
```

**Result**: 401 Unauthorized - "Invalid token signature" (signature doesn't match modified payload)

## Integration with Spec-1

### Existing Endpoints (Updated)

All Spec-1 endpoints will be updated to require JWT authentication:

| Endpoint | Method | Authentication | Authorization |
|----------|--------|----------------|---------------|
| `/api/users/{user_id}/todos` | GET | Required | user_id must match JWT |
| `/api/users/{user_id}/todos` | POST | Required | user_id must match JWT |
| `/api/users/{user_id}/todos/{todo_id}` | GET | Required | user_id must match JWT |
| `/api/users/{user_id}/todos/{todo_id}` | PUT | Required | user_id must match JWT |
| `/api/users/{user_id}/todos/{todo_id}` | DELETE | Required | user_id must match JWT |

### No Breaking Changes

- Endpoint paths remain unchanged
- Request/response formats remain unchanged
- Only addition: Authorization header required
- Existing functionality preserved

## Summary

**Key Points**:
1. JWT tokens are self-contained and stateless (no database storage)
2. Tokens include user_id, email, iat, exp claims
3. Tokens are signed with HS256 using BETTER_AUTH_SECRET
4. Tokens expire after 7 days (604800 seconds)
5. Backend verifies signature and expiration on every request
6. Authorization enforced by comparing JWT user_id with route user_id
7. No new database entities required
8. Seamless integration with Spec-1 backend (no breaking changes)

**Next Steps**:
- Review JWT token structure and validation rules
- Proceed to API contracts (contracts/jwt-middleware.md)
- Implement token issuance (Better Auth configuration)
- Implement token verification (FastAPI middleware)
