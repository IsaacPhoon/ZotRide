import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Debug logging - set to true to log all API responses to console
const ENABLE_API_LOGGING = true;

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
  (response) => {
    // Log all API responses if logging is enabled
    if (ENABLE_API_LOGGING) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log errors if logging is enabled
    if (ENABLE_API_LOGGING) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
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
  is_driver: boolean;
  driver_id: number | null;
  driver_approved?: boolean; // New field to track driver approval status
  total_reviews_authored?: number;
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

// Organization Types
export interface Organization {
  id: number;
  name: string;
  description?: string;
  access_code: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationWithMembers extends Organization {
  member_count: number;
}

export interface OrganizationMember {
  user_id: number;
  name: string;
  email: string;
  is_owner: boolean;
  is_admin: boolean;
  is_driver: boolean;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
}

export interface CreateOrganizationResponse {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
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

// Organization API Functions
export const organizationAPI = {
  /**
   * Create a new organization
   */
  createOrganization: async (
    name: string,
    description?: string
  ): Promise<CreateOrganizationResponse> => {
    const response = await api.post<CreateOrganizationResponse>('/organizations', {
      name,
      description,
    });
    return response.data;
  },

  /**
   * Get all organizations
   */
  getAllOrganizations: async (limit?: number, offset?: number): Promise<Organization[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const response = await api.get<Organization[]>('/organizations', { params });
    return response.data;
  },

  /**
   * Get a specific organization by ID
   */
  getOrganization: async (orgId: number): Promise<Organization> => {
    const response = await api.get<Organization>(`/organizations/${orgId}`);
    return response.data;
  },

  /**
   * Get members of an organization
   */
  getOrganizationMembers: async (orgId: number): Promise<OrganizationMember[]> => {
    const response = await api.get<OrganizationMember[]>(`/organizations/${orgId}/members`);
    return response.data;
  },

  /**
   * Get all rides for a specific organization
   */
  getOrganizationRides: async (orgId: number, status?: 'active' | 'completed'): Promise<Ride[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await api.get<Ride[]>(`/organizations/${orgId}/rides`, { params });
    return response.data;
  },

  /**
   * Join an organization using its access code
   */
  joinOrganization: async (accessCode: string): Promise<{ message: string; organization: Organization }> => {
    const response = await api.post<{ message: string; organization: Organization }>('/organizations/join', {
      access_code: accessCode,
    });
    return response.data;
  },

  /**
   * Update a member's role in an organization (admin/driver status)
   */
  updateMemberRole: async (
    orgId: number,
    userId: number,
    updates: { is_admin?: boolean; is_driver?: boolean }
  ): Promise<OrganizationMember> => {
    const response = await api.put<OrganizationMember>(
      `/organizations/${orgId}/members/${userId}/role`,
      updates
    );
    return response.data;
  },

  /**
   * Remove a member from an organization
   */
  removeMember: async (orgId: number, userId: number): Promise<void> => {
    await api.delete(`/organizations/${orgId}/members/${userId}`);
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
  status: string;
  driver_id: number | null;
  organization_id: number | null;
  driver_comment: string | null;
  date_created: string;
  available_seats?: number;
  is_full?: boolean;
  driver?: {
    id: number;
    name: string;
    email: string;
  };
  riders?: Array<{
    user_id: number;
    name: string;
    email: string;
    comment: string | null;
    joined_at: string;
  }>;
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

  /**
   * Get all driver posts (rides with driver)
   */
  getDriverPosts: async (params?: { limit?: number; offset?: number }): Promise<Ride[]> => {
    const response = await api.get('/rides/driver-posts', { params });
    return response.data;
  },

  /**
   * Join a ride as a rider
   */
  joinRide: async (rideId: number, userComment?: string): Promise<{ message: string; ride: Ride }> => {
    const response = await api.post(`/rides/${rideId}/join`, {
      user_comment: userComment,
    });
    return response.data;
  },

  /**
   * Get all riders for a specific ride
   */
  getRideRiders: async (rideId: number): Promise<Array<{
    user_id: number;
    name: string;
    email: string;
    comment: string | null;
    joined_at: string;
  }>> => {
    const response = await api.get(`/rides/${rideId}/riders`);
    return response.data;
  },

  /**
   * Get a specific ride by ID
   */
  getRide: async (rideId: number): Promise<Ride> => {
    const response = await api.get(`/rides/${rideId}`);
    return response.data;
  },

  /**
   * Accept a ride request as a driver (assign yourself as the driver)
   */
  acceptRide: async (rideId: number, driverComment?: string): Promise<{ message: string; ride: Ride }> => {
    const requestBody: { driver_comment?: string } = {};
    if (driverComment) {
      requestBody.driver_comment = driverComment;
    }
    
    if (ENABLE_API_LOGGING) {
      console.log(`[API Request] POST /api/rides/${rideId}/join_driver`, {
        body: requestBody,
      });
    }
    
    const response = await api.post(`/rides/${rideId}/join_driver`, requestBody);
    return response.data;
  },

  /**
   * Check if the current user is in any active rides
   */
  isUserInActiveRide: async (): Promise<boolean> => {
    const currentUser = await authAPI.getCurrentUser();
    const response = await api.get(`/users/${currentUser.id}/rides`);
    const rides: Ride[] = response.data;
    // Check if user has any active rides
    return rides.some(ride => ride.status === 'active');
  },

  /**
   * Get current user's active rides
   */
  getUserActiveRides: async (): Promise<Ride[]> => {
    const currentUser = await authAPI.getCurrentUser();
    const response = await api.get(`/users/${currentUser.id}/rides`);
    const rides: Ride[] = response.data;
    return rides.filter(ride => ride.status === 'active');
  },

  /**
   * Leave a ride as a rider
   */
  leaveRide: async (rideId: number): Promise<{ message: string }> => {
    const response = await api.post(`/rides/${rideId}/leave`);
    return response.data;
  },

  /**
   * Complete a ride (driver only)
   */
  completeRide: async (rideId: number): Promise<{ message: string; ride: Ride }> => {
    const response = await api.post(`/rides/${rideId}/complete`);
    return response.data;
  },

  /**
   * Enrich ride data with driver and rider names
   * This fetches user/driver information and adds it to the ride object
   */
  enrichRideWithNames: async (ride: Ride): Promise<Ride> => {
    const enrichedRide = { ...ride };

    // Fetch driver information if driver_id exists
    if (ride.driver_id) {
      try {
        const driverData = await driverAPI.getDriverById(ride.driver_id);
        const driverUser = await userAPI.getUserById(driverData.user_id);
        enrichedRide.driver = {
          id: driverUser.id,
          name: driverUser.name,
          email: driverUser.email,
        };
      } catch (err) {
        console.error('Error fetching driver info:', err);
      }
    }

    // Fetch rider information
    if (ride.riders && ride.riders.length > 0) {
      try {
        const enrichedRiders = await Promise.all(
          ride.riders.map(async (rider) => {
            try {
              const user = await userAPI.getUserById(rider.user_id);
              return {
                ...rider,
                name: user.name,
                email: user.email,
              };
            } catch (err) {
              console.error(`Error fetching rider ${rider.user_id}:`, err);
              return {
                ...rider,
                name: 'Unknown',
                email: '',
              };
            }
          })
        );
        enrichedRide.riders = enrichedRiders;
      } catch (err) {
        console.error('Error enriching riders:', err);
      }
    }

    return enrichedRide;
  },

  /**
   * Enrich multiple rides with driver and rider names
   */
  enrichRidesWithNames: async (rides: Ride[]): Promise<Ride[]> => {
    return Promise.all(rides.map(ride => rideAPI.enrichRideWithNames(ride)));
  },
};

// Profile API Functions
export interface UpdateProfileRequest {
  name: string;
  gender: number;
  preferred_contact: string;
}

export interface UpdateProfileResponse {
  user: User;
}

export const profileAPI = {
  /**
   * Update current user's profile information using existing user endpoint
   */
  updateProfile: async (profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    // Get current user to get their ID
    const currentUser = await authAPI.getCurrentUser();
    const response = await api.put(`/users/${currentUser.id}`, profileData);
    return { user: response.data };
  },

  /**
   * Get current user's profile information (uses auth/me endpoint)
   */
  getProfile: async (): Promise<User> => {
    return await authAPI.getCurrentUser();
  },
};

// Driver API Functions
export interface CreateDriverRequest {
  license_image: string;
  vehicle_data: string;
  license_plate: string;
}

export interface DriverData {
  id: number;
  user_id: number;
  license_image: string;
  vehicle_data: string;
  license_plate: string;
  is_approved: boolean;
  approved_at: string | null;
  average_rating: number;
}

export interface CreateDriverResponse {
  driver: DriverData;
  message?: string;
}

export const driverAPI = {
  /**
   * Register as a driver - creates driver data for the authenticated user
   */
  registerDriver: async (driverData: CreateDriverRequest): Promise<CreateDriverResponse> => {
    const response = await api.post('/drivers', driverData);
    return response.data;
  },

  /**
   * Get current user's driver data
   */
  getMyDriverData: async (): Promise<DriverData> => {
    const currentUser = await authAPI.getCurrentUser();
    if (!currentUser.driver_id) {
      throw new Error('User is not a driver');
    }
    const response = await api.get(`/drivers/${currentUser.driver_id}`);
    return response.data;
  },

  /**
   * Get driver data by driver ID
   */
  getDriverById: async (driverId: number): Promise<DriverData> => {
    const response = await api.get(`/drivers/${driverId}`);
    return response.data;
  },

  /**
   * Get all rides for a specific driver
   */
  getDriverRides: async (driverId: number, status?: 'active' | 'completed' | 'cancelled'): Promise<Ride[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const response = await api.get(`/drivers/${driverId}/rides`, { params });
    return response.data;
  },
};

// User API Functions
export const userAPI = {
  /**
   * Get user by ID
   */
  getUserById: async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

export default api;
