"""
Test fixtures and configuration
Provides database and client fixtures for testing
"""

import os
from collections.abc import Generator

# Set environment variables before importing app
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["MISTRAL_API_KEY"] = "test_key"
os.environ["SECRET_KEY"] = "test_secret_key_for_testing_only"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

from fastapi.testclient import TestClient
from pytest import fixture
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base, get_db
from app.main import app
from app.models.recipe import Recipe
from app.models.user import User
from app.models.user_preferences import UserPreferences

# Test database URL (in-memory SQLite for tests)
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

# Create test engine
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@fixture(scope="function")  # type: ignore[misc]
def db() -> Generator[Session, None, None]:
    """
    Create a fresh database for each test
    """
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Create session
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

    # Drop tables after test
    Base.metadata.drop_all(bind=engine)


@fixture(scope="function")  # type: ignore[misc]
def client(db: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with overridden database
    """

    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@fixture  # type: ignore[misc]
def test_user(db: Session) -> User:
    """
    Create a test user
    """
    user = User(username="testuser")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@fixture  # type: ignore[misc]
def test_recipe(db: Session) -> Recipe:
    """
    Create a test recipe
    """
    recipe = Recipe(
        name="Test Pasta",
        description="A delicious test pasta",
        servings=2,
        ingredients=[
            {"name": "pasta", "quantity": "200g"},
            {"name": "tomato sauce", "quantity": "100ml"},
        ],
        instructions="1. Cook pasta\n2. Add sauce\n3. Serve",
        cooking_time=20,
        prep_time=10,
        difficulty=3,
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@fixture  # type: ignore[misc]
def test_user_preferences(db: Session, test_user: User) -> UserPreferences:
    """
    Create test user preferences
    """
    preferences = UserPreferences(
        user_id=test_user.id,
        dietary_restrictions=["vegetarian"],
        allergies=["nuts"],
    )
    db.add(preferences)
    db.commit()
    db.refresh(preferences)
    return preferences


@fixture  # type: ignore[misc]
def auth_headers(client: TestClient) -> dict[str, str]:
    """
    Get authentication headers for a test user
    """
    # Login
    response = client.post("/api/v1/auth/login", json={"username": "testuser_auth"})
    assert response.status_code == 200

    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

