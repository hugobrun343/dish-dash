"""
Recipe model for DishDash
Stores recipe information from AI generation and user saves
"""

from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Recipe(Base):
    """Recipe table model"""

    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    servings = Column(Integer, nullable=False, default=1)
    ingredients = Column(JSON, nullable=False)  # JSONB array: [{"name": "...", "quantity": "..."}]
    instructions = Column(Text, nullable=False)
    cooking_time = Column(Integer, nullable=True)  # in minutes
    prep_time = Column(Integer, nullable=True)  # in minutes
    difficulty = Column(Integer, nullable=True)  # 1=easy, 10=expert
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    saved_by = relationship("SavedRecipe", back_populates="recipe", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Recipe(id={self.id}, name='{self.name}', difficulty={self.difficulty})>"

