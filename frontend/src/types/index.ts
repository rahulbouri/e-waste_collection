export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
  last_login_at?: string;
}

export interface Address {
  address_id: number;
  user_email: string;
  google_maps?: string;
  address: string;
  postal_code?: string;
  city?: string;
  state?: string;
  last_address?: number;
}

export interface Order {
  order_id: number;
  date: string;
  user_email: string;
  address_id: number;
  contact_number: string;
  description?: string;
  images?: string[];
  waste_type: 'e-waste' | 'biowaste';
}

export interface BioWasteOrder {
  order_id: number;
  date: string;
  user_email: string;
  address_id: number;
  contact_number: string;
  description?: string;
  images?: string[];
  waste_type: 'biowaste';
  bio_waste_category: string;
  quantity: number;
  unit: string;
  special_instructions?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
} 