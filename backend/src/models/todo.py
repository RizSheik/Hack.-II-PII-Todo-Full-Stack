"""
Todo database model.

Represents a user's todo item with title, description, completion status,
due dates, priorities, categories, and timestamps. Enforces user isolation through user_id foreign key.
"""
from sqlmodel import SQLModel, Field
from typing import Optional, ClassVar
from datetime import datetime
from enum import Enum


class PriorityEnum(str, Enum):
    """Priority levels for todos."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Todo(SQLModel, table=True):
    """
    Todo entity representing a user's task.

    Constitutional Requirements:
    - Every todo MUST be associated with a user_id
    - User isolation MUST be enforced at query level
    - Timestamps MUST be UTC
    """
    __tablename__: ClassVar[str] = "todos"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Todo ID (auto-generated)"
    )

    title: str = Field(
        max_length=200,
        min_length=1,
        description="Todo title (1-200 characters)"
    )

    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional todo description (max 1000 characters)"
    )

    completed: bool = Field(
        default=False,
        description="Completion status (default: False)"
    )

    due_date: Optional[datetime] = Field(
        default=None,
        description="When the todo is due (UTC, nullable)"
    )

    priority: PriorityEnum = Field(
        default=PriorityEnum.MEDIUM,
        description="Priority level (high/medium/low, default: medium)"
    )

    category_id: Optional[int] = Field(
        default=None,
        description="Optional category ID (foreign key to categories.id)"
    )

    user_id: int = Field(
        foreign_key="users.id",
        index=True,
        description="Owner user ID (foreign key to users.id)"
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.utcnow(),
        description="Creation timestamp (UTC)"
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.utcnow(),
        description="Last update timestamp (UTC)"
    )
