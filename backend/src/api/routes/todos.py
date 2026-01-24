"""
Todo API routes.

Implements CRUD operations for user-scoped todos with JWT authentication,
constitutional user isolation enforcement, and advanced features (due dates, priorities).
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, or_
from typing import List, Optional
from datetime import datetime, date
import logging

from ...database import get_session
from ...core.auth import get_current_user_id
from ...core.security import validate_user_access
from ...models.todo import Todo
from ...schemas.todo import TodoCreate, TodoResponse, TodoUpdate, DueDateStatus


# Configure logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


def compute_due_date_status(due_date: Optional[datetime]) -> DueDateStatus:
    """
    Compute due date status from due_date.

    Args:
        due_date: Due date (UTC) or None

    Returns:
        DueDateStatus: overdue, due_today, upcoming, or no_due_date
    """
    if due_date is None:
        return DueDateStatus.NO_DUE_DATE

    now = datetime.utcnow()
    today = now.date()
    due_date_only = due_date.date()

    if due_date_only < today:
        return DueDateStatus.OVERDUE
    elif due_date_only == today:
        return DueDateStatus.DUE_TODAY
    else:
        return DueDateStatus.UPCOMING


@router.post(
    "/users/{user_id}/todos",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new todo",
    description="Create a new todo for the authenticated user. User can only create todos for themselves.",
    responses={
        201: {"description": "Todo created successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - Cannot create todos for other users"},
        422: {"description": "Validation error - Invalid input data"}
    }
)
async def create_todo(
    user_id: int,
    todo_data: TodoCreate,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> TodoResponse:
    """
    Create a new todo for the authenticated user.

    Constitutional Requirements:
    - User can only create todos for themselves (enforced by validate_user_access)
    - JWT authentication required
    - User isolation enforced at database level

    Args:
        user_id: User ID from URL path (resource owner)
        todo_data: Todo creation data (title, description, completed, due_date, priority)
        current_user_id: Authenticated user ID from JWT token
        session: Database session

    Returns:
        TodoResponse: Created todo with all fields including ID, timestamps, and computed due_date_status

    Raises:
        HTTPException 403: If user_id doesn't match current_user_id
        HTTPException 422: If validation fails
    """
    # Constitutional requirement: Enforce user isolation
    validate_user_access(current_user_id, user_id)

    # Create todo entity
    todo = Todo(
        title=todo_data.title,
        description=todo_data.description,
        completed=todo_data.completed,
        due_date=todo_data.due_date,
        priority=todo_data.priority,
        user_id=user_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Save to database
    session.add(todo)
    session.commit()
    session.refresh(todo)

    logger.info(f"Created todo {todo.id} for user {user_id}: '{todo.title}' (due: {todo.due_date}, priority: {todo.priority})")

    # Build response with computed due_date_status
    response = TodoResponse.model_validate(todo)
    response.due_date_status = compute_due_date_status(todo.due_date)
    return response


@router.get(
    "/users/{user_id}/todos",
    response_model=List[TodoResponse],
    status_code=status.HTTP_200_OK,
    summary="List user's todos",
    description="Retrieve all todos for the authenticated user with optional filtering and sorting. User can only access their own todos.",
    responses={
        200: {"description": "List of todos retrieved successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - Cannot access other users' todos"}
    }
)
async def list_todos(
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    priority: Optional[str] = Query(None, description="Filter by priority (high/medium/low)"),
    due_date_status: Optional[str] = Query(None, description="Filter by due date status (overdue/due_today/upcoming/no_due_date)"),
    sort: Optional[str] = Query("created_at", description="Sort field (due_date/priority/created_at/updated_at)"),
    order: Optional[str] = Query("desc", description="Sort order (asc/desc)")
) -> List[TodoResponse]:
    """
    Retrieve all todos for the authenticated user with filtering and sorting.

    Constitutional Requirements:
    - User can only access their own todos (enforced by validate_user_access)
    - JWT authentication required
    - Database query MUST filter by user_id

    Args:
        user_id: User ID from URL path (resource owner)
        current_user_id: Authenticated user ID from JWT token
        session: Database session
        completed: Optional filter by completion status
        priority: Optional filter by priority level
        due_date_status: Optional filter by due date status
        sort: Sort field (default: created_at)
        order: Sort order (default: desc)

    Returns:
        List[TodoResponse]: List of todos with computed due_date_status (empty list if no todos exist)

    Raises:
        HTTPException 403: If user_id doesn't match current_user_id
    """
    # Constitutional requirement: Enforce user isolation
    validate_user_access(current_user_id, user_id)

    # Build query filtered by user_id (constitutional requirement)
    statement = select(Todo).where(Todo.user_id == user_id)

    # Apply filters
    if completed is not None:
        statement = statement.where(Todo.completed == completed)

    if priority:
        statement = statement.where(Todo.priority == priority)

    # Apply due_date_status filter (requires date comparison)
    if due_date_status:
        now = datetime.utcnow()
        today = now.date()

        if due_date_status == "overdue":
            statement = statement.where(Todo.due_date < now, Todo.due_date.isnot(None))
        elif due_date_status == "due_today":
            # Filter for todos due today
            statement = statement.where(
                Todo.due_date >= datetime.combine(today, datetime.min.time()),
                Todo.due_date < datetime.combine(today, datetime.max.time()),
                Todo.due_date.isnot(None)
            )
        elif due_date_status == "upcoming":
            tomorrow = datetime.combine(today, datetime.min.time()) + datetime.timedelta(days=1)
            statement = statement.where(Todo.due_date >= tomorrow, Todo.due_date.isnot(None))
        elif due_date_status == "no_due_date":
            statement = statement.where(Todo.due_date.is_(None))

    # Apply sorting
    sort_column = getattr(Todo, sort, Todo.created_at)
    if order == "asc":
        statement = statement.order_by(sort_column.asc())
    else:
        statement = statement.order_by(sort_column.desc())

    # Execute query
    todos = session.exec(statement).all()

    logger.info(f"Retrieved {len(todos)} todos for user {user_id} (filters: completed={completed}, priority={priority}, due_date_status={due_date_status}, sort={sort})")

    # Build responses with computed due_date_status
    responses = []
    for todo in todos:
        response = TodoResponse.model_validate(todo)
        response.due_date_status = compute_due_date_status(todo.due_date)
        responses.append(response)

    return responses


@router.get(
    "/users/{user_id}/todos/{todo_id}",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a specific todo",
    description="Retrieve a specific todo by ID. User can only access their own todos.",
    responses={
        200: {"description": "Todo retrieved successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - Cannot access other users' todos"},
        404: {"description": "Not found - Todo does not exist"}
    }
)
async def get_todo(
    user_id: int,
    todo_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> TodoResponse:
    """
    Retrieve a specific todo by ID.

    Constitutional Requirements:
    - User can only access their own todos (enforced by validate_user_access)
    - JWT authentication required
    - Database query MUST filter by both todo_id AND user_id

    Args:
        user_id: User ID from URL path (resource owner)
        todo_id: Todo ID from URL path
        current_user_id: Authenticated user ID from JWT token
        session: Database session

    Returns:
        TodoResponse: Todo details with computed due_date_status

    Raises:
        HTTPException 403: If user_id doesn't match current_user_id
        HTTPException 404: If todo not found or doesn't belong to user
    """
    # Constitutional requirement: Enforce user isolation
    validate_user_access(current_user_id, user_id)

    # Query todo filtered by both todo_id AND user_id (constitutional requirement)
    statement = select(Todo).where(
        Todo.id == todo_id,
        Todo.user_id == user_id
    )
    todo = session.exec(statement).first()

    if not todo:
        logger.warning(f"Todo {todo_id} not found for user {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} not found"
        )

    logger.info(f"Retrieved todo {todo_id} for user {user_id}: '{todo.title}'")

    # Build response with computed due_date_status
    response = TodoResponse.model_validate(todo)
    response.due_date_status = compute_due_date_status(todo.due_date)
    return response


@router.put(
    "/users/{user_id}/todos/{todo_id}",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a todo",
    description="Update a todo's fields. User can only update their own todos.",
    responses={
        200: {"description": "Todo updated successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - Cannot update other users' todos"},
        404: {"description": "Not found - Todo does not exist"},
        422: {"description": "Validation error - Invalid input data"}
    }
)
async def update_todo(
    user_id: int,
    todo_id: int,
    todo_data: TodoUpdate,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> TodoResponse:
    """
    Update an existing todo.

    Constitutional Requirements:
    - User can only update their own todos (enforced by validate_user_access)
    - JWT authentication required
    - Database query MUST filter by both todo_id AND user_id

    Args:
        user_id: User ID from URL path (resource owner)
        todo_id: Todo ID from URL path
        todo_data: Todo update data (all fields optional including due_date, priority)
        current_user_id: Authenticated user ID from JWT token
        session: Database session

    Returns:
        TodoResponse: Updated todo details with computed due_date_status

    Raises:
        HTTPException 403: If user_id doesn't match current_user_id
        HTTPException 404: If todo not found or doesn't belong to user
        HTTPException 422: If validation fails or no fields provided
    """
    # Constitutional requirement: Enforce user isolation
    validate_user_access(current_user_id, user_id)

    # Validate at least one field is provided
    update_data = todo_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field must be provided for update"
        )

    # Query todo filtered by both todo_id AND user_id (constitutional requirement)
    statement = select(Todo).where(
        Todo.id == todo_id,
        Todo.user_id == user_id
    )
    todo = session.exec(statement).first()

    if not todo:
        logger.warning(f"Todo {todo_id} not found for user {user_id} during update")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} not found"
        )

    # Update only provided fields
    for field, value in update_data.items():
        setattr(todo, field, value)

    # Update timestamp
    todo.updated_at = datetime.utcnow()

    # Save changes
    session.add(todo)
    session.commit()
    session.refresh(todo)

    logger.info(f"Updated todo {todo_id} for user {user_id}: {list(update_data.keys())}")

    # Build response with computed due_date_status
    response = TodoResponse.model_validate(todo)
    response.due_date_status = compute_due_date_status(todo.due_date)
    return response


@router.delete(
    "/users/{user_id}/todos/{todo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a todo",
    description="Delete a todo permanently. User can only delete their own todos.",
    responses={
        204: {"description": "Todo deleted successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - Cannot delete other users' todos"},
        404: {"description": "Not found - Todo does not exist"}
    }
)
async def delete_todo(
    user_id: int,
    todo_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> None:
    """
    Delete a todo permanently.

    Constitutional Requirements:
    - User can only delete their own todos (enforced by validate_user_access)
    - JWT authentication required
    - Database query MUST filter by both todo_id AND user_id

    Args:
        user_id: User ID from URL path (resource owner)
        todo_id: Todo ID from URL path
        current_user_id: Authenticated user ID from JWT token
        session: Database session

    Returns:
        None: 204 No Content on success

    Raises:
        HTTPException 403: If user_id doesn't match current_user_id
        HTTPException 404: If todo not found or doesn't belong to user
    """
    # Constitutional requirement: Enforce user isolation
    validate_user_access(current_user_id, user_id)

    # Query todo filtered by both todo_id AND user_id (constitutional requirement)
    statement = select(Todo).where(
        Todo.id == todo_id,
        Todo.user_id == user_id
    )
    todo = session.exec(statement).first()

    if not todo:
        logger.warning(f"Todo {todo_id} not found for user {user_id} during delete")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} not found"
        )

    # Delete todo
    session.delete(todo)
    session.commit()

    logger.info(f"Deleted todo {todo_id} for user {user_id}: '{todo.title}'")

