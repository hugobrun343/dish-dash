"""
Models module
Exports all SQLAlchemy models for easy import
"""

from app.models.recipe import Recipe
from app.models.saved_recipe import SavedRecipe
from app.models.user import User
from app.models.user_preferences import UserPreferences

__all__ = ["User", "Recipe", "SavedRecipe", "UserPreferences"]
