"""
API dependencies for dependency injection
Provides database sessions and authentication
"""

from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import verify_token
from app.models.user import User
from app.services.auth_service import get_user_by_username

# Security scheme for JWT Bearer token
security = HTTPBearer()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session

    Yields:
        Database session

    Example:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """
    Dependency to get current authenticated user from JWT token

    Args:
        credentials: JWT Bearer token from Authorization header
        db: Database session

    Returns:
        Current user object

    Raises:
        HTTPException: If token is invalid or user not found

    Example:
        @app.get("/me")
        def read_current_user(user: User = Depends(get_current_user)):
            return {"username": user.username}
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verify token
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise credentials_exception

    username: str | None = payload.get("sub")
    if username is None:
        raise credentials_exception

    # Get user from database
    user = get_user_by_username(db, username)
    if user is None:
        raise credentials_exception

    return user


# Type aliases for cleaner route signatures
DBSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

