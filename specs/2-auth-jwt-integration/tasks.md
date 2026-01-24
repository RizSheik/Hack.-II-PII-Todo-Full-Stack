---
description: "Task list for Authentication & JWT Security Integration"
---

# Tasks: Authentication & JWT Security Integration

**Input**: Design documents from `/specs/2-auth-jwt-integration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/jwt-middleware.md, quickstart.md

**Tests**: Tests are NOT explicitly requested in the specification. Tasks focus on implementation and manual verification.

**Organization**: Tasks are grouped by implementation phase, mapped to user stories where applicable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment and dependency setup

- [X] T001 Generate shared secret using `openssl rand -base64 32`
- [X] T002 [P] Add PyJWT==2.8.0 to backend/requirements.txt
- [ ] T003 [P] Add better-auth and @better-auth/jwt to frontend/package.json
- [X] T004 [P] Create backend/.env with BETTER_AUTH_SECRET
- [ ] T005 [P] Create frontend/.env.local with BETTER_AUTH_SECRET (same value as backend)
- [X] T006 Install backend dependencies: `pip install -r backend/requirements.txt`
- [ ] T007 Install frontend dependencies: `npm install` in frontend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication infrastructure that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Update backend/src/config.py to add BETTER_AUTH_SECRET setting
- [X] T009 Create backend/src/core/auth.py with verify_jwt_token() function
- [X] T010 Create backend/src/core/auth.py with get_current_user_id() dependency
- [X] T011 Update backend/src/core/security.py with validate_user_access() helper
- [ ] T012 [P] Create frontend/src/lib/auth.ts with Better Auth configuration
- [ ] T013 [P] Create frontend/src/lib/api-client.ts with JWT injection logic

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Token Issuance (Priority: P1) 🎯 MVP

**Goal**: Better Auth issues JWT tokens upon successful user login

**Independent Test**: User logs in, receives JWT token with user_id, email, iat, exp claims

### Implementation for User Story 1

- [ ] T014 [US1] Configure Better Auth JWT plugin in frontend/src/lib/auth.ts
- [ ] T015 [US1] Set JWT algorithm to HS256 in Better Auth config
- [ ] T016 [US1] Set JWT expiration to 7 days in Better Auth config
- [ ] T017 [US1] Define JWT claims (user_id, email) in Better Auth config
- [ ] T018 [US1] Test login flow: user logs in and receives JWT token
- [ ] T019 [US1] Verify JWT token contains user_id, email, iat, exp claims
- [ ] T020 [US1] Verify JWT token is signed with BETTER_AUTH_SECRET

**Checkpoint**: Users can log in and receive valid JWT tokens

---

## Phase 4: User Story 2 - Authenticated API Requests (Priority: P1) 🎯 MVP

**Goal**: Frontend attaches JWT to all API requests, backend verifies tokens

**Independent Test**: Make API request with valid JWT, verify backend accepts and processes request

### Implementation for User Story 2

- [ ] T021 [US2] Implement token extraction from Better Auth session in frontend/src/lib/api-client.ts
- [ ] T022 [US2] Add Authorization header (Bearer <token>) to all API requests in api-client.ts
- [X] T023 [US2] Implement JWT signature verification in backend/src/core/auth.py
- [X] T024 [US2] Implement JWT expiration validation in backend/src/core/auth.py
- [X] T025 [US2] Implement user_id extraction from JWT payload in backend/src/core/auth.py
- [X] T026 [US2] Update backend/src/api/routes/todos.py to use get_current_user_id dependency
- [ ] T027 [US2] Test API request with valid JWT: verify 200 OK response
- [ ] T028 [US2] Verify backend extracts correct user_id from JWT

**Checkpoint**: Authenticated API requests work end-to-end

---

## Phase 5: User Story 3 - Unauthorized Access Prevention (Priority: P1) 🎯 MVP

**Goal**: Backend rejects requests without valid JWT tokens

**Independent Test**: Make API request without token, with invalid token, with expired token - all return 401

### Implementation for User Story 3

- [X] T029 [US3] Add missing Authorization header check in backend/src/core/auth.py
- [X] T030 [US3] Add invalid Bearer format check in backend/src/core/auth.py
- [X] T031 [US3] Add invalid signature detection in backend/src/core/auth.py
- [X] T032 [US3] Add expired token detection in backend/src/core/auth.py
- [X] T033 [US3] Add missing user_id claim check in backend/src/core/auth.py
- [X] T034 [US3] Implement constitutional error format for all 401 responses
- [ ] T035 [US3] Test missing token: verify 401 "Missing authentication token"
- [ ] T036 [US3] Test invalid signature: verify 401 "Invalid token signature"
- [ ] T037 [US3] Test expired token: verify 401 "Token expired"

**Checkpoint**: All unauthorized requests are properly rejected with 401

---

## Phase 6: User Story 4 - Cross-User Access Prevention (Priority: P1) 🎯 MVP

**Goal**: Users can only access their own resources, not other users' data

**Independent Test**: User A tries to access User B's resources, verify 403 Forbidden

### Implementation for User Story 4

- [X] T038 [US4] Update GET /api/users/{user_id}/todos to call validate_user_access()
- [X] T039 [US4] Update POST /api/users/{user_id}/todos to call validate_user_access()
- [X] T040 [US4] Update GET /api/users/{user_id}/todos/{todo_id} to call validate_user_access()
- [X] T041 [US4] Update PUT /api/users/{user_id}/todos/{todo_id} to call validate_user_access()
- [X] T042 [US4] Update DELETE /api/users/{user_id}/todos/{todo_id} to call validate_user_access()
- [ ] T043 [US4] Test cross-user access: User 123 tries to access User 456's todos
- [ ] T044 [US4] Verify 403 "You can only access your own resources" response
- [ ] T045 [US4] Test same-user access: User 123 accesses own todos, verify 200 OK

**Checkpoint**: Zero cross-user data access possible - complete user isolation

---

## Phase 7: User Story 5 - Token Expiration Handling (Priority: P2)

**Goal**: System properly handles expired tokens and prompts re-authentication

**Independent Test**: Use expired token, verify 401 response, re-login works

### Implementation for User Story 5

- [ ] T046 [US5] Add frontend 401 response handler in frontend/src/lib/api-client.ts
- [ ] T047 [US5] Implement redirect to login on 401 in api-client.ts
- [ ] T048 [US5] Add clear error message for expired tokens in backend
- [ ] T049 [US5] Test expired token: verify 401 and redirect to login
- [ ] T050 [US5] Test re-authentication: user logs in again, receives new token
- [ ] T051 [US5] Verify new token works for API requests

**Checkpoint**: Token expiration is handled gracefully with clear user feedback

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Security validation, performance testing, documentation

- [ ] T052 [P] Test backend accepts only signed tokens (reject unsigned)
- [ ] T053 [P] Test backend detects token tampering (modified payload)
- [ ] T054 [P] Verify stateless operation (no session storage)
- [ ] T055 [P] Test shared secret mismatch detection
- [ ] T056 Performance test: JWT verification <50ms per request
- [ ] T057 Load test: 1000 concurrent authenticated requests
- [ ] T058 [P] Update backend/README.md with authentication setup instructions
- [ ] T059 [P] Update frontend/README.md with Better Auth configuration
- [ ] T060 Security audit: review JWT verification code for vulnerabilities
- [ ] T061 Run quickstart.md verification checklist
- [ ] T062 Verify all success criteria from spec.md are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 → US2 → US3 → US4 (sequential dependencies)
  - US5 can start after US3 (parallel with US4)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P1)**: Depends on US1 (needs token issuance working)
- **User Story 3 (P1)**: Depends on US2 (needs JWT verification working)
- **User Story 4 (P1)**: Depends on US3 (needs auth working before authorization)
- **User Story 5 (P2)**: Depends on US3 (needs JWT verification for expiration handling)

### Within Each User Story

- Configuration before implementation
- Backend verification before frontend integration
- Core functionality before error handling
- Implementation before testing

### Parallel Opportunities

- Setup tasks T002-T005 can run in parallel (different files)
- Foundational tasks T012-T013 can run in parallel (frontend/backend separation)
- Polish tasks T052-T055, T058-T059 can run in parallel (different concerns)

---

## Parallel Example: Foundational Phase

```bash
# Launch frontend and backend foundational tasks together:
Task T012: Create frontend/src/lib/auth.ts with Better Auth configuration
Task T013: Create frontend/src/lib/api-client.ts with JWT injection logic

# These can run in parallel because they're in different codebases
```

---

## Implementation Strategy

### MVP First (User Stories 1-4)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T013) - CRITICAL
3. Complete Phase 3: User Story 1 (T014-T020) - Token issuance
4. Complete Phase 4: User Story 2 (T021-T028) - Authenticated requests
5. Complete Phase 5: User Story 3 (T029-T037) - Unauthorized prevention
6. Complete Phase 6: User Story 4 (T038-T045) - Cross-user prevention
7. **STOP and VALIDATE**: Test complete authentication flow end-to-end
8. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Token issuance works
3. Add US2 → Test independently → Authenticated requests work
4. Add US3 → Test independently → Unauthorized access blocked
5. Add US4 → Test independently → Cross-user access blocked (MVP!)
6. Add US5 → Test independently → Token expiration handled
7. Polish → Security validation and documentation

### Sequential Strategy (Recommended)

Due to sequential dependencies between user stories:

1. Team completes Setup + Foundational together
2. Implement US1 → US2 → US3 → US4 in sequence
3. Each story builds on the previous one
4. US5 can be added after US3 (optional enhancement)
5. Polish phase after all stories complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- User stories are sequential (not independent) due to authentication flow
- No tests generated (not requested in specification)
- Manual testing via curl/Postman is sufficient per spec requirements
- Commit after each task or logical group
- Stop at any checkpoint to validate story
- Avoid: skipping foundational phase, implementing stories out of order

---

## Task Count Summary

- **Total Tasks**: 62
- **Setup (Phase 1)**: 7 tasks
- **Foundational (Phase 2)**: 6 tasks (BLOCKING)
- **User Story 1 (P1)**: 7 tasks (Token issuance)
- **User Story 2 (P1)**: 8 tasks (Authenticated requests)
- **User Story 3 (P1)**: 9 tasks (Unauthorized prevention)
- **User Story 4 (P1)**: 8 tasks (Cross-user prevention)
- **User Story 5 (P2)**: 6 tasks (Token expiration)
- **Polish (Phase 8)**: 11 tasks

**Parallel Opportunities**: 8 tasks marked [P] can run in parallel

**MVP Scope**: Phases 1-6 (45 tasks) deliver complete JWT authentication with user isolation
