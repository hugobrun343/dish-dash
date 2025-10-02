"""
Schemas module
Exports all Pydantic schemas for easy import
"""

from app.schemas.auth import LoginRequest, TokenData, TokenResponse
from app.schemas.recipe import (
    RecipeCreate,
    RecipeDetailsRequest,
    RecipeGenerateRequest,
    RecipeListItem,
    RecipeListResponse,
    RecipeResponse,
    SavedRecipeResponse,
)
from app.schemas.user import (
    UserCreate,
    UserPreferencesCreate,
    UserPreferencesResponse,
    UserPreferencesUpdate,
    UserResponse,
)

__all__ = [
    # Auth
    "LoginRequest",
    "TokenResponse",
    "TokenData",
    # User
    "UserCreate",
    "UserResponse",
    "UserPreferencesCreate",
    "UserPreferencesUpdate",
    "UserPreferencesResponse",
    # Recipe
    "RecipeCreate",
    "RecipeResponse",
    "RecipeGenerateRequest",
    "RecipeDetailsRequest",
    "RecipeListItem",
    "RecipeListResponse",
    "SavedRecipeResponse",
]
