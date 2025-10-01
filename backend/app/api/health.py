"""
Health check endpoints
Verify API and database connectivity
"""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text

from app.api.deps import DBSession

router = APIRouter()


@router.get("/health")  # type: ignore[misc]
async def health_check(db: DBSession) -> dict[str, str]:
    """
    Health check endpoint - verifies API and database are running

    Returns:
        Status message

    Raises:
        HTTPException: If database is not accessible
    """
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}",
        ) from e


@router.get("/")  # type: ignore[misc]
async def root() -> dict[str, str]:
    """Root endpoint - basic API info"""
    return {"message": "DishDash API is running!", "version": "1.0.0"}
