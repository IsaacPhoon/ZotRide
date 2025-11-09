import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Cookie utility functions
const cookieUtils = {
  set: (name: string, value: string, days: number = 7): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  get: (name: string): string | null => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  delete: (name: string): void => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  },
};

// Create axios instance with /api prefix
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = cookieUtils.get('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth state
      cookieUtils.delete('jwt_token');
      cookieUtils.delete('user');
      // You can add redirect to login here if needed
    }
    return Promise.reject(error);
  }
);

// Type Definitions
export interface User {
  id: number;
  email: string;
  name: string;
  gender: number;
  preferred_contact: string;
  is_system_admin: boolean;
  date_created: string;
}

export interface GoogleVerifyResponse {
  exists: boolean;
  message: string;
  token?: string;
  user?: User;
  email?: string;
  name?: string;
  google_id?: string;
}

export interface RegisterRequest {
  token: string;
  gender: number;
  preferred_contact: string;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: User;
  is_admin: boolean;
}

// Token Management (using cookies instead of localStorage)
export const tokenManager = {
  getToken: (): string | null => cookieUtils.get('jwt_token'),

  setToken: (token: string): void => {
    cookieUtils.set('jwt_token', token, 7); // 7 days expiration
  },

  removeToken: (): void => {
    cookieUtils.delete('jwt_token');
  },

  getUser: (): User | null => {
    const userStr = cookieUtils.get('user');
    if (!userStr) return null;
    try {
      return JSON.parse(decodeURIComponent(userStr));
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    cookieUtils.set('user', encodeURIComponent(JSON.stringify(user)), 7); // 7 days expiration
  },

  removeUser: (): void => {
    cookieUtils.delete('user');
  },

  clearAuth: (): void => {
    cookieUtils.delete('jwt_token');
    cookieUtils.delete('user');
  },
};

// Auth API Functions
export const authAPI = {
  /**
   * Verify Google token and check if user exists
   * Returns login info if existing user, registration info if new user
   */
  verifyGoogleToken: async (googleToken: string): Promise<GoogleVerifyResponse> => {
    const response = await api.post<GoogleVerifyResponse>('/auth/google/verify', {
      token: googleToken,
    });
    return response.data;
  },

  /**
   * Register a new user with Google OAuth
   */
  registerUser: async (
    googleToken: string,
    gender: number,
    preferredContact: string
  ): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/google/register', {
      token: googleToken,
      gender,
      preferred_contact: preferredContact,
    });
    return response.data;
  },

  /**
   * Verify if current JWT token is valid
   */
  verifyJWT: async (): Promise<{ message: string; user: User }> => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  /**
   * Refresh JWT token
   */
  refreshToken: async (currentToken: string): Promise<{ message: string; token: string; user: User }> => {
    const response = await api.post('/auth/refresh', {
      token: currentToken,
    });
    return response.data;
  },

  /**
   * Get current authenticated user's information
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default api;
