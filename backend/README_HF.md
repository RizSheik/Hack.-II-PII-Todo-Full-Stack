---
title: Todo Backend API
emoji: 📝
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# Todo Backend API

FastAPI backend for multi-user Todo application with JWT authentication.

## Features

- User authentication with JWT tokens
- User-scoped todo management
- PostgreSQL database (Neon Serverless)
- RESTful API design
- Comprehensive error handling

## API Documentation

Once deployed, visit:
- `/docs` - Swagger UI
- `/redoc` - ReDoc documentation
- `/health` - Health check endpoint

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_ALGORITHM` - JWT algorithm (default: HS256)
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)
