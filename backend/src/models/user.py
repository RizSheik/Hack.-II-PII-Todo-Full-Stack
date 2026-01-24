"""
User database model.

User entity with authentication credentials for JWT-based authentication.
"""
from sqlmodel import SQLModel, Field
from typing import Optional, ClassVar


class User(SQLModel, table=True):
    """
    User entity with authentication credentials.

    Stores user email and hashed password for authentication.
    """
    __tablename__: ClassVar[str] = "users"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="User ID"
    )

    email: str = Field(
        unique=True,
        index=True,
        description="User email address"
    )

    name: Optional[str] = Field(
        default=None,
        description="User's display name"
    )

    password_hash: str = Field(
        description="Bcrypt hashed password"
    )

