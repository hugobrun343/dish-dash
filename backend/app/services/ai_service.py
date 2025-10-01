"""
AI service for recipe generation using Mistral AI
"""

import json
from typing import Any

from mistralai import Mistral

from app.core.config import settings
from app.schemas.recipe import (
    RecipeDetailsRequest,
    RecipeGenerateRequest,
    RecipeListItem,
)


class AIService:
    """Service for interacting with Mistral AI"""

    def __init__(self) -> None:
        """Initialize Mistral client"""
        self.client = Mistral(api_key=settings.MISTRAL_API_KEY)
        self.model = "mistral-large-latest"

    def generate_recipe_list(self, request: RecipeGenerateRequest) -> list[RecipeListItem]:
        """
        Generate a list of recipe suggestions based on available ingredients

        Args:
            request: Recipe generation request with ingredients and preferences

        Returns:
            List of recipe suggestions
        """
        # Build prompt
        prompt = self._build_recipe_list_prompt(request)

        # Call Mistral AI
        response = self.client.chat.complete(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional chef assistant. Generate recipe suggestions in JSON format.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )

        # Parse response
        try:
            content = response.choices[0].message.content
            if content is None:
                return []

            data: dict[str, Any] = json.loads(content)
            recipes_data = data.get("recipes", [])

            # Convert to RecipeListItem objects
            recipes: list[RecipeListItem] = []
            for recipe_data in recipes_data:
                recipes.append(
                    RecipeListItem(
                        name=recipe_data.get("name", ""),
                        description=recipe_data.get("description"),
                        cooking_time=recipe_data.get("cooking_time"),
                        difficulty=recipe_data.get("difficulty"),
                    )
                )
            return recipes
        except (json.JSONDecodeError, KeyError, IndexError):
            return []

    def generate_recipe_details(self, request: RecipeDetailsRequest) -> dict[str, Any]:
        """
        Generate detailed recipe instructions for a specific recipe

        Args:
            request: Recipe details request with recipe name and preferences

        Returns:
            Detailed recipe with ingredients and instructions
        """
        # Build prompt
        prompt = self._build_recipe_details_prompt(request)

        # Call Mistral AI
        response = self.client.chat.complete(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional chef. Provide detailed recipes in JSON format.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )

        # Parse response
        try:
            content = response.choices[0].message.content
            if content is None:
                return {}

            data: dict[str, Any] = json.loads(content)
            return data
        except (json.JSONDecodeError, KeyError, IndexError):
            return {}

    def _build_recipe_list_prompt(self, request: RecipeGenerateRequest) -> str:
        """Build prompt for recipe list generation"""
        ingredients_str = ", ".join(request.ingredients)

        prompt = f"""Generate 3-5 recipe suggestions using these ingredients: {ingredients_str}

Requirements:
- Servings: {request.servings}"""

        if request.cooking_time:
            prompt += f"\n- Max cooking time: {request.cooking_time} minutes"

        if request.difficulty:
            prompt += f"\n- Difficulty level: {request.difficulty}/10"

        if request.dietary_restrictions:
            restrictions = ", ".join(request.dietary_restrictions)
            prompt += f"\n- Dietary restrictions: {restrictions}"

        if request.cuisine_preferences:
            cuisines = ", ".join(request.cuisine_preferences)
            prompt += f"\n- Cuisine preferences: {cuisines}"

        prompt += """

Return a JSON object with this structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description (1-2 sentences)",
      "cooking_time": 30,
      "difficulty": 5
    }
  ]
}"""

        return prompt

    def _build_recipe_details_prompt(self, request: RecipeDetailsRequest) -> str:
        """Build prompt for recipe details generation"""
        prompt = f"""Provide a detailed recipe for: {request.recipe_name}

Requirements:
- Servings: {request.servings}"""

        if request.dietary_restrictions:
            restrictions = ", ".join(request.dietary_restrictions)
            prompt += f"\n- Dietary restrictions: {restrictions}"

        prompt += """

Return a JSON object with this structure:
{
  "name": "Recipe Name",
  "description": "Detailed description",
  "servings": 2,
  "ingredients": [
    {"name": "Ingredient name", "quantity": "Amount with unit"}
  ],
  "instructions": "Step by step cooking instructions",
  "cooking_time": 30,
  "prep_time": 15,
  "difficulty": 5
}"""

        return prompt


# Global AI service instance
ai_service = AIService()
