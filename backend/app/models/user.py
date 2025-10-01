"""
User model for DishDash
Simple username-based authentication (no password)
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """User table model"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    saved_recipes = relationship("SavedRecipe", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreferences", back_populates="user", cascade="all, delete-orphan", uselist=False)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}')>"

