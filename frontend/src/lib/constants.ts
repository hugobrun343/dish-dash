export const DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-free', 'Lactose-free', 'Halal', 'Kosher', 'Nut-free'
] as const;

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', description: 'Simple and quick recipe' },
  { value: 'medium', label: 'Medium', description: 'Recipe with a few steps' },
  { value: 'hard', label: 'Hard', description: 'Complex and elaborate recipe' },
] as const;

export const COOKING_TIME_RANGES = [
  { label: 'Quick (< 30min)', value: 'quick' },
  { label: 'Medium (30-60min)', value: 'medium' },
  { label: 'Long (> 60min)', value: 'long' },
] as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
} as const;

// UI Constants
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const;
