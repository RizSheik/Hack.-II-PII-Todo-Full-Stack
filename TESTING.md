# End-to-End Testing Guide: Todo Application

## Overview

This guide walks through testing the complete Todo application with:
- **Backend**: FastAPI with JWT authentication (Spec-1 & Spec-2)
- **Frontend**: Next.js with Better Auth integration (Spec-3)
- **Database**: Neon Serverless PostgreSQL

## Prerequisites

Before testing, ensure:
- [ ] Backend dependencies installed (`cd backend && pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Database connection configured in `backend/.env`
- [ ] Frontend API URL configured in `frontend/.env.local`

## Step 1: Start the Backend API

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify Backend:**
- Open http://localhost:8000/docs
- You should see the FastAPI Swagger documentation
- Verify these endpoints exist:
  - POST /api/auth/signup
  - POST /api/auth/signin
  - GET /api/users/{user_id}/todos
  - POST /api/users/{user_id}/todos
  - PUT /api/users/{user_id}/todos/{todo_id}
  - DELETE /api/users/{user_id}/todos/{todo_id}

## Step 2: Start the Frontend Application

In a new terminal:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 16.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Starting...
 ✓ Ready in 2.5s
```

**Verify Frontend:**
- Open http://localhost:3000
- You should see the landing page
- No console errors in browser DevTools

## Step 3: Test User Registration

### 3.1 Navigate to Sign Up
- Click "Sign Up" button or navigate to http://localhost:3000/signup

### 3.2 Create Test Account
Fill in the form:
- **Email**: test@example.com
- **Password**: Test1234!

Click "Sign Up"

### 3.3 Verify Registration Success
**Expected Behavior:**
- ✅ Form submits without errors
- ✅ Redirected to /dashboard
- ✅ JWT token stored in localStorage
- ✅ User sees empty todo list with "No todos yet" message

**Verify in Browser DevTools:**
```javascript
// Open Console and check localStorage
localStorage.getItem('auth_token')  // Should return JWT token
localStorage.getItem('auth_user')   // Should return user object
```

**Verify in Backend Logs:**
```
INFO:     POST /api/auth/signup - 201 Created
```

### 3.4 Troubleshooting Registration Issues

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| "Network error" | Backend not running | Start backend server |
| "Email already exists" | User already registered | Use different email or delete from DB |
| "Invalid email format" | Email validation failed | Use valid email format |
| "Password too weak" | Password requirements not met | Use 8+ chars with uppercase and digit |

## Step 4: Test User Login

### 4.1 Sign Out
- Click "Sign Out" button in header
- Verify redirected to /signin

### 4.2 Sign In
Fill in the form:
- **Email**: test@example.com
- **Password**: Test1234!

Click "Sign In"

### 4.3 Verify Login Success
**Expected Behavior:**
- ✅ Form submits without errors
- ✅ Redirected to /dashboard
- ✅ JWT token stored in localStorage
- ✅ User sees their todo list (empty for new user)

**Verify JWT Token:**
```javascript
// In browser console
const token = localStorage.getItem('auth_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
// Should show: { user_id, email, exp, iat }
```

## Step 5: Test Create Todo

### 5.1 Create First Todo
In the "Add New Todo" form:
- **Title**: "Buy groceries"
- **Description**: "Milk, eggs, bread"

Click "Add Todo"

### 5.2 Verify Todo Created
**Expected Behavior:**
- ✅ Form clears after submission
- ✅ New todo appears in the list immediately
- ✅ Todo shows title and description
- ✅ Checkbox is unchecked (not completed)
- ✅ Edit and Delete buttons visible

**Verify API Request:**
Open Network tab in DevTools:
- Request: POST /api/users/{user_id}/todos
- Headers should include: `Authorization: Bearer <token>`
- Response: 201 Created with todo object

### 5.3 Create Multiple Todos
Add 2-3 more todos to test list display:
- "Finish project documentation"
- "Call dentist for appointment"
- "Review pull requests"

## Step 6: Test Update Todo

### 6.1 Mark Todo as Completed
- Click checkbox next to "Buy groceries"

**Expected Behavior:**
- ✅ Checkbox becomes checked
- ✅ Todo title gets strikethrough style
- ✅ Change persists after page refresh

**Verify API Request:**
- Request: PUT /api/users/{user_id}/todos/{todo_id}
- Body: `{ "completed": true }`
- Response: 200 OK with updated todo

### 6.2 Edit Todo Content
- Click "Edit" button on a todo
- Change title to "Buy groceries and snacks"
- Change description to "Milk, eggs, bread, chips"
- Click "Save"

**Expected Behavior:**
- ✅ Edit form appears with current values
- ✅ Changes save successfully
- ✅ Todo updates in the list
- ✅ Edit mode closes

**Verify API Request:**
- Request: PUT /api/users/{user_id}/todos/{todo_id}
- Body: `{ "title": "...", "description": "..." }`
- Response: 200 OK

### 6.3 Cancel Edit
- Click "Edit" on a todo
- Make changes but click "Cancel"

**Expected Behavior:**
- ✅ Changes are discarded
- ✅ Original values remain
- ✅ Edit mode closes

## Step 7: Test Delete Todo

### 7.1 Delete a Todo
- Click "Delete" button on a todo
- Confirm deletion if prompted

**Expected Behavior:**
- ✅ Todo removed from list immediately
- ✅ Deletion persists after page refresh

**Verify API Request:**
- Request: DELETE /api/users/{user_id}/todos/{todo_id}
- Response: 204 No Content

### 7.2 Delete All Todos
- Delete all remaining todos

**Expected Behavior:**
- ✅ Empty state appears: "No todos yet"
- ✅ Message encourages creating first todo

## Step 8: Test Security & Authorization

### 8.1 Test JWT Token Expiration
```javascript
// In browser console, corrupt the token
localStorage.setItem('auth_token', 'invalid.token.here');
```

- Refresh the page or try to create a todo

**Expected Behavior:**
- ✅ Redirected to /signin
- ✅ Error message: "Authentication required"

### 8.2 Test User Isolation
1. Create a second user account (different email)
2. Sign in with the second user
3. Create some todos for the second user
4. Sign out and sign in with the first user

**Expected Behavior:**
- ✅ First user only sees their own todos
- ✅ Second user's todos are not visible
- ✅ No cross-user data leakage

### 8.3 Test Direct URL Access
- Sign out
- Try to access http://localhost:3000/dashboard directly

**Expected Behavior:**
- ✅ Redirected to /signin
- ✅ Cannot access protected route without authentication

### 8.4 Test API Authorization
Using curl or Postman, try to access another user's todos:

```bash
# Get your JWT token from localStorage
TOKEN="your-jwt-token-here"
USER_ID=1
OTHER_USER_ID=2

# Try to access another user's todos
curl -X GET "http://localhost:8000/api/users/${OTHER_USER_ID}/todos" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Expected Behavior:**
- ✅ Response: 403 Forbidden
- ✅ Error message: "Access denied" or similar

## Step 9: Test Responsive Design

### 9.1 Mobile View (375px width)
- Open DevTools and toggle device toolbar
- Select iPhone SE or similar

**Verify:**
- ✅ Forms are readable and usable
- ✅ Buttons are touch-friendly (min 44px)
- ✅ Todo list items stack properly
- ✅ Header adapts to small screen
- ✅ No horizontal scrolling

### 9.2 Tablet View (768px width)
- Select iPad or similar

**Verify:**
- ✅ Layout uses available space efficiently
- ✅ Forms are centered and readable
- ✅ Todo list has appropriate width

### 9.3 Desktop View (1920px width)
**Verify:**
- ✅ Content is centered with max-width
- ✅ No excessive whitespace
- ✅ Readable font sizes

## Step 10: Test Error Handling

### 10.1 Network Error
- Stop the backend server
- Try to create a todo

**Expected Behavior:**
- ✅ Error message: "Network error. Please check your connection and try again."
- ✅ Retry button appears
- ✅ No crash or blank screen

### 10.2 Validation Error
- Try to create a todo with empty title

**Expected Behavior:**
- ✅ Error message: "Title is required"
- ✅ Form doesn't submit
- ✅ Error appears near the field

### 10.3 Server Error
- Temporarily break the backend (e.g., stop database)
- Try to fetch todos

**Expected Behavior:**
- ✅ Error message displayed
- ✅ Retry option available
- ✅ Application remains functional

## Step 11: Test Performance

### 11.1 Page Load Time
- Clear browser cache
- Reload http://localhost:3000/dashboard
- Check Network tab

**Expected:**
- ✅ Initial load < 3 seconds
- ✅ Time to Interactive < 2 seconds

### 11.2 API Response Time
- Check Network tab for API calls

**Expected:**
- ✅ GET /todos < 500ms
- ✅ POST /todos < 500ms
- ✅ PUT /todos < 500ms
- ✅ DELETE /todos < 500ms

### 11.3 Large Todo List
- Create 50+ todos (use a script if needed)
- Verify list renders smoothly

**Expected:**
- ✅ No lag when scrolling
- ✅ All todos render correctly
- ✅ Actions (edit, delete) remain responsive

## Step 12: Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on macOS)

**Verify in each:**
- ✅ Authentication works
- ✅ CRUD operations work
- ✅ Styling is consistent
- ✅ No console errors

## Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:**
1. Verify backend is running on port 8000
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Ensure no CORS issues (backend should allow localhost:3000)

### Issue: "JWT token not being sent"
**Solution:**
1. Check localStorage has `auth_token`
2. Verify api-client.ts includes Authorization header
3. Check Network tab to confirm header is present

### Issue: "User can see other users' todos"
**Solution:**
1. Verify backend JWT verification is working
2. Check backend filters todos by authenticated user_id
3. Ensure user_id from JWT matches user_id in URL

### Issue: "Tailwind styles not applying"
**Solution:**
1. Verify `npm run dev` is running
2. Check `tailwind.config.js` has correct content paths
3. Ensure `globals.css` imports Tailwind correctly

### Issue: "TypeScript errors in IDE"
**Solution:**
1. Run `npm run build` to check for real errors
2. Restart TypeScript server in IDE
3. Verify `tsconfig.json` is correct

## Success Criteria Checklist

All tests should pass:

**Authentication:**
- [ ] User can sign up with email and password
- [ ] User can sign in with credentials
- [ ] User can sign out
- [ ] JWT token is stored and used correctly
- [ ] Unauthenticated users redirected to signin

**Todo CRUD:**
- [ ] User can create todos
- [ ] User can view their todos
- [ ] User can edit todos
- [ ] User can mark todos as completed
- [ ] User can delete todos

**Security:**
- [ ] Users can only access their own todos
- [ ] JWT token required for all API calls
- [ ] Invalid tokens rejected
- [ ] Protected routes require authentication

**UI/UX:**
- [ ] Responsive design works on all screen sizes
- [ ] Loading states shown during API calls
- [ ] Error messages are clear and helpful
- [ ] Forms validate input
- [ ] Empty states are informative

**Performance:**
- [ ] Page loads quickly
- [ ] API responses are fast
- [ ] No memory leaks
- [ ] Smooth scrolling and interactions

## Next Steps

After all tests pass:
1. Consider deploying to staging environment
2. Perform user acceptance testing
3. Document any deployment-specific configuration
4. Set up monitoring and error tracking
5. Plan for production deployment

## Production Readiness Checklist

Before deploying to production:
- [ ] Environment variables configured for production
- [ ] HTTPS enabled
- [ ] JWT secret is strong and secure
- [ ] Database backups configured
- [ ] Error logging and monitoring set up
- [ ] Rate limiting enabled
- [ ] CORS configured for production domain
- [ ] Security headers configured
- [ ] Performance monitoring enabled
- [ ] User documentation created
