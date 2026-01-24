export interface User {
  id: string
  email: string
  name: string
}

export interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

export type TodoFilter = 'all' | 'completed' | 'pending'