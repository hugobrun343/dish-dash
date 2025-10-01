"""
Recipe routes
Generate recipes with AI, get details, and manage saved recipes
"""

from typing import cast

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DBSession
from app.schemas.recipe import (
    RecipeCreate,
    RecipeDetailsRequest,
    RecipeGenerateRequest,
    RecipeListResponse,
    RecipeResponse,
    SavedRecipeResponse,
)
from app.services.ai_service import ai_service
from app.services.recipe_service import (
    create_recipe,
    get_recipe_by_name,
    get_saved_recipes_for_user,
    save_recipe_for_user,
    unsave_recipe_for_user,
)

router = APIRouter(prefix="/recipes", tags=["Recipes"])


@router.post("/generate", response_model=RecipeListResponse)  # type: ignore[misc]
async def generate_recipes(
    request: RecipeGenerateRequest,
    user: CurrentUser,
) -> RecipeListResponse:
    """
    Generate recipe suggestions from available ingredients using AI

    Requires authentication.

    Args:
        request: Recipe generation request with ingredients and preferences
        user: Current authenticated user

    Returns:
        List of recipe suggestions

    Example:
        POST /api/v1/recipes/generate
        Headers: Authorization: Bearer <token>
        {
            "ingredients": ["chicken", "tomatoes", "pasta"],
            "cooking_time": 30,
            "difficulty": 5,
            "servings": 2,
            "dietary_restrictions": ["gluten-free"],
            "cuisine_preferences": ["italian"]
        }

        Response:
        {
            "recipes": [
                {
                    "name": "Chicken Pasta with Tomatoes",
                    "description": "A delicious Italian pasta dish",
                    "cooking_time": 25,
                    "difficulty": 4
                }
            ]
        }
    """
    try:
        recipes = ai_service.generate_recipe_list(request)

        if not recipes:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No recipes found for the given ingredients",
            )

        return RecipeListResponse(recipes=recipes)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recipes: {str(e)}",
        ) from e


@router.post("/details", response_model=RecipeResponse)  # type: ignore[misc]
async def get_recipe_details(
    request: RecipeDetailsRequest,
    user: CurrentUser,
    db: DBSession,
) -> RecipeResponse:
    """
    Get detailed recipe instructions for a specific recipe using AI

    Requires authentication.
    If the recipe doesn't exist in database, it will be created.

    Args:
        request: Recipe details request with recipe name
        user: Current authenticated user
        db: Database session

    Returns:
        Detailed recipe with ingredients and instructions

    Example:
        POST /api/v1/recipes/details
        Headers: Authorization: Bearer <token>
        {
            "recipe_name": "Chicken Pasta with Tomatoes",
            "servings": 2,
            "dietary_restrictions": ["gluten-free"]
        }

        Response:
        {
            "id": 1,
            "name": "Chicken Pasta with Tomatoes",
            "description": "A delicious Italian pasta dish",
            "servings": 2,
            "ingredients": [
                {"name": "chicken breast", "quantity": "200g"},
                {"name": "tomatoes", "quantity": "3 medium"}
            ],
            "instructions": "1. Cook pasta...",
            "cooking_time": 25,
            "prep_time": 10,
            "difficulty": 4,
            "created_at": "2025-10-01T12:00:00"
        }
    """
    try:
        # Check if recipe already exists in database
        existing_recipe = get_recipe_by_name(db, request.recipe_name)

        if existing_recipe:
            return cast(RecipeResponse, RecipeResponse.model_validate(existing_recipe))

        # Generate recipe details with AI
        recipe_data = ai_service.generate_recipe_details(request)

        if not recipe_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Failed to generate recipe details",
            )

        # Create recipe in database
        recipe_create = RecipeCreate(**recipe_data)
        recipe = create_recipe(db, recipe_create)

        return cast(RecipeResponse, RecipeResponse.model_validate(recipe))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recipe details: {str(e)}",
        ) from e


@router.get("/saved", response_model=list[SavedRecipeResponse])  # type: ignore[misc]
async def get_saved_recipes(
    user: CurrentUser,
    db: DBSession,
) -> list[SavedRecipeResponse]:
    """
    Get all saved recipes for current user

    Requires authentication.

    Args:
        user: Current authenticated user
        db: Database session

    Returns:
        List of saved recipes with details

    Example:
        GET /api/v1/recipes/saved
        Headers: Authorization: Bearer <token>

        Response:
        [
            {
                "id": 1,
                "user_id": 1,
                "recipe": {
                    "id": 1,
                    "name": "Chicken Pasta",
                    "description": "...",
                    ...
                },
                "saved_at": "2025-10-01T12:00:00"
            }
        ]
    """
    try:
        saved_recipes = get_saved_recipes_for_user(db, user)
        return [SavedRecipeResponse.model_validate(sr) for sr in saved_recipes]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get saved recipes: {str(e)}",
        ) from e


@router.post("/saved/{recipe_id}", response_model=SavedRecipeResponse)  # type: ignore[misc]
async def save_recipe(
    recipe_id: int,
    user: CurrentUser,
    db: DBSession,
) -> SavedRecipeResponse:
    """
    Save a recipe for current user

    Requires authentication.

    Args:
        recipe_id: Recipe ID to save
        user: Current authenticated user
        db: Database session

    Returns:
        Saved recipe info

    Raises:
        HTTPException: If recipe not found or already saved

    Example:
        POST /api/v1/recipes/saved/1
        Headers: Authorization: Bearer <token>

        Response:
        {
            "id": 1,
            "user_id": 1,
            "recipe": {...},
            "saved_at": "2025-10-01T12:00:00"
        }
    """
    try:
        # Get recipe from database
        from app.services.recipe_service import get_recipe_by_id

        recipe = get_recipe_by_id(db, recipe_id)

        if not recipe:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipe not found",
            )

        # Save recipe for user
        saved_recipe = save_recipe_for_user(db, user, recipe)

        return cast(SavedRecipeResponse, SavedRecipeResponse.model_validate(saved_recipe))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save recipe: {str(e)}",
        ) from e


@router.delete("/saved/{recipe_id}")  # type: ignore[misc]
async def unsave_recipe(
    recipe_id: int,
    user: CurrentUser,
    db: DBSession,
) -> dict[str, str]:
    """
    Remove a saved recipe for current user

    Requires authentication.

    Args:
        recipe_id: Recipe ID to unsave
        user: Current authenticated user
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If recipe was not saved

    Example:
        DELETE /api/v1/recipes/saved/1
        Headers: Authorization: Bearer <token>

        Response:
        {
            "message": "Recipe unsaved successfully"
        }
    """
    try:
        success = unsave_recipe_for_user(db, user, recipe_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipe not found in saved recipes",
            )

        return {"message": "Recipe unsaved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unsave recipe: {str(e)}",
        ) from e
