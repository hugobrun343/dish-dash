"""
Database initialization script
Creates all tables from SQLAlchemy models
"""

from app.core.database import Base, engine
from app.models import Recipe, SavedRecipe, User, UserPreferences  # noqa: F401


def init_db() -> None:
    """
    Initialize database tables
    This will create all tables defined in the models
    """
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


if __name__ == "__main__":
    init_db()

