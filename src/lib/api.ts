// API client for Waste Collection Service Backend

// Smart API URL detection
function getApiBaseUrl(): string {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on current environment
  const currentOrigin = window.location.origin;
  
  // If we're on localhost (development)
  if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
    return 'http://localhost:8000/api';
  }
  
  // If we're on Render or any other production domain
  // Use the same origin as the frontend (same domain)
  return `${currentOrigin}/api`;
}

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication endpoints
  async sendOTP(email: string): Promise<ApiResponse<{ session_id: string }>> {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email: string, otp: string): Promise<ApiResponse<{ user: any; is_new_user: boolean }>> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async register(email: string, userData: {
    name: string;
    phone: string;
    address: string;
    pincode: string;
    maps_link: string;
  }): Promise<ApiResponse<{ user: any }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, ...userData }),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{
    id: number;
    email: string;
    name: string;
    phone: string;
    address: string;
    pincode: string;
    city: string;
    state: string;
  }>> {
    return this.request('/auth/me');
  }

  // Booking endpoints
  async createBooking(bookingData: {
    waste_category: 'ewaste' | 'biomedical';
    waste_types: string[];
    quantity: string;
    pickup_date: string;
    additional_notes?: string;
    images?: string[];
  }): Promise<ApiResponse<{ booking: any }>> {
    return this.request('/bookings/', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getUserBookings(params?: {
    status?: string;
    waste_category?: string;
  }): Promise<ApiResponse<{ bookings: any[]; total: number }>> {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const endpoint = queryParams ? `/bookings/?${queryParams}` : '/bookings/';
    return this.request(endpoint);
  }

  async getBooking(bookingId: number): Promise<ApiResponse<{ booking: any }>> {
    return this.request(`/bookings/${bookingId}`);
  }

  async updateBooking(
    bookingId: number,
    updateData: Partial<{
      pickup_date: string;
      additional_notes: string;
      waste_types: string[];
      quantity: string;
    }>
  ): Promise<ApiResponse<{ booking: any }>> {
    return this.request(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async cancelBooking(bookingId: number): Promise<ApiResponse<{ booking: any }>> {
    return this.request(`/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  async getBookingStats(): Promise<ApiResponse<{
    total_bookings: number;
    pending_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    ewaste_bookings: number;
    biomedical_bookings: number;
  }>> {
    return this.request('/bookings/stats');
  }

  // User management endpoints
  async getProfile(): Promise<ApiResponse<{ user: any }>> {
    return this.request('/users/profile');
  }

  async updateProfile(profileData: {
    name?: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: any }>> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getAddresses(): Promise<ApiResponse<{ addresses: any[]; total: number }>> {
    return this.request('/users/addresses');
  }

  async addAddress(addressData: {
    address: string;
    pincode: string;
    maps_link?: string;
    city?: string;
    state?: string;
  }): Promise<ApiResponse<{ address: any }>> {
    return this.request('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(
    addressId: number,
    addressData: Partial<{
      address: string;
      pincode: string;
      maps_link: string;
      city: string;
      state: string;
    }>
  ): Promise<ApiResponse<{ address: any }>> {
    return this.request(`/users/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async setCurrentAddress(addressId: number): Promise<ApiResponse<{ address: any }>> {
    return this.request(`/users/addresses/${addressId}/set-current`, {
      method: 'POST',
    });
  }

  async deleteAddress(addressId: number): Promise<ApiResponse> {
    return this.request(`/users/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  async getUserStats(): Promise<ApiResponse<{
    total_addresses: number;
    total_bookings: number;
    pending_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    ewaste_bookings: number;
    biomedical_bookings: number;
    member_since: string;
  }>> {
    return this.request('/users/stats');
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export { ApiClient };

// Type definitions for better TypeScript support
export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  created_at: string;
  last_login_at?: string;
}

export interface Address {
  id: number;
  user_id: number;
  address: string;
  pincode: string;
  city: string;
  state: string;
  maps_link: string;
  is_current: boolean;
  created_at: string;
}

export interface Booking {
  id: number;
  user_id: number;
  address_id?: number;
  waste_category: 'ewaste' | 'biomedical';
  waste_types: string[];
  quantity: string;
  pickup_date: string;
  additional_notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  images_count: number;
  address?: Address;
} 