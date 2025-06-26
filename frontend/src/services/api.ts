import axios from 'axios';
import { User, Address, Order, BioWasteOrder, LoginResponse, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to include CSRF token
api.interceptors.request.use((config) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (token) {
    config.headers['X-CSRFToken'] = token;
  }
  return config;
});

export const authAPI = {
  login: async (email: string): Promise<LoginResponse> => {
    const response = await api.post('/login', { email });
    return response.data;
  },

  verifyOTP: async (otp: string): Promise<LoginResponse> => {
    const response = await api.post('/verify-otp', { otp });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/logout');
  },

  checkAuth: async (): Promise<{ authenticated: boolean; user?: User }> => {
    try {
      const response = await api.get('/api/check-auth');
      return response.data;
    } catch {
      return { authenticated: false };
    }
  },
};

export const userAPI = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/api/user/profile', userData);
    return response.data;
  },
};

export const addressAPI = {
  getAddress: async (): Promise<Address | null> => {
    try {
      const response = await api.get('/api/address');
      return response.data;
    } catch {
      return null;
    }
  },

  createAddress: async (addressData: Omit<Address, 'address_id' | 'user_email'>): Promise<Address> => {
    const response = await api.post('/api/address', addressData);
    return response.data;
  },

  updateAddress: async (addressData: Partial<Address>): Promise<Address> => {
    const response = await api.put('/api/address', addressData);
    return response.data;
  },
};

export const orderAPI = {
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/api/orders');
    return response.data;
  },

  createEWasteOrder: async (orderData: {
    contact_number: string;
    description?: string;
    images?: File[];
  }): Promise<Order> => {
    const formData = new FormData();
    formData.append('contact_number', orderData.contact_number);
    if (orderData.description) {
      formData.append('description', orderData.description);
    }
    if (orderData.images) {
      orderData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/api/orders/e-waste', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  createBioWasteOrder: async (orderData: {
    contact_number: string;
    description?: string;
    images?: File[];
    bio_waste_category: string;
    quantity: number;
    unit: string;
    special_instructions?: string;
  }): Promise<BioWasteOrder> => {
    const formData = new FormData();
    formData.append('contact_number', orderData.contact_number);
    formData.append('bio_waste_category', orderData.bio_waste_category);
    formData.append('quantity', orderData.quantity.toString());
    formData.append('unit', orderData.unit);
    if (orderData.description) {
      formData.append('description', orderData.description);
    }
    if (orderData.special_instructions) {
      formData.append('special_instructions', orderData.special_instructions);
    }
    if (orderData.images) {
      orderData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/api/orders/biowaste', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 