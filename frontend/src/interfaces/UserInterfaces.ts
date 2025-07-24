// User types
export interface User {
  id: string;
  username: string;
  nickname: string;
  createdAt: string;
}

// Authentication types
export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface AuthStatusResponse {
  success: boolean;
  isAuthenticated: boolean;
  user?: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  nickname: string;
}
