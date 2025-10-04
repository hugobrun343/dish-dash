import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  const router = useRouter();
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
          router.push('/auth/login');
        }
        setIsLoading(false);
      }).catch(() => {
        // Token invalid, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/auth/login');
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [router]);

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
        // Redirect to recipe generation page after successful login
        router.push('/recipes/generate');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth/login');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
}