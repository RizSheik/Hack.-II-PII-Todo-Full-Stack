# Frontend Data Model: Todo Web Application

## Entity Definitions

### User Entity
- **Entity Name**: User
- **Fields**:
  - id (string/number): Unique identifier for the user
  - email (string): User's email address for authentication
  - sessionToken (string): JWT token for maintaining authentication state
  - createdAt (Date): Timestamp when user account was created
- **Validation Rules**:
  - Email must be valid email format
  - Email must be unique
  - Session token must be properly formatted JWT
- **Relationships**: Owns multiple Task entities

### Task Entity
- **Entity Name**: Task
- **Fields**:
  - id (string/number): Unique identifier for the task
  - title (string): Title of the task (required, max 200 characters)
  - description (string): Optional description (max 1000 characters)
  - completed (boolean): Whether the task is completed (default: false)
  - dueDate (Date): Optional due date for the task
  - priority (string): Priority level (high/medium/low, default: medium)
  - userId (string/number): Reference to the user who owns the task
  - createdAt (Date): Timestamp when task was created
  - updatedAt (Date): Timestamp when task was last updated
- **Validation Rules**:
  - Title is required and must be 1-200 characters
  - Description, if provided, must be max 1000 characters
  - Priority must be one of 'high', 'medium', 'low'
  - Completed must be boolean
- **State Transitions**:
  - Active → Completed (when task is marked as done)
  - Completed → Active (when task is marked as undone)

### Authentication State Entity
- **Entity Name**: AuthState
- **Fields**:
  - isAuthenticated (boolean): Whether user is currently authenticated
  - user (User object): Current user data when authenticated
  - token (string): Current JWT token
  - loading (boolean): Whether auth state is being determined
- **Validation Rules**:
  - When isAuthenticated is true, user and token must be present
  - When isAuthenticated is false, user should be null
- **State Transitions**:
  - Unauthenticated → Authenticating (during login process)
  - Authenticating → Authenticated (after successful login)
  - Authenticated → Unauthenticated (after logout)

## Frontend-Specific Data Structures

### Tab Filter State
- **Entity Name**: TabFilter
- **Fields**:
  - activeTab (string): Current active tab ('all', 'active', 'completed')
- **Validation Rules**:
  - Must be one of the allowed tab values
- **State Transitions**:
  - Changes trigger client-side filtering of tasks

### Form State
- **Entity Name**: FormState
- **Fields**:
  - title (string): Current value of task title input
  - description (string): Current value of task description input
  - dueDate (Date): Current value of due date picker
  - priority (string): Current selected priority value
  - errors (object): Validation errors for each field
  - isSubmitting (boolean): Whether form is currently submitting
- **Validation Rules**:
  - Title must meet task title requirements
  - Description must meet task description requirements
- **State Transitions**:
  - Updates as user interacts with form fields

### API Response State
- **Entity Name**: ApiResponse
- **Fields**:
  - data (any): Response data from API
  - error (string): Error message if request failed
  - loading (boolean): Whether request is in progress
  - status (number): HTTP status code of response
- **Validation Rules**:
  - Only one of data or error should be present at a time
- **State Transitions**:
  - Idle → Loading (when request starts)
  - Loading → Success/Error (when request completes)