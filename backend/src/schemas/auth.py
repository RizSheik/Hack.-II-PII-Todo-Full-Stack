"""
Authentication request/response schemas.
"""
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    """User signup request."""
    email: EmailStr
    name: str
    password: str = Field(min_length=8, max_length=100)


class SigninRequest(BaseModel):
    """User signin request."""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Signup response."""
    message: str
    user_id: int


class UserResponse(BaseModel):
    """User information response."""
    id: int
    email: str
    name: str


class LoginResponse(BaseModel):
    """Login response with token and user info."""
    token: str
    user: UserResponse
