/**
 * Backend API Type Definitions for Seller/Shop Endpoints
 *
 * These types match the exact response structure from the backend API.
 * Use these types when receiving data from API calls, then map to frontend types.
 *
 * Convention: Backend uses both raw and display fields (e.g., category + category_display)
 * - UI should always show *_display fields
 * - API calls/filters should use raw fields
 */

// ====================
// Authentication Types
// ====================

export interface ShopAuthResponse {
  access_token: string;
  token_type: 'bearer';
  shop: {
    id: number;
    username: string;
    phone_number: string;
    shop_name: string;
    role: 'shop' | 'admin';
    link: string | null;
    created_at: string;
    try_on_credits: number;
  };
}

// ====================
// Dashboard Types
// ====================

export interface DashboardResponse {
  visits: {
    today: number;
    this_week: number;
    this_month: number;
  };
  ai_generations: {
    today: number;
    this_week: number;
    this_month: number;
  };
  last_7_days: Array<{
    day: string; // Persian day name (e.g., "شنبه")
    date: string; // Persian date (e.g., "1403/09/15")
    visits: number;
    ai_generations: number;
  }>;
  credits: {
    remaining: number;
    total_used: number;
    total_added: number;
  };
}

// ====================
// Product Types
// ====================

export interface ProductListItem {
  id?: number; // May not be returned by backend list endpoint
  image_url: string;
  name: string;
  total_views: number;
  price: number;
  unique_link?: string;
  frontend_link?: string;
}

export interface PaginatedProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductListItem[];
}

export interface ProductDetailsResponse {
  id: number;
  name: string;
  description: string;
  category: number; // Raw backend value (use for API calls/filters)
  category_display: string; // Display value (use in UI)
  price: number;
  image_url: string;
  unique_link: string; // UUID
  link: string | null; // Purchase URL (product-specific or shop fallback)
  extra_details: Record<string, string>; // Key-value product features
  available_sizes?: string[]; // Available rug sizes (only for RUG_AND_CARPET category)
  available_sizes_display?: string[]; // Display labels for available sizes
  total_views: number;
  frontend_link: string; // Shareable customer link (https://domain/shop/uuid)
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ProductAnalyticsItem {
  id: number;
  name: string;
  category: number; // Raw value
  category_display: string; // Display value
  price: number;
  image_url: string;
  views: {
    today: number;
    total: number;
  };
  ai_generations: {
    today: number;
    total: number;
  };
  engagement_rate: number; // (ai_generations / views) * 100
  created_at: string;
  is_active: boolean;
}

export interface PaginatedAnalyticsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductAnalyticsItem[];
}

// ====================
// Settings Types
// ====================

export interface ShopSettingsResponse {
  username: string;
  shop_name: string;
  phone_number: string;
  shop_link: string; // Read-only, auto-generated (https://domain/shop_name/)
  shop_website_link: string | null; // Optional shop website URL
  registered_since: string; // Persian date (YYYY/MM/DD format)
  registered_since_display: string; // Human-readable Persian date (e.g., "15 آذر 1403")
}

// ====================
// Credits Types
// ====================

export interface CreditBalanceResponse {
  current_credits: number;
  total_credits_used: number;
  total_credits_added: number;
  shop_name: string;
  shop_id: number;
}

export interface CreditTransactionItem {
  id: number;
  amount: number; // Positive for add/refund, negative for deduct/remove
  transaction_type: 'ADMIN_ADD' | 'ADMIN_REMOVE' | 'TRY_ON_DEDUCT' | 'TRY_ON_REFUND';
  transaction_type_display: string; // Display value
  reason: string;
  balance_after: number;
  created_at: string;
  performed_by_username: string | null; // Admin username (for admin transactions)
  related_processed_image_id: number | null; // Link to processed image (for try-on transactions)
}

export interface PaginatedTransactionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CreditTransactionItem[];
}

// ====================
// Standard API Response Wrapper
// ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ====================
// Error Response Type
// ====================

export interface ApiErrorResponse {
  success: false;
  message: string;
  data?: {
    error?: string | string[];
    [key: string]: any;
  };
}

// ====================
// Query Parameters Types
// ====================

export interface ProductListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
}

export interface ProductAnalyticsParams {
  period?: 'today' | 'week' | 'month' | 'all';
  ordering?: '-views_total' | '-ai_total' | 'name' | 'views_total' | 'ai_total' | '-name';
  page?: number;
  page_size?: number;
}

export interface CreditHistoryParams {
  page?: number;
  page_size?: number;
  transaction_type?: 'ADMIN_ADD' | 'ADMIN_REMOVE' | 'TRY_ON_DEDUCT' | 'TRY_ON_REFUND';
}

export interface UpdateSettingsData {
  username?: string;
  shop_name?: string;
  phone_number?: string;
  shop_website_link?: string | null;
  old_password?: string;
  new_password?: string;
  confirm_password?: string;
}

// ====================
// Product Form Data Types
// ====================

// For creating/updating products
export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  link?: string | null;
  extra_details?: Record<string, string>;
  // image is sent as File via FormData, not in JSON
}

// ====================
// Helper Types
// ====================

// Generic paginated response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Generic result type for service methods
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
