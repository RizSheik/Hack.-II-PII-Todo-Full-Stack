---
name: backend-core
description: Build scalable backend architecture using routes, controllers, and database connections. Use for API-driven applications.
---

# Backend Core Development

## Instructions

1. **Project structure**
   - Separate routes, controllers, and services
   - Use environment variables for configuration
   - Follow modular folder structure

2. **Routing**
   - Define RESTful API endpoints
   - Use route grouping (e.g. `/api/v1`)
   - Apply middleware for auth and validation

3. **Controllers**
   - Handle request/response logic only
   - Validate incoming data
   - Return standardized API responses

4. **Database Connection**
   - Centralized DB connection file
   - Use connection pooling
   - Handle connection errors gracefully

## Best Practices
- Keep controllers thin, move logic to services
- Never access DB directly inside routes
- Use async/await with proper error handling
- Follow consistent naming conventions
- Secure credentials using `.env`

## Example Structure
```txt
src/
 ├── routes/
 │    └── user.routes.js
 ├── controllers/
 │    └── user.controller.js
 ├── services/
 │    └── user.service.js
 ├── config/
 │    └── db.js
 └── app.js
