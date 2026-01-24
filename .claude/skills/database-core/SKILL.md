---
name: database-core
description: Design scalable database schemas, manage migrations, and implement reliable CRUD operations. Use for backend and full-stack projects.
---

# Database Core Skill

## Instructions

1. **Schema Design**
   - Identify entities and relationships
   - Normalize tables (avoid redundancy)
   - Use primary & foreign keys
   - Define constraints (NOT NULL, UNIQUE, INDEX)

2. **Migrations**
   - Version-controlled schema changes
   - Forward and rollback migrations
   - Separate schema vs data migrations
   - Never edit applied migrations

3. **CRUD Operations**
   - Create: Insert validated data
   - Read: Optimized queries with filters
   - Update: Partial updates with safety checks
   - Delete: Soft deletes when possible

## Best Practices
- Design schema before writing code
- Use indexes only where needed
- Avoid N+1 query problems
- Always validate input before DB writes
- Prefer transactions for multi-step operations

## Example Structure

### Schema (SQL)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
