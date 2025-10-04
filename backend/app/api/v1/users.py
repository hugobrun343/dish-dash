
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import (
    UserPreferencesBase,
    UserPreferencesResponse,
    UserPreferencesUpdate,
)
from app.services.user_service import UserService

router = APIRouter()

def _get_current_user_profile(
    current_user: User = Depends(get_current_user)
) -> dict[str, Any]:
    """Get current user profile"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "created_at": current_user.created_at
    }

def _get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict[str, Any] | UserPreferencesResponse:
    """Get user preferences"""
    user_service = UserService(db)
    preferences = user_service.get_user_preferences(current_user.id)

    if not preferences:
        # Return default preferences if none exist
        return {
            "dietary_restrictions": [],
            "allergies": []
        }

    return UserPreferencesResponse(
        id=preferences.id,
        user_id=preferences.user_id,
        dietary_restrictions=preferences.dietary_restrictions or [],
        allergies=preferences.allergies or [],
        updated_at=preferences.updated_at
    )

def _update_user_preferences(
    preferences_update: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserPreferencesResponse:
    """Update user preferences"""
    user_service = UserService(db)

    # Check if preferences exist
    existing_preferences = user_service.get_user_preferences(current_user.id)

    if existing_preferences:
        # Update existing preferences
        updated_preferences = user_service.update_user_preferences(
            current_user.id,
            preferences_update.model_dump(exclude_unset=True)
        )
    else:
        # Create new preferences
        preferences_data = UserPreferencesBase(**preferences_update.model_dump())
        updated_preferences = user_service.create_user_preferences(
            current_user.id,
            preferences_data
        )

    if not updated_preferences:
        raise HTTPException(status_code=500, detail="Failed to update preferences")

    return UserPreferencesResponse(
        id=updated_preferences.id,
        user_id=updated_preferences.user_id,
        dietary_restrictions=updated_preferences.dietary_restrictions or [],
        allergies=updated_preferences.allergies or [],
        updated_at=updated_preferences.updated_at
    )

# Register routes with proper typing
router.add_api_route("/me", _get_current_user_profile, methods=["GET"])
router.add_api_route("/me/preferences", _get_user_preferences, methods=["GET"])
router.add_api_route("/me/preferences", _update_user_preferences, methods=["PUT"])

