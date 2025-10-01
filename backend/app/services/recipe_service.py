"""
Recipe service for CRUD operations and saved recipes management
"""

from typing import cast

from sqlalchemy.orm import Session

from app.models.recipe import Recipe
from app.models.saved_recipe import SavedRecipe
from app.models.user import User
from app.schemas.recipe import RecipeCreate


def create_recipe(db: Session, recipe_data: RecipeCreate) -> Recipe:
    """
    Create a new recipe in the database

    Args:
        db: Database session
        recipe_data: Recipe data to create

    Returns:
        Created recipe object
    """
    # Convert ingredients to dict format for JSONB
    ingredients_dict = [ing.model_dump() for ing in recipe_data.ingredients]

    recipe = Recipe(
        name=recipe_data.name,
        description=recipe_data.description,
        servings=recipe_data.servings,
        ingredients=ingredients_dict,
        instructions=recipe_data.instructions,
        cooking_time=recipe_data.cooking_time,
        prep_time=recipe_data.prep_time,
        difficulty=recipe_data.difficulty,
    )

    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


def get_recipe_by_id(db: Session, recipe_id: int) -> Recipe | None:
    """
    Get recipe by ID

    Args:
        db: Database session
        recipe_id: Recipe ID

    Returns:
        Recipe object or None if not found
    """
    result = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    return cast(Recipe | None, result)


def get_recipe_by_name(db: Session, recipe_name: str) -> Recipe | None:
    """
    Get recipe by name

    Args:
        db: Database session
        recipe_name: Recipe name

    Returns:
        Recipe object or None if not found
    """
    result = db.query(Recipe).filter(Recipe.name == recipe_name).first()
    return cast(Recipe | None, result)


def save_recipe_for_user(db: Session, user: User, recipe: Recipe) -> SavedRecipe:
    """
    Save a recipe for a user

    Args:
        db: Database session
        user: User object
        recipe: Recipe object

    Returns:
        SavedRecipe object

    Raises:
        ValueError: If recipe is already saved by user
    """
    # Check if already saved
    existing = (
        db.query(SavedRecipe)
        .filter(SavedRecipe.user_id == user.id, SavedRecipe.recipe_id == recipe.id)
        .first()
    )

    if existing:
        raise ValueError("Recipe already saved by user")

    # Create saved recipe
    saved_recipe = SavedRecipe(user_id=user.id, recipe_id=recipe.id)
    db.add(saved_recipe)
    db.commit()
    db.refresh(saved_recipe)
    return saved_recipe


def unsave_recipe_for_user(db: Session, user: User, recipe_id: int) -> bool:
    """
    Remove a saved recipe for a user

    Args:
        db: Database session
        user: User object
        recipe_id: Recipe ID to unsave

    Returns:
        True if recipe was unsaved, False if not found
    """
    saved_recipe = (
        db.query(SavedRecipe)
        .filter(SavedRecipe.user_id == user.id, SavedRecipe.recipe_id == recipe_id)
        .first()
    )

    if not saved_recipe:
        return False

    db.delete(saved_recipe)
    db.commit()
    return True


def get_saved_recipes_for_user(db: Session, user: User) -> list[SavedRecipe]:
    """
    Get all saved recipes for a user

    Args:
        db: Database session
        user: User object

    Returns:
        List of SavedRecipe objects with recipe details
    """
    result = (
        db.query(SavedRecipe)
        .filter(SavedRecipe.user_id == user.id)
        .order_by(SavedRecipe.saved_at.desc())
        .all()
    )
    return cast(list[SavedRecipe], result)
