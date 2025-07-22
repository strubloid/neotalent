import axios, { AxiosResponse } from 'axios';
import { User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface RegisterData {
  username: string;
  password: string;
  nickname: string;
}

export interface LoginData {
  username: string;
  password: string;
}

class AuthServiceClass {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.apiClient.post('/api/auth/register', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.apiClient.post('/api/auth/login', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.apiClient.post('/api/auth/logout');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Logout failed',
      };
    }
  }

  async deleteAccount(): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.apiClient.delete('/api/auth/delete');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Account deletion failed',
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response: AxiosResponse<{ user: User }> = await this.apiClient.get('/api/auth/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const response: AxiosResponse<{ authenticated: boolean }> = await this.apiClient.get('/api/auth/status');
      return response.data.authenticated;
    } catch (error) {
      return false;
    }
  }
}

export const AuthService = new AuthServiceClass();
export { AuthServiceClass };
