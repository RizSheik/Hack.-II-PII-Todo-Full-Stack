"""
Authentication API routes.

Implements user signup and signin with JWT token issuance.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timedelta
import jwt
import bcrypt
import logging

from ...database import get_session
from ...models.user import User
from ...config import settings
from ...schemas.auth import SignupRequest, SigninRequest, AuthResponse, UserResponse, LoginResponse
from ...core.auth import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    signup_data: SignupRequest,
    session: Session = Depends(get_session)
) -> AuthResponse:
    """
    Register a new user.

    Creates a new user account with hashed password.
    Does NOT automatically issue a token - user must sign in after signup.
    """
    # Check if user already exists
    statement = select(User).where(User.email == signup_data.email)
    existing_user = session.exec(statement).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Hash password
    password_hash = bcrypt.hashpw(
        signup_data.password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    # Create user
    user = User(
        email=signup_data.email,
        name=signup_data.name,
        password_hash=password_hash
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    logger.info(f"User created: {user.email} (ID: {user.id})")

    return AuthResponse(
        message="User created successfully. Please sign in.",
        user_id=user.id
    )


@router.post("/auth/signin", response_model=LoginResponse)
async def signin(
    signin_data: SigninRequest,
    session: Session = Depends(get_session)
) -> LoginResponse:
    """
    Authenticate user and issue JWT token.

    Verifies credentials and returns a JWT token for authenticated requests.
    """
    # Find user by email
    statement = select(User).where(User.email == signin_data.email)
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not bcrypt.checkpw(
        signin_data.password.encode('utf-8'),
        user.password_hash.encode('utf-8')
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate JWT token
    expiration = datetime.utcnow() + timedelta(days=7)
    payload = {
        "user_id": user.id,
        "email": user.email,
        "iat": datetime.utcnow(),
        "exp": expiration
    }

    token = jwt.encode(
        payload,
        settings.effective_jwt_secret,
        algorithm=settings.JWT_ALGORITHM
    )

    logger.info(f"User signed in: {user.email} (ID: {user.id})")

    # Return both token and user information
    return LoginResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name or user.email.split('@')[0]  # Use email prefix as name if not set
        )
    )


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user(
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> UserResponse:
    """
    Get current authenticated user's information.

    Retrieves the authenticated user's profile information.
    """
    statement = select(User).where(User.id == current_user_id)
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name or user.email.split('@')[0]
    )
