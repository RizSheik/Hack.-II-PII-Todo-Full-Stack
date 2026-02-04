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

    # Better Auth Configuration - Primary secret for JWT signing/verification
    BETTER_AUTH_SECRET: str = Field(
        ...,
        min_length=32,
        description="Secret key for Better Auth JWT signing (min 32 characters)"
    )

    # JWT Configuration - Using the same secret as Better Auth for consistency
    JWT_SECRET: str = Field(
        ...,
        min_length=32,
        description="Secret key for JWT token signing (min 32 characters)"
    )

    @property
    def effective_jwt_secret(self) -> str:
        """Return the effective JWT secret, using either JWT_SECRET or BETTER_AUTH_SECRET."""
        # For backward compatibility, we'll use JWT_SECRET, but both should be the same
        return self.JWT_SECRET

    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="Algorithm for JWT token signing"
    )

    JWT_EXPIRATION_HOURS: int = Field(
        default=24,
        description="Expiration time for JWT tokens in hours"
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

    # CORS Configuration
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Comma-separated list of allowed origins for CORS"
    )

    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()
