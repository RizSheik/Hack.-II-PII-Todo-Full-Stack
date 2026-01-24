# API Contracts: Frontend-Backend Integration

This directory contains the API contracts that define how the frontend communicates with the backend API.

## Authentication Endpoints

### POST /api/auth/signup
- **Purpose**: Register a new user account
- **Authentication**: None required
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "confirmPassword": "securePassword123"
  }
  ```
- **Request Headers**:
  - Content-Type: application/json
- **Success Response (200)**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@example.com"
    },
    "token": "jwt-token-string"
  }
  ```
- **Error Response (422)**:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input data",
      "details": [
        {
          "field": "email",
          "message": "Invalid email format"
        }
      ]
    }
  }
  ```
- **Error Response (409)**:
  ```json
  {
    "error": {
      "code": "USER_EXISTS",
      "message": "User with this email already exists"
    }
  }
  ```

### POST /api/auth/signin
- **Purpose**: Authenticate user and return JWT token
- **Authentication**: None required
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Request Headers**:
  - Content-Type: application/json
- **Success Response (200)**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@example.com"
    },
    "token": "jwt-token-string"
  }
  ```
- **Error Response (401)**:
  ```json
  {
    "error": {
      "code": "INVALID_CREDENTIALS",
      "message": "Invalid email or password"
    }
  }
  ```

### POST /api/auth/signout
- **Purpose**: Log out user and invalidate session
- **Authentication**: JWT token required in Authorization header
- **Request Headers**:
  - Authorization: Bearer {jwt-token}
- **Success Response (200)**:
  ```json
  {
    "message": "Successfully signed out"
  }
  ```

## Task Management Endpoints

### GET /api/users/{user_id}/todos
- **Purpose**: Retrieve all tasks for a specific user
- **Authentication**: JWT token required in Authorization header
- **Parameters**:
  - user_id (path parameter): ID of the user whose tasks to retrieve
- **Request Headers**:
  - Authorization: Bearer {jwt-token}
- **Success Response (200)**:
  ```json
  {
    "todos": [
      {
        "id": 1,
        "title": "Complete project",
        "description": "Finish the todo app implementation",
        "completed": false,
        "dueDate": "2026-01-30T10:00:00Z",
        "priority": "high",
        "userId": 1,
        "createdAt": "2026-01-20T10:00:00Z",
        "updatedAt": "2026-01-20T10:00:00Z"
      }
    ]
  }
  ```
- **Error Response (401)**:
  ```json
  {
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication required"
    }
  }
  ```
- **Error Response (403)**:
  ```json
  {
    "error": {
      "code": "FORBIDDEN",
      "message": "Access denied to this user's data"
    }
  }
  ```

### POST /api/users/{user_id}/todos
- **Purpose**: Create a new task for the user
- **Authentication**: JWT token required in Authorization header
- **Parameters**:
  - user_id (path parameter): ID of the user creating the task
- **Request Body**:
  ```json
  {
    "title": "New task",
    "description": "Task description (optional)",
    "dueDate": "2026-01-30T10:00:00Z",
    "priority": "medium"
  }
  ```
- **Request Headers**:
  - Authorization: Bearer {jwt-token}
  - Content-Type: application/json
- **Success Response (201)**:
  ```json
  {
    "id": 2,
    "title": "New task",
    "description": "Task description (optional)",
    "completed": false,
    "dueDate": "2026-01-30T10:00:00Z",
    "priority": "medium",
    "userId": 1,
    "createdAt": "2026-01-20T11:00:00Z",
    "updatedAt": "2026-01-20T11:00:00Z"
  }
  ```
- **Error Response (401)**:
  ```json
  {
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication required"
    }
  }
  ```
- **Error Response (403)**:
  ```json
  {
    "error": {
      "code": "FORBIDDEN",
      "message": "Access denied to this user's data"
    }
  }
  ```
- **Error Response (422)**:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input data",
      "details": [
        {
          "field": "title",
          "message": "Title is required and must be 1-200 characters"
        }
      ]
    }
  }
  ```

### PUT /api/users/{user_id}/todos/{todo_id}
- **Purpose**: Update an existing task for the user
- **Authentication**: JWT token required in Authorization header
- **Parameters**:
  - user_id (path parameter): ID of the user
  - todo_id (path parameter): ID of the task to update
- **Request Body**:
  ```json
  {
    "title": "Updated task title",
    "description": "Updated description",
    "dueDate": "2026-01-31T10:00:00Z",
    "priority": "high"
  }
  ```
- **Request Headers**:
  - Authorization: Bearer {jwt-token}
  - Content-Type: application/json
- **Success Response (200)**:
  ```json
  {
    "id": 2,
    "title": "Updated task title",
    "description": "Updated description",
    "completed": false,
    "dueDate": "2026-01-31T10:00:00Z",
    "priority": "high",
    "userId": 1,
    "createdAt": "2026-01-20T11:00:00Z",
    "updatedAt": "2026-01-20T12:00:00Z"
  }
  ```
- **Error Response (401)**:
  ```json
  {
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication required"
    }
  }
  ```
- **Error Response (403)**:
  ```json
  {
    "error": {
      "code": "FORBIDDEN",
      "message": "Access denied to this user's data"
    }
  }
  ```

### PATCH /api/users/{user_id}/todos/{todo_id}
- **Purpose**: Update specific fields of a task (commonly used for toggling completion)
- **Authentication**: JWT token required in Authorization header
- **Parameters**:
  - user_id (path parameter): ID of the user
  - todo_id (path parameter): ID of the task to update
- **Request Body**:
  ```json
  {
    "completed": true
  }
  ```
- **Request Headers**:
  - Authorization: Bearer {jwt-token}
  - Content-Type: application/json
- **Success Response (200)**:
  ```json
  {
    "id": 2,
    "title": "Updated task title",
    "description": "Updated description",
    "completed": true,
    "dueDate": "2026-01-31T10:00:00Z",
    "priority": "high",
    "userId": 1,
    "createdAt": "2026-01-20T11:00:00Z",
    "updatedAt": "2026-01-20T13:00:00Z"
  }
  ```
- **Error Response (401)**:
  ```json
  {
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication required"
    }
  }
  ```
- **Error Response (403)**:
  ```json
  {
    "error": {
      "code": "FORBIDDEN",
      "message": "Access denied to this user's data"
    }
  }
  ```

### DELETE /api/users/{user_id}/todos/{todo_id}
- **Purpose**: Delete a specific task for the user
- **Authentication**: JWT token required in Authorization header
- **Parameters**:
  - user_id (path parameter): ID of the user
  - todo_id (path parameter): ID of the task to delete
- **Request Headers**:
  - Authorization: Bearer {jwt-token}
- **Success Response (204)**:
  - No content returned
- **Error Response (401)**:
  ```json
  {
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication required"
    }
  }
  ```
- **Error Response (403)**:
  ```json
  {
    "error": {
      "code": "FORBIDDEN",
      "message": "Access denied to this user's data"
    }
  }
  ```