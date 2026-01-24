import type { User, Todo } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    // Get token from localStorage
    const token = localStorage.getItem('auth_token');

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    }

    const response = await fetch(url, mergedOptions)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    // For DELETE requests or responses without body, return null
    if (response.status === 204 || endpoint.includes('/logout') || options.method === 'DELETE') {
      return null as T
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()

// Define the response types
type LoginResponse = {
  token: string;
  user: User;
};

export const authApi = {
  async login(email: string, password: string): Promise<User> {
    const response: LoginResponse = await apiClient.post('/api/auth/signin', { email, password });

    // Store the JWT token for future requests
    localStorage.setItem('auth_token', response.token);

    // Return user information
    return response.user;
  },

  async signup(email: string, password: string, name: string): Promise<User> {
    const response = await apiClient.post<{ user_id: number }>('/api/auth/signup', { email, password, name });
    // After signup, the user still needs to sign in
    // For now, return a minimal user object based on the signup response
    return { id: response.user_id.toString(), email, name };
  },

  async logout(): Promise<void> {
    // Clear any stored tokens
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  },

  async getUser(): Promise<User> {
    return apiClient.get('/api/auth/me');
  }
}

// Helper function to get current user ID
function getCurrentUserId(): string {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('User not authenticated');
  }
  const user = JSON.parse(userStr);
  return user.id;
}

// Todos API
export const todosApi = {
  async getAll(): Promise<Todo[]> {
    const userId = getCurrentUserId();
    return apiClient.get(`/api/users/${userId}/todos`);
  },

  async create(data: { title: string; description: string; completed: boolean }): Promise<Todo> {
    const userId = getCurrentUserId();
    return apiClient.post(`/api/users/${userId}/todos`, data);
  },

  async update(todoId: string, updates: Partial<Todo>): Promise<Todo> {
    const userId = getCurrentUserId();
    return apiClient.put(`/api/users/${userId}/todos/${todoId}`, updates);
  },

  async delete(todoId: string): Promise<void> {
    const userId = getCurrentUserId();
    return apiClient.delete(`/api/users/${userId}/todos/${todoId}`);
  }
}