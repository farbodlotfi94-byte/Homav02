/**
 * Seller API Service
 * Handles all shop-specific API endpoints (dashboard, products, settings, credits)
 *
 * Pattern: Uses sellerAuthService for authentication headers
 * Error Handling: Returns consistent { success, data?, error? } format
 */

import { API_CONFIG } from '../config/api';
import { sellerAuthService } from './sellerAuthService';
import type {
  DashboardResponse,
  ProductListParams,
  PaginatedProductsResponse,
  ProductDetailsResponse,
  ProductAnalyticsParams,
  PaginatedAnalyticsResponse,
  ShopSettingsResponse,
  UpdateSettingsData,
  CreditBalanceResponse,
  CreditHistoryParams,
  PaginatedTransactionsResponse,
  ServiceResult,
  ApiResponse,
} from '../types/seller-api';

class SellerApiService {
  /**
   * Helper: Make authenticated API request with automatic token refresh
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ServiceResult<T>> {
    return this.makeRequestWithRetry<T>(endpoint, options, false);
  }

  /**
   * Internal: Make request with optional retry after refresh
   */
  private async makeRequestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ServiceResult<T>> {
    try {
      const authHeaders = sellerAuthService.getAuthHeaders();

      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          ...authHeaders,
        },
      });

      const responseData: ApiResponse<T> = await response.json();

      if (!response.ok) {
        console.error(`[SellerAPI] Request failed: ${endpoint}`, responseData);

        // Handle 401 - token expired
        if (response.status === 401) {
          // Don't retry if this is already a retry attempt
          if (isRetry) {
            console.log('[SellerAPI] Retry failed, logging out');
            sellerAuthService.logout();
            return {
              success: false,
              error: 'نشست شما منقضی شده است. لطفا دوباره وارد شوید',
            };
          }

          // Attempt to refresh token
          console.log('[SellerAPI] Access token expired, attempting refresh...');
          const refreshSuccess = await sellerAuthService.refreshAccessToken();

          if (refreshSuccess) {
            console.log('[SellerAPI] Token refreshed, retrying request...');
            return this.makeRequestWithRetry<T>(endpoint, options, true);
          } else {
            console.log('[SellerAPI] Token refresh failed, logging out');
            sellerAuthService.logout();
            return {
              success: false,
              error: 'نشست شما منقضی شده است. لطفا دوباره وارد شوید',
            };
          }
        }

        // Handle other errors (unchanged from current implementation)
        let errorMessage = responseData.message || 'خطا در انجام عملیات';
        if ((responseData as any).data?.error) {
          const error = (responseData as any).data.error;
          if (Array.isArray(error)) {
            errorMessage = error.join(', ');
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        data: responseData.data,
      };
    } catch (error) {
      console.error(`[SellerAPI] Request error: ${endpoint}`, error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/shops/dashboard/
   */
  async getDashboardStats(): Promise<ServiceResult<DashboardResponse>> {
    console.log('[SellerAPI] Fetching dashboard stats');
    return this.makeRequest<DashboardResponse>('/api/shops/dashboard/');
  }

  /**
   * Get products list with pagination and filtering
   * GET /api/shops/products/list/
   */
  async getProductsList(params: ProductListParams = {}): Promise<ServiceResult<PaginatedProductsResponse>> {
    console.log('[SellerAPI] Fetching products list', params);

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);

    const queryString = queryParams.toString();
    const endpoint = `/api/shops/products/list/${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PaginatedProductsResponse>(endpoint);
  }

  /**
   * Get product details by unique link
   * GET /api/shops/products/{unique_link}/
   */
  async getProductDetails(uniqueLink: string): Promise<ServiceResult<ProductDetailsResponse>> {
    console.log('[SellerAPI] Fetching product details:', uniqueLink);
    return this.makeRequest<ProductDetailsResponse>(`/api/shops/products/${uniqueLink}/`);
  }

  /**
   * Create new product with image upload
   * POST /api/shops/products/
   */
  async createProduct(formData: FormData): Promise<ServiceResult<ProductDetailsResponse>> {
    console.log('[SellerAPI] Creating product');

    try {
      const authHeaders = sellerAuthService.getAuthHeaders();

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/shops/products/`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        },
        body: formData,
      });

      const responseData: ApiResponse<ProductDetailsResponse> = await response.json();

      if (!response.ok) {
        console.error('[SellerAPI] Create product failed:', responseData);

        if (response.status === 401) {
          sellerAuthService.logout();
          return {
            success: false,
            error: 'نشست شما منقضی شده است. لطفا دوباره وارد شوید',
          };
        }

        let errorMessage = responseData.message || 'خطا در ایجاد محصول';
        if ((responseData as any).data?.error) {
          const error = (responseData as any).data.error;
          if (Array.isArray(error)) {
            errorMessage = error.join(', ');
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        data: responseData.data,
      };
    } catch (error) {
      console.error('[SellerAPI] Create product error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Update product
   * PUT /api/shops/products/edit/{product_id}/
   */
  async updateProduct(productId: number, formData: FormData): Promise<ServiceResult<ProductDetailsResponse>> {
    console.log('[SellerAPI] Updating product:', productId);

    try {
      const authHeaders = sellerAuthService.getAuthHeaders();

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/shops/products/edit/${productId}/`, {
        method: 'PUT',
        headers: {
          ...authHeaders,
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        },
        body: formData,
      });

      const responseData: ApiResponse<ProductDetailsResponse> = await response.json();

      if (!response.ok) {
        console.error('[SellerAPI] Update product failed:', responseData);

        if (response.status === 401) {
          sellerAuthService.logout();
          return {
            success: false,
            error: 'نشست شما منقضی شده است. لطفا دوباره وارد شوید',
          };
        }

        let errorMessage = responseData.message || 'خطا در به‌روزرسانی محصول';
        if ((responseData as any).data?.error) {
          const error = (responseData as any).data.error;
          if (Array.isArray(error)) {
            errorMessage = error.join(', ');
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        data: responseData.data,
      };
    } catch (error) {
      console.error('[SellerAPI] Update product error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Delete product (soft delete)
   * DELETE /api/shops/products/delete/{product_id}/
   */
  async deleteProduct(productId: number): Promise<ServiceResult<void>> {
    console.log('[SellerAPI] Deleting product:', productId);
    return this.makeRequest<void>(`/api/shops/products/delete/${productId}/`, {
      method: 'DELETE',
    });
  }

  /**
   * Get product analytics with filtering and sorting
   * GET /api/shops/products/analytics/
   */
  async getProductAnalytics(params: ProductAnalyticsParams = {}): Promise<ServiceResult<PaginatedAnalyticsResponse>> {
    console.log('[SellerAPI] Fetching product analytics', params);

    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/shops/products/analytics/${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PaginatedAnalyticsResponse>(endpoint);
  }

  /**
   * Get shop settings
   * GET /api/shops/settings/
   */
  async getSettings(): Promise<ServiceResult<ShopSettingsResponse>> {
    console.log('[SellerAPI] Fetching shop settings');
    return this.makeRequest<ShopSettingsResponse>('/api/shops/settings/');
  }

  /**
   * Update shop settings
   * PUT /api/shops/settings/
   */
  async updateSettings(data: UpdateSettingsData): Promise<ServiceResult<ShopSettingsResponse>> {
    console.log('[SellerAPI] Updating shop settings');
    return this.makeRequest<ShopSettingsResponse>('/api/shops/settings/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Get credit balance
   * GET /api/shops/credits/
   */
  async getCredits(): Promise<ServiceResult<CreditBalanceResponse>> {
    console.log('[SellerAPI] Fetching credit balance');
    return this.makeRequest<CreditBalanceResponse>('/api/shops/credits/');
  }

  /**
   * Get credit transaction history
   * GET /api/shops/credits/history/
   */
  async getCreditHistory(params: CreditHistoryParams = {}): Promise<ServiceResult<PaginatedTransactionsResponse>> {
    console.log('[SellerAPI] Fetching credit history', params);

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);

    const queryString = queryParams.toString();
    const endpoint = `/api/shops/credits/history/${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PaginatedTransactionsResponse>(endpoint);
  }
}

// Export singleton instance
export const sellerApiService = new SellerApiService();
export default sellerApiService;
