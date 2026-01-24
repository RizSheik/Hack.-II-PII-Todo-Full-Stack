# Todo App Phase II Development Guidelines

Auto-generated from feature plans. Last updated: 2026-01-17

## Active Technologies

### Backend
- **Python 3.11+** with FastAPI
- **SQLModel** - ORM for database operations
- **Pydantic** - Data validation and serialization
- **Alembic** - Database migrations
- **PyJWT** - JWT token handling
- **bcrypt** - Password hashing
- **asyncpg** - PostgreSQL async driver
- **APScheduler** - Task scheduling for reminders

### Frontend
- **Next.js 16+** with App Router
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **Better Auth** - Authentication with JWT
- **Zod** - Runtime validation
- **date-fns** - Date manipulation
- **react-datepicker** - Date picker component
- **Framer Motion** - Animation library for micro-interactions
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Unstyled component library

### Database
- **Neon Serverless PostgreSQL** - Primary database
- **PostgreSQL 14+** - Local development option

### Notification Services (Phase 4)
- **Resend** - Email notifications (primary)
- **SendGrid** - Email notifications (alternative)
- **Web Push API** - Browser push notifications
- **Firebase Cloud Messaging** - Optional mobile push

### Development Tools
- **pytest** - Backend testing
- **Jest + React Testing Library** - Frontend testing
- **Playwright** - E2E testing (optional)

## Project Structure

```text
backend/
├── app/
│   ├── models/          # SQLModel entities
│   │   ├── todo.py      # Enhanced with due_date, priority, category_id
│   │   ├── category.py  # User categories
│   │   ├── tag.py       # User tags
│   │   ├── reminder.py  # Scheduled notifications
│   │   └── user_preferences.py  # Notification preferences
│   ├── api/             # FastAPI endpoints
│   │   ├── todos.py     # Todo CRUD with filtering
│   │   ├── categories.py
│   │   ├── tags.py
│   │   └── reminders.py
│   ├── services/        # Business logic
│   │   ├── notification_service.py  # Multi-channel notifications
│   │   └── reminder_scheduler.py    # APScheduler integration
│   ├── middleware/
│   │   └── auth.py      # JWT verification
│   └── main.py          # FastAPI app
├── tests/               # pytest tests
└── alembic/             # Database migrations

frontend/
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── todos/
│   │   ├── categories/
│   │   └── settings/notifications/
│   ├── components/      # React components
│   │   ├── TodoItem.tsx
│   │   ├── TodoForm.tsx
│   │   ├── DueDatePicker.tsx
│   │   ├── PrioritySelector.tsx
│   │   ├── CategorySelector.tsx
│   │   ├── TagInput.tsx
│   │   └── ReminderConfig.tsx
│   ├── lib/
│   │   ├── api/         # API client functions
│   │   ├── auth.ts      # Better Auth integration
│   │   └── animations/  # Framer Motion configurations
│   │       ├── constants.ts  # Timing, easing, scale values
│   │       ├── variants.ts   # Animation variant definitions
│   │       ├── hooks.ts      # Custom animation hooks
│   │       └── utils.ts      # Animation utilities
│   └── types/           # TypeScript types
└── tests/               # Jest tests

specs/
└── 1-todo-advanced-features/
    ├── spec.md          # Feature specification
    ├── plan.md          # Implementation plan
    ├── research.md      # Technical decisions
    ├── data-model.md    # Entity definitions
    ├── quickstart.md    # Setup guide
    └── contracts/       # OpenAPI specs
```

## Commands

### Backend

```bash
# Setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1
alembic current

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest tests/
pytest tests/test_todos.py -v
pytest tests/ --cov=app
```

### Frontend

```bash
# Setup
cd frontend
npm install

# Run dev server
npm run dev

# Run tests
npm test
npm run test:watch

# Build
npm run build
npm start
```

### Database

```bash
# Local PostgreSQL
createdb todo_db
psql todo_db

# Connect to Neon
psql $DATABASE_URL
```

## Code Style

### Python (Backend)

**Imports**:
```python
# Standard library
from datetime import datetime, timezone
from typing import Optional, List

# Third-party
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

# Local
from app.models.todo import Todo
from app.middleware.auth import verify_token
```

**Models (SQLModel)**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from enum import Enum

class PriorityEnum(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    priority: PriorityEnum = Field(default=PriorityEnum.MEDIUM)
    due_date: Optional[datetime] = Field(default=None)

    # Relationships
    category: Optional["Category"] = Relationship(back_populates="todos")
```

**API Endpoints**:
```python
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(prefix="/api/users/{user_id}/todos", tags=["todos"])

@router.get("/", response_model=List[TodoResponse])
async def list_todos(
    user_id: int,
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    # Verify user authorization
    if token_data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Query with user filter
    todos = db.exec(
        select(Todo).where(Todo.user_id == user_id)
    ).all()

    return todos
```

**Security Pattern**:
```python
# ALWAYS verify JWT and filter by authenticated user
async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ALWAYS filter queries by authenticated user
todos = db.exec(
    select(Todo).where(Todo.user_id == authenticated_user_id)
).all()
```

### TypeScript (Frontend)

**Imports**:
```typescript
// React
import { useState, useEffect } from 'react';

// Next.js
import { useRouter } from 'next/navigation';

// Third-party
import { format, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';

// Local
import { TodoResponse } from '@/types/todo';
import { fetchTodos } from '@/lib/api/todos';
```

**Types**:
```typescript
export interface TodoResponse {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  due_date_status: 'overdue' | 'due_today' | 'upcoming' | 'no_due_date';
  priority: 'high' | 'medium' | 'low';
  category: CategorySummary | null;
  tags: TagSummary[];
  created_at: string;
  updated_at: string;
}

export interface TodoCreate {
  title: string;
  description?: string;
  completed?: boolean;
  due_date?: string;
  priority?: 'high' | 'medium' | 'low';
  category_id?: number;
  tag_ids?: number[];
}
```

**Components**:
```typescript
'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TodoFormProps {
  onSubmit: (todo: TodoCreate) => void;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      due_date: dueDate?.toISOString(),
      priority,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <DatePicker
        selected={dueDate}
        onChange={(date) => setDueDate(date)}
        showTimeSelect
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <button type="submit">Create Todo</button>
    </form>
  );
}
```

**API Client**:
```typescript
export async function fetchTodos(userId: number, filters?: TodoFilters): Promise<TodoResponse[]> {
  const params = new URLSearchParams();
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.category_id) params.append('category_id', filters.category_id.toString());

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/todos?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }

  return response.json();
}
```

**Framer Motion Animations**:
```typescript
'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { taskListVariants } from '@/lib/animations/variants';

// Animated task list with staggered entrance
export function TaskList({ tasks }: { tasks: TodoResponse[] }) {
  return (
    <motion.ul
      variants={taskListVariants.container}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      <AnimatePresence mode="popLayout">
        {tasks.map(task => (
          <motion.li
            key={task.id}
            variants={taskListVariants.item}
            exit="exit"
            layout
          >
            <TaskItem task={task} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}

// Animated modal with backdrop
export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={modalVariants.backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />
          <motion.div
            variants={modalVariants.dialog}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 flex items-center justify-center"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hover/tap interactions
export function AnimatedButton({ children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Reduced motion support
export function useAnimationVariant(standardVariant: Variants): Variants {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.05 } },
    };
  }

  return standardVariant;
}
```

**Animation Constants**:
```typescript
// lib/animations/constants.ts
export const ANIMATION_DURATION = {
  fast: 0.3,
  normal: 0.4,
  slow: 0.6,
  reduced: 0.05,
} as const;

export const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
};

export const STAGGER_DELAY = {
  list: 0.08,
  cards: 0.12,
} as const;
```

**Animation Best Practices**:
- Always add 'use client' directive for components using Framer Motion
- Use GPU-accelerated properties only: transform (translate, scale, rotate) and opacity
- Never animate width, height, top, left, margin, padding (causes layout thrashing)
- Use AnimatePresence with mode="popLayout" for smooth list animations
- Implement reduced motion support with useReducedMotion() hook
- Keep animation durations between 0.3-0.6 seconds
- Use spring or easeOut timing functions for natural motion
- Provide unique key prop for AnimatePresence to track elements

## Recent Changes

### Feature: Advanced UI Animations (2026-01-25)
**Added**:
- Framer Motion library for professional micro-interactions and transitions
- Centralized animation configuration system (lib/animations/)
- Animation variants for task lists, modals, tabs, navigation, empty states, loading
- Reduced motion accessibility support via useReducedMotion hook
- GPU-accelerated animations (transform, opacity only) for 60fps performance
- AnimatePresence for smooth enter/exit animations
- Spring physics and easeOut timing functions for natural motion

**Frontend Changes**:
- New directory: `src/lib/animations/` with constants, variants, hooks, utils
- Animation durations: 0.3-0.6 seconds (0.05s for reduced motion)
- Stagger delays for list animations (0.08s for tasks, 0.12s for cards)
- Scale values for hover (1.02-1.05x) and tap (0.98x) interactions
- Modal animations with backdrop fade and dialog spring bounce
- Tab navigation with smooth indicator transitions

**Performance Requirements**:
- Maintain 60fps during all animations
- Zero Cumulative Layout Shift (CLS = 0)
- Bundle size increase <50KB gzipped
- Memory overhead <10MB during animations

**Accessibility**:
- Full prefers-reduced-motion support
- Simplified animations (<0.1s) or disabled for users with motion sensitivity
- Keyboard navigation unaffected by animations
- Screen reader compatibility maintained

### Feature: Todo Advanced Features (2026-01-17)
**Added**:
- Due dates with visual indicators (overdue, due today, upcoming)
- Priority levels (high/medium/low) with color-coded badges
- User-created categories for organizing todos
- User-created tags with autocomplete
- Reminder system with multi-channel notifications (in-app, email, push)
- APScheduler for reliable reminder scheduling
- User notification preferences

**Database Changes**:
- Added columns to `todos`: `due_date`, `priority`, `category_id`
- New tables: `categories`, `tags`, `todo_tags`, `reminders`, `user_notification_preferences`
- Indexes for performance on due_date, priority, category_id

**API Changes**:
- Enhanced todos endpoints with filtering and sorting
- New endpoints: `/categories`, `/tags`, `/reminders`, `/preferences/notifications`
- All endpoints enforce JWT authentication and user data isolation

<!-- MANUAL ADDITIONS START -->
<!-- Add project-specific notes, conventions, or reminders here -->
<!-- MANUAL ADDITIONS END -->
