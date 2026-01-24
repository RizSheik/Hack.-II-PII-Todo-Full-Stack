"""
Application configuration using pydantic-settings.

Loads configuration from environment variables with validation.
"""
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database Configuration
    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL connection string"
    )

    # JWT Configuration
    JWT_SECRET: str = Field(
        ...,
        min_length=32,
        description="Secret key for JWT token signing (min 32 characters)"
    )

    # Better Auth JWT Configuration (for frontend-backend authentication)
    BETTER_AUTH_SECRET: str = Field(
        ...,
        min_length=32,
        description="Shared secret for Better Auth JWT verification (must match frontend)"
    )

    # Application Configuration
    APP_ENV: str = Field(
        default="development",
        description="Application environment (development, staging, production)"
    )

    DEBUG: bool = Field(
        default=False,
        description="Enable debug mode"
    )

    LOG_LEVEL: str = Field(
        default="info",
        description="Logging level (debug, info, warning, error, critical)"
    )

    # Server Configuration
    HOST: str = Field(
        default="0.0.0.0",
        description="Server host address"
    )

    PORT: int = Field(
        default=8000,
        ge=1,
        le=65535,
        description="Server port number"
    )

    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()
