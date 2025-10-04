// Environment configuration
export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  HEALTH: {
    CHECK: '/health',
    DB: '/health/db',
  },
  RECIPES: {
    GENERATE: '/recipes/generate',
    GET: (id: string) => `/recipes/${id}`,
    SAVE: (id: string) => `/recipes/${id}/save`,
    UNSAVE: (id: string) => `/recipes/${id}/save`,
    SAVED: '/recipes/saved',
  },
} as const;
