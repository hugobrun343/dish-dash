// User types
export interface User {
  id: string;
  username: string;
  email?: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  dietary_restrictions: string[];
  allergies: string[];
}

// Recipe types
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prep_time: number; // in minutes
  cook_time: number; // in minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dietary_tags: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
  is_saved?: boolean;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

// Recipe generation types
export interface RecipeGenerationRequest {
  ingredients: string[];
  dietary_restrictions?: string[];
  cooking_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface RecipeGenerationResponse {
  recipe: Recipe;
  success: boolean;
  message?: string;
}

// Authentication types
export interface LoginRequest {
  username: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  success: boolean;
  message?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// UI State types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RecipeState {
  recipes: Recipe[];
  savedRecipes: Recipe[];
  currentRecipe: Recipe | null;
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;
}

// Form types
export interface LoginFormData {
  username: string;
}

export interface RecipeFormData {
  ingredients: string[];
  dietary_restrictions: string[];
  cooking_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Filter types
export interface RecipeFilters {
  search: string;
  difficulty: string;
  cooking_time: string;
  dietary_tags: string[];
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  current?: boolean;
}
