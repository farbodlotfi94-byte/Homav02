/**
 * Admin Service Layer
 * Handles all admin API operations including authentication and CRUD operations
 */

import { API_CONFIG } from '../config/api';
import type {
  AdminLoginCredentials,
  AdminAuthResponse,
  AdminProduct,
  AdminProductFormData,
  AdminProductsResponse,
  ModelPrompt,
  ModelPromptResponse,
  GroqPromptResponse,
  AdminApiResponse,
  AdminError,
} from '../types/admin';
import { ADMIN_STORAGE_KEYS } from '../types/admin';

class AdminService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.loadTokenFromStorage();
  }

  /**
   * Load token from localStorage
   */
  private loadTokenFromStorage(): void {
    try {
      this.token = localStorage.getItem(ADMIN_STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('[AdminService] Failed to load token from storage:', error);
      this.token = null;
    }
  }

  /**
   * Save token to localStorage
   */
  private saveTokenToStorage(token: string): void {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEYS.AUTH_TOKEN, token);
      this.token = token;
    } catch (error) {
      console.error('[AdminService] Failed to save token to storage:', error);
    }
  }

  /**
   * Clear token from localStorage
   */
  private clearTokenFromStorage(): void {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEYS.AUTH_TOKEN);
      this.token = null;
    } catch (error) {
      console.error('[AdminService] Failed to clear token from storage:', error);
    }
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Get multipart headers for file uploads
   */
  private getMultipartHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: any, response?: Response): AdminError {
    if (response) {
      switch (response.status) {
        case 401:
          this.clearTokenFromStorage();
          return {
            message: 'احراز هویت ناموفق. لطفاً دوباره وارد شوید.',
            statusCode: 401,
            type: 'auth',
          };
        case 403:
          return {
            message: 'دسترسی غیرمجاز. شما مجوز دسترسی به این بخش را ندارید.',
            statusCode: 403,
            type: 'auth',
          };
        case 404:
          return {
            message: 'منبع مورد نظر یافت نشد.',
            statusCode: 404,
            type: 'server',
          };
        case 413:
          return {
            message: 'حجم فایل بیش از حد مجاز (حداکثر 10 مگابایت).',
            statusCode: 413,
            type: 'validation',
          };
        case 500:
          return {
            message: 'خطای داخلی سرور. لطفاً بعداً تلاش کنید.',
            statusCode: 500,
            type: 'server',
          };
        default:
          return {
            message: `خطای HTTP ${response.status}: ${error.message || 'خطای ناشناخته'}`,
            statusCode: response.status,
            type: 'server',
          };
      }
    }

    if (error.name === 'AbortError') {
      return {
        message: 'زمان درخواست به پایان رسید.',
        statusCode: 408,
        type: 'network',
      };
    }

    return {
      message: error.message || 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.',
      statusCode: 0,
      type: 'network',
    };
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AdminApiResponse<T>> {
    try {
      const url = new URL(endpoint, this.baseUrl);
      console.log('[AdminService] Making request to:', url.toString());

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url.toString(), {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const error = this.handleApiError(data, response);
        return {
          success: false,
          error: error.message,
          statusCode: error.statusCode,
        };
      }

      return {
        success: true,
        data: data.data || data,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('[AdminService] Request failed:', error);
      const adminError = this.handleApiError(error);
      return {
        success: false,
        error: adminError.message,
        statusCode: adminError.statusCode,
      };
    }
  }

  /**
   * Make multipart request for file uploads
   */
  private async makeMultipartRequest<T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' = 'POST'
  ): Promise<AdminApiResponse<T>> {
    try {
      const url = new URL(endpoint, this.baseUrl);
      console.log('[AdminService] Making multipart request to:', url.toString(), 'method:', method);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url.toString(), {
        method,
        headers: this.getMultipartHeaders(),
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        console.error('[AdminService] Multipart request failed with status:', response.status);
        console.error('[AdminService] Error response data:', JSON.stringify(data, null, 2));
        const error = this.handleApiError(data, response);
        return {
          success: false,
          error: error.message,
          statusCode: error.statusCode,
        };
      }

      console.log('[AdminService] Multipart request successful:', response.status);
      console.log('[AdminService] Response data:', JSON.stringify(data, null, 2));

      return {
        success: true,
        data: data.data || data,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('[AdminService] Multipart request failed:', error);
      const adminError = this.handleApiError(error);
      return {
        success: false,
        error: adminError.message,
        statusCode: adminError.statusCode,
      };
    }
  }

  // Authentication Methods

  /**
   * Login with username and password
   */
  async login(credentials: AdminLoginCredentials): Promise<AdminApiResponse<AdminAuthResponse>> {
    const response = await this.makeRequest<AdminAuthResponse>('/api/shops/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.saveTokenToStorage(response.data.access_token);
    }

    return response;
  }

  /**
   * Logout and clear token
   */
  logout(): void {
    this.clearTokenFromStorage();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  // Product Management Methods

  /**
   * Get all products with pagination
   */
  async getProducts(skip = 0, limit = 20): Promise<AdminApiResponse<AdminProductsResponse>> {
    const endpoint = `/api/admin/products?skip=${skip}&limit=${limit}`;
    return this.makeRequest<AdminProductsResponse>(endpoint);
  }

  /**
   * Get specific product by ID
   */
  async getProduct(productId: number): Promise<AdminApiResponse<AdminProduct>> {
    const endpoint = `/api/admin/products/${productId}`;
    return this.makeRequest<AdminProduct>(endpoint);
  }

  /**
   * Create new product
   */
  async createProduct(
    productData: AdminProductFormData,
    imageFile: File
  ): Promise<AdminApiResponse<AdminProduct>> {
    const formData = new FormData();

    // File is required
    formData.append('file', imageFile);

    // Create product_data object (only include fields with values)
    const productDataObj: any = {
      is_predefined: productData.is_predefined
    };

    if (productData.name && productData.name.trim()) {
      productDataObj.name = productData.name.trim();
    }
    if (productData.description && productData.description.trim()) {
      productDataObj.description = productData.description.trim();
    }
    if (productData.category && productData.category.trim()) {
      productDataObj.category = productData.category.trim();
    }

    // Send product_data as JSON string
    formData.append('product_data', JSON.stringify(productDataObj));

    console.log('[AdminService] Creating product with FormData:');
    console.log('- file:', imageFile.name, imageFile.type, imageFile.size);
    console.log('- product_data:', JSON.stringify(productDataObj, null, 2));

    return this.makeMultipartRequest<AdminProduct>('/api/admin/products', formData);
  }

  /**
   * Update existing product
   */
  async updateProduct(
    productId: number,
    productData: Partial<AdminProductFormData>,
    imageFile?: File
  ): Promise<AdminApiResponse<AdminProduct>> {
    const formData = new FormData();

    // Create product_data object (only include fields that are defined)
    const productDataObj: any = {};

    if (productData.name !== undefined && productData.name.trim()) {
      productDataObj.name = productData.name.trim();
    }
    if (productData.description !== undefined && productData.description.trim()) {
      productDataObj.description = productData.description.trim();
    }
    if (productData.category !== undefined && productData.category.trim()) {
      productDataObj.category = productData.category.trim();
    }
    if (productData.is_predefined !== undefined) {
      productDataObj.is_predefined = productData.is_predefined;
    }

    // Only append product_data if there are fields to update
    if (Object.keys(productDataObj).length > 0) {
      formData.append('product_data', JSON.stringify(productDataObj));
    }

    // Add file if provided
    if (imageFile) {
      formData.append('file', imageFile);
    }

    console.log('[AdminService] Updating product', productId, 'with:');
    console.log('- product_data:', JSON.stringify(productDataObj, null, 2));
    console.log('- has file:', !!imageFile);

    const endpoint = `/api/admin/products/${productId}`;
    return this.makeMultipartRequest<AdminProduct>(endpoint, formData, 'PUT');
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: number): Promise<AdminApiResponse<{ message: string }>> {
    const endpoint = `/api/admin/products/${productId}`;
    return this.makeRequest<{ message: string }>(endpoint, {
      method: 'DELETE',
    });
  }

  // Model Prompt Methods

  /**
   * Get current model prompt (Gemini)
   */
  async getModelPrompt(): Promise<AdminApiResponse<ModelPromptResponse>> {
    return this.makeRequest<ModelPromptResponse>('/api/admin/model-prompt');
  }

  /**
   * Update model prompt (Gemini)
   */
  async updateModelPrompt(prompt: string): Promise<AdminApiResponse<ModelPromptResponse>> {
    return this.makeRequest<ModelPromptResponse>('/api/admin/model-prompt', {
      method: 'PUT',
      body: JSON.stringify({ prompt }),
    });
  }

  // Groq Prompt Methods

  /**
   * Get current Groq prompt
   */
  async getGroqPrompt(): Promise<AdminApiResponse<GroqPromptResponse>> {
    return this.makeRequest<GroqPromptResponse>('/api/admin/groq-prompt');
  }

  /**
   * Update Groq prompt
   */
  async updateGroqPrompt(prompt: string): Promise<AdminApiResponse<GroqPromptResponse>> {
    return this.makeRequest<GroqPromptResponse>('/api/admin/groq-prompt', {
      method: 'PUT',
      body: JSON.stringify({ prompt }),
    });
  }

  // Utility Methods

  /**
   * Get product image URL
   */
  getProductImageUrl(imagePath: string): string {
    return `${this.baseUrl}/api/products/images/${imagePath}`;
  }

  /**
   * Validate file for upload
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'حجم فایل بیش از 10 مگابایت است.',
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'نوع فایل مجاز نیست. فقط تصاویر JPEG، PNG و WebP مجاز است.',
      };
    }

    return { isValid: true };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/health');
      return response.success;
    } catch (error) {
      console.error('[AdminService] Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;
