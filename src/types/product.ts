// Product data types for Instagram-sourced products

export interface Product {
  id: string; // Internal productId for URL compatibility
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
    verified: boolean;
  };
  brand?: string;
  category: string;
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
  name: string;
  description: string;
  category: string;
  price?: number;
  currency?: string;
  is_predefined: number;
  image_path: string;
  unique_link: string;
  created_at: string;
}

export interface BackendProductsResponse {
  products: BackendProduct[];
}

export interface BackendProductResponse {
  id: number;
  shop_name: string;
  image_path: string;
  unique_link: string;
  created_at: string;
}

export interface BackendProcessResponse {
  status: string;           // "success" or "error"
  image_url: string;        // Direct URL to the processed image
  image_id: number;         // ID of the processed image record
  message?: string;         // Success/error message (optional)
  customer_image_path?: string;  // Optional: original image path (legacy)
  processed_image_path?: string; // Optional: processed image path (legacy)
}
