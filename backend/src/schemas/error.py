"""
Error response schemas.

Constitutional requirement: All error responses must follow the standard format:
{
    "error": {
        "code": "ERROR_CODE",
        "message": "Human-readable message",
        "details": ["Additional context..."]
    }
}
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class ErrorDetail(BaseModel):
    """
    Individual error detail item.

    Used for validation errors or providing additional context.
    """
    field: Optional[str] = Field(
        None,
        description="Field name that caused the error (for validation errors)"
    )
    message: str = Field(
        ...,
        description="Detailed error message"
    )
    type: Optional[str] = Field(
        None,
        description="Error type (e.g., 'value_error', 'type_error')"
    )


class ErrorResponse(BaseModel):
    """
    Standard error response format.

    All API errors must use this format to ensure consistency.

    Example:
        {
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": [
                    {
                        "field": "title",
                        "message": "Title must be between 1 and 200 characters",
                        "type": "value_error"
                    }
                ]
            }
        }
    """
    code: str = Field(
        ...,
        description="Machine-readable error code (e.g., 'UNAUTHORIZED', 'NOT_FOUND')"
    )
    message: str = Field(
        ...,
        description="Human-readable error message"
    )
    details: List[str] = Field(
        default_factory=list,
        description="Additional error details or context"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": ["Title must be between 1 and 200 characters"]
            }
        }


class ErrorWrapper(BaseModel):
    """
    Top-level error wrapper.

    Wraps ErrorResponse in an 'error' field for constitutional compliance.
    """
    error: ErrorResponse = Field(
        ...,
        description="Error details"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Todo not found",
                    "details": ["No todo with ID 123 exists for user 456"]
                }
            }
        }
