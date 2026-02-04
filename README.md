# Todo App - Full Stack Application

## Deployment

This application is configured for deployment on Hugging Face Spaces.

### Backend Deployment (Hugging Face)
- The backend is configured to run on port 7860 (Hugging Face default)
- Dockerfile is configured specifically for Hugging Face deployment
- Deploy at: https://rizsheik-todo-app.hf.space

### Frontend Deployment
- The frontend uses the Hugging Face URL: https://rizsheik-todo-app.hf.space

## Troubleshooting Authentication Issues

### Common Issues & Solutions:

1. **"Invalid credentials" error on Vercel:**
   - Make sure your Vercel environment variables are set correctly:
     - `NEXT_PUBLIC_API_URL=https://rizsheik-todo-app.hf.space`

2. **Backend accessibility:**
   - Verify that your Hugging Face backend is running and accessible
   - Test the API endpoints directly: `https://rizsheik-todo-app.hf.space/docs`

3. **CORS issues:**
   - Backend is configured to allow requests from Hugging Face domain
   - If using different domains, update CORS settings in backend

4. **Environment variables:**
   - Ensure your Hugging Face backend has all required environment variables:
     - `DATABASE_URL`
     - `BETTER_AUTH_SECRET` (min 32 characters)
     - `JWT_SECRET` (min 32 characters, same as BETTER_AUTH_SECRET)

## Local Development

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Set up environment variables in `.env`
4. Start the server: `uvicorn src.main:app --reload`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Start the development server: `npm run dev`