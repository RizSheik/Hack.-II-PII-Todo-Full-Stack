"""
Security and authentication utilities.

Provides JWT token verification and user authorization helpers.
Constitutional requirement: Backend must never trust frontend identity without JWT verification.
"""
from fastapi import Header, HTTPException, status
from typing import Optional
import jwt
from ..config import settings


async def get_current_user_id(
    authorization: Optional[str] = Header(None, description="Bearer JWT token")
) -> int:
    """
    FastAPI dependency that extracts and validates user_id from JWT token.

    Args:
        authorization: Authorization header with format "Bearer <token>"

    Returns:
        int: Authenticated user ID from JWT payload

    Raises:
        HTTPException: 401 if token is missing, malformed, or invalid

    Usage:
        @app.get("/endpoint")
        async def endpoint(user_id: int = Depends(get_current_user_id)):
            # user_id is guaranteed to be valid
            pass
    """
    # Check if Authorization header is present
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Check if header has correct format
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = parts[1]

    # Verify and decode JWT token
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Extract user_id from payload
    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user_id claim",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        return int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user_id in token",
            headers={"WWW-Authenticate": "Bearer"}
        )


def validate_user_access(token_user_id: int, resource_user_id: int) -> None:
    """
    Validate that the authenticated user has access to the requested resource.

    Constitutional requirement: Each user can only access their own tasks.
    This function enforces user isolation at the application level.

    Args:
        token_user_id: User ID from JWT token (authenticated user)
        resource_user_id: User ID from URL path (resource owner)

    Raises:
        HTTPException: 403 Forbidden if user IDs don't match

    Usage:
        @app.get("/api/users/{user_id}/todos")
        async def get_todos(
            user_id: int,
            current_user_id: int = Depends(get_current_user_id)
        ):
            validate_user_access(current_user_id, user_id)
            # Proceed with query - user is authorized
    """
    if token_user_id != resource_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "You can only access your own resources",
                    "details": []
                }
            }
        )
