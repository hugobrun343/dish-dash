"""
Tests for recipe endpoints
"""

from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.recipe import Recipe
from app.models.saved_recipe import SavedRecipe
from app.schemas.recipe import RecipeListItem


def test_generate_recipes_success(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test generating recipes from ingredients with AI"""
    mock_recipes = [
        RecipeListItem(
            name="Pasta Carbonara",
            description="Classic Italian pasta",
            cooking_time=20,
            difficulty=4,
        ),
        RecipeListItem(
            name="Tomato Pasta",
            description="Simple tomato pasta",
            cooking_time=15,
            difficulty=2,
        ),
    ]

    with patch("app.api.v1.recipes.ai_service.generate_recipe_list") as mock_ai:
        mock_ai.return_value = mock_recipes

        response = client.post(
            "/api/v1/recipes/generate",
            headers=auth_headers,
            json={
                "ingredients": ["pasta", "tomatoes", "eggs"],
                "cooking_time": 30,
                "difficulty": 5,
                "servings": 2,
            },
        )

        assert response.status_code == 200
        data = response.json()

        assert "recipes" in data
        assert len(data["recipes"]) == 2
        assert data["recipes"][0]["name"] == "Pasta Carbonara"
        assert data["recipes"][1]["name"] == "Tomato Pasta"


def test_generate_recipes_no_auth(client: TestClient) -> None:
    """Test generating recipes without authentication fails"""
    response = client.post(
        "/api/v1/recipes/generate",
        json={"ingredients": ["pasta"], "servings": 2},
    )

    assert response.status_code == 403  # Forbidden


def test_generate_recipes_no_results(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test generating recipes when AI returns no results"""
    with patch("app.api.v1.recipes.ai_service.generate_recipe_list") as mock_ai:
        mock_ai.return_value = []

        response = client.post(
            "/api/v1/recipes/generate",
            headers=auth_headers,
            json={"ingredients": ["unknown"], "servings": 2},
        )

        assert response.status_code == 404


def test_get_recipe_details_new_recipe(
    client: TestClient, auth_headers: dict[str, str], db: Session
) -> None:
    """Test getting recipe details creates new recipe in DB"""
    mock_recipe_data = {
        "name": "New Pasta Recipe",
        "description": "A brand new pasta",
        "servings": 2,
        "ingredients": [
            {"name": "pasta", "quantity": "200g"},
            {"name": "sauce", "quantity": "100ml"},
        ],
        "instructions": "Cook pasta, add sauce",
        "cooking_time": 20,
        "prep_time": 10,
        "difficulty": 3,
    }

    with patch("app.api.v1.recipes.ai_service.generate_recipe_details") as mock_ai:
        mock_ai.return_value = mock_recipe_data

        response = client.post(
            "/api/v1/recipes/details",
            headers=auth_headers,
            json={"recipe_name": "New Pasta Recipe", "servings": 2},
        )

        assert response.status_code == 200
        data = response.json()

        assert data["name"] == "New Pasta Recipe"
        assert data["servings"] == 2
        assert len(data["ingredients"]) == 2

        # Check recipe was created in database
        recipe = db.query(Recipe).filter(Recipe.name == "New Pasta Recipe").first()
        assert recipe is not None


def test_get_recipe_details_existing_recipe(
    client: TestClient, auth_headers: dict[str, str], test_recipe: Recipe
) -> None:
    """Test getting recipe details for existing recipe returns from DB"""
    response = client.post(
        "/api/v1/recipes/details",
        headers=auth_headers,
        json={"recipe_name": test_recipe.name, "servings": 2},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["name"] == test_recipe.name
    assert data["id"] == test_recipe.id


def test_get_saved_recipes_empty(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test getting saved recipes when user has none"""
    response = client.get("/api/v1/recipes/saved", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 0


def test_save_recipe(
    client: TestClient,
    auth_headers: dict[str, str],
    test_recipe: Recipe,
    db: Session,
) -> None:
    """Test saving a recipe"""
    response = client.post(
        f"/api/v1/recipes/saved/{test_recipe.id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["recipe"]["id"] == test_recipe.id
    assert "saved_at" in data

    # Check saved_recipe was created in database
    saved = (
        db.query(SavedRecipe).filter(SavedRecipe.recipe_id == test_recipe.id).first()
    )
    assert saved is not None


def test_save_recipe_not_found(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test saving a non-existent recipe fails"""
    response = client.post(
        "/api/v1/recipes/saved/99999",
        headers=auth_headers,
    )

    assert response.status_code == 404


def test_save_recipe_already_saved(
    client: TestClient,
    auth_headers: dict[str, str],
    test_recipe: Recipe,
    db: Session,
) -> None:
    """Test saving a recipe twice fails"""
    # Save once
    response1 = client.post(
        f"/api/v1/recipes/saved/{test_recipe.id}",
        headers=auth_headers,
    )
    assert response1.status_code == 200

    # Try to save again
    response2 = client.post(
        f"/api/v1/recipes/saved/{test_recipe.id}",
        headers=auth_headers,
    )
    assert response2.status_code == 400


def test_get_saved_recipes_with_data(
    client: TestClient,
    auth_headers: dict[str, str],
    test_recipe: Recipe,
) -> None:
    """Test getting saved recipes returns saved recipe"""
    # Save recipe first
    client.post(
        f"/api/v1/recipes/saved/{test_recipe.id}",
        headers=auth_headers,
    )

    # Get saved recipes
    response = client.get("/api/v1/recipes/saved", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert data[0]["recipe"]["id"] == test_recipe.id
    assert data[0]["recipe"]["name"] == test_recipe.name


def test_unsave_recipe(
    client: TestClient,
    auth_headers: dict[str, str],
    test_recipe: Recipe,
    db: Session,
) -> None:
    """Test unsaving a recipe"""
    # Save recipe first
    client.post(
        f"/api/v1/recipes/saved/{test_recipe.id}",
        headers=auth_headers,
    )

    # Unsave recipe
    response = client.delete(
        f"/api/v1/recipes/saved/{test_recipe.id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Recipe unsaved successfully"

    # Check saved_recipe was deleted from database
    saved = (
        db.query(SavedRecipe).filter(SavedRecipe.recipe_id == test_recipe.id).first()
    )
    assert saved is None


def test_unsave_recipe_not_saved(
    client: TestClient, auth_headers: dict[str, str], test_recipe: Recipe
) -> None:
    """Test unsaving a recipe that wasn't saved fails"""
    response = client.delete(
        f"/api/v1/recipes/saved/{test_recipe.id}",
        headers=auth_headers,
    )

    assert response.status_code == 404


def test_recipe_isolation_between_users(
    client: TestClient, test_recipe: Recipe, db: Session
) -> None:
    """Test that saved recipes are isolated between users"""
    # User 1 saves recipe
    response1 = client.post("/api/v1/auth/login", json={"username": "user1"})
    headers1 = {"Authorization": f"Bearer {response1.json()['access_token']}"}

    client.post(f"/api/v1/recipes/saved/{test_recipe.id}", headers=headers1)

    # User 2 checks saved recipes
    response2 = client.post("/api/v1/auth/login", json={"username": "user2"})
    headers2 = {"Authorization": f"Bearer {response2.json()['access_token']}"}

    response = client.get("/api/v1/recipes/saved", headers=headers2)

    assert response.status_code == 200
    data = response.json()

    # User 2 should have no saved recipes
    assert len(data) == 0

