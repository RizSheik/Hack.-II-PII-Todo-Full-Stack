# Research: Authentication & JWT Security Integration

**Feature**: 2-auth-jwt-integration
**Date**: 2026-01-09
**Purpose**: Document technology decisions and research findings for JWT-based authentication integration

## Overview

This document captures research findings and technology decisions made during the planning phase for integrating JWT-based authentication between Better Auth (Next.js frontend) and FastAPI (Python backend).

## Research Questions & Findings

### Q1: Which JWT signing algorithm should we use?

**Options Evaluated**:
1. **HS256 (HMAC with SHA-256)** - Symmetric signing
2. **RS256 (RSA with SHA-256)** - Asymmetric signing
3. **ES256 (ECDSA with SHA-256)** - Asymmetric signing

**Decision**: HS256 (HMAC with SHA-256)

**Rationale**:
- **Simplicity**: Symmetric algorithm uses same secret for signing and verification
- **No Key Management**: No need to manage public/private key pairs
- **Sufficient Security**: Adequate for shared secret between frontend and backend in same organization
- **Library Support**: Excellent support in both Better Auth and PyJWT
- **Performance**: Faster than asymmetric algorithms (no public key cryptography overhead)

**Trade-offs**:
- **Secret Sharing**: Both frontend and backend must have access to the same secret (acceptable in our architecture)
- **No Public Verification**: Can't share public key for third-party verification (not needed in our use case)

**Alternatives Rejected**:
- **RS256**: More complex, requires key pair management, overkill for single backend
- **ES256**: Better performance than RSA but still requires key pair management

**References**:
- [RFC 7518 - JSON Web Algorithms (JWA)](https://tools.ietf.org/html/rfc7518)
- [Better Auth JWT Plugin Documentation](https://www.better-auth.com/docs/plugins/jwt)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)

---

### Q2: What should the JWT token payload structure include?

**Options Evaluated**:
1. **Minimal**: user_id, exp only
2. **Standard**: user_id, email, iat, exp
3. **Extended**: user_id, email, roles, permissions, iat, exp

**Decision**: Standard (user_id, email, iat, exp)

**Rationale**:
- **user_id**: Required for authorization (matching with route user_id)
- **email**: Useful for logging, debugging, and user identification
- **iat (issued at)**: Standard JWT claim for token issuance timestamp
- **exp (expiration)**: Required for expiration validation (FR-011, FR-020)
- **Minimal Payload**: Reduces token size and improves performance
- **No RBAC**: Roles/permissions out of scope for Spec-2

**Trade-offs**:
- **No Roles**: Can't implement role-based access control without additional claims (acceptable - out of scope)
- **No Refresh Token**: Can't implement token refresh without additional mechanism (acceptable - out of scope)

**Alternatives Rejected**:
- **Minimal**: Missing email makes debugging harder
- **Extended**: Roles/permissions out of scope, increases token size unnecessarily

**JWT Payload Example**:
```json
{
  "user_id": 123,
  "email": "user@example.com",
  "iat": 1704844800,
  "exp": 1705449600
}
```

**References**:
- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [JWT Claims Best Practices](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-token-claims)

---

### Q3: What should the token expiration duration be?

**Options Evaluated**:
1. **Short-lived**: 1 hour (3600 seconds)
2. **Medium-lived**: 24 hours (86400 seconds)
3. **Long-lived**: 7 days (604800 seconds)
4. **Very long-lived**: 30 days (2592000 seconds)

**Decision**: 7 days (604800 seconds)

**Rationale**:
- **Security vs UX Balance**: Long enough to avoid frequent re-authentication, short enough to limit damage if stolen
- **Industry Standard**: Common practice for web applications
- **Acceptable Risk**: Given HTTPS enforcement and secure token storage, 7 days is acceptable
- **Configurable**: Can be adjusted via environment variable if needed

**Trade-offs**:
- **Security Risk**: Stolen tokens valid for 7 days (mitigated by HTTPS, secure storage)
- **No Revocation**: Can't revoke individual tokens before expiration (acceptable for stateless design)

**Alternatives Rejected**:
- **1 hour**: Too short, requires frequent re-authentication (poor UX)
- **24 hours**: Better security but still requires daily re-authentication
- **30 days**: Too long, higher security risk if token is stolen

**Mitigation Strategies**:
- Enforce HTTPS in production (tokens encrypted in transit)
- Use httpOnly cookies for token storage (immune to XSS)
- Implement token refresh in future if needed (out of scope for Spec-2)

**References**:
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [JWT Token Expiration Best Practices](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)

---

### Q4: Where should the frontend store JWT tokens?

**Options Evaluated**:
1. **httpOnly Cookies**: Stored in cookies with httpOnly flag
2. **localStorage**: Stored in browser localStorage
3. **sessionStorage**: Stored in browser sessionStorage
4. **In-memory only**: Stored in JavaScript variable

**Decision**: httpOnly Cookies (preferred) or localStorage (fallback)

**Rationale**:
- **httpOnly Cookies**: Best security (immune to XSS attacks), automatic transmission with requests
- **localStorage**: Fallback if cookies not feasible (vulnerable to XSS but acceptable with CSP)
- **Better Auth Handles Storage**: Better Auth manages storage automatically based on configuration
- **Persistence Required**: Must persist across page refreshes (FR-009)

**Trade-offs**:
- **httpOnly Cookies**: Requires CORS configuration, CSRF protection needed
- **localStorage**: Vulnerable to XSS attacks (mitigated by Content Security Policy)

**Alternatives Rejected**:
- **sessionStorage**: Doesn't persist across tabs/windows (poor UX)
- **In-memory only**: Lost on page refresh (poor UX)

**Security Considerations**:
- Implement Content Security Policy (CSP) to mitigate XSS
- Use HTTPS to prevent token interception
- Consider CSRF protection if using cookies

**References**:
- [OWASP Token Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)
- [Better Auth Storage Configuration](https://www.better-auth.com/docs/concepts/session-management)

---

### Q5: How should the backend verify JWT tokens?

**Options Evaluated**:
1. **PyJWT Library**: Standard Python JWT library
2. **python-jose**: Alternative JWT library with more features
3. **Manual Implementation**: Custom JWT parsing and verification

**Decision**: PyJWT Library

**Rationale**:
- **Industry Standard**: Most widely used Python JWT library
- **Mature & Well-Tested**: Battle-tested in production environments
- **Simple API**: Easy to use and understand
- **Active Maintenance**: Regular updates and security patches
- **FastAPI Integration**: Works seamlessly with FastAPI dependency injection

**Trade-offs**:
- **Limited Features**: Fewer features than python-jose (acceptable - we only need basic JWT verification)

**Alternatives Rejected**:
- **python-jose**: More features but less widely used, potential overkill
- **Manual Implementation**: Error-prone, reinventing the wheel, security risks

**Implementation Pattern**:
```python
import jwt
from fastapi import HTTPException, Depends, Header

async def verify_jwt_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**References**:
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)

---

### Q6: How should authorization be enforced?

**Options Evaluated**:
1. **Helper Function**: `validate_user_access(token_user_id, resource_user_id)`
2. **Decorator Pattern**: `@require_user_match` decorator
3. **Middleware-Based**: Global middleware checks all requests
4. **Inline Checks**: Authorization logic in each endpoint

**Decision**: Helper Function (`validate_user_access`)

**Rationale**:
- **Reusable**: Can be called from any endpoint
- **Centralized Logic**: Single source of truth for authorization
- **Explicit**: Clear and visible in endpoint code
- **Testable**: Easy to test independently
- **Follows DRY**: Avoids code duplication

**Trade-offs**:
- **Manual Invocation**: Must remember to call in each endpoint (mitigated by code review)

**Alternatives Rejected**:
- **Decorator Pattern**: More complex, less explicit, harder to debug
- **Middleware-Based**: Can't access route parameters easily
- **Inline Checks**: Violates DRY principle, error-prone

**Implementation Pattern**:
```python
def validate_user_access(token_user_id: int, resource_user_id: int):
    """Ensure authenticated user can only access their own resources"""
    if token_user_id != resource_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own resources"
        )
```

**References**:
- [FastAPI Dependency Injection](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [Authorization Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

---

### Q7: How should the system integrate with Spec-1 backend?

**Options Evaluated**:
1. **Update Existing Endpoints**: Add JWT verification to existing endpoints
2. **Create New Endpoints**: Create authenticated versions of endpoints
3. **Versioned API**: Create /v2/ endpoints with authentication

**Decision**: Update Existing Endpoints (non-breaking addition)

**Rationale**:
- **No Breaking Changes**: Add JWT verification as a dependency (FR-026)
- **No Code Duplication**: Reuse existing endpoint logic
- **Backward Compatible**: Can be deployed incrementally
- **Follows Open/Closed Principle**: Open for extension, closed for modification

**Trade-offs**:
- **Requires Testing**: Must test all Spec-1 endpoints after integration

**Alternatives Rejected**:
- **Create New Endpoints**: Duplicates code, confusing API
- **Versioned API**: Unnecessary complexity for authentication addition

**Integration Strategy**:
1. Add JWT verification dependency to existing endpoints
2. Add authorization validation (user_id matching)
3. No changes to endpoint signatures or response formats
4. Test all endpoints after integration

**References**:
- [API Versioning Best Practices](https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/)
- [FastAPI Dependency Injection](https://fastapi.tiangolo.com/tutorial/dependencies/)

---

## Technology Stack Summary

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Frontend Auth | Better Auth | Latest | JWT token issuance |
| Frontend Framework | Next.js | 14+ | Web application framework |
| Backend Framework | FastAPI | 0.104+ | REST API framework |
| JWT Library (Backend) | PyJWT | 2.8+ | JWT verification |
| JWT Algorithm | HS256 | - | Symmetric signing |
| Token Storage | httpOnly Cookies / localStorage | - | Secure token storage |
| Token Expiration | 7 days | 604800s | Balance security and UX |

## Security Considerations

### Threat Model

**Threats Addressed**:
1. **Unauthorized API Access**: JWT verification prevents unauthenticated requests
2. **Cross-User Data Access**: Authorization validation prevents users from accessing other users' data
3. **Token Tampering**: JWT signature verification detects modified tokens
4. **Token Expiration**: Expiration validation prevents use of old tokens

**Threats NOT Addressed** (out of scope):
1. **Token Revocation**: No mechanism to revoke individual tokens before expiration
2. **Token Refresh**: No automatic token refresh mechanism
3. **Brute Force Attacks**: No rate limiting on authentication endpoints
4. **Account Takeover**: No multi-factor authentication

### Security Best Practices

1. **HTTPS Enforcement**: All production traffic must use HTTPS
2. **Secret Management**: BETTER_AUTH_SECRET loaded from environment variables, never hardcoded
3. **Token Storage**: Use httpOnly cookies when possible (immune to XSS)
4. **Content Security Policy**: Implement CSP to mitigate XSS attacks
5. **Error Messages**: Don't leak sensitive information in error responses
6. **Logging**: Log authentication failures for security monitoring

## Performance Considerations

### Benchmarks

**Target Performance**:
- JWT verification: <50ms per request (SC-005)
- Login flow: <2 seconds end-to-end (SC-001)
- Concurrent requests: 1000 without degradation (SC-006)

**Optimization Strategies**:
1. **Efficient Library**: PyJWT uses optimized C extensions
2. **Minimal Payload**: Keep JWT payload small (only essential claims)
3. **No Database Lookups**: Stateless verification (no session storage)
4. **Connection Pooling**: Reuse database connections for user data

### Scalability

**Horizontal Scaling**:
- Stateless design enables horizontal scaling
- No shared session storage required
- Load balancer can distribute requests to any backend instance

**Vertical Scaling**:
- JWT verification is CPU-bound (minimal memory usage)
- Can handle thousands of requests per second on modern hardware

## Open Questions & Future Work

### Resolved Questions
All critical questions have been resolved during research phase.

### Future Enhancements (out of scope for Spec-2)
1. **Token Refresh**: Implement refresh token rotation for better security
2. **Token Revocation**: Add token blacklist for immediate revocation
3. **Role-Based Access Control**: Add roles and permissions to JWT claims
4. **Multi-Factor Authentication**: Add MFA for enhanced security
5. **Rate Limiting**: Add rate limiting on authentication endpoints
6. **Audit Logging**: Log all authentication and authorization events

## References

### Standards & Specifications
- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [RFC 7518 - JSON Web Algorithms (JWA)](https://tools.ietf.org/html/rfc7518)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

### Libraries & Frameworks
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)

### Best Practices
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)
- [Token Storage Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)

---

**Research Status**: ✅ COMPLETE - All technology decisions documented and justified
**Next Phase**: Phase 1 - Design & Contracts (data-model.md, contracts/, quickstart.md)
