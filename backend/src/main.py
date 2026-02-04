"""
FastAPI application entry point.

Initializes the FastAPI app with CORS middleware and custom exception handlers
that enforce the constitutional error format.
"""
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings
from .schemas.error import ErrorWrapper, ErrorResponse
from .api.routes.todos import router as todos_router
from .api.routes.auth import router as auth_router
import logging
import time

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title="Todo Backend API",
    description="Secure REST API for managing user-scoped todo tasks",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS middleware
# Parse CORS origins from environment variable or use defaults
cors_origins = settings.CORS_ORIGINS.split(",") if hasattr(settings, 'CORS_ORIGINS') and settings.CORS_ORIGINS else [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://rizsheik-todo-app.hf.space",  # Hugging Face deployment
    "https://rizsheik-todo-app.hf.space/*"  # Allow all paths from HF
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)


# Request/Response logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware to log all HTTP requests and responses.

    Logs:
    - Request method, path, and client IP
    - Response status code and processing time
    - Useful for debugging and monitoring
    """
    start_time = time.time()

    # Log incoming request
    logger.info(
        f"Request: {request.method} {request.url.path} - "
        f"Client: {request.client.host if request.client else 'unknown'}"
    )

    # Process request
    response = await call_next(request)

    # Calculate processing time
    process_time = time.time() - start_time

    # Log response
    logger.info(
        f"Response: {request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )

    # Add processing time header
    response.headers["X-Process-Time"] = str(process_time)

    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Custom exception handler for HTTPException.

    Converts FastAPI's default error format to constitutional format:
    {"error": {"code": "...", "message": "...", "details": [...]}}
    """
    # Map HTTP status codes to error codes
    status_code_map = {
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        422: "VALIDATION_ERROR",
        500: "INTERNAL_SERVER_ERROR"
    }

    error_code = status_code_map.get(exc.status_code, "ERROR")

    # Extract details from exception
    details = []
    if isinstance(exc.detail, str):
        details = [exc.detail] if exc.detail else []
    elif isinstance(exc.detail, list):
        details = [str(d) for d in exc.detail]
    else:
        details = [str(exc.detail)]

    error_response = ErrorWrapper(
        error=ErrorResponse(
            code=error_code,
            message=exc.detail if isinstance(exc.detail, str) else "Request failed",
            details=details if details != [exc.detail] else []
        )
    )

    logger.warning(
        f"HTTP {exc.status_code} - {error_code}: {exc.detail} - Path: {request.url.path}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump()
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    """
    Custom exception handler for Pydantic validation errors.

    Converts validation errors to constitutional format with detailed field information.
    """
    details = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        message = error["msg"]
        details.append(f"{field}: {message}" if field else message)

    error_response = ErrorWrapper(
        error=ErrorResponse(
            code="VALIDATION_ERROR",
            message="Invalid input data",
            details=details
        )
    )

    logger.warning(
        f"Validation error - Path: {request.url.path} - Errors: {len(details)}"
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all exception handler for unexpected errors.

    Ensures all errors follow constitutional format, even unexpected ones.
    """
    error_response = ErrorWrapper(
        error=ErrorResponse(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred",
            details=["Please contact support if this issue persists"]
        )
    )

    logger.error(
        f"Unexpected error - Path: {request.url.path} - Error: {str(exc)}",
        exc_info=True
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump()
    )


@app.get("/", tags=["Health"])
async def root():
    """
    Root endpoint - health check.

    Returns:
        dict: API status and version information
    """
    return {
        "status": "ok",
        "service": "Todo Backend API",
        "version": "1.0.0",
        "environment": settings.APP_ENV
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring.

    Returns:
        dict: Service health status
    """
    return {
        "status": "healthy",
        "environment": settings.APP_ENV
    }


# Register API routers
app.include_router(
    auth_router,
    prefix="/api",
    tags=["Authentication"]
)

app.include_router(
    todos_router,
    prefix="/api",
    tags=["Todos"]
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
