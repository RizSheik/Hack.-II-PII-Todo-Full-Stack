# Claude Code Rules

This file is generated during init for the selected agent.

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to work with the architext to build products.

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent.
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
- All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps. 

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

---

## Project-Specific Guidelines: Todo Full-Stack Web Application (Phase II)

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16+ (App Router) |
| Backend | Python FastAPI |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Authentication | Better Auth (JWT tokens) |
| Spec-Driven | Claude Code + Spec-Kit Plus |

### Architecture Overview

This is a multi-user Todo application with:
- **Frontend**: Next.js app with Better Auth for user authentication
- **Backend**: FastAPI REST API with JWT verification
- **Database**: Neon Serverless PostgreSQL for persistent storage
- **Security**: JWT-based authentication with user-scoped data access

### Agent Usage Guidelines

Use specialized agents for different aspects of the application:

#### 1. **Auth Agent** (`secure-auth-handler`)
Use for all authentication and authorization tasks:
- Implementing user signup/signin flows
- Better Auth configuration and integration
- JWT token generation and verification
- Password hashing and validation
- Session management
- Security audits of auth code

**When to use:**
- User asks to implement login/signup
- Need to add JWT token handling
- Debugging authentication issues
- Reviewing auth security

#### 2. **Frontend Agent** (`nextjs-auth-ui`)
Use for Next.js frontend development:
- Building authentication UI (login/signup forms)
- Creating protected routes and layouts
- Implementing OAuth provider buttons
- Client-side JWT token management
- Responsive UI components
- Accessibility improvements

**When to use:**
- Creating/modifying Next.js pages or components
- Building authentication forms
- Adding route protection
- UI/UX improvements

#### 3. **Backend Agent** (`fastapi-auth-backend`)
Use for FastAPI backend development:
- Creating REST API endpoints
- Implementing JWT verification middleware
- Request/response validation
- Error handling
- API security
- Endpoint testing

**When to use:**
- Creating/modifying API endpoints
- Adding authentication middleware
- Implementing business logic
- API security reviews

#### 4. **Database Agent** (`neon-db-security`)
Use for database operations:
- Schema design and migrations
- User authentication tables
- Query optimization
- Database security (row-level security)
- Connection pooling
- Data validation at DB level

**When to use:**
- Designing database schemas
- Creating/modifying tables
- Writing complex queries
- Database security implementation

---

## Authentication Architecture: Better Auth + FastAPI Integration

### The Challenge

Better Auth is a JavaScript/TypeScript authentication library that runs on your Next.js frontend. However, your FastAPI backend is a separate Python service that needs to verify which user is making API requests.

### The Solution: JWT Tokens

Better Auth can be configured to issue JWT (JSON Web Token) tokens when users log in. These tokens are self-contained credentials that include user information and can be verified by any service that knows the secret key.

### Authentication Flow

```
1. User logs in on Frontend
   ↓
2. Better Auth creates session and issues JWT token
   ↓
3. Frontend makes API call with JWT in Authorization header
   Authorization: Bearer <token>
   ↓
4. Backend receives request and extracts token from header
   ↓
5. Backend verifies JWT signature using shared secret
   ↓
6. Backend decodes token to get user ID, email, etc.
   ↓
7. Backend matches user ID from token with user ID in URL
   ↓
8. Backend filters data and returns only user's resources
```

### Implementation Guidelines

#### Frontend (Next.js + Better Auth)

**Key Responsibilities:**
- Configure Better Auth to issue JWT tokens
- Store JWT tokens securely (httpOnly cookies preferred)
- Include JWT in Authorization header for all API calls
- Handle token refresh and expiration
- Redirect to login on 401 responses

**Security Considerations:**
- Never store JWT in localStorage (XSS vulnerability)
- Use httpOnly cookies when possible
- Implement CSRF protection
- Set appropriate token expiration times
- Handle token refresh before expiration

#### Backend (FastAPI + JWT Verification)

**Key Responsibilities:**
- Extract JWT from Authorization header
- Verify JWT signature using shared secret
- Decode JWT to extract user claims (user_id, email, etc.)
- Validate token expiration
- Match authenticated user with requested resources
- Return 401 for invalid/expired tokens
- Return 403 for unauthorized access to resources

**Security Considerations:**
- Never trust client-provided user IDs without JWT verification
- Always filter data by authenticated user
- Use environment variables for JWT secrets
- Implement rate limiting
- Log authentication failures
- Validate all input data

**Example JWT Verification Pattern:**

```python
from fastapi import HTTPException, Header
import jwt
import os

async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET"),
            algorithms=["HS256"]
        )
        return payload  # Contains user_id, email, etc.
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Securing REST API Endpoints

**User-Scoped Data Access:**
```python
@app.get("/api/users/{user_id}/todos")
async def get_user_todos(user_id: int, token_data: dict = Depends(verify_token)):
    # Verify the authenticated user matches the requested user_id
    if token_data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Return only this user's todos
    todos = db.query(Todo).filter(Todo.user_id == user_id).all()
    return todos
```

**Key Security Rules:**
1. **Always verify JWT before processing requests**
2. **Match authenticated user with requested resources**
3. **Never trust user_id from URL without verification**
4. **Filter all queries by authenticated user**
5. **Return 401 for authentication failures**
6. **Return 403 for authorization failures**

---

## Validation Skill Guidelines

### Input Validation Strategy

Implement validation at multiple layers:

#### 1. **Frontend Validation (Next.js)**
- Immediate user feedback
- Client-side form validation
- Type checking with TypeScript
- Zod schemas for runtime validation

**Purpose:** User experience and early error detection

#### 2. **API Validation (FastAPI)**
- Pydantic models for request/response validation
- Type hints and automatic validation
- Custom validators for business rules
- Sanitize input to prevent injection attacks

**Purpose:** Security and data integrity

#### 3. **Database Validation (SQLModel/PostgreSQL)**
- Schema constraints (NOT NULL, UNIQUE, CHECK)
- Foreign key constraints
- Data type enforcement
- Row-level security policies

**Purpose:** Data consistency and integrity

### Validation Best Practices

**1. Email Validation:**
```python
from pydantic import EmailStr, validator

class UserSignup(BaseModel):
    email: EmailStr  # Automatic email validation
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain digit')
        return v
```

**2. Todo Validation:**
```python
class TodoCreate(BaseModel):
    title: str
    description: str | None = None
    completed: bool = False

    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        if len(v) > 200:
            raise ValueError('Title too long (max 200 characters)')
        return v.strip()
```

**3. User Authorization Validation:**
```python
def validate_user_access(token_user_id: int, resource_user_id: int):
    """Ensure authenticated user can only access their own resources"""
    if token_user_id != resource_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own resources"
        )
```

### Error Response Format

Standardize error responses across the API:

```python
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input data",
        "details": [
            {
                "field": "email",
                "message": "Invalid email format"
            },
            {
                "field": "password",
                "message": "Password must be at least 8 characters"
            }
        ]
    }
}
```

### Validation Checklist

Before implementing any endpoint, ensure:

- [ ] Input validation with Pydantic models
- [ ] Authentication via JWT verification
- [ ] Authorization check (user can access resource)
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize output)
- [ ] Rate limiting for sensitive endpoints
- [ ] Proper error messages (don't leak sensitive info)
- [ ] Logging for security events

---

## API Endpoint Design Patterns

### RESTful Endpoint Structure

```
POST   /api/auth/signup          - User registration
POST   /api/auth/signin          - User login
POST   /api/auth/signout         - User logout
GET    /api/auth/session         - Get current session

GET    /api/users/{user_id}/todos              - List user's todos
POST   /api/users/{user_id}/todos              - Create new todo
GET    /api/users/{user_id}/todos/{todo_id}    - Get specific todo
PUT    /api/users/{user_id}/todos/{todo_id}    - Update todo
DELETE /api/users/{user_id}/todos/{todo_id}    - Delete todo
```

### Endpoint Implementation Pattern

```python
@app.post("/api/users/{user_id}/todos", response_model=TodoResponse)
async def create_todo(
    user_id: int,
    todo: TodoCreate,
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    # 1. Verify authentication
    validate_user_access(token_data["user_id"], user_id)

    # 2. Validate input (automatic via Pydantic)

    # 3. Create resource
    db_todo = Todo(
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        user_id=user_id
    )

    # 4. Save to database
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)

    # 5. Return response
    return db_todo
```

---

## Development Workflow

### 1. Specification Phase
- Use `/sp.specify` to create feature specifications
- Define user stories and acceptance criteria
- Document API contracts and data models

### 2. Planning Phase
- Use `/sp.plan` to create architectural plans
- Identify security considerations
- Plan database schema changes
- Design API endpoints

### 3. Task Generation
- Use `/sp.tasks` to generate actionable tasks
- Break down into testable units
- Include security validation tasks

### 4. Implementation Phase
- Use appropriate agents for each layer:
  - **Auth Agent** for authentication logic
  - **Backend Agent** for API endpoints
  - **Frontend Agent** for UI components
  - **Database Agent** for schema changes

### 5. Testing and Validation
- Test authentication flows end-to-end
- Verify JWT token handling
- Test authorization (users can't access others' data)
- Validate input handling and error responses
- Check for security vulnerabilities

### 6. Documentation
- Create ADRs for significant decisions
- Document API endpoints
- Update PHRs for all work

---

## Security Checklist

Before deploying any feature:

- [ ] JWT secret stored in environment variables (never hardcoded)
- [ ] All API endpoints require authentication (except public routes)
- [ ] User authorization verified (can only access own resources)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize output)
- [ ] CSRF protection enabled
- [ ] Rate limiting on authentication endpoints
- [ ] Passwords hashed with bcrypt (never stored plain text)
- [ ] HTTPS enforced in production
- [ ] Sensitive data not logged
- [ ] Error messages don't leak sensitive information
