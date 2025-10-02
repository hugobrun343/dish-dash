"""
UserPreferences model for DishDash
Stores user dietary restrictions, allergies, and cooking preferences
"""

from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserPreferences(Base):
    """UserPreferences table model"""

    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    dietary_restrictions = Column(JSON, nullable=True)  # vegetarian, vegan, gluten-free, etc.
    allergies = Column(JSON, nullable=True)  # nuts, dairy, shellfish, etc.
    cooking_time_preference = Column(Integer, nullable=True)  # max cooking time in minutes
    difficulty_preference = Column(Integer, nullable=True)  # 1=easy, 10=expert
    cuisine_preferences = Column(JSON, nullable=True)  # italian, french, asian, etc.
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="preferences")

    def __repr__(self) -> str:
        return f"<UserPreferences(user_id={self.user_id}, dietary_restrictions={self.dietary_restrictions})>"

