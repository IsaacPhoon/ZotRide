import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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
    const token = localStorage.getItem('jwt_token');
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
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
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

// Token Management (using localStorage)
export const tokenManager = {
  getToken: (): string | null => localStorage.getItem('jwt_token'),

  setToken: (token: string): void => {
    localStorage.setItem('jwt_token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('jwt_token');
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem('user');
  },

  clearAuth: (): void => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
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

// Ride API Functions
export interface CreateRideRequest {
  pickup_address: string;
  pickup_time: string;
  destination_address: string;
  max_riders?: number;
  price_option: 'free' | 'gas' | 'gas with fee';
  driver_id?: number;
  organization_id?: number;
  driver_comment?: string;
}

export interface Ride {
  id: number;
  pickup_address: string;
  pickup_time: string;
  destination_address: string;
  max_riders: number;
  price_option: string;
  driver_id: number | null;
  organization_id: number | null;
  driver_comment: string | null;
  date_created: string;
}

export const rideAPI = {
  /**
   * Create a new ride request (without driver) or driver post (with driver)
   */
  createRide: async (rideData: CreateRideRequest): Promise<{ message: string; ride: Ride }> => {
    const response = await api.post('/rides', rideData);
    return response.data;
  },

  /**
   * Get all rider requests (rides without driver)
   */
  getRiderRequests: async (): Promise<Ride[]> => {
    const response = await api.get('/rides/rider-requests');
    return response.data;
  },
};

export default api;
