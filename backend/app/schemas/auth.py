"""
Authentication schemas for request/response validation
Simple username-based authentication
"""

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Login request with username only (no password)"""

    username: str = Field(..., min_length=3, max_length=50, description="Username")


class TokenResponse(BaseModel):
    """JWT token response"""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    username: str = Field(..., description="Logged in username")


class TokenData(BaseModel):
    """Token payload data"""

    username: str | None = None

