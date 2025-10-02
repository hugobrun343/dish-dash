"""
Authentication service
Handles user login with simple username authentication
"""

from datetime import timedelta
from typing import cast

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import User


def get_or_create_user(db: Session, username: str) -> User:
    """
    Get user by username or create if doesn't exist

    Args:
        db: Database session
        username: Username to find or create

    Returns:
        User object
    """
    # Try to find existing user
    existing_user = db.query(User).filter(User.username == username).first()

    # Create new user if doesn't exist
    if not existing_user:
        new_user = User(username=username)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    return cast(User, existing_user)


def authenticate_user(db: Session, username: str) -> tuple[User, str]:
    """
    Authenticate user with username (no password required)

    Args:
        db: Database session
        username: Username to authenticate

    Returns:
        Tuple of (User object, JWT token)
    """
    # Get or create user
    user = get_or_create_user(db, username)

    # Create JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return user, access_token


def get_user_by_username(db: Session, username: str) -> User | None:
    """
    Get user by username

    Args:
        db: Database session
        username: Username to find

    Returns:
        User object or None if not found
    """
    result = db.query(User).filter(User.username == username).first()
    return cast(User | None, result)
