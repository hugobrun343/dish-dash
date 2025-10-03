"""
User service functions
Handle user preferences operations
"""

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.schemas.user import UserPreferencesBase, UserPreferencesUpdate


def get_user_preferences(db: Session, user: User) -> UserPreferences | None:
    """
    Get user preferences from database

    Args:
        db: Database session
        user: User object

    Returns:
        UserPreferences object or None if not found
    """
    result = db.query(UserPreferences).filter(UserPreferences.user_id == user.id).first()
    return result if isinstance(result, UserPreferences) else None


def create_user_preferences(
    db: Session,
    user: User,
    preferences_data: UserPreferencesUpdate
) -> UserPreferences:
    """
    Create new user preferences

    Args:
        db: Database session
        user: User object
        preferences_data: Preferences data to create

    Returns:
        Created UserPreferences object
    """
    preferences = UserPreferences(
        user_id=user.id,
        dietary_restrictions=preferences_data.dietary_restrictions,
        allergies=preferences_data.allergies,
        cooking_time_preference=preferences_data.cooking_time_preference,
        difficulty_preference=preferences_data.difficulty_preference,
    )

    db.add(preferences)
    db.commit()
    db.refresh(preferences)

    return preferences


def update_user_preferences(
    db: Session,
    user: User,
    preferences_data: UserPreferencesUpdate
) -> UserPreferences:
    """
    Update existing user preferences

    Args:
        db: Database session
        user: User object
        preferences_data: Updated preferences data

    Returns:
        Updated UserPreferences object
    """
    preferences = get_user_preferences(db, user)

    if not preferences:
        raise ValueError("User preferences not found")

    # Update fields that are provided
    if preferences_data.dietary_restrictions is not None:
        preferences.dietary_restrictions = preferences_data.dietary_restrictions
    if preferences_data.allergies is not None:
        preferences.allergies = preferences_data.allergies
    if preferences_data.cooking_time_preference is not None:
        preferences.cooking_time_preference = preferences_data.cooking_time_preference
    if preferences_data.difficulty_preference is not None:
        preferences.difficulty_preference = preferences_data.difficulty_preference

    db.commit()
    db.refresh(preferences)

    return preferences


class UserService:
    """Service class for user-related operations"""

    def __init__(self, db: Session):
        self.db = db

    def get_user_preferences(self, user_id: int) -> UserPreferences | None:
        """Get user preferences by user ID"""
        result = self.db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
        return result if isinstance(result, UserPreferences) else None

    def create_user_preferences(self, user_id: int, preferences_data: UserPreferencesBase) -> UserPreferences:
        """Create new user preferences"""
        preferences = UserPreferences(
            user_id=user_id,
            dietary_restrictions=preferences_data.dietary_restrictions,
            allergies=preferences_data.allergies,
            cooking_time_preference=preferences_data.cooking_time_preference,
            difficulty_preference=preferences_data.difficulty_preference,
        )

        self.db.add(preferences)
        self.db.commit()
        self.db.refresh(preferences)

        return preferences

    def update_user_preferences(self, user_id: int, preferences_data: dict) -> UserPreferences:
        """Update existing user preferences"""
        preferences = self.get_user_preferences(user_id)

        if not preferences:
            raise ValueError("User preferences not found")

        # Update fields that are provided
        for field, value in preferences_data.items():
            if hasattr(preferences, field) and value is not None:
                setattr(preferences, field, value)

        self.db.commit()
        self.db.refresh(preferences)

        return preferences
