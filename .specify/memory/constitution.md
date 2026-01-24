<!--
Sync Impact Report:
- Version: NEW → 1.0.0 (Initial constitution)
- Rationale: First constitution for Phase II Todo Full-Stack Web Application
- Modified principles: N/A (new document)
- Added sections: All (new document)
- Removed sections: None
- Templates requiring updates:
  ✅ plan-template.md - Constitution Check section aligns with security and spec-driven principles
  ✅ spec-template.md - User story prioritization and requirements align with spec-driven rigor
  ✅ tasks-template.md - Phase structure supports foundational security requirements
- Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Correctness

All features MUST behave exactly as specified and be verifiable through execution. No feature may be considered complete unless it can be demonstrated to work according to its specification through concrete tests or manual verification steps.

**Rationale**: Spec-driven development requires that specifications are not just documentation but executable contracts. Every requirement must be testable and every test must pass before deployment.

### II. Security-First Design

Authentication, authorization, and data isolation are MANDATORY for all features. No endpoint may be implemented without proper JWT verification. No user may access another user's data under any circumstances.

**Rationale**: Multi-user applications require absolute data isolation. A single security breach undermines the entire system. Security cannot be retrofitted—it must be designed in from the start.

**Non-negotiable rules**:
- All API endpoints MUST verify JWT tokens before processing requests
- Backend MUST never trust user_id from URL/body without JWT verification
- Every database query MUST filter by authenticated user_id
- Cross-user data access MUST return 403 Forbidden
- Authentication failures MUST return 401 Unauthorized

### III. Spec-Driven Rigor

Implementation MUST strictly follow written specifications without assumption or interpretation. No feature may be implemented without a corresponding spec section. All API contracts MUST be documented before implementation begins.

**Rationale**: Assumptions lead to misalignment between what was requested and what was built. Explicit specifications enable reproducibility, verification, and team coordination.

**Non-negotiable rules**:
- Every API endpoint MUST define: method, path, inputs, outputs, status codes, auth requirements
- Every user story MUST have acceptance criteria before implementation
- Every data model MUST be specified before database schema creation
- Implementation MUST NOT add features not in the spec
- Ambiguities MUST be clarified through spec updates, not implementation decisions

### IV. Reproducibility

Any developer MUST be able to reproduce the entire system using only the specifications, without access to the original implementation or implementer. Specs are the source of truth, not the code.

**Rationale**: True spec-driven development means the spec is sufficient to recreate the system. This ensures specifications are complete, unambiguous, and maintainable over time.

**Non-negotiable rules**:
- Specs MUST include all environment variables and configuration
- Specs MUST document all external dependencies and versions
- Specs MUST include setup and verification steps
- System MUST run locally and in production without spec changes
- Missing information in specs is a spec defect, not an implementation detail

### V. Separation of Concerns

Frontend, backend, authentication, and data layers MUST be clearly isolated with well-defined interfaces. Each layer MUST be independently testable and replaceable.

**Rationale**: Clear boundaries enable parallel development, independent testing, and technology evolution. Tight coupling creates fragility and blocks progress.

**Non-negotiable rules**:
- Frontend MUST communicate with backend only via RESTful API
- Backend MUST NOT contain frontend-specific logic
- Authentication MUST be stateless (JWT-based, no server-side sessions)
- Database access MUST go through ORM (SQLModel), never raw SQL strings
- Each layer MUST have its own validation (frontend for UX, backend for security)

## Technology Stack & Constraints

### Mandated Technologies

The following technology choices are FIXED and MUST NOT be substituted:

- **Frontend**: Next.js 16+ with App Router
- **Backend**: Python FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth with JWT enabled
- **Communication Protocol**: RESTful API only (no GraphQL, no WebSockets)

**Rationale**: These technologies were selected for Phase II to demonstrate full-stack integration with modern, production-ready tools. Changing them would invalidate the learning objectives.

### Security Constraints

- Environment secrets (JWT_SECRET, DATABASE_URL) MUST NEVER be hardcoded
- All secrets MUST be stored in `.env` files (excluded from version control)
- All API endpoints MUST require valid JWT tokens (except public auth endpoints)
- Each user MUST only access their own tasks (enforced at database query level)
- Passwords MUST be hashed with bcrypt (minimum 10 rounds)
- HTTPS MUST be enforced in production

### Data Isolation Constraints

- Every database query MUST filter by authenticated user_id
- User IDs from URL parameters MUST be verified against JWT token user_id
- Cross-user access attempts MUST return 403 Forbidden
- Database foreign keys MUST enforce referential integrity
- Row-level security SHOULD be considered for additional protection

## API Standards & Error Handling

### API Endpoint Requirements

Every API endpoint MUST document:

1. **HTTP Method**: GET, POST, PUT, DELETE
2. **Path**: Including path parameters (e.g., `/api/users/{user_id}/todos`)
3. **Authentication**: Required JWT token in `Authorization: Bearer <token>` header
4. **Request Body**: JSON schema with field types and validation rules
5. **Response Body**: JSON schema for success responses
6. **Status Codes**: All possible HTTP status codes with meanings

### Deterministic Error Responses

Errors MUST be deterministic and documented. The following status codes MUST be used consistently:

- **401 Unauthorized**: Missing, invalid, or expired JWT token
- **403 Forbidden**: Valid token but user lacks permission (e.g., accessing another user's data)
- **404 Not Found**: Resource does not exist
- **422 Unprocessable Entity**: Validation error (invalid input format or business rule violation)
- **500 Internal Server Error**: Unexpected server error (should be rare and logged)

**Error Response Format** (MUST be consistent across all endpoints):

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "field_name",
        "message": "Specific validation error"
      }
    ]
  }
}
```

### Validation Requirements

Validation MUST occur at three layers:

1. **Frontend (Next.js)**: Immediate user feedback, Zod schemas
2. **Backend (FastAPI)**: Security enforcement, Pydantic models
3. **Database (PostgreSQL)**: Data integrity, constraints and foreign keys

**Never trust client-side validation alone**. Backend validation is mandatory for security.

## Development Workflow

### Specification-First Process

1. **Specify**: Create feature specification with user stories, requirements, and acceptance criteria
2. **Plan**: Design architecture, API contracts, and data models
3. **Tasks**: Generate actionable, testable tasks organized by user story
4. **Implement**: Execute tasks strictly according to specifications
5. **Verify**: Confirm all acceptance criteria are met through testing
6. **Document**: Update specs if implementation reveals ambiguities

### Implementation Rules

- No implementation may begin without a complete specification
- No feature may be added that is not in the specification
- Ambiguities MUST be resolved by updating the spec, not by making assumptions
- All API endpoints MUST be documented before implementation
- All data models MUST be specified before database schema creation

### Testing Requirements

- Every user story MUST be independently testable
- Authentication flows MUST be tested end-to-end
- Authorization checks MUST be verified (users cannot access others' data)
- Input validation MUST be tested at all layers
- Error responses MUST be verified for all documented status codes

## Governance

### Authority

This constitution supersedes all other development practices, guidelines, and conventions. In case of conflict, the constitution takes precedence.

### Compliance Verification

All implementations MUST verify compliance with constitutional principles:

- **Correctness**: Can the feature be demonstrated to work as specified?
- **Security**: Are JWT tokens verified? Is data isolated by user?
- **Spec-Driven**: Does a spec section exist for this feature?
- **Reproducibility**: Can another developer build this from the spec alone?
- **Separation**: Are layers properly isolated with clear interfaces?

### Amendment Process

Amendments to this constitution require:

1. **Documentation**: Proposed change with rationale and impact analysis
2. **Review**: Assessment of affected specifications and implementations
3. **Approval**: Explicit consent before changes take effect
4. **Migration**: Plan for updating existing code to comply with new principles
5. **Version Bump**: Semantic versioning (MAJOR.MINOR.PATCH)

### Versioning Policy

- **MAJOR**: Backward-incompatible changes (principle removal or redefinition)
- **MINOR**: New principles or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

### Complexity Justification

Any violation of constitutional principles MUST be explicitly justified in the implementation plan with:

- Why the violation is necessary
- What simpler alternatives were considered and rejected
- What risks the violation introduces
- How the violation will be mitigated

**Version**: 1.0.0 | **Ratified**: 2026-01-09 | **Last Amended**: 2026-01-09
