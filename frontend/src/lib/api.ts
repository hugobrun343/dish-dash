const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If we can't parse the error response, use the status
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/me');
  }

  async getUserPreferences() {
    return this.request('/me/preferences');
  }

  async updateUserPreferences(preferences: any) {
    return this.request('/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Auth endpoints
  async login(username: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  // Recipe endpoints
  async getSavedRecipes() {
    return this.request('/recipes/saved');
  }

  async generateRecipes(request: any) {
    return this.request('/recipes/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getRecipeDetails(request: any) {
    return this.request('/recipes/details', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);