---
description: "Task list for Todo Backend Core & Data Layer implementation"
---

# Tasks: Todo Backend Core & Data Layer

**Input**: Design documents from `/specs/1-todo-backend/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/openapi.yaml, research.md, quickstart.md

**Tests**: Tests are NOT explicitly requested in the specification. Tasks focus on implementation and manual verification via HTTP clients (curl, Postman).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend API**: `backend/src/`, `backend/tests/`
- Paths shown below use backend structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure: backend/src/, backend/tests/, backend/src/models/, backend/src/schemas/, backend/src/api/, backend/src/api/routes/, backend/src/core/
- [x] T002 Initialize Python project with requirements.txt containing: fastapi==0.104.1, sqlmodel==0.0.14, pydantic==2.5.0, pydantic-settings==2.1.0, psycopg2-binary==2.9.9, python-dotenv==1.0.0, uvicorn[standard]==0.24.0, pytest==7.4.3, httpx==0.25.2
- [x] T003 [P] Create .env.example file with DATABASE_URL, JWT_SECRET, APP_ENV, DEBUG, LOG_LEVEL, HOST, PORT templates
- [x] T004 [P] Create .gitignore file with .env, __pycache__/, *.pyc, venv/, .pytest_cache/ entries
- [x] T005 [P] Create backend/README.md with setup instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create backend/src/config.py with Settings class using pydantic-settings for DATABASE_URL, JWT_SECRET, APP_ENV, DEBUG, LOG_LEVEL, HOST, PORT
- [x] T007 Create backend/src/database.py with SQLModel engine creation, init_db() function, and get_session() dependency
- [x] T008 [P] Create backend/src/models/__init__.py (empty module initializer)
- [x] T009 [P] Create backend/src/schemas/__init__.py (empty module initializer)
- [x] T010 [P] Create backend/src/api/__init__.py (empty module initializer)
- [x] T011 [P] Create backend/src/api/routes/__init__.py (empty module initializer)
- [x] T012 [P] Create backend/src/core/__init__.py (empty module initializer)
- [x] T013 Create backend/src/models/user.py with minimal User SQLModel (id field only, table=True)
- [x] T014 Create backend/src/models/todo.py with Todo SQLModel (id, title, description, completed, user_id, created_at, updated_at fields, table=True)
- [x] T015 Create backend/src/core/security.py with get_current_user_id() dependency function (assumes JWT middleware provides user_id)
- [x] T016 Create backend/src/schemas/error.py with ErrorResponse and ErrorDetail Pydantic models matching constitutional error format
- [x] T017 Create backend/src/main.py with FastAPI app initialization, CORS middleware, and custom exception handlers for HTTPException and RequestValidationError
- [x] T018 Run database initialization: python -c "from src.database import init_db; init_db()" to create tables
- [x] T019 Start API server with uvicorn src.main:app --reload and verify it starts without errors

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Retrieve Personal Todos (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to create new todos and retrieve their personal todo list

**Independent Test**: Authenticate as user 123, create 3 todos via POST, list todos via GET, verify only user 123's todos are returned, attempt to access user 456's todos and verify 403 response

### Implementation for User Story 1

- [x] T020 [P] [US1] Create backend/src/schemas/todo.py with TodoCreate Pydantic model (title: str 1-200 chars, description: Optional[str] max 1000 chars, completed: bool default False)
- [x] T021 [P] [US1] Create backend/src/schemas/todo.py with TodoResponse Pydantic model (id, title, description, completed, user_id, created_at, updated_at, Config.from_attributes=True)
- [x] T022 [US1] Create backend/src/api/routes/todos.py with APIRouter and import dependencies (get_current_user_id, get_session, Todo model, schemas)
- [x] T023 [US1] Implement POST /api/users/{user_id}/todos endpoint in backend/src/api/routes/todos.py: verify user_id matches current_user_id, validate TodoCreate, create Todo with user_id, save to database, return 201 with TodoResponse
- [x] T024 [US1] Implement GET /api/users/{user_id}/todos endpoint in backend/src/api/routes/todos.py: verify user_id matches current_user_id, query todos filtered by user_id, return 200 with list of TodoResponse
- [x] T025 [US1] Register todos router in backend/src/main.py with app.include_router(todos_router)
- [x] T026 [US1] Add authorization validation helper function validate_user_access(token_user_id, resource_user_id) in backend/src/core/security.py that raises 403 if IDs don't match
- [x] T027 [US1] Update POST and GET endpoints to use validate_user_access() helper
- [x] T028 [US1] Test POST /api/users/123/todos with valid todo data, verify 201 response with todo ID
- [x] T029 [US1] Test GET /api/users/123/todos, verify 200 response with array of todos
- [x] T030 [US1] Test POST /api/users/123/todos with empty title, verify 422 validation error
- [x] T031 [US1] Test POST /api/users/123/todos with title > 200 chars, verify 422 validation error
- [x] T032 [US1] Test GET /api/users/123/todos as user 456 (mock different user_id), verify 403 forbidden response

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can create and list their own todos

---

## Phase 4: User Story 4 - Retrieve Individual Todo Details (Priority: P2)

**Goal**: Enable authenticated users to retrieve a specific todo by its ID

**Independent Test**: Create a todo, note its ID, retrieve it by ID via GET, verify all details are returned, attempt to retrieve another user's todo and verify 403 response

### Implementation for User Story 4

- [x] T033 [US4] Implement GET /api/users/{user_id}/todos/{todo_id} endpoint in backend/src/api/routes/todos.py: verify user_id matches current_user_id, query todo by id and user_id, return 200 with TodoResponse or 404 if not found
- [x] T034 [US4] Add 404 error handling for non-existent todo in GET endpoint
- [x] T035 [US4] Test GET /api/users/123/todos/1 with valid todo ID, verify 200 response with complete todo details
- [x] T036 [US4] Test GET /api/users/123/todos/999 with non-existent ID, verify 404 not found response
- [x] T037 [US4] Test GET /api/users/123/todos/1 as user 456 (mock different user_id), verify 403 forbidden response

**Checkpoint**: At this point, User Stories 1 AND 4 should both work independently - users can create, list, and retrieve individual todos

---

## Phase 5: User Story 2 - Update Todo Status and Details (Priority: P2)

**Goal**: Enable authenticated users to update their todo items (mark complete, edit title/description)

**Independent Test**: Create a todo, update its completion status via PUT, verify change persists, update title, verify change persists, attempt to update another user's todo and verify 403 response

### Implementation for User Story 2

- [x] T038 [P] [US2] Create backend/src/schemas/todo.py with TodoUpdate Pydantic model (title: Optional[str] 1-200 chars, description: Optional[str] max 1000 chars, completed: Optional[bool])
- [x] T039 [US2] Implement PUT /api/users/{user_id}/todos/{todo_id} endpoint in backend/src/api/routes/todos.py: verify user_id matches current_user_id, query todo by id and user_id, update fields from TodoUpdate (only provided fields), save changes, return 200 with TodoResponse or 404 if not found
- [x] T040 [US2] Add validation to ensure at least one field is provided in TodoUpdate
- [x] T041 [US2] Add updated_at timestamp update logic in PUT endpoint
- [x] T042 [US2] Test PUT /api/users/123/todos/1 with completed=true, verify 200 response with updated todo
- [x] T043 [US2] Test PUT /api/users/123/todos/1 with new title, verify 200 response with updated title
- [x] T044 [US2] Test PUT /api/users/123/todos/1 with empty title, verify 422 validation error
- [x] T045 [US2] Test PUT /api/users/123/todos/999 with non-existent ID, verify 404 not found response
- [x] T046 [US2] Test PUT /api/users/123/todos/1 as user 456 (mock different user_id), verify 403 forbidden response

**Checkpoint**: At this point, User Stories 1, 4, AND 2 should all work independently - users can create, list, retrieve, and update todos

---

## Phase 6: User Story 3 - Delete Personal Todos (Priority: P3)

**Goal**: Enable authenticated users to delete their completed or unwanted todos

**Independent Test**: Create a todo, delete it via DELETE, verify 204 response, attempt to retrieve deleted todo and verify 404, attempt to delete another user's todo and verify 403 response

### Implementation for User Story 3

- [x] T047 [US3] Implement DELETE /api/users/{user_id}/todos/{todo_id} endpoint in backend/src/api/routes/todos.py: verify user_id matches current_user_id, query todo by id and user_id, delete todo, return 204 no content or 404 if not found
- [x] T048 [US3] Test DELETE /api/users/123/todos/1 with valid todo ID, verify 204 no content response
- [x] T049 [US3] Test GET /api/users/123/todos/1 after deletion, verify 404 not found response
- [x] T050 [US3] Test DELETE /api/users/123/todos/999 with non-existent ID, verify 404 not found response
- [x] T051 [US3] Test DELETE /api/users/123/todos/1 as user 456 (mock different user_id), verify 403 forbidden response

**Checkpoint**: All user stories should now be independently functional - complete CRUD operations available

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T052 [P] Review and update OpenAPI documentation at http://localhost:8000/docs, verify all endpoints are documented correctly
- [x] T053 [P] Add logging for all CRUD operations in backend/src/api/routes/todos.py (info level for success, error level for failures)
- [x] T054 [P] Add request/response logging middleware in backend/src/main.py for debugging
- [x] T055 Verify all error responses match constitutional format (error.code, error.message, error.details)
- [x] T056 Test performance: create todo should complete in <500ms, list 100 todos should complete in <1s
- [x] T057 Test user isolation: create todos as user 123 and user 456, verify each user only sees their own todos
- [x] T058 Test concurrent operations: create/update/delete todos concurrently, verify no data corruption
- [x] T059 Restart API server and verify all todos persist (test data retention across restarts)
- [x] T060 [P] Update backend/README.md with API endpoint documentation and testing instructions
- [x] T061 Run quickstart.md verification checklist to ensure all success criteria are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent)

**Note**: All user stories are independently implementable after the Foundational phase. They can be developed in parallel by different developers or sequentially in priority order.

### Within Each User Story

- Schema definitions before endpoint implementations
- Authorization helpers before endpoints that use them
- Endpoint implementation before testing
- Core functionality before edge case handling

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T005)
- All Foundational module initializers marked [P] can run in parallel (T008-T012)
- Schema definitions within a story marked [P] can run in parallel (T020-T021, T038)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Polish tasks marked [P] can run in parallel (T052-T054, T060)

---

## Parallel Example: User Story 1

```bash
# Launch schema definitions together:
Task T020: Create TodoCreate schema
Task T021: Create TodoResponse schema

# Then implement endpoints sequentially:
Task T022: Create router
Task T023: Implement POST endpoint
Task T024: Implement GET endpoint
Task T025: Register router
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (P1)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Create todos via POST
   - List todos via GET
   - Verify user isolation (403 for cross-user access)
   - Verify validation (422 for invalid input)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (P1) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 4 (P2) → Test independently → Deploy/Demo
4. Add User Story 2 (P2) → Test independently → Deploy/Demo
5. Add User Story 3 (P3) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1)
   - Developer B: User Story 4 (P2)
   - Developer C: User Story 2 (P2)
3. Stories complete and integrate independently
4. Developer D: User Story 3 (P3) after others complete
5. Team: Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests are generated (not requested in specification)
- Manual testing via curl/Postman is sufficient per spec requirements
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Total Tasks**: 61
- **Setup (Phase 1)**: 5 tasks
- **Foundational (Phase 2)**: 14 tasks (BLOCKING)
- **User Story 1 (P1)**: 13 tasks (MVP)
- **User Story 4 (P2)**: 5 tasks
- **User Story 2 (P2)**: 9 tasks
- **User Story 3 (P3)**: 5 tasks
- **Polish (Phase 7)**: 10 tasks

**Parallel Opportunities**: 12 tasks marked [P] can run in parallel

**MVP Scope**: Phases 1, 2, and 3 (32 tasks) deliver a working todo API with create and list functionality
