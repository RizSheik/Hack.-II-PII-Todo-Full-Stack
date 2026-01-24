"""
JWT authentication and verification for Better Auth integration.

This module provides JWT token verification for stateless authentication
between the Next.js frontend (Better Auth) and FastAPI backend.
"""
import jwt
from fastapi import HTTPException, Header, Depends
from datetime import datetime
from src.config import settings


async def verify_jwt_token(authorization: str = Header(None)) -> dict:
    """
    Verify JWT token from Authorization header.

    Extracts and verifies JWT token issued by Better Auth on the frontend.
    Validates signature, expiration, and required claims.

    Args:
        authorization: Authorization header value (Bearer <token>)

    Returns:
        dict: JWT payload containing user_id, email, iat, exp

    Raises:
        HTTPException(401): If token is missing, invalid, or expired
    """
    # Check if Authorization header is present
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Missing authentication token",
                    "details": []
                }
            }
        )

    # Validate Bearer format
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Invalid token format",
                    "details": [{"field": "authorization", "message": "Must use Bearer token format"}]
                }
            }
        )

    # Extract token
    token = authorization.split(" ", 1)[1]

    try:
        # Decode and verify JWT
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )

        # Validate required claims
        if "user_id" not in payload:
            raise HTTPException(
                status_code=401,
                detail={
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Invalid token claims",
                        "details": [{"field": "user_id", "message": "Missing user_id claim"}]
                    }
                }
            )

        # Validate user_id type
        if not isinstance(payload["user_id"], int):
            raise HTTPException(
                status_code=401,
                detail={
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Invalid user_id in token",
                        "details": [{"field": "user_id", "message": "user_id must be an integer"}]
                    }
                }
            )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Token expired",
                    "details": []
                }
            }
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Invalid token signature",
                    "details": [{"field": "token", "message": str(e)}]
                }
            }
        )


async def get_current_user_id(
    token_payload: dict = Depends(verify_jwt_token)
) -> int:
    """
    Extract user ID from verified JWT payload.

    This dependency provides the authenticated user ID to endpoint handlers.
    Token verification is performed by verify_jwt_token dependency.

    Args:
        token_payload: Verified JWT payload from verify_jwt_token

    Returns:
        int: Authenticated user ID
    """
    return token_payload["user_id"]
