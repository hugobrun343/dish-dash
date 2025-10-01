"""
SavedRecipe model for DishDash
Many-to-many relationship between users and recipes
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class SavedRecipe(Base):
    """SavedRecipe junction table model"""

    __tablename__ = "saved_recipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="saved_recipes")
    recipe = relationship("Recipe", back_populates="saved_by")

    # Unique constraint: a user can save a recipe only once
    __table_args__ = (UniqueConstraint("user_id", "recipe_id", name="uix_user_recipe"),)

    def __repr__(self) -> str:
        return f"<SavedRecipe(user_id={self.user_id}, recipe_id={self.recipe_id})>"

