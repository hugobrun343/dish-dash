"""
Tests for authentication endpoints
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User


def test_login_new_user(client: TestClient, db: Session) -> None:
    """Test login with a new username creates a new user"""
    response = client.post("/api/v1/auth/login", json={"username": "newuser"})

    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["username"] == "newuser"

    # Check user was created in database
    user = db.query(User).filter(User.username == "newuser").first()
    assert user is not None
    assert user.username == "newuser"


def test_login_existing_user(client: TestClient, test_user: User) -> None:
    """Test login with existing username returns token"""
    response = client.post(
        "/api/v1/auth/login", json={"username": test_user.username}
    )

    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["username"] == test_user.username


def test_login_invalid_username_too_short(client: TestClient) -> None:
    """Test login with too short username fails validation"""
    response = client.post("/api/v1/auth/login", json={"username": "ab"})

    assert response.status_code == 422  # Validation error


def test_login_invalid_username_too_long(client: TestClient) -> None:
    """Test login with too long username fails validation"""
    response = client.post(
        "/api/v1/auth/login", json={"username": "a" * 51}  # 51 chars
    )

    assert response.status_code == 422  # Validation error


def test_login_missing_username(client: TestClient) -> None:
    """Test login without username fails validation"""
    response = client.post("/api/v1/auth/login", json={})

    assert response.status_code == 422  # Validation error


def test_token_is_valid_jwt(client: TestClient) -> None:
    """Test that returned token is a valid JWT"""
    response = client.post("/api/v1/auth/login", json={"username": "jwtuser"})

    assert response.status_code == 200
    token = response.json()["access_token"]

    # JWT tokens have 3 parts separated by dots
    assert token.count(".") == 2


def test_login_multiple_times_same_user(client: TestClient, db: Session) -> None:
    """Test logging in multiple times with same username doesn't create duplicates"""
    username = "repeatuser"

    # First login
    response1 = client.post("/api/v1/auth/login", json={"username": username})
    assert response1.status_code == 200

    # Second login
    response2 = client.post("/api/v1/auth/login", json={"username": username})
    assert response2.status_code == 200

    # Check only one user exists
    users = db.query(User).filter(User.username == username).all()
    assert len(users) == 1

