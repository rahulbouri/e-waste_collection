import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.data && response.data.id) {
        // Backend returns user data directly, not wrapped in a user property
        const backendUser = response.data;
        const userData = {
          id: backendUser.id.toString(),
          name: backendUser.name || '',
          email: backendUser.email || '',
          phone: backendUser.phone || '',
          address: backendUser.address || '',
          pincode: backendUser.pincode || '',
          city: backendUser.city || '',
          state: backendUser.state || ''
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else {
        // No valid session, clear local storage
        setUser(null);
        localStorage.removeItem('user');
        return false;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Clear local storage on error
      setUser(null);
      localStorage.removeItem('user');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    // After login, verify the session with backend
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Verify session is valid
    const isValid = await checkAuth();
    if (!isValid) {
      // Session verification failed, clear user
      setUser(null);
      localStorage.removeItem('user');
      throw new Error('Session verification failed');
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Check for stored user and verify with backend on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        // Set user from localStorage first for immediate UI response
        setUser(JSON.parse(storedUser));
      }
      // Then verify with backend
      await checkAuth();
    };
    
    initializeAuth();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
