---
id: 002
title: Authentication JWT Implementation Planning
stage: plan
date: 2026-01-09
surface: agent
model: claude-opus-4-5-20251101
feature: 2-auth-jwt-integration
branch: 2-auth-jwt-integration
user: mac
command: /sp.plan
labels: ["planning", "authentication", "jwt", "better-auth", "fastapi", "architecture", "security", "stateless-auth"]
links:
  spec: specs/2-auth-jwt-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/2-auth-jwt-integration/plan.md
  - specs/2-auth-jwt-integration/research.md
  - specs/2-auth-jwt-integration/data-model.md
  - specs/2-auth-jwt-integration/contracts/jwt-middleware.md
  - specs/2-auth-jwt-integration/quickstart.md
tests:
  - N/A (planning phase - no tests yet)
---

## Prompt

User executed `/sp.plan` command with the following step-by-step implementation plan:

```
Objective:
Secure all backend API access using JWT-based authentication issued by Better Auth and verified by FastAPI.

Step-by-step plan:

1. Better Auth Configuration (Frontend)
   - Enable Better Auth JWT plugin
   - Configure token issuance on successful login
   - Define JWT payload to include:
     - user_id
     - email
     - issued_at
     - expiration
   - Set token expiration duration (e.g., 7 days)

2. Shared Secret Management
   - Define BETTER_AUTH_SECRET in frontend environment
   - Define same BETTER_AUTH_SECRET in backend environment
   - Ensure secrets are never committed to source control

3. Frontend API Client Updates
   - Extract JWT token from Better Auth session
   - Attach token to all API requests:
     - Authorization: Bearer <JWT>
   - Ensure no request is sent without token

4. FastAPI JWT Verification Middleware
   - Implement middleware or dependency to:
     - Extract Authorization header
     - Validate Bearer token format
     - Verify JWT signature using shared secret
     - Check token expiration
   - Reject invalid or missing tokens with 401

5. User Identity Extraction
   - Decode JWT payload
   - Extract authenticated user_id
   - Attach user identity to request context/state

6. Route-Level Authorization Enforcement
   - Compare authenticated user_id with route {user_id}
   - Reject mismatches with 403 Forbidden
   - Ensure all Spec-1 endpoints depend on auth verification

7. Failure Scenarios Handling
   - Missing token → 401 Unauthorized
   - Invalid token → 401 Unauthorized
   - Expired token → 401 Unauthorized
   - User mismatch → 403 Forbidden

8. Security Validation
   - Verify backend accepts only signed tokens
   - Confirm token tampering is detected
   - Ensure backend works without frontend runtime

9. Final Verification
   - End-to-end login → API access flow works
   - Stateless auth confirmed (no sessions)
   - Backend ready for frontend consumption (Spec-3)
```

## Response snapshot

Successfully created comprehensive implementation plan for Authentication & JWT Security Integration feature:

**Planning Artifacts Created**:

1. **plan.md** (comprehensive implementation plan):
   - Summary: Stateless JWT authentication between Better Auth and FastAPI
   - Technical Context: Python 3.11+, FastAPI, Better Auth, PyJWT, HS256 algorithm
   - Constitution Check: ✅ PASSED (all 5 principles satisfied)
   - Project Structure: Web application (frontend + backend)
   - Complexity Tracking: No violations
   - Phase 0: Research & Technology Decisions (8 decisions documented)
   - Phase 1: Design Artifacts (data model, API contracts, quickstart)
   - Implementation Phases: 9 phases aligned with user's step-by-step plan
   - Risk Analysis: 6 risks identified with mitigations

2. **research.md** (technology decisions):
   - Q1: JWT Signing Algorithm → HS256 (symmetric, simpler than RS256/ES256)
   - Q2: JWT Payload Structure → user_id, email, iat, exp (minimal but sufficient)
   - Q3: Token Expiration Duration → 7 days (balances security and UX)
   - Q4: Frontend Token Storage → httpOnly cookies (preferred) or localStorage (fallback)
   - Q5: Backend JWT Verification → PyJWT library (industry standard)
   - Q6: Authorization Enforcement → Helper function validate_user_access()
   - Q7: Spec-1 Integration → Update existing endpoints (non-breaking)
   - Technology Stack Summary: Better Auth, Next.js 14+, FastAPI 0.104+, PyJWT 2.8+
   - Security Considerations: Threat model, best practices, performance benchmarks

3. **data-model.md** (JWT token structure):
   - JWT Token Format: header.payload.signature
   - Header: {"alg": "HS256", "typ": "JWT"}
   - Payload: {"user_id": 123, "email": "user@example.com", "iat": 1704844800, "exp": 1705449600}
   - Signature: HMACSHA256(header + payload, BETTER_AUTH_SECRET)
   - Token Lifecycle: Issuance → Transmission → Verification → Expiration
   - Authorization Model: User-resource ownership validation
   - Token Security: Threat model, validation rules, error responses
   - Integration with Spec-1: All endpoints updated to require JWT

4. **contracts/jwt-middleware.md** (API contracts):
   - JWT Verification Dependency: verify_jwt_token() function
   - User Identity Extraction: get_current_user_id() function
   - Authorization Validation: validate_user_access() helper
   - Endpoint Integration Pattern: FastAPI dependency injection
   - Error Response Format: Constitutional error format
   - Configuration Requirements: BETTER_AUTH_SECRET environment variable
   - Testing Contract: Unit and integration test cases
   - Performance Requirements: <50ms JWT verification

5. **quickstart.md** (setup and verification guide):
   - Prerequisites: Node.js 18+, Python 3.11+, PostgreSQL 15+
   - Step 1: Generate shared secret (openssl rand -base64 32)
   - Step 2: Configure backend (install PyJWT, update .env, create auth.py)
   - Step 3: Configure frontend (install Better Auth, configure JWT plugin, create API client)
   - Verification Checklist: Backend, frontend, and end-to-end tests
   - Troubleshooting: Common issues and solutions
   - Performance Benchmarks: <50ms verification, <2s login, 1000 concurrent requests
   - Security Checklist: HTTPS, secret management, token storage, CSP, CORS

**Key Achievements**:
- All 9 user-provided steps incorporated into implementation phases
- Constitutional compliance verified (Security-First, Spec-Driven Rigor, Stateless)
- 8 technology decisions documented with rationale and alternatives
- Complete JWT token structure defined (header, payload, signature)
- Comprehensive API contracts for JWT verification middleware
- Detailed setup guide with verification checklist
- Risk analysis with 6 risks identified and mitigated
- Performance targets defined (<50ms verification, 1000 concurrent requests)
- Security best practices documented (HTTPS, secret management, token storage)

**Implementation Phases** (aligned with user's 9-step plan):
1. Shared Secret Management (Blocking)
2. Better Auth Configuration (Frontend)
3. Frontend API Client Updates
4. FastAPI JWT Verification Middleware
5. User Identity Extraction
6. Route-Level Authorization Enforcement
7. Failure Scenarios Handling
8. Security Validation
9. Final Verification

## Outcome

- ✅ Impact: Comprehensive implementation plan created for stateless JWT authentication system; defines 9 implementation phases, 8 technology decisions, complete JWT token structure, API contracts for middleware, and detailed setup guide; ready for task generation
- 🧪 Tests: Planning phase complete - no tests yet; testing strategy defined in contracts/jwt-middleware.md (unit tests for JWT verification, integration tests for end-to-end flow)
- 📁 Files: Created specs/2-auth-jwt-integration/plan.md (implementation plan), research.md (technology decisions), data-model.md (JWT structure), contracts/jwt-middleware.md (API contracts), quickstart.md (setup guide)
- 🔁 Next prompts: Run /sp.tasks to generate actionable implementation tasks based on the 9 phases defined in plan.md
- 🧠 Reflection: Planning successfully incorporated user's detailed 9-step approach while maintaining constitutional compliance; all technology decisions documented with rationale and alternatives; JWT token structure fully specified with validation rules; comprehensive setup guide enables reproducible implementation; ready for task generation phase

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully with all required artifacts generated
- Graders run and results (PASS/FAIL): Constitution Check PASS (5/5 principles), Technical Context COMPLETE (all fields specified), Research COMPLETE (8 decisions documented), Design Artifacts COMPLETE (data model, contracts, quickstart)
- Prompt variant (if applicable): Standard /sp.plan workflow with detailed user-provided step-by-step implementation plan
- Next experiment (smallest change to try): Proceed with /sp.tasks to generate actionable tasks; planning is complete and ready for implementation phase
