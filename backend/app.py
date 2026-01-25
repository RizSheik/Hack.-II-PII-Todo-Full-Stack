"""
Hugging Face Spaces entry point for FastAPI backend.
This file imports and runs the FastAPI application.
"""
from src.main import app

# Hugging Face Spaces will automatically run this app
if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.getenv("PORT", 7860))  # Hugging Face default port
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port
    )
