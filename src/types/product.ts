// Product data types for Instagram-sourced products

export interface Product {
  id: string; // Internal productId for URL compatibility
  backendId: number; // Numeric ID from backend database
  unique_link: string; // UUID from backend API
  name: string;
  nameEn?: string;
  thumbnail: string;
  price?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  currency: string;
  seller: {
    name: string;
    username?: string; // Original shop username for API calls
    verified: boolean;
  };
  brand?: string;
  category: string;
  category_display?: string; // Display name for category
  variants?: {
    colors?: Array<{ name: string; hex: string; available: boolean }>;
    sizes?: Array<{ name: string; available: boolean }>;
  };
  selectedVariant?: {
    color?: string;
    size?: string;
  };
  status: "active" | "inactive" | "out_of_stock";
  images: string[];
  description?: string;
  features?: string[];
  link?: string | null; // Product purchase/redirect URL
  extra_details?: Record<string, string>; // Key-value product features
  available_sizes?: string[]; // Available rug sizes (only for RUG_AND_CARPET category)
  available_sizes_display?: string[]; // Display labels for available sizes
  // Backend-specific fields
  shop_id: number | null;
  is_predefined: number; // 0 or 1
  image_path: string; // Path in MinIO storage
  created_at: string; // ISO timestamp
}

export interface UTMParams {
  source: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface EntryContext {
  productId: string;
  utm: UTMParams;
  seller?: string;
  timestamp: number;
}

// Backend API response types
export interface BackendProduct {
  id: number;
  shop_id: number | null;
  shop_name?: string; // Shop/seller name (if included in response)
  shop_username?: string; // Shop username for URL routing
  name: string;
  description: string;
  category: string; // Category enum/DB value
  category_display?: string; // Category display name for users
  price?: number;
  currency?: string;
  is_predefined: number;
  image_path: string;
  unique_link: string;
  created_at: string;
  link?: string | null; // Product purchase/redirect URL
  extra_details?: Record<string, string>; // Key-value product features
  available_sizes?: string[]; // Available rug sizes (only for RUG_AND_CARPET category)
  available_sizes_display?: string[]; // Display labels for available sizes
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Wrapped API response format with pagination
export interface BackendProductsResponse {
  success: boolean;
  message: string;
  data: PaginatedResponse<BackendProduct>;
}

// Single product detail response (not paginated)
export interface BackendProductDetailResponse {
  success: boolean;
  message: string;
  data: BackendProduct;
}

// Rate limit error details from backend
export interface RateLimitError {
  message: string;          // User-facing error message
  retryAfter: number;       // Time in seconds until user can retry
  availableIn: string;      // Human-readable time (e.g., "57 minutes")
  statusCode: 429;          // HTTP status code
}

export interface BackendProcessResponse {
  status: string;           // "success" or "error"
  image_path: string;       // Relative path to the processed image (served via /api/products/images/)
  image_id: number;         // ID of the processed image record
  message?: string;         // Success/error message (optional)
  isRateLimited?: boolean;  // True if request was rate limited
  rateLimitInfo?: RateLimitError; // Rate limit details (only present if isRateLimited is true)
}

export interface VoteResponse {
  status: string;
  image_id: number;
  score: number;
  message: string;
}
