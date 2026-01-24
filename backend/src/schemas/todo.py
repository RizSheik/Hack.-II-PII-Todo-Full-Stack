"""
Todo API schemas.

Pydantic models for todo request/response validation.
Separate from SQLModel entities to maintain clean separation of concerns.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum


class PriorityEnum(str, Enum):
    """Priority levels for todos."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class DueDateStatus(str, Enum):
    """Due date status computed from due_date."""
    OVERDUE = "overdue"
    DUE_TODAY = "due_today"
    UPCOMING = "upcoming"
    NO_DUE_DATE = "no_due_date"


class TodoCreate(BaseModel):
    """
    Schema for creating a new todo.

    Validation:
    - title: Required, 1-200 characters, stripped of whitespace
    - description: Optional, max 1000 characters
    - completed: Optional, defaults to False
    - due_date: Optional, datetime in UTC
    - priority: Optional, defaults to medium
    """
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Todo title (1-200 characters)"
    )

    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional todo description (max 1000 characters)"
    )

    completed: bool = Field(
        default=False,
        description="Completion status (default: False)"
    )

    due_date: Optional[datetime] = Field(
        None,
        description="When the todo is due (UTC, nullable)"
    )

    priority: PriorityEnum = Field(
        default=PriorityEnum.MEDIUM,
        description="Priority level (high/medium/low, default: medium)"
    )

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """
        Validate and sanitize title.

        - Strip leading/trailing whitespace
        - Ensure not empty after stripping
        """
        v = v.strip()
        if not v:
            raise ValueError("Title cannot be empty or whitespace only")
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """
        Validate and sanitize description.

        - Strip leading/trailing whitespace if provided
        - Return None if empty after stripping
        """
        if v is not None:
            v = v.strip()
            if not v:
                return None
        return v

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Complete project documentation",
                "description": "Write comprehensive API documentation with examples",
                "completed": False,
                "due_date": "2026-01-25T14:00:00Z",
                "priority": "high"
            }
        }


class TodoResponse(BaseModel):
    """
    Schema for todo response.

    Returns complete todo information including metadata and computed fields.
    """
    id: int = Field(
        ...,
        description="Todo ID"
    )

    title: str = Field(
        ...,
        description="Todo title"
    )

    description: Optional[str] = Field(
        None,
        description="Todo description"
    )

    completed: bool = Field(
        ...,
        description="Completion status"
    )

    due_date: Optional[datetime] = Field(
        None,
        description="When the todo is due (UTC, nullable)"
    )

    due_date_status: Optional[DueDateStatus] = Field(
        None,
        description="Computed due date status (overdue/due_today/upcoming/no_due_date)"
    )

    priority: PriorityEnum = Field(
        ...,
        description="Priority level (high/medium/low)"
    )

    user_id: int = Field(
        ...,
        description="Owner user ID"
    )

    created_at: datetime = Field(
        ...,
        description="Creation timestamp (UTC)"
    )

    updated_at: datetime = Field(
        ...,
        description="Last update timestamp (UTC)"
    )

    class Config:
        """Pydantic configuration."""
        from_attributes = True  # Enable ORM mode for SQLModel compatibility
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Complete project documentation",
                "description": "Write comprehensive API documentation with examples",
                "completed": False,
                "due_date": "2026-01-25T14:00:00Z",
                "due_date_status": "upcoming",
                "priority": "high",
                "user_id": 123,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


class TodoUpdate(BaseModel):
    """
    Schema for updating an existing todo.

    All fields are optional - only provided fields will be updated.
    At least one field must be provided.

    Validation:
    - title: Optional, 1-200 characters if provided
    - description: Optional, max 1000 characters if provided
    - completed: Optional boolean
    - due_date: Optional datetime
    - priority: Optional priority level
    """
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Todo title (1-200 characters)"
    )

    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Todo description (max 1000 characters)"
    )

    completed: Optional[bool] = Field(
        None,
        description="Completion status"
    )

    due_date: Optional[datetime] = Field(
        None,
        description="When the todo is due (UTC, nullable)"
    )

    priority: Optional[PriorityEnum] = Field(
        None,
        description="Priority level (high/medium/low)"
    )

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """
        Validate and sanitize title if provided.

        - Strip leading/trailing whitespace
        - Ensure not empty after stripping
        """
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Title cannot be empty or whitespace only")
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """
        Validate and sanitize description if provided.

        - Strip leading/trailing whitespace
        - Return None if empty after stripping
        """
        if v is not None:
            v = v.strip()
            if not v:
                return None
        return v

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Updated title",
                "completed": True,
                "due_date": "2026-01-26T14:00:00Z",
                "priority": "medium"
            }
        }

