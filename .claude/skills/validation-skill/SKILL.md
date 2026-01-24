---
name: validation-skill
description: Implement comprehensive input validation, data sanitization, and security validation across frontend, backend, and database layers.
---

# Validation Skill: Multi-Layer Validation Strategy

## Overview

This skill implements validation for a full-stack application with:
- **Frontend**: Next.js with Zod schemas and TypeScript
- **Backend**: FastAPI with Pydantic models
- **Database**: SQLModel with constraints and type enforcement

## Validation Philosophy

**Defense in Depth**: Validate at every layer
1. **Frontend**: User experience and early feedback
2. **Backend**: Security and business logic enforcement
3. **Database**: Data integrity and consistency

> Never trust client-side validation alone. Always validate on the backend.

## Layer 1: Frontend Validation (Next.js + Zod)

### Setup Zod for Form Validation

```typescript
// lib/validations/auth.ts
import { z } from "zod"

export const signupSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),

  email: z.string()
    .email("Invalid email format")
    .toLowerCase(),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[^A-Za-z0-9]/, "Password must contain special character"),

  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type SignupInput = z.infer<typeof signupSchema>
```

### Todo Validation Schema

```typescript
// lib/validations/todo.ts
import { z } from "zod"

export const todoSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),

  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),

  completed: z.boolean().default(false),
})

export const todoUpdateSchema = todoSchema.partial()

export type TodoInput = z.infer<typeof todoSchema>
export type TodoUpdateInput = z.infer<typeof todoUpdateSchema>
```

### Form Validation with React Hook Form

```typescript
// components/SignupForm.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, SignupInput } from "@/lib/validations/auth"

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupInput) => {
    // Data is validated before reaching here
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      // Handle backend validation errors
      const error = await response.json()
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Sign Up</button>
    </form>
  )
}
```

## Layer 2: Backend Validation (FastAPI + Pydantic)

### Pydantic Models for Request Validation

```python
# app/schemas.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import re

class UserSignup(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

    @validator('password')
    def validate_password_strength(cls, v):
        """Enforce password complexity requirements"""
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain number')
        if not re.search(r'[^A-Za-z0-9]', v):
            raise ValueError('Password must contain special character')
        return v

    @validator('name')
    def validate_name(cls, v):
        """Sanitize and validate name"""
        v = v.strip()
        if not v:
            raise ValueError('Name cannot be empty')
        # Prevent XSS in name field
        if '<' in v or '>' in v:
            raise ValueError('Name contains invalid characters')
        return v

class UserSignin(BaseModel):
    email: EmailStr
    password: str

class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: bool = False

    @validator('title')
    def validate_title(cls, v):
        """Sanitize and validate title"""
        v = v.strip()
        if not v:
            raise ValueError('Title cannot be empty')
        # Prevent XSS
        if '<script' in v.lower() or '<' in v or '>' in v:
            raise ValueError('Title contains invalid characters')
        return v

    @validator('description')
    def validate_description(cls, v):
        """Sanitize description"""
        if v:
            v = v.strip()
            # Prevent XSS
            if '<script' in v.lower():
                raise ValueError('Description contains invalid content')
        return v

class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: Optional[bool] = None

    @validator('title')
    def validate_title(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Title cannot be empty')
            if '<script' in v.lower() or '<' in v or '>' in v:
                raise ValueError('Title contains invalid characters')
        return v

class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    user_id: int
    created_at: str

    class Config:
        from_attributes = True
```

### Using Pydantic Models in Endpoints

```python
# app/main.py
from fastapi import FastAPI, HTTPException, Depends
from app.schemas import TodoCreate, TodoUpdate, TodoResponse
from app.auth import verify_token, validate_user_access

@app.post("/api/users/{user_id}/todos", response_model=TodoResponse)
async def create_todo(
    user_id: int,
    todo: TodoCreate,  # Automatic validation via Pydantic
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    # 1. Authorization check
    validate_user_access(token_data["user_id"], user_id)

    # 2. Input is already validated by Pydantic
    # 3. Additional business logic validation

    # Check if user has too many todos (business rule)
    todo_count = db.query(Todo).filter(Todo.user_id == user_id).count()
    if todo_count >= 1000:
        raise HTTPException(
            status_code=400,
            detail="Maximum todo limit reached (1000)"
        )

    # 4. Create todo
    db_todo = Todo(
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        user_id=user_id
    )

    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)

    return db_todo
```

### Custom Validators for Business Logic

```python
# app/validators.py
from fastapi import HTTPException
from sqlmodel import Session, select
from app.models import Todo, User

def validate_todo_ownership(
    todo_id: int,
    user_id: int,
    db: Session
) -> Todo:
    """
    Verify that the todo exists and belongs to the user.
    Returns the todo if valid, raises 404 or 403 otherwise.
    """
    todo = db.get(Todo, todo_id)

    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    if todo.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access this todo"
        )

    return todo

def validate_user_exists(user_id: int, db: Session) -> User:
    """Verify user exists"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Layer 3: Database Validation (SQLModel + PostgreSQL)

### Database Schema with Constraints

```python
# app/models.py
from sqlmodel import SQLModel, Field, Column, String
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)

    email: str = Field(
        sa_column=Column(String, unique=True, nullable=False, index=True)
    )

    name: str = Field(
        sa_column=Column(String(50), nullable=False)
    )

    password_hash: str = Field(
        sa_column=Column(String, nullable=False)
    )

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)

    title: str = Field(
        sa_column=Column(String(200), nullable=False)
    )

    description: Optional[str] = Field(
        default=None,
        sa_column=Column(String(1000), nullable=True)
    )

    completed: bool = Field(default=False, nullable=False)

    user_id: int = Field(
        foreign_key="users.id",
        nullable=False,
        index=True
    )

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Database-Level Constraints (SQL)

```sql
-- Additional constraints via migration
ALTER TABLE todos
ADD CONSTRAINT check_title_not_empty
CHECK (length(trim(title)) > 0);

ALTER TABLE todos
ADD CONSTRAINT check_title_length
CHECK (length(title) <= 200);

ALTER TABLE users
ADD CONSTRAINT check_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Index for performance
CREATE INDEX idx_todos_user_id_created ON todos(user_id, created_at DESC);
```

## Security Validation Patterns

### 1. SQL Injection Prevention

```python
# ✅ SAFE: Using SQLModel/SQLAlchemy (parameterized queries)
todos = db.query(Todo).filter(Todo.user_id == user_id).all()

# ✅ SAFE: Using select with parameters
statement = select(Todo).where(Todo.user_id == user_id)
todos = db.exec(statement).all()

# ❌ UNSAFE: Never do this
query = f"SELECT * FROM todos WHERE user_id = {user_id}"  # SQL injection risk!
```

### 2. XSS Prevention

```python
# Backend: Validate and sanitize input
@validator('title')
def validate_title(cls, v):
    v = v.strip()
    # Remove or escape HTML tags
    if '<' in v or '>' in v:
        raise ValueError('Title contains invalid characters')
    return v

# Frontend: Use React's built-in XSS protection
# React automatically escapes values in JSX
<div>{todo.title}</div>  {/* Safe - React escapes */}

# ❌ UNSAFE: Using dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{__html: todo.title}} />  {/* XSS risk! */}
```

### 3. Authorization Validation

```python
# Always verify user owns the resource
def validate_resource_access(
    resource_user_id: int,
    authenticated_user_id: int
):
    if resource_user_id != authenticated_user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )
```

## Error Response Standardization

### Backend Error Handler

```python
# app/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    """Standardize validation error responses"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"][1:]),
            "message": error["msg"],
            "type": error["type"]
        })

    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": errors
            }
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardize HTTP error responses"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail
            }
        }
    )
```

### Frontend Error Handling

```typescript
// lib/api.ts
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    const error = await response.json()

    if (response.status === 422) {
      // Validation errors
      throw new ValidationError(error.error.details)
    } else if (response.status === 401) {
      // Redirect to login
      window.location.href = '/signin'
    } else if (response.status === 403) {
      throw new Error('Access denied')
    } else {
      throw new Error(error.error.message || 'An error occurred')
    }
  }

  return response.json()
}
```

## Validation Checklist

Before deploying any endpoint:

- [ ] Frontend validation with Zod schema
- [ ] Backend validation with Pydantic model
- [ ] Database constraints defined
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] Authorization check (user owns resource)
- [ ] Business logic validation
- [ ] Error responses standardized
- [ ] Field length limits enforced
- [ ] Required fields validated
- [ ] Email format validated
- [ ] Password strength enforced
- [ ] Unique constraints checked
- [ ] Foreign key relationships validated

## Common Validation Patterns

### Pattern 1: Email Validation
```python
# Backend
from pydantic import EmailStr

class UserInput(BaseModel):
    email: EmailStr  # Automatic email validation
```

### Pattern 2: Enum Validation
```python
from enum import Enum

class TodoStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TodoCreate(BaseModel):
    status: TodoStatus = TodoStatus.PENDING
```

### Pattern 3: Date Validation
```python
from datetime import datetime
from pydantic import validator

class TodoCreate(BaseModel):
    due_date: Optional[datetime] = None

    @validator('due_date')
    def validate_due_date(cls, v):
        if v and v < datetime.utcnow():
            raise ValueError('Due date cannot be in the past')
        return v
```

### Pattern 4: Conditional Validation
```python
class TodoUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None
    completed_at: Optional[datetime] = None

    @validator('completed_at')
    def validate_completed_at(cls, v, values):
        if v and not values.get('completed'):
            raise ValueError('completed_at requires completed=true')
        return v
```

## Testing Validation

```python
# tests/test_validation.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_todo_with_empty_title():
    response = client.post(
        "/api/users/1/todos",
        json={"title": "", "completed": False},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422
    assert "title" in str(response.json())

def test_create_todo_with_long_title():
    response = client.post(
        "/api/users/1/todos",
        json={"title": "x" * 201, "completed": False},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

def test_signup_with_weak_password():
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "test@example.com",
            "password": "weak",
            "name": "Test"
        }
    )
    assert response.status_code == 422
    assert "password" in str(response.json())
```

## Quick Reference

**Validation Layers:**
1. Frontend (Zod) → User experience
2. Backend (Pydantic) → Security enforcement
3. Database (Constraints) → Data integrity

**Security Rules:**
- Never trust client input
- Always validate on backend
- Sanitize all user input
- Use parameterized queries
- Escape output in templates
- Validate authorization on every request

**Common Mistakes to Avoid:**
- ❌ Only validating on frontend
- ❌ Trusting user_id from URL without auth check
- ❌ Using string concatenation for SQL queries
- ❌ Not sanitizing HTML in user input
- ❌ Returning detailed error messages that leak info
- ❌ Not validating file uploads
- ❌ Skipping validation for "trusted" users
