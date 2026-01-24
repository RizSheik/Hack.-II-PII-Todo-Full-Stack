# Quickstart Guide: Todo Backend Core & Data Layer

**Feature**: 1-todo-backend
**Date**: 2026-01-09
**Purpose**: Complete setup and verification guide for running the Todo backend API locally

## Prerequisites

Before starting, ensure you have:

- **Python 3.11+** installed (`python --version`)
- **pip** package manager
- **Git** for version control
- **Neon PostgreSQL** account (or local PostgreSQL 15+)
- **HTTP client** (curl, Postman, or HTTPie)
- **Text editor** or IDE (VS Code, PyCharm, etc.)

## Step 1: Clone and Setup Project

```bash
# Navigate to project root
cd /path/to/todo-app-phase2

# Checkout the feature branch
git checkout 1-todo-backend

# Create Python virtual environment
python3.11 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Verify Python version
python --version  # Should show Python 3.11+
```

## Step 2: Install Dependencies

Create `backend/requirements.txt`:

```txt
fastapi==0.104.1
sqlmodel==0.0.14
pydantic==2.5.0
pydantic-settings==2.1.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
uvicorn[standard]==0.24.0
pytest==7.4.3
httpx==0.25.2
```

Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

## Step 3: Configure Database

### Option A: Neon Serverless PostgreSQL (Recommended)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (format: `postgresql://user:password@host/database`)

### Option B: Local PostgreSQL

```bash
# Install PostgreSQL 15+ (macOS with Homebrew)
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb todo_db
```

## Step 4: Environment Configuration

Create `backend/.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Configuration (for future auth integration)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Application Configuration
APP_ENV=development
DEBUG=true
LOG_LEVEL=info

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

**Security Note**: Never commit `.env` to version control. Add to `.gitignore`:

```bash
echo ".env" >> backend/.gitignore
```

## Step 5: Initialize Database

Create `backend/src/database.py`:

```python
from sqlmodel import SQLModel, create_engine, Session
from src.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL queries in debug mode
    pool_pre_ping=True,   # Verify connections before using
)

def init_db():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for database sessions."""
    with Session(engine) as session:
        yield session
```

Run database initialization:

```bash
cd backend
python -c "from src.database import init_db; init_db()"
```

Verify tables were created:

```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Expected output:
# public | todos | table | user
# public | users | table | user

# Exit psql
\q
```

## Step 6: Start the API Server

```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Step 7: Verify API is Running

### Test 1: Health Check (if implemented)

```bash
curl http://localhost:8000/health
```

Expected: `{"status": "ok"}`

### Test 2: OpenAPI Documentation

Open in browser: http://localhost:8000/docs

You should see the interactive Swagger UI with all API endpoints.

### Test 3: Create a Todo (Mock Auth)

**Note**: For testing without full auth, temporarily mock the `get_current_user_id` dependency to return a test user ID.

```bash
# Create a todo for user 123
curl -X POST http://localhost:8000/api/users/123/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-token-for-testing" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'
```

Expected response (201 Created):
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": 123,
  "created_at": "2026-01-09T10:30:00Z",
  "updated_at": "2026-01-09T10:30:00Z"
}
```

### Test 4: List Todos

```bash
curl http://localhost:8000/api/users/123/todos \
  -H "Authorization: Bearer mock-token-for-testing"
```

Expected response (200 OK):
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "user_id": 123,
    "created_at": "2026-01-09T10:30:00Z",
    "updated_at": "2026-01-09T10:30:00Z"
  }
]
```

### Test 5: Get Specific Todo

```bash
curl http://localhost:8000/api/users/123/todos/1 \
  -H "Authorization: Bearer mock-token-for-testing"
```

Expected response (200 OK): Same as create response

### Test 6: Update Todo

```bash
curl -X PUT http://localhost:8000/api/users/123/todos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-token-for-testing" \
  -d '{
    "completed": true
  }'
```

Expected response (200 OK): Todo with `completed: true`

### Test 7: Delete Todo

```bash
curl -X DELETE http://localhost:8000/api/users/123/todos/1 \
  -H "Authorization: Bearer mock-token-for-testing"
```

Expected response (204 No Content): Empty response

### Test 8: Verify User Isolation

```bash
# Try to access user 123's todos as user 456
curl http://localhost:8000/api/users/123/todos \
  -H "Authorization: Bearer mock-token-for-user-456"
```

Expected response (403 Forbidden):
```json
{
  "error": {
    "code": "403",
    "message": "You can only access your own todos"
  }
}
```

## Step 8: Run Tests

```bash
cd backend
pytest tests/ -v
```

Expected output:
```
tests/test_todos.py::test_create_todo PASSED
tests/test_todos.py::test_list_todos PASSED
tests/test_todos.py::test_get_todo PASSED
tests/test_todos.py::test_update_todo PASSED
tests/test_todos.py::test_delete_todo PASSED
tests/test_auth.py::test_user_isolation PASSED
tests/test_auth.py::test_unauthorized_access PASSED

======= 7 passed in 2.34s =======
```

## Verification Checklist

Use this checklist to verify the backend is working correctly:

- [ ] Python 3.11+ installed and virtual environment activated
- [ ] All dependencies installed (`pip list` shows fastapi, sqlmodel, etc.)
- [ ] Database connection successful (can connect with psql)
- [ ] Database tables created (todos and users tables exist)
- [ ] API server starts without errors
- [ ] OpenAPI docs accessible at http://localhost:8000/docs
- [ ] Can create a todo (POST returns 201 with todo data)
- [ ] Can list todos (GET returns array of todos)
- [ ] Can get specific todo (GET with ID returns todo)
- [ ] Can update todo (PUT returns updated todo)
- [ ] Can delete todo (DELETE returns 204)
- [ ] User isolation enforced (403 when accessing other user's todos)
- [ ] Validation works (422 for empty title, title > 200 chars)
- [ ] All tests pass (pytest shows green)

## Troubleshooting

### Issue: Database connection fails

**Symptoms**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solutions**:
1. Verify DATABASE_URL is correct in `.env`
2. Check database server is running
3. Verify network connectivity to Neon (if using cloud)
4. Check firewall settings

### Issue: Import errors

**Symptoms**: `ModuleNotFoundError: No module named 'fastapi'`

**Solutions**:
1. Verify virtual environment is activated (`which python` should show venv path)
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Check Python version: `python --version` (must be 3.11+)

### Issue: Port already in use

**Symptoms**: `OSError: [Errno 48] Address already in use`

**Solutions**:
1. Kill process using port 8000: `lsof -ti:8000 | xargs kill -9`
2. Use different port: `uvicorn src.main:app --port 8001`

### Issue: JWT verification fails

**Symptoms**: `401 Unauthorized` on all requests

**Solutions**:
1. For testing, temporarily mock auth dependency
2. Verify JWT_SECRET is set in `.env`
3. Check Authorization header format: `Bearer <token>`

### Issue: Tests fail

**Symptoms**: `pytest` shows failures

**Solutions**:
1. Check test database is separate from development database
2. Verify test fixtures are set up correctly
3. Run tests with verbose output: `pytest -vv`
4. Check test logs for specific error messages

## Development Workflow

### Making Changes

1. Make code changes in `backend/src/`
2. Server auto-reloads (if using `--reload` flag)
3. Test changes with curl or Postman
4. Run tests: `pytest`
5. Commit changes: `git add . && git commit -m "description"`

### Adding New Endpoints

1. Define route in `backend/src/api/routes/`
2. Add Pydantic schemas in `backend/src/schemas/`
3. Update OpenAPI docs (automatic with FastAPI)
4. Write tests in `backend/tests/`
5. Update this quickstart guide if needed

### Database Migrations

For schema changes:

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Production Deployment

### Environment Variables

Update `.env` for production:

```env
APP_ENV=production
DEBUG=false
DATABASE_URL=postgresql://prod-user:prod-pass@prod-host/prod-db
JWT_SECRET=production-secret-min-32-chars-very-secure
LOG_LEVEL=warning
```

### Docker Deployment (Optional)

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t todo-backend .
docker run -p 8000:8000 --env-file .env todo-backend
```

## Next Steps

After verifying the backend works:

1. **Integrate Authentication** (Spec-2): Add JWT verification middleware
2. **Build Frontend** (Spec-3): Create Next.js UI that consumes this API
3. **Add Features**: Implement additional user stories (pagination, search, etc.)
4. **Performance Testing**: Load test with 100+ concurrent users
5. **Security Audit**: Verify user isolation, test for vulnerabilities
6. **Documentation**: Update API docs, add code comments

## Support

For issues or questions:
- Check troubleshooting section above
- Review API documentation at http://localhost:8000/docs
- Consult feature specification: `specs/1-todo-backend/spec.md`
- Review implementation plan: `specs/1-todo-backend/plan.md`

## Success Criteria Verification

Verify the backend meets all success criteria from the specification:

- [ ] **SC-001**: Todo creation completes in <500ms (test with `time curl ...`)
- [ ] **SC-002**: List retrieval (100 items) completes in <1s
- [ ] **SC-003**: 100% user data isolation (test cross-user access returns 403)
- [ ] **SC-004**: Handles 100 concurrent users (load test with `ab` or `wrk`)
- [ ] **SC-005**: Data persists across restarts (restart server, verify todos still exist)
- [ ] **SC-006**: Correct HTTP status codes (test all scenarios)
- [ ] **SC-007**: Rejects 100% of cross-user access attempts (403 every time)
- [ ] **SC-008**: Testable with HTTP clients (curl/Postman work without frontend)

All criteria must pass before considering the feature complete.
