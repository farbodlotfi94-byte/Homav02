/**
 * Admin Dashboard Types
 * TypeScript interfaces for admin functionality
 */

// Authentication Types
export interface AdminLoginCredentials {
  username: string;
  password: string;
}

export interface AdminAuthResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

// Product Management Types
export interface AdminProduct {
  id: number;
  shop_id: number | null;
  name: string;
  description: string;
  category: string;
  is_predefined: number;
  image_path: string;
  unique_link: string;
  created_at: string;
}

export interface AdminProductFormData {
  name: string;
  description: string;
  category: string;
  is_predefined: number;
  file?: File;
}

export interface AdminProductsResponse {
  products: AdminProduct[];
  total: number;
  skip: number;
  limit: number;
}

// Model Prompt Types
export interface ModelPrompt {
  id?: number;
  prompt: string;
  updated_at?: string;
}

export interface ModelPromptResponse {
  prompt: string;
  updated_at: string;
}

// Groq Prompt Types
export interface GroqPromptResponse {
  prompt: string;
  updated_at: string;
}

// API Response Types
export interface AdminApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

// Error Types
export interface AdminError {
  message: string;
  statusCode?: number;
  type: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
}

// UI State Types
export interface AdminDashboardState {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentTab: 'products' | 'gemini-prompt' | 'groq-prompt' | 'analytics';
  error: AdminError | null;
}

export interface ProductTableState {
  products: AdminProduct[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  selectedCategory: string;
}

// Form Types
export interface ProductFormState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  productId?: number;
  formData: AdminProductFormData;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export interface ModelPromptFormState {
  prompt: string;
  isSubmitting: boolean;
  lastSaved?: string;
  hasChanges: boolean;
}

// Filter and Search Types
export interface ProductFilters {
  category: string;
  isPredefined: boolean | null;
  search: string;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// Image Types
export interface ProductImage {
  id: number;
  product_id: number;
  image_path: string;
  is_primary: boolean;
  created_at: string;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// Toast Notification Types
export interface AdminToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Constants
export const ADMIN_STORAGE_KEYS = {
  AUTH_TOKEN: 'homa_admin_token',
  USER_PREFERENCES: 'homa_admin_preferences',
} as const;

export const ADMIN_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  DEFAULT_PAGE_SIZE: 20,
} as const;

export const ADMIN_CATEGORIES = [
  'Rugs & Carpets',
  'Furniture',
  'Decor',
  'Lighting',
  'Textiles',
  'Art & Wall Decor',
  'Storage',
  'Other',
] as const;

export type AdminCategory = typeof ADMIN_CATEGORIES[number];

