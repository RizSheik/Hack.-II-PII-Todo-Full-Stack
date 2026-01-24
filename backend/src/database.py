"""
Database connection and session management using SQLModel.

Provides engine creation, table initialization, and session dependency.
"""
from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
from .config import settings
# Import models to register them with SQLModel metadata
from .models.user import User  # noqa: F401
from .models.todo import Todo  # noqa: F401


# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL queries in debug mode
    pool_pre_ping=True,   # Verify connections before using
    pool_size=5,          # Connection pool size
    max_overflow=10       # Max overflow connections
)


def init_db() -> None:
    """
    Initialize database by creating all tables.

    This function should be called once during application startup
    or via CLI command to set up the database schema.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.

    Yields:
        Session: SQLModel database session

    Usage:
        @app.get("/endpoint")
        def endpoint(session: Session = Depends(get_session)):
            # Use session here
            pass
    """
    with Session(engine) as session:
        yield session
