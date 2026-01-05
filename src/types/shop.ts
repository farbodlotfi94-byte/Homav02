/**
 * Shop data types for shop selection page.
 *
 * These types match the backend ShopPublicListSerializer response.
 */

/**
 * Shop data returned from GET /api/shops/list/
 */
export interface Shop {
  /** Shop ID */
  id: number;
  /** Display name of the shop */
  shop_name: string;
  /** URL-friendly slug */
  slug: string;
  /** URL to shop logo (null if not set) */
  logo_url: string | null;
  /** Shop website URL (null if not provided) */
  website: string | null;
  /** Number of active products in the shop */
  product_count: number;
  /** ISO timestamp when shop was created */
  created_at: string;
}

/**
 * Paginated response from GET /api/shops/list/
 */
export interface ShopListResponse {
  /** Total number of shops matching the query */
  count: number;
  /** URL to next page (null if no more pages) */
  next: string | null;
  /** URL to previous page (null if on first page) */
  previous: string | null;
  /** Array of shops for current page */
  results: Shop[];
}

/**
 * Query parameters for shop list API
 */
export interface ShopListParams {
  /** Page number (1-indexed) */
  page?: number;
  /** Number of items per page (default: 20, max: 100) */
  page_size?: number;
  /** Search term for shop name or slug */
  search?: string;
}
