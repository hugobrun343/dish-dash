// Environment configuration
export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
  },
  HEALTH: {
    CHECK: '/health',
    DB: '/health/db',
  },
  RECIPES: {
    GENERATE: '/api/v1/recipes/generate',
    GET: (id: string) => `/api/v1/recipes/${id}`,
    SAVE: (id: string) => `/api/v1/recipes/${id}/save`,
    UNSAVE: (id: string) => `/api/v1/recipes/${id}/save`,
    SAVED: '/api/v1/recipes/saved',
  },
} as const;
