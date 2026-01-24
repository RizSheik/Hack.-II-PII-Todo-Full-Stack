# Implementation Plan: Authentication & JWT Security Integration

**Branch**: `2-auth-jwt-integration` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/2-auth-jwt-integration/spec.md`

## Summary

Implement stateless JWT-based authentication to secure all backend API access. Better Auth (Next.js frontend) issues JWT tokens upon user login, and FastAPI (Python backend) verifies these tokens on every request. The system enforces strict user isolation by matching authenticated user identity from JWT claims with requested resources, rejecting unauthorized access with 401/403 responses.

**Core Capabilities**:
- Better Auth issues JWT tokens with user_id, email, and expiration claims
- Frontend attaches JWT to all API requests via Authorization header
- Backend verifies JWT signature, expiration, and integrity
- Backend extracts authenticated user_id from verified JWT claims
- Backend enforces authorization by matching JWT user_id with route user_id
- Stateless operation without session storage or database lookups
- Consistent error handling (401 for auth failures, 403 for authorization failures)

**Technical Approach**:
- Better Auth JWT plugin for token issuance (Next.js frontend)
- Shared secret (BETTER_AUTH_SECRET) for symmetric JWT signing/verification
- FastAPI dependency injection for JWT verification middleware
- Authorization header format: `Bearer <token>`
- HS256 algorithm for JWT signing
- Integration with existing Spec-1 backend APIs (no breaking changes)

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.0+, Next.js 14+ (App Router)
- Backend: Python 3.11+

**Primary Dependencies**:
- Frontend: Better Auth (latest), Next.js 14+
- Backend: FastAPI 0.104+, PyJWT 2.8+, python-jose 3.3+ (JWT verification)

**Storage**: N/A (stateless authentication, no session storage)

**Testing**:
- Frontend: Jest, React Testing Library
- Backend: pytest 7.4+, httpx 0.25+ (for FastAPI test client)

**Target Platform**:
- Frontend: Browser (Chrome, Firefox, Safari, Edge)
- Backend: Linux/macOS server, containerized deployment (Docker)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- Token verification: <50ms per request
- Login flow: <2 seconds end-to-end
- Support 1000 concurrent authenticated requests

**Constraints**:
- Stateless authentication (no session storage)
- Authorization header only (no cookies for backend auth)
- Shared secret must be identical in frontend and backend
- Must integrate with Spec-1 backend without breaking changes
- JWT expiration enforced consistently

**Scale/Scope**:
- 10,000 users
- 1000 concurrent authenticated requests
- All Spec-1 endpoints protected by authentication

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Correctness ✅
- **Compliance**: All 27 functional requirements (FR-001 through FR-027) have corresponding acceptance scenarios
- **Verification**: Each authentication flow can be tested end-to-end (login → token issuance → API request → verification)
- **Testability**: Success criteria define measurable outcomes (SC-001: login within 2s, SC-005: <50ms verification latency)

### II. Security-First Design ✅
- **JWT Verification**: All protected endpoints MUST verify JWT signature before processing (FR-010)
- **Token Expiration**: Backend MUST validate token expiration on every request (FR-011)
- **User Isolation**: Backend MUST compare authenticated user_id with requested resource owner_id (FR-014, FR-015)
- **Stateless Security**: No session storage - security relies on cryptographic verification only
- **Secret Protection**: BETTER_AUTH_SECRET loaded from environment variables, never hardcoded (FR-025)
- **Error Handling**: Authentication failures return 401, authorization failures return 403 (FR-018 through FR-021)

### III. Spec-Driven Rigor ✅
- **API Contracts**: JWT verification middleware contract defined (Phase 1)
- **Token Structure**: JWT payload structure specified (user_id, email, exp claims)
- **No Assumptions**: Implementation follows spec exactly - no undocumented features
- **Acceptance Criteria**: Every user story has Given-When-Then scenarios

### IV. Reproducibility ✅
- **Environment Config**: BETTER_AUTH_SECRET via environment variables (identical in frontend and backend)
- **Dependencies**: Exact versions specified in package.json and requirements.txt
- **Setup Steps**: quickstart.md provides complete setup and verification (Phase 1)
- **No Hidden State**: Stateless design - no server-side sessions or caches

### V. Separation of Concerns ✅
- **Frontend Responsibility**: Token issuance, storage, and transmission
- **Backend Responsibility**: Token verification, user identity extraction, authorization enforcement
- **Clear Boundary**: Authorization header is the only communication channel for authentication
- **No Backend-to-Frontend Calls**: Backend never calls frontend for auth verification
- **Integration Layer**: JWT verification middleware isolates auth logic from business logic

**Gate Status**: ✅ PASSED - All constitutional principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/2-auth-jwt-integration/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (JWT token structure, user entity)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── jwt-middleware.md # JWT verification middleware contract
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Frontend (Next.js + Better Auth)
frontend/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx      # Sign-in page
│   │   │   └── signup/
│   │   │       └── page.tsx      # Sign-up page
│   │   └── layout.tsx            # Root layout with auth provider
│   ├── lib/
│   │   ├── auth.ts               # Better Auth configuration
│   │   └── api-client.ts         # API client with JWT injection
│   └── middleware.ts             # Next.js middleware for protected routes
├── .env.local                    # Environment variables (BETTER_AUTH_SECRET)
├── package.json                  # Dependencies (Better Auth, Next.js)
└── README.md                     # Frontend setup instructions

# Backend (FastAPI + JWT Verification)
backend/
├── src/
│   ├── main.py                   # FastAPI app (updated with JWT middleware)
│   ├── config.py                 # Configuration (updated with BETTER_AUTH_SECRET)
│   ├── core/
│   │   ├── security.py           # JWT verification (UPDATED)
│   │   └── auth.py               # Authentication dependencies (NEW)
│   ├── api/
│   │   └── routes/
│   │       └── todos.py          # Todo endpoints (UPDATED with auth)
│   └── schemas/
│       └── auth.py               # JWT token schemas (NEW)
├── tests/
│   ├── test_auth.py              # JWT verification tests (NEW)
│   └── test_todos.py             # Todo endpoint tests (UPDATED with auth)
├── .env                          # Environment variables (BETTER_AUTH_SECRET)
├── requirements.txt              # Dependencies (PyJWT added)
└── README.md                     # Backend setup instructions (UPDATED)
```

**Structure Decision**: Web application structure selected because this feature spans both frontend (Better Auth token issuance) and backend (FastAPI token verification). The frontend handles user authentication and token management, while the backend handles token verification and authorization enforcement. Both layers share the BETTER_AUTH_SECRET for JWT signing/verification.

## Complexity Tracking

> **No violations** - All constitutional principles are satisfied without exceptions.

## Phase 0: Research & Technology Decisions

### Decision 1: JWT Signing Algorithm

**Decision**: Use HS256 (HMAC with SHA-256) for JWT signing
**Rationale**:
- Symmetric signing algorithm (same secret for signing and verification)
- Simpler than asymmetric algorithms (RS256) - no public/private key management
- Sufficient security for shared secret between frontend and backend
- Better Auth supports HS256 out of the box
- PyJWT has excellent HS256 support

**Alternatives considered**:
- RS256 (RSA asymmetric): More complex, requires key pair management, overkill for single backend
- ES256 (ECDSA): Better performance than RSA but still requires key pair management

### Decision 2: JWT Token Payload Structure

**Decision**: Include user_id, email, iat (issued at), and exp (expiration) claims
**Rationale**:
- user_id: Required for authorization (matching with route user_id)
- email: Useful for logging and debugging
- iat: Standard JWT claim for token issuance timestamp
- exp: Required for expiration validation (FR-011, FR-020)
- Minimal payload size reduces token size and improves performance

**Alternatives considered**:
- Include user roles/permissions: Out of scope (no RBAC in Spec-2)
- Include session ID: Violates stateless requirement
- Include refresh token: Out of scope (no refresh token rotation in Spec-2)

### Decision 3: Token Expiration Duration

**Decision**: 7 days (604800 seconds)
**Rationale**:
- Balances security (shorter is better) with user experience (longer reduces re-authentication)
- Industry standard for web applications
- Can be adjusted via environment variable if needed
- Acceptable risk given HTTPS enforcement and secure token storage

**Alternatives considered**:
- 24 hours: More secure but requires daily re-authentication (poor UX)
- 30 days: Better UX but higher security risk if token is stolen
- Refresh tokens: Out of scope for Spec-2

### Decision 4: Frontend Token Storage

**Decision**: Store JWT in httpOnly cookies (if possible) or secure localStorage
**Rationale**:
- httpOnly cookies: Best security (immune to XSS attacks)
- localStorage: Fallback if cookies not feasible (vulnerable to XSS but acceptable with CSP)
- Better Auth handles storage automatically based on configuration
- Must persist across page refreshes (FR-009)

**Alternatives considered**:
- sessionStorage: Doesn't persist across tabs/windows (poor UX)
- In-memory only: Lost on page refresh (poor UX)

### Decision 5: Backend JWT Verification Strategy

**Decision**: Use FastAPI dependency injection with PyJWT library
**Rationale**:
- FastAPI's `Depends()` provides clean, testable auth injection
- PyJWT is the standard Python JWT library (mature, well-tested)
- Allows mocking auth in tests
- Follows FastAPI best practices
- Can be applied globally or per-endpoint

**Alternatives considered**:
- python-jose: Alternative JWT library, but PyJWT is more widely used
- Manual JWT parsing: Error-prone, reinventing the wheel
- Global middleware: Less flexible than dependency injection

### Decision 6: Authorization Enforcement Pattern

**Decision**: Create `validate_user_access(token_user_id, resource_user_id)` helper function
**Rationale**:
- Reusable across all endpoints
- Centralizes authorization logic
- Raises HTTPException(403) on mismatch
- Easy to test independently
- Follows DRY principle

**Alternatives considered**:
- Inline checks in each endpoint: Violates DRY, error-prone
- Decorator pattern: More complex, less explicit
- Middleware-based: Can't access route parameters easily

### Decision 7: Error Response Format

**Decision**: Use constitutional standard error format with `error.code`, `error.message`, `error.details[]`
**Rationale**:
- Consistent with Spec-1 backend (FR-026)
- Supports field-level validation errors
- Machine-readable error codes
- Human-readable messages
- Already implemented in Spec-1

**Alternatives considered**:
- Custom auth error format: Inconsistent with existing backend
- Simple string errors: Not structured enough for client parsing

### Decision 8: Integration with Spec-1 Backend

**Decision**: Update existing endpoints to require JWT verification without breaking changes
**Rationale**:
- Add JWT verification as a dependency to existing endpoints
- No changes to endpoint signatures or response formats
- Backward compatible (can be deployed incrementally)
- Follows Open/Closed Principle (open for extension, closed for modification)

**Alternatives considered**:
- Create new authenticated endpoints: Duplicates code, confusing API
- Break existing endpoints: Violates FR-026 (seamless integration)

## Phase 1: Design Artifacts

### Data Model Summary

**JWT Token Structure**:
```json
{
  "user_id": 123,
  "email": "user@example.com",
  "iat": 1704844800,
  "exp": 1705449600
}
```

**Claims**:
- `user_id` (integer): Unique user identifier, matches database user.id
- `email` (string): User email address
- `iat` (integer): Issued at timestamp (Unix epoch)
- `exp` (integer): Expiration timestamp (Unix epoch)

**User Entity** (reference only):
- Already defined in Spec-1
- No changes needed for authentication integration

See [data-model.md](./data-model.md) for complete JWT token structure and validation rules.

### API Contract Summary

**JWT Verification Middleware Contract**:

**Input**:
- HTTP Header: `Authorization: Bearer <JWT>`

**Processing**:
1. Extract Authorization header
2. Validate Bearer token format
3. Decode JWT and verify signature using BETTER_AUTH_SECRET
4. Validate token expiration (exp claim)
5. Extract user_id from claims

**Output**:
- Success: `current_user_id` (integer) available to endpoint
- Failure: HTTPException with 401 status code

**Error Scenarios**:
- Missing Authorization header → 401 Unauthorized
- Invalid Bearer format → 401 Unauthorized
- Invalid JWT signature → 401 Unauthorized
- Expired token → 401 Unauthorized
- Missing user_id claim → 401 Unauthorized

**Authorization Validation Contract**:

**Input**:
- `token_user_id` (integer): User ID from verified JWT
- `resource_user_id` (integer): User ID from route parameter

**Processing**:
- Compare token_user_id with resource_user_id

**Output**:
- Success: No action (allow request to proceed)
- Failure: HTTPException with 403 status code

See [contracts/jwt-middleware.md](./contracts/jwt-middleware.md) for complete middleware specification.

### Setup & Verification

See [quickstart.md](./quickstart.md) for:
- Better Auth configuration (JWT plugin setup)
- Shared secret configuration (BETTER_AUTH_SECRET)
- Frontend API client setup (JWT injection)
- Backend JWT verification setup (PyJWT installation)
- End-to-end testing (login → API request → verification)
- Verification checklist

## Implementation Phases

### Phase 1: Shared Secret Management (Blocking)
**Objective**: Establish shared secret for JWT signing/verification

**Tasks**:
1. Define BETTER_AUTH_SECRET in frontend environment (.env.local)
2. Define same BETTER_AUTH_SECRET in backend environment (.env)
3. Update frontend config.py to load BETTER_AUTH_SECRET
4. Update backend config.py to load BETTER_AUTH_SECRET
5. Verify secrets are never committed to source control (.gitignore)
6. Document secret generation and rotation procedures

**Acceptance Criteria**:
- Both frontend and backend load identical BETTER_AUTH_SECRET from environment
- Secrets are not hardcoded in source code
- .env files are in .gitignore

### Phase 2: Better Auth Configuration (Frontend)
**Objective**: Configure Better Auth to issue JWT tokens upon successful login

**Tasks**:
1. Install Better Auth and JWT plugin dependencies
2. Configure Better Auth with JWT plugin enabled
3. Define JWT payload structure (user_id, email, iat, exp)
4. Set token expiration duration (7 days)
5. Configure token signing with BETTER_AUTH_SECRET
6. Test token issuance on successful login

**Acceptance Criteria**:
- Better Auth issues JWT tokens on successful login
- JWT payload includes user_id, email, iat, exp claims
- JWT is signed with BETTER_AUTH_SECRET using HS256
- Token expiration is set to 7 days

### Phase 3: Frontend API Client Updates
**Objective**: Attach JWT tokens to all API requests

**Tasks**:
1. Create API client utility (lib/api-client.ts)
2. Extract JWT token from Better Auth session
3. Attach token to all API requests in Authorization header
4. Use format: `Authorization: Bearer <token>`
5. Handle missing token scenario (redirect to login)
6. Test API requests include Authorization header

**Acceptance Criteria**:
- All API requests include Authorization header with JWT
- Header format is `Bearer <token>`
- Missing token redirects to login page
- Token persists across page refreshes

### Phase 4: FastAPI JWT Verification Middleware
**Objective**: Verify JWT signature and expiration on every protected request

**Tasks**:
1. Install PyJWT dependency (requirements.txt)
2. Create JWT verification function in core/auth.py
3. Extract Authorization header from request
4. Validate Bearer token format
5. Verify JWT signature using BETTER_AUTH_SECRET
6. Check token expiration (exp claim)
7. Raise HTTPException(401) for invalid/expired tokens
8. Test JWT verification with valid and invalid tokens

**Acceptance Criteria**:
- Backend verifies JWT signature using shared secret
- Backend validates token expiration
- Invalid tokens return 401 Unauthorized
- Expired tokens return 401 Unauthorized
- Missing tokens return 401 Unauthorized

### Phase 5: User Identity Extraction
**Objective**: Extract authenticated user_id from verified JWT claims

**Tasks**:
1. Decode JWT payload after signature verification
2. Extract user_id claim from payload
3. Validate user_id is present and is an integer
4. Create FastAPI dependency `get_current_user_id()` that returns user_id
5. Make dependency available to all protected endpoints
6. Test user_id extraction with various JWT payloads

**Acceptance Criteria**:
- Backend extracts user_id from verified JWT
- user_id is available to all protected endpoints via dependency injection
- Missing user_id claim returns 401 Unauthorized
- Invalid user_id format returns 401 Unauthorized

### Phase 6: Route-Level Authorization Enforcement
**Objective**: Ensure authenticated user can only access their own resources

**Tasks**:
1. Create `validate_user_access(token_user_id, resource_user_id)` helper
2. Update all Spec-1 endpoints to call validation helper
3. Compare authenticated user_id with route {user_id} parameter
4. Raise HTTPException(403) on mismatch
5. Test cross-user access attempts (should return 403)
6. Verify same-user access works (should return 200)

**Acceptance Criteria**:
- All endpoints compare JWT user_id with route user_id
- Mismatches return 403 Forbidden
- Matches allow request to proceed
- Zero cross-user data access possible

### Phase 7: Failure Scenarios Handling
**Objective**: Implement consistent error handling for all auth failures

**Tasks**:
1. Missing token → 401 Unauthorized with clear message
2. Invalid token signature → 401 Unauthorized with clear message
3. Expired token → 401 Unauthorized with "token expired" message
4. User mismatch → 403 Forbidden with "access denied" message
5. Update error response format to match constitutional standard
6. Test all error scenarios return correct status codes and messages

**Acceptance Criteria**:
- All authentication failures return 401 with appropriate message
- All authorization failures return 403 with appropriate message
- Error messages are clear and actionable
- Error responses match constitutional format

### Phase 8: Security Validation
**Objective**: Verify backend security guarantees

**Tasks**:
1. Test backend accepts only signed tokens (reject unsigned)
2. Test backend detects token tampering (modified payload)
3. Test backend works without frontend runtime (stateless)
4. Test token expiration is enforced consistently
5. Test shared secret mismatch is detected (all tokens rejected)
6. Security audit of JWT verification code

**Acceptance Criteria**:
- Backend rejects unsigned tokens
- Backend detects and rejects tampered tokens
- Backend operates statelessly (no session storage)
- Token expiration is enforced on every request
- Secret mismatch results in 100% token rejection

### Phase 9: Final Verification
**Objective**: End-to-end validation of authentication system

**Tasks**:
1. Test complete login → API access flow
2. Verify stateless operation (no session storage)
3. Verify backend ready for frontend consumption (Spec-3)
4. Performance testing (token verification <50ms)
5. Load testing (1000 concurrent authenticated requests)
6. Documentation review and updates

**Acceptance Criteria**:
- Users can log in and receive valid JWT tokens
- JWT tokens work for all Spec-1 API endpoints
- System operates without session storage
- Token verification adds <50ms latency
- System handles 1000 concurrent requests
- All success criteria from spec.md are met

## Risk Analysis

### Risk 1: Shared Secret Mismatch
**Impact**: All authentication will fail if secrets differ between frontend and backend
**Mitigation**:
- Configuration validation on startup (log secret hash for comparison)
- Use shared environment configuration (e.g., .env file in monorepo)
- Document secret setup clearly in quickstart.md
- Add health check endpoint that verifies JWT signing/verification works

### Risk 2: Token Expiration Handling
**Impact**: Poor UX if expired tokens aren't handled gracefully
**Mitigation**:
- Clear error messages for expired tokens
- Frontend detects 401 responses and redirects to login
- Consider implementing token refresh in future (out of scope for Spec-2)

### Risk 3: Performance Impact
**Impact**: JWT verification on every request could add latency
**Mitigation**:
- Use efficient PyJWT library (optimized C extensions)
- Benchmark verification performance (<50ms target)
- Consider caching public keys if switching to asymmetric signing (future)

### Risk 4: Token Theft
**Impact**: Stolen JWT tokens can be used until expiration
**Mitigation**:
- Use short token lifetimes (7 days is acceptable)
- Enforce HTTPS in production (tokens encrypted in transit)
- Implement secure token storage (httpOnly cookies preferred)
- No revocation mechanism in Spec-2 (acceptable trade-off for stateless design)

### Risk 5: Secret Exposure
**Impact**: If BETTER_AUTH_SECRET is exposed, all tokens can be forged
**Mitigation**:
- Never commit secrets to version control (.gitignore)
- Use secure secret management (environment variables, secret managers)
- Rotate secrets if compromised (requires all users to re-authenticate)
- Document secret rotation procedures

### Risk 6: Breaking Changes to Spec-1 Backend
**Impact**: Adding authentication could break existing functionality
**Mitigation**:
- Use dependency injection (non-breaking addition)
- Test all Spec-1 endpoints after authentication integration
- Maintain backward compatibility during transition
- Deploy incrementally (test in staging first)

## Next Steps

After `/sp.plan` completion:
1. Review generated artifacts (research.md, data-model.md, contracts/jwt-middleware.md, quickstart.md)
2. Run `/sp.tasks` to generate actionable implementation tasks
3. Execute tasks in phase order (Phase 1 → Phase 9)
4. Verify each phase independently before proceeding to next
5. Perform end-to-end testing after Phase 9 completion
6. Document any architectural decisions in ADRs if needed
