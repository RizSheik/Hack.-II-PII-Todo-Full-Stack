# Todo App Frontend

A modern, responsive todo application with authentication built using Next.js, TypeScript, and Tailwind CSS.

## Features

- User authentication (sign up, sign in, sign out)
- Task management (create, read, update, delete)
- Task filtering (all, active, completed)
- Responsive design with mobile support
- Purple-themed UI with gradients and rounded cards
- Loading states and error handling

## Tech Stack

- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Radix UI primitives
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Then update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
├── contexts/              # React context providers
├── lib/                  # Utility functions and libraries
│   ├── auth.ts           # Authentication helpers
│   ├── api-client.ts     # API client with JWT handling
│   └── utils.ts          # General utility functions
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication state management
│   └── useTodos.ts       # Todo state management
└── types/                # TypeScript type definitions
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: The URL of the backend API (default: http://localhost:8000)

## Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint

## API Integration

The frontend communicates with the backend through a centralized API client that handles:
- JWT token attachment to authenticated requests
- Error handling for 401/403 responses
- Loading states
- Proper error messaging

## Security

- JWT tokens are stored securely in localStorage
- All authenticated API requests include JWT tokens in headers
- Users can only access their own data (validated by backend)
- Input validation on both frontend and backend

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request