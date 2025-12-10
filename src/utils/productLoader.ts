import type {
  Product,
  UTMParams,
  EntryContext,
  BackendProduct,
  PaginatedResponse,
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

  // Construct image URL with validation
  const baseUrl = API_CONFIG.BASE_URL || 'https://104.234.46.187:8888';
  const imagePath = backendProduct.image_path || '';
  const thumbnailUrl = imagePath
    ? `${baseUrl}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(imagePath)}`
    : '';

  console.log('[transformBackendProduct] Image URL construction:', {
    productId,
    baseUrl,
    imagePath,
    thumbnailUrl
  });

  return {
    id: productId,
    unique_link: backendProduct.unique_link,
    name: backendProduct.name,
    thumbnail: thumbnailUrl,
    price: backendProduct.price,
    currency: backendProduct.currency || "ریال",
    seller: {
      name: backendProduct.shop_name || "فروشگاه",
      verified: false
    },
    category: String(backendProduct.category), // Ensure category is always a string for comparison
    category_display: backendProduct.category_display,
    status: "active",
    images: thumbnailUrl ? [thumbnailUrl] : [],
    description: backendProduct.description,
    link: backendProduct.link,
    extra_details: backendProduct.extra_details,
    available_sizes: backendProduct.available_sizes || [],
    available_sizes_display: backendProduct.available_sizes_display || [],
    // Backend-specific fields
    shop_id: backendProduct.shop_id,
    is_predefined: backendProduct.is_predefined,
    image_path: backendProduct.image_path,
    created_at: backendProduct.created_at
  };
}

/**
 * Extract shop_name and unique_link from URL path
 * Returns object with shopName and uniqueLink, or null for root/homepage
 * Supports formats: /shop_name/product/unique_link, /shop_name/unique_link (legacy), or /shop_name
 */
export function parseShopAndProductFromPath(url: string): {
  shopName: string | null;
  uniqueLink: string | null;
} | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname
      .split('/')
      .filter(p => p)
      .map(segment => {
        try {
          return decodeURIComponent(segment);
        } catch {
          return segment;
        }
      });

    // Root path - no shop or product
    if (pathParts.length === 0) {
      return null;
    }

    // Reserved routes
    if (pathParts[0] === 'admin' || pathParts[0] === 'health' || pathParts[0] === 'seller') {
      return null;
    }

    // UUID regex for validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Case 1: /shop_name/product/unique_link (3 segments - new format)
    if (pathParts.length === 3 && pathParts[1] === 'product') {
      const shopName = pathParts[0];
      const uniqueLink = pathParts[2];

      // Validate that third segment is UUID
      if (uuidRegex.test(uniqueLink)) {
        return { shopName, uniqueLink };
      }

      // Invalid format
      return null;
    }

    // Case 2: /shop_name/unique_link (2 segments - legacy format, still supported)
    if (pathParts.length === 2) {
      const shopName = pathParts[0];
      const uniqueLink = pathParts[1];

      // Validate that second segment is UUID
      if (uuidRegex.test(uniqueLink)) {
        return { shopName, uniqueLink };
      }

      // Invalid format
      return null;
    }

    // Case 3: /shop_name (1 segment) - shop listing page
    if (pathParts.length === 1) {
      const firstSegment = pathParts[0];

      // If it's a UUID, this is old format (should show error)
      if (uuidRegex.test(firstSegment)) {
        return null; // Old format detected
      }

      // Otherwise it's a shop name
      return { shopName: firstSegment, uniqueLink: null };
    }

    // More than 3 segments - invalid
    return null;
  } catch (error) {
    console.error('[parseShopAndProductFromPath] Error:', error);
    return null;
  }
}

/**
 * Extract unique_link from URL path (LEGACY - for backward compatibility detection)
 * Returns unique_link if found in path (e.g., /550e8400-e29b-41d4-a716-446655440000/)
 * Returns null if home page or invalid format
 * This function is used to detect old URL formats that should show errors
 */
export function parseUniqueLinkFromPath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname
      .split('/')
      .filter(p => p)
      .map(segment => {
        try {
          return decodeURIComponent(segment);
        } catch {
          return segment;
        }
      });

    // Check if path has a segment (not homepage)
    if (pathParts.length === 0) {
      return null;
    }

    // Check if first path segment is admin or other reserved routes
    if (pathParts[0] === 'admin' || pathParts[0] === 'health') {
      return null;
    }

    // If path has exactly 1 segment and it's a UUID, this is old format
    if (pathParts.length === 1) {
      const uniqueLink = pathParts[0];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(uniqueLink)) {
        return uniqueLink; // Old format detected
      }
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
    const response = await apiGet<PaginatedResponse<BackendProduct>>(API_CONFIG.ENDPOINTS.PRODUCTS);
    
    console.log('[fetchProduct] API response:', response);
    
    if (response.success && response.data) {
      // API returns: { success: true, message: "...", data: { count, next, previous, results } }
      // apiGet extracts: response.data = { count, next, previous, results }
      const paginatedData = response.data;
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
      // API returns: { success: true, message: "...", data: BackendProduct }
      // apiGet extracts: response.data = BackendProduct
      const backendProduct = response.data as BackendProduct;

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
 * Fetch products filtered by shop name
 * Fetches all products and filters client-side by shop_name
 * Handles both raw shop names and sanitized URL shop names
 */
export async function fetchProductsByShopName(shopName: string): Promise<Product[]> {
  try {
    console.log('[fetchProductsByShopName] Fetching products for shop:', shopName);
    
    // Fetch all products (we'll filter client-side)
    const response = await apiGet<PaginatedResponse<BackendProduct>>(API_CONFIG.ENDPOINTS.PRODUCTS);
    
    if (response.success && response.data) {
      const paginatedData = response.data;
      const productsArray = paginatedData?.results || [];
      
      // Normalize shop name for comparison (case-insensitive)
      const normalizedShopName = shopName.toLowerCase().trim();

      // Filter by shop_username or shop_name - match against username (preferred) or sanitized shop name
      const filteredProducts = productsArray
        .filter(product => {
          // First check shop_username (most reliable for URL routing)
          const productShopUsername = (product.shop_username || '').toLowerCase().trim();
          if (productShopUsername && normalizedShopName === productShopUsername) {
            return true;
          }

          // Fallback: check shop_name and sanitized versions
          const productShopName = (product.shop_name || '').toLowerCase().trim();
          const sanitizedProductShopName = sanitizeShopNameForUrl(product.shop_name || '').toLowerCase().trim();

          return normalizedShopName === productShopName || normalizedShopName === sanitizedProductShopName;
        })
        .map(transformBackendProduct);
      
      console.log('[fetchProductsByShopName] Found products:', {
        shopName,
        total: productsArray.length,
        filtered: filteredProducts.length
      });
      
      return filteredProducts;
    }
    
    return [];
  } catch (error) {
    console.error('[fetchProductsByShopName] Error:', error);
    return [];
  }
}

/**
 * Get suggested products based on category
 * Fetches all products and filters by category
 */
export async function getSuggestedProducts(category: string, limit: number = 3): Promise<Product[]> {
  try {
    const response = await apiGet<PaginatedResponse<BackendProduct>>(API_CONFIG.ENDPOINTS.PRODUCTS);

    if (response.success && response.data) {
      // API returns: { success: true, message: "...", data: { count, next, previous, results } }
      // apiGet extracts: response.data = { count, next, previous, results }
      const paginatedData = response.data;
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
 * Sanitize shop name for URL usage
 * Converts to lowercase, replaces spaces with hyphens, removes special chars
 */
export function sanitizeShopNameForUrl(shopName: string): string {
  return shopName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '') // Remove special chars, keep Persian/Arabic
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
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