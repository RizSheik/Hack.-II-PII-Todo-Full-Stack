# Data Model: Todo Backend Core & Data Layer

**Feature**: 1-todo-backend
**Date**: 2026-01-09
**Purpose**: Define entities, attributes, relationships, and validation rules for the todo backend

## Entity Definitions

### Entity 1: Todo

**Description**: Represents a task item that belongs to a specific user. Each todo has a title, optional description, completion status, and timestamps for tracking creation and updates.

**Attributes**:

| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | Integer | Yes (auto) | Primary key, auto-increment | Unique identifier for the todo |
| title | String | Yes | Min length: 1, Max length: 200 | The todo item's title/summary |
| description | String | No | Max length: 1000 | Optional detailed description |
| completed | Boolean | Yes | Default: false | Whether the todo is completed |
| user_id | Integer | Yes | Foreign key → User.id | Owner of this todo |
| created_at | DateTime | Yes (auto) | UTC timestamp | When the todo was created |
| updated_at | DateTime | Yes (auto) | UTC timestamp, auto-update | When the todo was last modified |

**Validation Rules**:
- `title` MUST NOT be empty (after trimming whitespace)
- `title` MUST NOT exceed 200 characters
- `description` MUST NOT exceed 1000 characters if provided
- `user_id` MUST reference an existing user (foreign key constraint)
- `completed` defaults to `false` if not specified
- `created_at` is set automatically on creation
- `updated_at` is set automatically on creation and updated on modification

**Business Rules**:
- A todo MUST belong to exactly one user (cannot be shared or unowned)
- A user can have multiple todos (one-to-many relationship)
- Deleting a todo does not affect the user
- A todo cannot exist without a valid user (referential integrity)

**Indexes**:
- Primary index on `id` (automatic)
- Index on `user_id` (for filtering user's todos efficiently)
- Composite index on `(user_id, created_at)` (for sorted retrieval)

**State Transitions**:
```
[Created] → completed=false
    ↓
[Mark Complete] → completed=true
    ↓
[Mark Incomplete] → completed=false (can toggle back)
    ↓
[Delete] → (removed from database)
```

---

### Entity 2: User

**Description**: Represents an authenticated user who owns todos. User management (registration, login, profile) is handled by a separate authentication layer (out of scope for this feature). The backend only needs to reference users by their ID.

**Attributes**:

| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | Integer | Yes | Primary key | Unique identifier for the user |

**Note**: This is a minimal reference entity. Full user attributes (email, name, password_hash, etc.) are managed by the authentication layer (Spec-2). The backend only needs to know the user ID to associate todos with users.

**Validation Rules**:
- `id` MUST be a valid integer
- `id` MUST exist in the authentication system (assumed verified by JWT middleware)

**Business Rules**:
- A user can have zero or more todos
- Deleting a user should cascade delete their todos (or prevent deletion if todos exist)
- User identity is provided by JWT token, not managed by this backend

---

## Relationships

### Todo → User (Many-to-One)

**Relationship**: Each todo belongs to exactly one user. A user can have multiple todos.

**Cardinality**: Many todos to one user (N:1)

**Foreign Key**: `Todo.user_id` → `User.id`

**Referential Integrity**:
- `ON DELETE`: CASCADE or RESTRICT (prevent user deletion if todos exist)
- `ON UPDATE`: CASCADE (if user ID changes, update todos - unlikely in practice)

**Query Pattern**:
```sql
-- Get all todos for a user
SELECT * FROM todos WHERE user_id = ?

-- Get a specific todo for a user
SELECT * FROM todos WHERE id = ? AND user_id = ?
```

**Enforcement**:
- Database-level: Foreign key constraint
- Application-level: Every query MUST filter by `user_id`
- Authorization: Route `user_id` MUST match JWT `user_id`

---

## Database Schema (SQL)

```sql
-- User table (minimal reference)
CREATE TABLE users (
    id SERIAL PRIMARY KEY
);

-- Todo table
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- Indexes for performance
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_user_created ON todos(user_id, created_at DESC);

-- Trigger for updated_at (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW() AT TIME ZONE 'UTC';
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## SQLModel Implementation (Python)

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    """Minimal user reference for todo ownership."""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Relationship to todos (not used in queries, just for ORM)
    todos: list["Todo"] = Relationship(back_populates="owner")


class Todo(SQLModel, table=True):
    """Todo item belonging to a user."""
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, min_length=1)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())

    # Relationship to user (not used in queries, just for ORM)
    owner: Optional[User] = Relationship(back_populates="todos")
```

---

## Pydantic Schemas (API Contracts)

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TodoCreate(BaseModel):
    """Request schema for creating a todo."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: bool = Field(default=False)


class TodoUpdate(BaseModel):
    """Request schema for updating a todo."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: Optional[bool] = None


class TodoResponse(BaseModel):
    """Response schema for todo operations."""
    id: int
    title: str
    description: Optional[str]
    completed: bool
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allow ORM model conversion
```

---

## Validation Rules Summary

### Title Validation
- **Required**: Yes (cannot be null or empty)
- **Min Length**: 1 character (after trimming)
- **Max Length**: 200 characters
- **Allowed Characters**: Any Unicode characters
- **Trimming**: Leading/trailing whitespace should be trimmed

### Description Validation
- **Required**: No (optional field)
- **Max Length**: 1000 characters
- **Allowed Characters**: Any Unicode characters
- **Null vs Empty**: Both null and empty string are acceptable

### Completed Validation
- **Required**: Yes (defaults to false)
- **Type**: Boolean only (true/false)
- **Invalid Values**: Reject strings like "yes", "no", 1, 0

### User ID Validation
- **Required**: Yes (every todo must have an owner)
- **Type**: Integer
- **Existence**: Must reference a valid user (foreign key constraint)
- **Authorization**: Route user_id must match JWT user_id

---

## Data Integrity Constraints

### Database-Level Constraints
1. **Primary Keys**: Ensure uniqueness of todo IDs
2. **Foreign Keys**: Ensure todos reference valid users
3. **NOT NULL**: Prevent null values for required fields (title, user_id, completed)
4. **CHECK Constraints**: Enforce length limits (title ≤ 200, description ≤ 1000)
5. **Indexes**: Optimize queries by user_id

### Application-Level Constraints
1. **User Isolation**: Every query filters by user_id
2. **Authorization**: Verify route user_id matches JWT user_id
3. **Validation**: Pydantic schemas validate input before database operations
4. **Timestamps**: Automatically set created_at and updated_at

### Concurrency Constraints
1. **Row Locking**: PostgreSQL row-level locks prevent concurrent update conflicts
2. **Transactions**: Use database transactions for atomic operations
3. **Optimistic Locking**: Not required for MVP (can add version field later if needed)

---

## Example Data

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, and vegetables",
  "completed": false,
  "user_id": 123,
  "created_at": "2026-01-09T10:30:00Z",
  "updated_at": "2026-01-09T10:30:00Z"
}

{
  "id": 2,
  "title": "Finish project report",
  "description": null,
  "completed": true,
  "user_id": 123,
  "created_at": "2026-01-08T14:20:00Z",
  "updated_at": "2026-01-09T09:15:00Z"
}
```

---

## Migration Strategy

### Initial Schema Creation
```python
# Using SQLModel
from sqlmodel import SQLModel, create_engine

engine = create_engine(DATABASE_URL)
SQLModel.metadata.create_all(engine)
```

### Future Schema Changes (with Alembic)
1. Add new fields: Use Alembic migration to add columns
2. Modify constraints: Use Alembic to alter table definitions
3. Data migrations: Use Alembic for data transformations
4. Rollback: Alembic supports downgrade migrations

---

## Security Considerations

1. **User Isolation**: Every query MUST filter by user_id (constitutional requirement)
2. **Authorization**: Verify route user_id matches JWT user_id before any operation
3. **SQL Injection**: Use parameterized queries (SQLModel handles this automatically)
4. **ID Enumeration**: Not a risk when user isolation is enforced (user can't access other users' todos)
5. **Cascading Deletes**: Consider impact of deleting users (cascade delete todos or prevent deletion)

---

## Performance Considerations

1. **Indexes**: user_id index enables fast filtering
2. **Composite Index**: (user_id, created_at) enables fast sorted retrieval
3. **Query Optimization**: Always filter by user_id first (most selective)
4. **Connection Pooling**: Use SQLModel/SQLAlchemy connection pooling
5. **Pagination**: Not required for MVP (up to 1000 todos per user)

---

## Testing Considerations

1. **Unit Tests**: Test validation rules with Pydantic schemas
2. **Integration Tests**: Test database operations with test database
3. **Authorization Tests**: Verify user isolation (user A cannot access user B's todos)
4. **Edge Cases**: Test empty strings, max lengths, null values, invalid user IDs
5. **Concurrency Tests**: Test concurrent updates to same todo
