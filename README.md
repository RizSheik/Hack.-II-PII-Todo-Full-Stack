# Todo App - Full Stack Application

## Deployment

This application is configured for deployment on Hugging Face Spaces.

### Backend Deployment (Hugging Face)
- The backend is configured to run on port 7860 (Hugging Face default)
- Dockerfile is configured specifically for Hugging Face deployment
- Deploy at: https://rizsheik-todo-app.hf.space

### Frontend Deployment
- The frontend uses the Hugging Face URL: https://rizsheik-todo-app.hf.space

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