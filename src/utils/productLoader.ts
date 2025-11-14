import type {
  Product,
  UTMParams,
  EntryContext,
  BackendProduct,
  BackendProductDetailResponse
} from "../types/product";
import { apiGet } from "../services/api";
import { API_CONFIG } from "../config/api";

// Product mapping for URL compatibility
const productIdToUniqueLink: Record<string, string> = {};

/**
 * Transform backend product to internal Product type
 */
function transformBackendProduct(backendProduct: BackendProduct): Product {
  const productId = `prod_${backendProduct.id}`;
  
  // Store mapping for URL compatibility
  productIdToUniqueLink[productId] = backendProduct.unique_link;
  
  return {
    id: productId,
    unique_link: backendProduct.unique_link,
    name: backendProduct.name,
    thumbnail: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(backendProduct.image_path)}`,
    price: backendProduct.price,
    currency: backendProduct.currency || "ریال",
    seller: {
      name: backendProduct.shop_name || "فروشگاه",
      verified: false
    },
    category: backendProduct.category,
    category_display: backendProduct.category_display,
    status: "active",
    images: [`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(backendProduct.image_path)}`],
    description: backendProduct.description,
    link: backendProduct.link,
    extra_details: backendProduct.extra_details,
    // Backend-specific fields
    shop_id: backendProduct.shop_id,
    is_predefined: backendProduct.is_predefined,
    image_path: backendProduct.image_path,
    created_at: backendProduct.created_at
  };
}

/**
 * Extract unique_link from URL path
 * Returns unique_link if found in path (e.g., /550e8400-e29b-41d4-a716-446655440000/)
 * Returns null if home page or invalid format
 */
export function parseUniqueLinkFromPath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p);

    // Check if path has a segment (not homepage)
    if (pathParts.length === 0) {
      return null;
    }

    // Check if first path segment is admin or other reserved routes
    if (pathParts[0] === 'admin') {
      return null;
    }

    // First path segment should be the unique_link (UUID format)
    const uniqueLink = pathParts[0];

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(uniqueLink)) {
      return uniqueLink;
    }

    return null;
  } catch (error) {
    console.error('[parseUniqueLinkFromPath] Error:', error);
    return null;
  }
}

/**
 * Parse URL parameters to extract product ID and UTM data (LEGACY - for backward compatibility)
 * @deprecated Use parseUniqueLinkFromPath for new path-based routing
 */
export function parseEntryParams(url: string): EntryContext | null {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    const productId = params.get('productId');
    if (!productId) return null;

    const utm: UTMParams = {
      source: params.get('utm_source') || 'direct',
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      content: params.get('utm_content') || undefined,
      term: params.get('utm_term') || undefined
    };

    return {
      productId,
      utm,
      seller: params.get('seller') || undefined,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error parsing entry params:', error);
    return null;
  }
}

/**
 * Fetch product metadata by ID
 * Maps internal productId to unique_link and fetches from API
 */
export async function fetchProduct(productId: string): Promise<Product | null> {
  try {
    console.log('[fetchProduct] Fetching product:', { productId });
    
    // Use the same approach as fetchProductByUniqueLink for consistency
    const response = await apiGet<BackendProductsResponse>(API_CONFIG.ENDPOINTS.PRODUCTS);
    
    console.log('[fetchProduct] API response:', response);
    
    if (response.success && response.data) {
      // Backend returns paginated: { success: true, message: "...", data: { count, next, previous, results } }
      // apiGet wraps it: { data: { success, message, data }, success: true, status: 200 }
      const backendResponse = response.data as BackendProductsResponse;
      const paginatedData = backendResponse.data;
      const productsArray = paginatedData?.results || [];

      let backendProduct: BackendProduct | undefined;

      // Check if productId has the prod_ prefix (e.g., prod_18)
      if (productId.startsWith('prod_')) {
        const numericId = parseInt(productId.replace('prod_', ''));
        console.log('[fetchProduct] Looking for numeric ID:', numericId);
        backendProduct = productsArray.find(p => p.id === numericId);
      } else {
        // Check if we have a mapping, otherwise assume productId is unique_link
        const uniqueLink = productIdToUniqueLink[productId] || productId;
        console.log('[fetchProduct] Looking for unique_link:', uniqueLink);
        backendProduct = productsArray.find(p => p.unique_link === uniqueLink);
      }
      
      if (backendProduct) {
        console.log('[fetchProduct] Found product:', backendProduct);
        // Transform using the full product data
        return transformBackendProduct(backendProduct);
      } else {
        console.log('[fetchProduct] Product not found in products list');
        return null;
      }
    }
    
    console.log('[fetchProduct] Products API error');
    return null;
  } catch (error) {
    console.error('[fetchProduct] Error:', error);
    return null;
  }
}

/**
 * Fetch product by unique_link directly using detail API
 * This is used when we have the unique_link from product selection
 */
export async function fetchProductByUniqueLink(uniqueLink: string): Promise<Product | null> {
  try {
    console.log('[fetchProductByUniqueLink] Fetching product by unique_link:', uniqueLink);

    // Use the detail API endpoint for single product
    const response = await apiGet<BackendProductDetailResponse>(
      API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(uniqueLink)
    );

    console.log('[fetchProductByUniqueLink] API response:', response);

    if (response.success && response.data) {
      // Backend returns: { success: true, message: "...", data: BackendProduct }
      // apiGet wraps it: { data: { success, message, data }, success: true, status: 200 }
      const backendResponse = response.data as BackendProductDetailResponse;
      const backendProduct = backendResponse.data;

      if (backendProduct) {
        console.log('[fetchProductByUniqueLink] Found product:', backendProduct);
        // Transform using the full product data
        return transformBackendProduct(backendProduct);
      } else {
        console.log('[fetchProductByUniqueLink] Product not found');
        return null;
      }
    }

    console.log('[fetchProductByUniqueLink] Product detail API error');
    return null;
  } catch (error) {
    console.error('[fetchProductByUniqueLink] Error:', error);
    return null;
  }
}

/**
 * Get suggested products based on category
 * Fetches all products and filters by category
 */
export async function getSuggestedProducts(category: string, limit: number = 3): Promise<Product[]> {
  try {
    const response = await apiGet<BackendProductsResponse>(API_CONFIG.ENDPOINTS.PRODUCTS);

    if (response.success && response.data) {
      // Backend returns paginated: { success: true, message: "...", data: { count, next, previous, results } }
      // apiGet wraps it: { data: { success, message, data }, success: true, status: 200 }
      const backendResponse = response.data as BackendProductsResponse;
      const paginatedData = backendResponse.data;
      const productsArray = paginatedData?.results || [];

      const filteredProducts = productsArray
        .filter(product => product.category === category || category === 'all')
        .slice(0, limit)
        .map(transformBackendProduct);

      return filteredProducts;
    }

    return [];
  } catch (error) {
    console.error('[getSuggestedProducts] Error:', error);
    return [];
  }
}

/**
 * Validate product availability
 */
export function validateProduct(product: Product): {
  isValid: boolean;
  reason?: "not_found" | "inactive" | "out_of_stock";
} {
  if (!product) {
    return { isValid: false, reason: "not_found" };
  }
  
  if (product.status === "inactive") {
    return { isValid: false, reason: "inactive" };
  }
  
  if (product.status === "out_of_stock") {
    return { isValid: false, reason: "out_of_stock" };
  }
  
  return { isValid: true };
}