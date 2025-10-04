"""
Tests for user routes and functionality
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_preferences import UserPreferences


class TestUserRoutes:
    """Test user API endpoints"""

    def test_get_current_user_profile(self, client: TestClient, auth_headers: dict[str, str]):
        """Test getting current user profile"""
        response = client.get("/api/v1/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "username" in data
        assert "created_at" in data
        assert data["username"] == "testuser_auth"

    def test_get_current_user_profile_unauthorized(self, client: TestClient):
        """Test getting current user profile without authentication"""
        response = client.get("/api/v1/me")

        assert response.status_code == 403  # FastAPI returns 403 for protected routes

    def test_get_user_preferences_not_found(self, client: TestClient, auth_headers: dict[str, str]):
        """Test getting user preferences when none exist"""
        response = client.get("/api/v1/me/preferences", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["dietary_restrictions"] == []
        assert data["allergies"] == []

    def test_get_user_preferences_existing(self, client: TestClient, db: Session, test_user_preferences: UserPreferences):
        """Test getting existing user preferences"""
        # Create auth headers for the user who has preferences
        response = client.post("/api/v1/auth/login", json={"username": "testuser"})
        assert response.status_code == 200
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/api/v1/me/preferences", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data is not None
        assert "id" in data
        assert "user_id" in data
        assert "dietary_restrictions" in data
        assert "allergies" in data
        assert "updated_at" in data

    def test_create_user_preferences(self, client: TestClient, auth_headers: dict[str, str]):
        """Test creating new user preferences"""
        preferences_data = {
            "dietary_restrictions": ["vegetarian", "gluten-free"],
            "allergies": ["nuts", "dairy"],
        }

        response = client.put("/api/v1/me/preferences", json=preferences_data, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["dietary_restrictions"] == ["vegetarian", "gluten-free"]
        assert data["allergies"] == ["nuts", "dairy"]

    def test_update_user_preferences(self, client: TestClient, db: Session, test_user_preferences: UserPreferences):
        """Test updating existing user preferences"""
        # Create auth headers for the user who has preferences
        response = client.post("/api/v1/auth/login", json={"username": "testuser"})
        assert response.status_code == 200
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        update_data = {
            "dietary_restrictions": ["vegan"]
        }

        response = client.put("/api/v1/me/preferences", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["dietary_restrictions"] == ["vegan"]
        # Other fields should remain unchanged
        assert data["allergies"] == ["nuts"]

    def test_update_user_preferences_partial(self, client: TestClient, db: Session, test_user_preferences: UserPreferences):
        """Test partial update of user preferences"""
        # Create auth headers for the user who has preferences
        response = client.post("/api/v1/auth/login", json={"username": "testuser"})
        assert response.status_code == 200
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        update_data = {
            "allergies": ["shellfish"]
        }

        response = client.put("/api/v1/me/preferences", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["allergies"] == ["shellfish"]
        # Other fields should remain unchanged
        assert data["dietary_restrictions"] == ["vegetarian"]


    def test_update_user_preferences_unauthorized(self, client: TestClient):
        """Test updating preferences without authentication"""
        preferences_data = {
            "dietary_restrictions": ["vegetarian"]
        }

        response = client.put("/api/v1/me/preferences", json=preferences_data)

        assert response.status_code == 403  # FastAPI returns 403 for protected routes


class TestUserService:
    """Test user service functions"""

    def test_get_user_preferences_not_found(self, db: Session, test_user: User):
        """Test getting preferences for user with none"""
        from app.services.user_service import get_user_preferences

        preferences = get_user_preferences(db, test_user)
        assert preferences is None

    def test_get_user_preferences_found(self, db: Session, test_user: User, test_user_preferences: UserPreferences):
        """Test getting existing preferences"""
        from app.services.user_service import get_user_preferences

        preferences = get_user_preferences(db, test_user)
        assert preferences is not None
        assert preferences.user_id == test_user.id
        assert preferences.dietary_restrictions == ["vegetarian"]

    def test_create_user_preferences(self, db: Session, test_user: User):
        """Test creating new preferences"""
        from app.schemas.user import UserPreferencesUpdate
        from app.services.user_service import create_user_preferences

        preferences_data = UserPreferencesUpdate(
            dietary_restrictions=["vegan"],
            allergies=["shellfish"],
        )

        preferences = create_user_preferences(db, test_user, preferences_data)

        assert preferences.user_id == test_user.id
        assert preferences.dietary_restrictions == ["vegan"]
        assert preferences.allergies == ["shellfish"]

    def test_update_user_preferences(self, db: Session, test_user: User, test_user_preferences: UserPreferences):
        """Test updating existing preferences"""
        from app.schemas.user import UserPreferencesUpdate
        from app.services.user_service import update_user_preferences

        update_data = UserPreferencesUpdate(
            dietary_restrictions=["vegan"]
        )

        updated_preferences = update_user_preferences(db, test_user, update_data)

        assert updated_preferences.dietary_restrictions == ["vegan"]
        # Other fields should remain unchanged
        assert updated_preferences.allergies == ["nuts"]

    def test_update_user_preferences_not_found(self, db: Session, test_user: User):
        """Test updating preferences that don't exist"""
        from app.schemas.user import UserPreferencesUpdate
        from app.services.user_service import update_user_preferences

        update_data = UserPreferencesUpdate(dietary_restrictions=["vegan"])

        with pytest.raises(ValueError, match="User preferences not found"):
            update_user_preferences(db, test_user, update_data)
