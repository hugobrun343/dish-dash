"""
Services module
Exports all business logic services
"""

from app.services.ai_service import AIService, ai_service
from app.services.auth_service import (
    authenticate_user,
    get_or_create_user,
    get_user_by_username,
)
from app.services.recipe_service import (
    create_recipe,
    get_recipe_by_id,
    get_recipe_by_name,
    get_saved_recipes_for_user,
    save_recipe_for_user,
    unsave_recipe_for_user,
)

__all__ = [
    # AI Service
    "AIService",
    "ai_service",
    # Auth Service
    "authenticate_user",
    "get_or_create_user",
    "get_user_by_username",
    # Recipe Service
    "create_recipe",
    "get_recipe_by_id",
    "get_recipe_by_name",
    "save_recipe_for_user",
    "unsave_recipe_for_user",
    "get_saved_recipes_for_user",
]
