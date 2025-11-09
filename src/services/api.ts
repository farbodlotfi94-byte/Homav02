/**
 * API Service Layer
 * Reusable functions for making API calls with proper error handling
 *
 * ENHANCED WITH:
 * - Auto-injection of user auth headers
 * - 401 handling with token refresh and retry
 * - 429 rate limit error handling
 * - Response headers exposure for rate limit tracking
 */

import { API_CONFIG } from '../config/api';
import { userAuthService } from './userAuthService';

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
  status: number;
  headers?: Headers;         // NEW: Expose response headers
  requiresLogin?: boolean;   // NEW: Flag for 401 after refresh failed
  retryAfter?: number;       // NEW: Seconds for 429 errors
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

/**
 * Get user authorization headers if authenticated
 */
function getUserAuthHeaders(): HeadersInit {
  return userAuthService.getAuthHeaders();
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let controller: AbortController | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      console.warn('[API] Request timeout, aborting:', url);
      controller?.abort();
    }, API_CONFIG.TIMEOUT);

    // Don't set Content-Type if body is FormData (browser will set it with boundary)
    const headers: HeadersInit = {};
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    console.log('[API] Making request:', { 
      url, 
      method: options.method || 'GET',
      hasBody: !!options.body,
      bodyType: options.body instanceof FormData ? 'FormData' : typeof options.body,
      headers: { ...headers, ...options.headers }
    });

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...headers,
        ...getUserAuthHeaders(),  // AUTO-INJECT auth headers
        ...options.headers,
      },
    });

    // Clear timeout on successful response
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    console.log('[API] Response received:', {
      url,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    // Handle 401 Unauthorized - try to refresh token and retry
    if (response.status === 401) {
      console.log('[API] 401 Unauthorized - attempting token refresh');

      const refreshed = await userAuthService.refreshAccessToken();

      if (refreshed) {
        console.log('[API] Token refreshed successfully, retrying request');
        // Retry the request with new token (recursive call)
        return apiRequest<T>(url, options);
      } else {
        console.error('[API] Token refresh failed, user must login');
        // Logout user
        userAuthService.logout();

        return {
          data: null as T,
          success: false,
          error: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید',
          status: 401,
          requiresLogin: true,
        };
      }
    }

    // Handle 429 Rate Limit Exceeded
    if (response.status === 429) {
      console.log('[API] 429 Rate Limit Exceeded');

      const retryAfter = response.headers.get('Retry-After');
      let errorMessage = 'محدودیت روزانه به پایان رسید';
      let detail = '';

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        detail = errorData.detail || '5 per 1 hour';
      } catch (jsonError) {
        // Ignore JSON parsing errors
      }

      return {
        data: null as T,
        success: false,
        error: errorMessage,
        status: 429,
        retryAfter: retryAfter ? parseInt(retryAfter, 10) : null,
        headers: response.headers,
      };
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (jsonError) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (textError) {
          // Keep the default error message
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return {
      data,
      success: true,
      status: response.status,
      headers: response.headers,  // EXPOSE headers for rate limit tracking
    };
  } catch (error) {
    // Clean up timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    console.error('[API] Request failed:', { 
      url, 
      error: error instanceof Error ? error.message : error,
      name: error instanceof Error ? error.name : 'Unknown',
      errorType: error.constructor.name,
      isDOMException: error instanceof DOMException
    });
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'AbortError') {
        return {
          data: null as T,
          success: false,
          error: 'درخواست لغو شد - لطفاً دوباره تلاش کنید',
          status: 408,
        };
      }
      
      if (error instanceof DOMException) {
        return {
          data: null as T,
          success: false,
          error: 'خطا در اتصال شبکه - لطفاً اتصال اینترنت خود را بررسی کنید',
          status: 0,
        };
      }
      
      if (error.message.includes('NS_BINDING_ABORTED')) {
        return {
          data: null as T,
          success: false,
          error: 'اتصال قطع شد - لطفاً اتصال اینترنت خود را بررسی کنید',
          status: 0,
        };
      }

      if (error.message.includes('Failed to fetch')) {
        return {
          data: null as T,
          success: false,
          error: 'خطا در اتصال به سرور - لطفاً دوباره تلاش کنید',
          status: 0,
        };
      }

      if (error.message.includes('Request timeout')) {
        return {
          data: null as T,
          success: false,
          error: 'زمان پردازش تمام شد - سرور ممکن است مشغول باشد، لطفاً دوباره تلاش کنید',
          status: 408,
        };
      }
      
      return {
        data: null as T,
        success: false,
        error: error.message,
        status: 0,
      };
    }

    return {
      data: null as T,
      success: false,
      error: 'خطای ناشناخته رخ داده است',
      status: 0,
    };
  } finally {
    // Ensure cleanup
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  return apiRequest<T>(url, { method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method: 'POST',
  };

  if (body) {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
    }
  }

  return apiRequest<T>(url, options);
}

/**
 * POST request helper with custom timeout for image processing
 */
export async function apiPostWithTimeout<T = any>(
  endpoint: string,
  body?: any,
  timeout: number = API_CONFIG.TIMEOUT
): Promise<ApiResponse<T>> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  let controller: AbortController | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      console.warn('[API] Custom timeout reached, aborting:', url);
      controller?.abort();
    }, timeout);

    // Don't set Content-Type if body is FormData (browser will set it with boundary)
    const headers: HeadersInit = {};
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    console.log('[API] Making custom timeout request:', { 
      url, 
      method: 'POST',
      timeout: timeout,
      hasBody: !!body,
      bodyType: body instanceof FormData ? 'FormData' : typeof body,
      headers: { ...headers }
    });

    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        ...headers,
        ...getUserAuthHeaders(),  // AUTO-INJECT auth headers
      },
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });

    // Clear timeout on successful response
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    console.log('[API] Custom timeout response received:', {
      url,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    // Handle 401 Unauthorized - try to refresh token and retry
    if (response.status === 401) {
      console.log('[API] 401 Unauthorized - attempting token refresh');

      const refreshed = await userAuthService.refreshAccessToken();

      if (refreshed) {
        console.log('[API] Token refreshed successfully, retrying request');
        // Retry the request with new token (recursive call)
        return apiPostWithTimeout<T>(endpoint, body, timeout);
      } else {
        console.error('[API] Token refresh failed, user must login');
        // Logout user
        userAuthService.logout();

        return {
          data: null as T,
          success: false,
          error: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید',
          status: 401,
          requiresLogin: true,
        };
      }
    }

    // Handle 429 Rate Limit Exceeded
    if (response.status === 429) {
      console.log('[API] 429 Rate Limit Exceeded');

      const retryAfter = response.headers.get('Retry-After');
      let errorMessage = 'محدودیت روزانه به پایان رسید';

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // Ignore JSON parsing errors
      }

      return {
        data: null as T,
        success: false,
        error: errorMessage,
        status: 429,
        retryAfter: retryAfter ? parseInt(retryAfter, 10) : null,
        headers: response.headers,
      };
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (jsonError) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (textError) {
          // Keep the default error message
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return {
      data,
      success: true,
      status: response.status,
      headers: response.headers,  // EXPOSE headers for rate limit tracking
    };
  } catch (error) {
    // Clean up timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    console.error('[API] Custom timeout request failed:', { 
      url, 
      error: error instanceof Error ? error.message : error,
      name: error instanceof Error ? error.name : 'Unknown',
      errorType: error.constructor.name,
      isDOMException: error instanceof DOMException
    });
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'AbortError') {
        return {
          data: null as T,
          success: false,
          error: 'زمان پردازش تمام شد - سرور ممکن است مشغول باشد، لطفاً دوباره تلاش کنید',
          status: 408,
        };
      }
      
      if (error instanceof DOMException) {
        return {
          data: null as T,
          success: false,
          error: 'خطا در اتصال شبکه - لطفاً اتصال اینترنت خود را بررسی کنید',
          status: 0,
        };
      }
      
      if (error.message.includes('NS_BINDING_ABORTED')) {
        return {
          data: null as T,
          success: false,
          error: 'اتصال قطع شد - لطفاً اتصال اینترنت خود را بررسی کنید',
          status: 0,
        };
      }

      if (error.message.includes('Failed to fetch')) {
        return {
          data: null as T,
          success: false,
          error: 'خطا در اتصال به سرور - لطفاً دوباره تلاش کنید',
          status: 0,
        };
      }
      
      return {
        data: null as T,
        success: false,
        error: error.message,
        status: 0,
      };
    }

    return {
      data: null as T,
      success: false,
      error: 'خطای ناشناخته رخ داده است',
      status: 0,
    };
  } finally {
    // Ensure cleanup
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Health check
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await apiGet(API_CONFIG.ENDPOINTS.HEALTH);
    return response.success && response.data?.status === 'healthy';
  } catch {
    return false;
  }
}

/**
 * Vote on a processed image
 * POST /api/products/vote
 * 
 * @param imageId - ID of the processed image to vote on
 * @param vote - Vote value: 1=GOOD, 2=NEUTRAL, 3=BAD
 * @returns API response with vote status
 */
export interface VoteResponse {
  status: string;
  image_id: number;
  score: number;
  message: string;
}

export async function submitVote(
  imageId: number,
  vote: 1 | 2 | 3
): Promise<ApiResponse<VoteResponse>> {
  console.log('[Vote API] Submitting vote:', { imageId, vote });
  
  const response = await apiPost<VoteResponse>(API_CONFIG.ENDPOINTS.VOTE, {
    image_id: imageId,
    vote: vote,
  });

  if (response.success) {
    console.log('[Vote API] Vote submitted successfully:', response.data);
  } else {
    console.error('[Vote API] Vote submission failed:', response.error);
  }

  return response;
}
