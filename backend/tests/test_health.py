"""
Tests for health check endpoints
"""

from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient) -> None:
    """Test root endpoint returns API info"""
    response = client.get("/")

    assert response.status_code == 200
    data = response.json()

    assert "message" in data
    assert "version" in data
    assert data["message"] == "DishDash API is running!"
    assert data["version"] == "1.0.0"


def test_health_check_success(client: TestClient) -> None:
    """Test health check endpoint with working database"""
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_health_check_endpoint_accessible_without_auth(client: TestClient) -> None:
    """Test health check is accessible without authentication"""
    response = client.get("/health")

    # Should not require authentication
    assert response.status_code == 200

