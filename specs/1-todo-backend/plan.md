# Implementation Plan: Todo Backend Core & Data Layer

**Branch**: `1-todo-backend` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-todo-backend/spec.md`

## Summary

Implement a secure, stateless REST API backend for managing user-scoped todo tasks. The backend provides complete CRUD operations for todos with strict user data isolation enforced at every layer. Each authenticated user can only access their own todos, with authorization verified on every request. Data persists in Neon Serverless PostgreSQL using SQLModel ORM.

**Core Capabilities**:
- Create, read, update, and delete todo items
- List all todos for authenticated user
- Retrieve individual todo by ID
- Mark todos as complete/incomplete
- Validate input (title length, required fields)
- Enforce user data isolation (100% - zero cross-user access)
- Return deterministic error responses (401, 403, 404, 422, 500)

**Technical Approach**:
- FastAPI framework for REST API with automatic OpenAPI documentation
- SQLModel for type-safe ORM with Pydantic validation
- Neon Serverless PostgreSQL for persistent storage
- JWT-based authentication (token verification assumed handled by middleware)
- Stateless design compatible with horizontal scaling

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.104+, SQLModel 0.0.14+, Pydantic 2.5+, psycopg2-binary 2.9+
**Storage**: Neon Serverless PostgreSQL (cloud-hosted PostgreSQL 15+)
**Testing**: pytest 7.4+, httpx 0.25+ (for FastAPI test client)
**Target Platform**: Linux/macOS server, containerized deployment (Docker)
**Project Type**: Backend API (web application backend)
**Performance Goals**: <500ms todo creation, <1s list retrieval (100 items), 100 concurrent users
**Constraints**: Stateless operation, JWT auth required, user data isolation mandatory, no raw SQL
**Scale/Scope**: 10,000 users, 1,000 todos per user, standard web app concurrency

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Correctness ✅
- **Compliance**: All functional requirements (FR-001 through FR-015) have corresponding acceptance scenarios
- **Verification**: Each endpoint can be tested via HTTP client (curl, Postman) with expected responses
- **Testability**: Success criteria define measurable outcomes (response times, data isolation percentages)

### II. Security-First Design ✅
- **JWT Verification**: All endpoints require authenticated user context (assumed provided by middleware)
- **User ID Validation**: Route user_id parameter MUST match JWT token user_id (403 if mismatch)
- **Query Filtering**: Every database query filters by `owner_user_id` (FR-005, SC-003, SC-007)
- **Authorization**: Cross-user access attempts return 403 Forbidden
- **No Trust**: Backend never trusts user_id from URL/body without JWT verification

### III. Spec-Driven Rigor ✅
- **API Contracts**: All endpoints documented with method, path, inputs, outputs, status codes (Phase 1)
- **Data Models**: Todo and User entities specified before implementation (Phase 1: data-model.md)
- **No Assumptions**: Implementation follows spec exactly - no undocumented features
- **Acceptance Criteria**: Every user story has Given-When-Then scenarios

### IV. Reproducibility ✅
- **Environment Config**: DATABASE_URL, JWT_SECRET via environment variables
- **Dependencies**: Exact versions specified in requirements.txt
- **Setup Steps**: quickstart.md provides complete setup and verification (Phase 1)
- **No Hidden State**: Stateless design - no server-side sessions

### V. Separation of Concerns ✅
- **Backend Only**: No frontend logic, no UI rendering
- **RESTful API**: Clean HTTP interface for frontend integration
- **ORM Layer**: SQLModel abstracts database access (no raw SQL)
- **Auth Boundary**: JWT verification handled by middleware (separate concern)
- **Validation**: Pydantic models validate input at API boundary

**Gate Status**: ✅ PASSED - All constitutional principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/1-todo-backend/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (entity definitions)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── openapi.yaml     # OpenAPI 3.0 specification
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # Database connection and session management
│   ├── models/
│   │   ├── __init__.py
│   │   ├── todo.py          # Todo SQLModel entity
│   │   └── user.py          # User reference (minimal)
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── todo.py          # Pydantic request/response schemas
│   │   └── error.py         # Error response schemas
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependency injection (auth, db session)
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── todos.py     # Todo CRUD endpoints
│   └── core/
│       ├── __init__.py
│       └── security.py      # JWT verification utilities
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   ├── test_todos.py        # Todo endpoint tests
│   └── test_auth.py         # Authorization tests
├── alembic/                 # Database migrations (optional)
│   └── versions/
├── .env.example             # Environment variable template
├── requirements.txt         # Python dependencies
├── pyproject.toml           # Project metadata
└── README.md                # Backend setup instructions
```

**Structure Decision**: Backend-only structure selected because this feature implements only the API layer. Frontend will be a separate feature (Spec-2). The `backend/` directory contains all API code, with clear separation between models (database), schemas (API contracts), and routes (endpoints).

## Complexity Tracking

> **No violations** - All constitutional principles are satisfied without exceptions.

## Phase 0: Research & Technology Decisions

### Decision 1: Database ID Strategy

**Decision**: Use auto-incrementing integer IDs for todos
**Rationale**:
- Simpler than UUIDs for initial implementation
- PostgreSQL sequences provide uniqueness guarantees
- Smaller index size improves query performance
- User isolation prevents ID enumeration attacks (user can't access other users' todos by ID)

**Alternatives considered**:
- UUIDs: More complex, larger storage, but globally unique (overkill for user-scoped data)
- Composite keys (user_id + sequence): Unnecessary complexity when user_id filtering is mandatory

### Decision 2: Timestamp Strategy

**Decision**: Use `datetime.utcnow()` for created_at and updated_at timestamps
**Rationale**:
- UTC avoids timezone confusion
- SQLModel/SQLAlchemy provides `default` and `onupdate` for automatic timestamp management
- Sufficient for audit trail requirements in spec

**Alternatives considered**:
- Database-generated timestamps (CURRENT_TIMESTAMP): Less portable, harder to test
- Unix epoch integers: Less readable, no timezone info

### Decision 3: Authentication Middleware Approach

**Decision**: Use FastAPI dependency injection for JWT verification
**Rationale**:
- FastAPI's `Depends()` provides clean, testable auth injection
- Middleware can extract JWT and provide `current_user_id` to endpoints
- Allows mocking auth in tests
- Follows FastAPI best practices

**Alternatives considered**:
- Global middleware: Less flexible, harder to test individual endpoints
- Manual token parsing in each endpoint: Violates DRY principle

### Decision 4: Error Response Format

**Decision**: Use constitutional standard error format with `error.code`, `error.message`, `error.details[]`
**Rationale**:
- Consistent with constitution requirements
- Supports field-level validation errors
- Machine-readable error codes
- Human-readable messages

**Alternatives considered**:
- FastAPI default format: Inconsistent with constitutional requirements
- Simple string errors: Not structured enough for client parsing

### Decision 5: Database Migration Strategy

**Decision**: Use Alembic for database migrations (optional for MVP)
**Rationale**:
- SQLModel integrates with Alembic
- Supports schema evolution
- Version-controlled migrations
- Can be added later if needed for MVP

**Alternatives considered**:
- SQLModel.metadata.create_all(): Simple but no migration history
- Manual SQL scripts: Error-prone, no rollback support

## Phase 1: Design Artifacts

### Data Model Summary

**Entities**:
1. **Todo** (primary entity)
   - Fields: id, title, description, completed, user_id, created_at, updated_at
   - Constraints: title NOT NULL, title length ≤ 200, user_id NOT NULL (foreign key)
   - Indexes: user_id (for filtering), created_at (for sorting)

2. **User** (reference only)
   - Fields: id (provided by auth layer)
   - Note: Full user management is out of scope (Spec-2)

**Relationships**:
- Todo.user_id → User.id (many-to-one)
- Enforced at database level with foreign key constraint

See [data-model.md](./data-model.md) for complete entity definitions.

### API Contract Summary

**Base Path**: `/api/users/{user_id}/todos`

**Endpoints**:
1. `GET /api/users/{user_id}/todos` - List user's todos
2. `POST /api/users/{user_id}/todos` - Create new todo
3. `GET /api/users/{user_id}/todos/{todo_id}` - Get specific todo
4. `PUT /api/users/{user_id}/todos/{todo_id}` - Update todo
5. `DELETE /api/users/{user_id}/todos/{todo_id}` - Delete todo

**Authentication**: All endpoints require `Authorization: Bearer <JWT>` header

**Authorization**: Route `user_id` must match JWT token `user_id` (403 if mismatch)

See [contracts/openapi.yaml](./contracts/openapi.yaml) for complete API specification.

### Setup & Verification

See [quickstart.md](./quickstart.md) for:
- Environment setup (Python 3.11+, virtual environment)
- Database configuration (Neon PostgreSQL connection)
- Dependency installation
- Database initialization
- Running the API server
- Testing endpoints with curl/Postman
- Verification checklist

## Implementation Phases

### Phase 1: Foundation (Blocking)
- Project structure and dependencies
- Database connection and configuration
- SQLModel entity definitions
- Database table creation

### Phase 2: User Story 1 (P1 - MVP)
- POST /api/users/{user_id}/todos (create)
- GET /api/users/{user_id}/todos (list)
- JWT verification dependency
- User authorization validation
- Input validation (title required, length limits)
- Error handling (401, 403, 422)

### Phase 3: User Story 4 (P2)
- GET /api/users/{user_id}/todos/{todo_id} (retrieve individual)
- 404 handling for non-existent todos
- Cross-user access prevention

### Phase 4: User Story 2 (P2)
- PUT /api/users/{user_id}/todos/{todo_id} (update)
- Completion status toggle
- Title/description updates
- Validation on updates

### Phase 5: User Story 3 (P3)
- DELETE /api/users/{user_id}/todos/{todo_id} (delete)
- Cascade considerations
- Post-deletion verification

### Phase 6: Polish
- OpenAPI documentation review
- Error message refinement
- Performance testing (response times)
- Security audit (user isolation verification)

## Risk Analysis

### Risk 1: User ID Mismatch Vulnerabilities
**Mitigation**: Mandatory authorization check in every endpoint - compare route `user_id` with JWT `user_id` before any database query

### Risk 2: Database Connection Failures
**Mitigation**: Connection pooling, retry logic, graceful error responses (500 with generic message)

### Risk 3: Concurrent Update Conflicts
**Mitigation**: Database-level locking (PostgreSQL row locks), optimistic concurrency control if needed

### Risk 4: JWT Verification Complexity
**Mitigation**: Assume JWT verification is handled by middleware (out of scope for this feature), backend receives trusted `user_id`

## Next Steps

After `/sp.plan` completion:
1. Review generated artifacts (data-model.md, contracts/openapi.yaml, quickstart.md)
2. Run `/sp.tasks` to generate actionable implementation tasks
3. Execute tasks in priority order (P1 → P2 → P3)
4. Verify each user story independently before proceeding to next
