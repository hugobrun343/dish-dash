import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: number;
  username: string;
  created_at: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token by getting user profile
      apiClient.getCurrentUser().then(response => {
        if (response.data) {
          setUser(response.data as User);
        } else {
          // Token invalid, clear it
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
        setIsLoading(false);
      }).catch(() => {
        // Token invalid, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string) => {
    const response = await apiClient.login(username.trim());
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (response.data) {
      const loginData = response.data as LoginResponse;
      const { access_token, username: userUsername } = loginData;
      
      // Store token
      localStorage.setItem('auth_token', access_token);
      
      // Get user profile
      const userResponse = await apiClient.getCurrentUser();
      if (userResponse.data) {
        setUser(userResponse.data as User);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
}