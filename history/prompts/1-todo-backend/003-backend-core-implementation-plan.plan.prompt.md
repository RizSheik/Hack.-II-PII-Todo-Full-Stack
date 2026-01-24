---
id: 003
title: Backend Core Implementation Plan
stage: plan
date: 2026-01-09
surface: agent
model: claude-sonnet-4-5
feature: 1-todo-backend
branch: 1-todo-backend
user: system
command: /sp.plan
labels: ["backend", "api", "planning", "architecture", "data-model"]
links:
  spec: specs/1-todo-backend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-todo-backend/plan.md
  - specs/1-todo-backend/research.md
  - specs/1-todo-backend/data-model.md
  - specs/1-todo-backend/contracts/openapi.yaml
  - specs/1-todo-backend/quickstart.md
tests:
  - N/A (planning phase)
---

## Prompt

```text
Objective:
Implement a secure, spec-compliant backend service that manages user-scoped Todo tasks.

Step-by-step plan:

1. Project Initialization
   - Create FastAPI application structure
   - Configure environment-based settings
   - Set up database connection to Neon PostgreSQL

2. Data Modeling
   - Define SQLModel Task schema
     - id (UUID or int)
     - title
     - description (optional)
     - completed (boolean)
     - owner_user_id (string / UUID)
     - created_at
     - updated_at
   - Enforce ownership at model/query level

3. Database Integration
   - Initialize SQLModel engine
   - Create database tables
   - Verify persistence and migrations strategy

4. API Route Definitions
   - Implement endpoints:
     - GET    /api/{user_id}/tasks
     - POST   /api/{user_id}/tasks
     - GET    /api/{user_id}/tasks/{id}
     - PUT    /api/{user_id}/tasks/{id}
     - DELETE /api/{user_id}/tasks/{id}
     - PATCH  /api/{user_id}/tasks/{id}/complete
   - Ensure route structure matches spec exactly

5. Request Handling Logic
   - Extract authenticated user ID from request context
   - Validate route user_id against authenticated user
   - Reject mismatches with 403 Forbidden

6. Data Access Rules
   - All queries must filter by owner_user_id
   - No endpoint may access unowned tasks
   - Prevent ID enumeration attacks

7. Error Handling
   - 401 Unauthorized for missing auth context
   - 403 Forbidden for user mismatch
   - 404 Not Found for missing tasks
   - 422 Validation errors
   - Consistent error response schema

8. Validation & Testing
   - Manually test all endpoints via Postman/cURL
   - Verify database persistence
   - Confirm user isolation across requests

9. Final Verification
   - Backend runs standalone
   - API matches spec without undocumented behavior
   - Ready for integration with authentication layer (Spec-2)
```

## Response snapshot

Created comprehensive implementation plan for Todo Backend Core & Data Layer (Feature 1-todo-backend) with complete Phase 0 and Phase 1 artifacts.

**Implementation Plan (plan.md)**:
- Technical context: Python 3.11+, FastAPI, SQLModel, Neon PostgreSQL
- Constitution check: ✅ All 5 principles satisfied (Correctness, Security-First, Spec-Driven, Reproducibility, Separation of Concerns)
- Project structure: Backend-only with clear separation (models, schemas, routes, core)
- Implementation phases: Foundation → US1 (P1 MVP) → US4 (P2) → US2 (P2) → US3 (P3) → Polish
- Risk analysis: User ID mismatch vulnerabilities, database failures, concurrent updates, JWT verification

**Phase 0: Research (research.md)**:
- Decision 1: Integer IDs (simpler, faster, user isolation prevents enumeration)
- Decision 2: Application-level UTC timestamps (testable, portable)
- Decision 3: FastAPI dependency injection for auth (idiomatic, testable)
- Decision 4: Constitutional error format (consistent, structured)
- Decision 5: Alembic migrations (optional for MVP, add later)
- Decision 6: Manual query filtering (explicit, auditable)
- Decision 7: Separate Pydantic schemas (separation of concerns)

**Phase 1: Data Model (data-model.md)**:
- Todo entity: 7 attributes (id, title, description, completed, user_id, created_at, updated_at)
- User entity: Minimal reference (id only, full management in Spec-2)
- Relationships: Todo → User (many-to-one with foreign key)
- Validation rules: Title 1-200 chars, description max 1000 chars
- Indexes: user_id, (user_id, created_at) composite
- SQLModel and Pydantic schema implementations provided

**Phase 1: API Contracts (contracts/openapi.yaml)**:
- 5 endpoints: List, Create, Get, Update, Delete todos
- Complete OpenAPI 3.0 specification with examples
- Request/response schemas for all operations
- Error responses: 401, 403, 404, 422 with constitutional format
- Security: Bearer JWT authentication on all endpoints
- Authorization: Route user_id must match JWT user_id

**Phase 1: Quickstart Guide (quickstart.md)**:
- Complete setup instructions (Python, venv, dependencies)
- Database configuration (Neon or local PostgreSQL)
- Environment variables (.env template)
- Database initialization steps
- API server startup and verification
- 8 test scenarios with curl commands
- Troubleshooting guide for common issues
- Success criteria verification checklist

**Constitutional Compliance**:
- ✅ Correctness: All requirements testable with acceptance scenarios
- ✅ Security-First: User isolation enforced at every layer, JWT verification required
- ✅ Spec-Driven: API contracts documented before implementation
- ✅ Reproducibility: Complete setup guide enables any developer to build from specs
- ✅ Separation of Concerns: Backend-only, RESTful API, ORM abstraction, auth boundary

**Key Architectural Decisions**:
- Stateless design (JWT-based, no server sessions)
- User data isolation (every query filters by user_id)
- Three-layer validation (Pydantic API, SQLModel ORM, PostgreSQL constraints)
- Deterministic error responses (constitutional format)
- FastAPI dependency injection for auth
- SQLModel for type-safe ORM with Pydantic integration

## Outcome

- ✅ Impact: Created complete implementation plan with all Phase 0 and Phase 1 artifacts for backend core functionality
- 🧪 Tests: Planning phase - test scenarios defined in quickstart.md for verification
- 📁 Files: Created 5 planning artifacts (plan.md, research.md, data-model.md, openapi.yaml, quickstart.md)
- 🔁 Next prompts: `/sp.tasks` to generate actionable implementation tasks organized by user story
- 🧠 Reflection: Planning successfully translates specification into concrete technical design. All technology decisions documented with rationale. API contracts complete and ready for implementation. Constitutional compliance verified at every level. User isolation is the central security principle throughout the design.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning phase completed successfully with all artifacts
- Graders run and results (PASS/FAIL): Constitution check - PASS (all 5 principles satisfied), API contract completeness - PASS (all endpoints documented with examples)
- Prompt variant (if applicable): Standard planning workflow with Phase 0 research and Phase 1 design
- Next experiment (smallest change to try): Validate that generated plan enables implementation without additional clarification during task generation phase
