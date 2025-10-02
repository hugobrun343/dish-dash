"""
Authentication routes
Simple username-based login (no password)
"""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DBSession
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import authenticate_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)  # type: ignore[misc]
async def login(request: LoginRequest, db: DBSession) -> TokenResponse:
    """
    Login with username (no password required)

    Creates a new user if username doesn't exist, otherwise logs in existing user.
    Returns a JWT token for authentication.

    Args:
        request: Login request with username
        db: Database session

    Returns:
        JWT token and user info

    Example:
        POST /api/v1/auth/login
        {
            "username": "john_doe"
        }

        Response:
        {
            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "token_type": "bearer",
            "username": "john_doe"
        }
    """
    try:
        user, access_token = authenticate_user(db, request.username)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            username=user.username,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}",
        ) from e
