"""
Recipe schemas for request/response validation
"""

from datetime import datetime

from pydantic import BaseModel, Field


class RecipeIngredient(BaseModel):
    """Schema for recipe ingredient"""

    name: str = Field(..., description="Ingredient name")
    quantity: str = Field(..., description="Ingredient quantity")


class RecipeGenerateRequest(BaseModel):
    """Request to generate recipes from ingredients using AI"""

    ingredients: list[str] = Field(..., min_length=1, description="List of available ingredients")
    cooking_time: int | None = Field(default=None, description="Max cooking time in minutes")
    difficulty: int | None = Field(default=None, ge=1, le=10, description="Difficulty level (1-10)")
    servings: int = Field(default=2, ge=1, description="Number of servings")
    dietary_restrictions: list[str] | None = Field(default=None, description="Dietary restrictions")


class RecipeDetailsRequest(BaseModel):
    """Request to get detailed recipe from recipe name using AI"""

    recipe_name: str = Field(..., description="Recipe name to get details for")
    servings: int = Field(default=2, ge=1, description="Number of servings")
    dietary_restrictions: list[str] | None = Field(default=None, description="Dietary restrictions")


class RecipeBase(BaseModel):
    """Base recipe schema"""

    name: str = Field(..., max_length=200, description="Recipe name")
    description: str | None = Field(default=None, description="Recipe description")
    servings: int = Field(default=1, ge=1, description="Number of servings")
    ingredients: list[RecipeIngredient] = Field(..., description="List of ingredients")
    instructions: str = Field(..., description="Cooking instructions")
    cooking_time: int | None = Field(default=None, description="Cooking time in minutes")
    prep_time: int | None = Field(default=None, description="Preparation time in minutes")
    difficulty: int | None = Field(default=None, ge=1, le=10, description="Difficulty level (1-10)")


class RecipeCreate(RecipeBase):
    """Schema for creating a recipe"""

    pass


class RecipeResponse(RecipeBase):
    """Schema for recipe response"""

    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class RecipeListItem(BaseModel):
    """Schema for recipe list item (simplified)"""

    name: str = Field(..., description="Recipe name")
    description: str | None = Field(default=None, description="Short description")
    cooking_time: int | None = Field(default=None, description="Cooking time in minutes")
    difficulty: int | None = Field(default=None, description="Difficulty level (1-10)")


class RecipeListResponse(BaseModel):
    """Response with list of recipe suggestions"""

    recipes: list[RecipeListItem] = Field(..., description="List of recipe suggestions")


class SavedRecipeResponse(BaseModel):
    """Schema for saved recipe response"""

    id: int
    user_id: int
    recipe: RecipeResponse
    saved_at: datetime

    model_config = {"from_attributes": True}

