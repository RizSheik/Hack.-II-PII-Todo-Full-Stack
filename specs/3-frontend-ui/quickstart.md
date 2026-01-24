# Frontend Application Quickstart Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to backend API (running on http://localhost:8000 by default)
- Better Auth configured for authentication

## Setup Instructions

### 1. Clone and Navigate to Project

```bash
git clone <repository-url>
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root of the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key-here
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (sign-in, sign-up)
│   ├── (protected)/       # Protected pages requiring authentication
│   │   └── dashboard/     # Main dashboard page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/UI components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components (header, footer)
│   └── todos/            # Todo-specific components
├── lib/                  # Utility functions and libraries
│   ├── auth.ts           # Authentication helpers
│   ├── api-client.ts     # API client with JWT handling
│   └── utils.ts          # General utility functions
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication state management
│   └── useTodos.ts       # Todo state management
└── types/                # TypeScript type definitions
```

## Key Features Implementation

### Authentication Flow

1. **Sign Up**: Users can create an account with email and password
2. **Sign In**: Returning users authenticate with credentials
3. **Protected Routes**: Dashboard and task management require authentication
4. **Session Management**: JWT tokens handle user sessions

### Task Management

1. **View Tasks**: Display tasks in All/Active/Completed tabs
2. **Add Task**: Create new tasks via modal form
3. **Edit Task**: Update task details
4. **Complete Task**: Toggle task completion status
5. **Delete Task**: Remove tasks with confirmation

### API Integration

The frontend communicates with the backend through:

1. **Centralized API Client**: `lib/api-client.ts` handles all API requests
2. **JWT Attachment**: Automatically adds JWT tokens to authenticated requests
3. **Error Handling**: Properly handles 401, 403, and other error responses
4. **Loading States**: Shows appropriate loading indicators

## Running Tests

```bash
# Run unit tests
npm test
# or
yarn test

# Run linting
npm run lint
# or
yarn lint

# Run type checking
npm run type-check
# or
yarn type-check
```

## Building for Production

```bash
npm run build
# or
yarn build
```

The built application will be available in the `out/` directory for static hosting.

## Deployment

The application is configured for Vercel deployment:

1. Connect your Vercel account to the repository
2. Add the required environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

- `NEXT_PUBLIC_API_URL`: Production backend API URL
- `NEXT_PUBLIC_BETTER_AUTH_URL`: Production auth URL
- `BETTER_AUTH_SECRET`: Secret key for JWT signing
- `NODE_ENV`: Set to "production"