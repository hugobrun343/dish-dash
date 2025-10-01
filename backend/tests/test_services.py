"""
Tests for business logic services
"""

from sqlalchemy.orm import Session

from app.models.recipe import Recipe
from app.models.user import User
from app.schemas.recipe import RecipeCreate
from app.services.auth_service import authenticate_user, get_or_create_user
from app.services.recipe_service import (
    create_recipe,
    get_recipe_by_id,
    get_recipe_by_name,
    get_saved_recipes_for_user,
    save_recipe_for_user,
    unsave_recipe_for_user,
)


# Auth Service Tests
def test_get_or_create_user_new(db: Session) -> None:
    """Test creating a new user"""
    user = get_or_create_user(db, "newuser")

    assert user.username == "newuser"
    assert user.id is not None


def test_get_or_create_user_existing(db: Session, test_user: User) -> None:
    """Test getting an existing user"""
    user = get_or_create_user(db, test_user.username)

    assert user.id == test_user.id
    assert user.username == test_user.username


def test_authenticate_user_new(db: Session) -> None:
    """Test authenticating a new user"""
    user, token = authenticate_user(db, "authuser")

    assert user.username == "authuser"
    assert token is not None
    assert len(token) > 0


def test_authenticate_user_existing(db: Session, test_user: User) -> None:
    """Test authenticating an existing user"""
    user, token = authenticate_user(db, test_user.username)

    assert user.id == test_user.id
    assert token is not None


# Recipe Service Tests
def test_create_recipe(db: Session) -> None:
    """Test creating a recipe"""
    recipe_data = RecipeCreate(
        name="Test Recipe",
        description="Test description",
        servings=2,
        ingredients=[
            {"name": "ingredient1", "quantity": "100g"},
            {"name": "ingredient2", "quantity": "50ml"},
        ],
        instructions="Test instructions",
        cooking_time=20,
        prep_time=10,
        difficulty=3,
    )

    recipe = create_recipe(db, recipe_data)

    assert recipe.id is not None
    assert recipe.name == "Test Recipe"
    assert recipe.servings == 2
    assert len(recipe.ingredients) == 2


def test_get_recipe_by_id(db: Session, test_recipe: Recipe) -> None:
    """Test getting recipe by ID"""
    recipe = get_recipe_by_id(db, test_recipe.id)

    assert recipe is not None
    assert recipe.id == test_recipe.id
    assert recipe.name == test_recipe.name


def test_get_recipe_by_id_not_found(db: Session) -> None:
    """Test getting non-existent recipe by ID"""
    recipe = get_recipe_by_id(db, 99999)

    assert recipe is None


def test_get_recipe_by_name(db: Session, test_recipe: Recipe) -> None:
    """Test getting recipe by name"""
    recipe = get_recipe_by_name(db, test_recipe.name)

    assert recipe is not None
    assert recipe.name == test_recipe.name


def test_get_recipe_by_name_not_found(db: Session) -> None:
    """Test getting non-existent recipe by name"""
    recipe = get_recipe_by_name(db, "Non Existent Recipe")

    assert recipe is None


def test_save_recipe_for_user(db: Session, test_user: User, test_recipe: Recipe) -> None:
    """Test saving a recipe for a user"""
    saved_recipe = save_recipe_for_user(db, test_user, test_recipe)

    assert saved_recipe.user_id == test_user.id
    assert saved_recipe.recipe_id == test_recipe.id


def test_save_recipe_for_user_duplicate(
    db: Session, test_user: User, test_recipe: Recipe
) -> None:
    """Test saving a recipe twice raises error"""
    # Save once
    save_recipe_for_user(db, test_user, test_recipe)

    # Try to save again
    try:
        save_recipe_for_user(db, test_user, test_recipe)
        raise AssertionError("Should have raised ValueError")
    except ValueError as e:
        assert "already saved" in str(e)


def test_unsave_recipe_for_user(
    db: Session, test_user: User, test_recipe: Recipe
) -> None:
    """Test unsaving a recipe"""
    # Save first
    save_recipe_for_user(db, test_user, test_recipe)

    # Unsave
    result = unsave_recipe_for_user(db, test_user, test_recipe.id)

    assert result is True


def test_unsave_recipe_not_saved(db: Session, test_user: User) -> None:
    """Test unsaving a recipe that wasn't saved"""
    result = unsave_recipe_for_user(db, test_user, 99999)

    assert result is False


def test_get_saved_recipes_for_user_empty(db: Session, test_user: User) -> None:
    """Test getting saved recipes when user has none"""
    saved_recipes = get_saved_recipes_for_user(db, test_user)

    assert len(saved_recipes) == 0


def test_get_saved_recipes_for_user_with_data(
    db: Session, test_user: User, test_recipe: Recipe
) -> None:
    """Test getting saved recipes with data"""
    # Save recipe
    save_recipe_for_user(db, test_user, test_recipe)

    # Get saved recipes
    saved_recipes = get_saved_recipes_for_user(db, test_user)

    assert len(saved_recipes) == 1
    assert saved_recipes[0].recipe_id == test_recipe.id


def test_saved_recipes_ordered_by_date(
    db: Session, test_user: User, test_recipe: Recipe
) -> None:
    """Test saved recipes are ordered by saved_at (most recent first)"""
    # Create second recipe
    recipe2_data = RecipeCreate(
        name="Second Recipe",
        description="Second",
        servings=1,
        ingredients=[{"name": "test", "quantity": "1"}],
        instructions="Test",
        cooking_time=10,
        prep_time=5,
        difficulty=2,
    )
    recipe2 = create_recipe(db, recipe2_data)

    # Save recipes
    save_recipe_for_user(db, test_user, test_recipe)
    save_recipe_for_user(db, test_user, recipe2)

    # Get saved recipes
    saved_recipes = get_saved_recipes_for_user(db, test_user)

    # Most recent should be first
    assert len(saved_recipes) == 2
    assert saved_recipes[0].recipe_id == recipe2.id
    assert saved_recipes[1].recipe_id == test_recipe.id

