import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface UserPreferences {
  id?: number;
  user_id?: number;
  dietary_restrictions?: string[];
  allergies?: string[];
  cooking_time_preference?: number;
  difficulty_preference?: number;
  updated_at?: string;
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getUserPreferences();
      
      if (response.error) {
        setError(response.error);
      } else {
        setPreferences((response.data as UserPreferences) || null);
      }
    } catch (err) {
      setError('Failed to load preferences');
    }
    
    setIsLoading(false);
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.updateUserPreferences(newPreferences);
      
      if (response.error) {
        setError(response.error);
        return false;
      } else {
        setPreferences(response.data as UserPreferences);
        return true;
      }
    } catch (err) {
      setError('Failed to update preferences');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    loadPreferences,
  };
}
