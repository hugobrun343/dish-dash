"""
User schemas for request/response validation
"""

from datetime import datetime

from pydantic import BaseModel, Field


class UserBase(BaseModel):
    """Base user schema"""

    username: str = Field(..., min_length=3, max_length=50, description="Username")


class UserCreate(UserBase):
    """Schema for creating a new user"""

    pass


class UserResponse(UserBase):
    """Schema for user response"""

    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPreferencesBase(BaseModel):
    """Base user preferences schema"""

    dietary_restrictions: list[str] | None = Field(default=None, description="Dietary restrictions")
    allergies: list[str] | None = Field(default=None, description="Allergies")
    cooking_time_preference: int | None = Field(default=None, description="Max cooking time in minutes")
    difficulty_preference: int | None = Field(default=None, ge=1, le=10, description="Difficulty level (1-10)")


class UserPreferencesCreate(UserPreferencesBase):
    """Schema for creating user preferences"""

    pass


class UserPreferencesUpdate(UserPreferencesBase):
    """Schema for updating user preferences"""

    pass


class UserPreferencesResponse(UserPreferencesBase):
    """Schema for user preferences response"""

    id: int
    user_id: int
    updated_at: datetime

    model_config = {"from_attributes": True}

