# Research: Todo Backend Core & Data Layer

**Feature**: 1-todo-backend
**Date**: 2026-01-09
**Purpose**: Document technology decisions and research findings for implementation planning

## Research Questions & Findings

### Q1: Database ID Strategy - Integer vs UUID?

**Context**: Todos need unique identifiers. Two common approaches: auto-incrementing integers or UUIDs.

**Research Findings**:
- **Integer IDs**: Simpler, smaller storage (4-8 bytes), faster indexing, sequential
- **UUIDs**: Globally unique (16 bytes), no central coordination needed, harder to enumerate
- **Security Consideration**: ID enumeration is NOT a risk when user isolation is enforced (user can't access other users' todos regardless of ID)

**Decision**: Use auto-incrementing integer IDs (PostgreSQL SERIAL or BIGSERIAL)

**Rationale**:
1. Simpler implementation with SQLModel (default behavior)
2. Smaller index size improves query performance
3. Sequential IDs are easier to debug and test
4. User isolation prevents ID enumeration attacks (constitutional security requirement)
5. No need for global uniqueness across distributed systems (single database)

**Alternatives Rejected**:
- UUIDs: Unnecessary complexity for user-scoped data, larger storage overhead
- Composite keys (user_id + sequence): Adds complexity without benefit when user_id filtering is mandatory

---

### Q2: Timestamp Management - Application vs Database?

**Context**: Need to track created_at and updated_at timestamps for todos.

**Research Findings**:
- **Application-level**: Python `datetime.utcnow()` with SQLModel `default` and `onupdate`
- **Database-level**: PostgreSQL `CURRENT_TIMESTAMP` or `NOW()`
- **Best Practice**: UTC timestamps avoid timezone confusion

**Decision**: Use application-level timestamps with `datetime.utcnow()`

**Rationale**:
1. SQLModel provides clean `default=datetime.utcnow` and `onupdate=datetime.utcnow` syntax
2. Easier to test (can mock datetime in tests)
3. More portable across databases
4. Consistent with Python ecosystem conventions
5. UTC avoids timezone ambiguity

**Alternatives Rejected**:
- Database-generated timestamps: Less portable, harder to test, requires raw SQL
- Unix epoch integers: Less readable, no timezone information, harder to work with

---

### Q3: Authentication Middleware Pattern

**Context**: JWT verification is required but out of scope for this feature. How should backend receive authenticated user identity?

**Research Findings**:
- **FastAPI Dependency Injection**: `Depends()` provides clean auth injection
- **Global Middleware**: Runs on every request, less flexible
- **Manual Parsing**: Violates DRY, error-prone

**Decision**: Use FastAPI dependency injection with `get_current_user_id()` dependency

**Rationale**:
1. FastAPI's `Depends()` is the idiomatic pattern for auth
2. Allows mocking in tests (inject fake user IDs)
3. Reusable across all endpoints
4. Clear separation of concerns (auth logic in deps.py)
5. Follows FastAPI best practices and documentation

**Implementation Pattern**:
```python
# api/deps.py
async def get_current_user_id(authorization: str = Header(None)) -> int:
    # JWT verification logic (or assume middleware provides it)
    # For now, assume middleware sets request.state.user_id
    return request.state.user_id

# api/routes/todos.py
@router.get("/api/users/{user_id}/todos")
async def list_todos(
    user_id: int,
    current_user_id: int = Depends(get_current_user_id)
):
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    # ... query todos
```

**Alternatives Rejected**:
- Global middleware: Less testable, harder to mock for specific endpoints
- Manual token parsing in each endpoint: Violates DRY, error-prone, hard to maintain

---

### Q4: Error Response Format

**Context**: Constitution requires consistent error format. FastAPI has default format but may not match requirements.

**Research Findings**:
- **Constitutional Requirement**: `{"error": {"code": "...", "message": "...", "details": [...]}}`
- **FastAPI Default**: `{"detail": "..."}` or `{"detail": [{"loc": [...], "msg": "...", "type": "..."}]}`
- **Customization**: FastAPI allows custom exception handlers

**Decision**: Implement custom exception handler to match constitutional format

**Rationale**:
1. Constitutional compliance is mandatory
2. Consistent error format across all endpoints
3. Machine-readable error codes
4. Structured field-level validation errors
5. FastAPI supports custom exception handlers

**Implementation Pattern**:
```python
# main.py
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": [
                    {"field": ".".join(str(x) for x in err["loc"][1:]),
                     "message": err["msg"]}
                    for err in exc.errors()
                ]
            }
        }
    )
```

**Alternatives Rejected**:
- FastAPI default format: Doesn't match constitutional requirements
- Simple string errors: Not structured enough for client parsing

---

### Q5: Database Migration Strategy

**Context**: Need to create database tables and handle schema changes over time.

**Research Findings**:
- **Alembic**: Industry-standard migration tool for SQLAlchemy/SQLModel
- **SQLModel.metadata.create_all()**: Simple but no migration history
- **Manual SQL**: Error-prone, no rollback support

**Decision**: Use Alembic for migrations (optional for MVP, can add later)

**Rationale**:
1. SQLModel integrates seamlessly with Alembic
2. Version-controlled migrations enable schema evolution
3. Supports rollback for failed migrations
4. Industry standard for Python/SQLAlchemy projects
5. Can start with `create_all()` for MVP and add Alembic later if needed

**MVP Approach**: Use `SQLModel.metadata.create_all()` for initial development, add Alembic before production

**Alternatives Rejected**:
- Manual SQL scripts: Error-prone, no version control, no rollback
- No migrations: Can't evolve schema safely in production

---

### Q6: Query Filtering Pattern for User Isolation

**Context**: Every query must filter by user_id to enforce data isolation (constitutional requirement).

**Research Findings**:
- **Manual filtering**: Add `.filter(Todo.user_id == user_id)` to every query
- **Query wrapper**: Create helper function that automatically adds user filter
- **Database views**: PostgreSQL views with user_id filter (complex)

**Decision**: Manual filtering with explicit `.filter(Todo.user_id == user_id)` in every query

**Rationale**:
1. Explicit is better than implicit (Python Zen)
2. Easy to audit for security compliance
3. No magic - clear what each query does
4. Follows SQLModel/SQLAlchemy conventions
5. Constitutional requirement is visible in code

**Pattern**:
```python
# Always filter by user_id
todos = session.exec(
    select(Todo).where(Todo.user_id == current_user_id)
).all()

# Never query without user filter
# BAD: session.exec(select(Todo)).all()  # Returns all users' todos!
```

**Alternatives Rejected**:
- Query wrapper: Adds abstraction layer, harder to debug, magic behavior
- Database views: Overly complex for this use case, harder to test

---

### Q7: Validation Strategy - Pydantic vs SQLModel

**Context**: Need to validate input (title length, required fields). SQLModel combines Pydantic and SQLAlchemy.

**Research Findings**:
- **SQLModel models**: Used for database entities (with table=True)
- **Pydantic models**: Used for API request/response schemas (no table)
- **Best Practice**: Separate database models from API schemas

**Decision**: Use separate Pydantic schemas for API, SQLModel for database

**Rationale**:
1. Separation of concerns (API contracts vs database schema)
2. API schemas can differ from database models (e.g., exclude timestamps from create requests)
3. Pydantic provides rich validation (Field, validator decorators)
4. Follows FastAPI best practices
5. Easier to evolve API independently of database

**Pattern**:
```python
# models/todo.py (database)
class Todo(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    user_id: int = Field(foreign_key="user.id")
    # ...

# schemas/todo.py (API)
class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

class TodoResponse(BaseModel):
    id: int
    title: str
    description: str | None
    completed: bool
    created_at: datetime
```

**Alternatives Rejected**:
- Single model for both: Tight coupling, harder to evolve independently
- No validation: Security risk, violates constitutional requirements

---

## Technology Stack Summary

**Confirmed Technologies**:
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.104+
- **ORM**: SQLModel 0.0.14+
- **Database**: Neon Serverless PostgreSQL (PostgreSQL 15+)
- **Validation**: Pydantic 2.5+
- **Testing**: pytest 7.4+, httpx 0.25+

**Key Dependencies**:
```
fastapi==0.104.1
sqlmodel==0.0.14
pydantic==2.5.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pytest==7.4.3
httpx==0.25.2
```

**Development Tools**:
- **Linting**: ruff or flake8
- **Formatting**: black
- **Type Checking**: mypy (optional)
- **Migrations**: Alembic (optional for MVP)

---

## Best Practices Identified

1. **User Isolation**: Always filter queries by `user_id` - no exceptions
2. **Authorization**: Verify route `user_id` matches JWT `user_id` before any database operation
3. **Error Handling**: Use constitutional error format consistently
4. **Validation**: Validate at API boundary with Pydantic schemas
5. **Timestamps**: Use UTC timestamps with `datetime.utcnow()`
6. **Dependencies**: Use FastAPI `Depends()` for auth injection
7. **Testing**: Mock auth dependencies for unit tests
8. **Configuration**: Environment variables for all secrets (DATABASE_URL, JWT_SECRET)

---

## Open Questions (None)

All research questions have been resolved. Implementation can proceed with confidence.
