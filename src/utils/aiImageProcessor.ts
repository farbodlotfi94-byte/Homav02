/**
 * AI Image Processing Service
 * Connects to real backend API for image processing
 */

import { apiPost, apiPostWithTimeout } from "../services/api";
import { API_CONFIG } from "../config/api";
import type { BackendProcessResponse } from "../types/product";

export interface ProcessImageRequest {
  imageFile: File;
  productId: string;
  uniqueLink: string; // Backend unique_link for API call
  userId?: string;
  sessionId?: string;
}

export interface ProcessImageResponse {
  success: boolean;
  visualizedImageUrl: string;
  originalImageUrl: string;
  processingTime: number;
  confidence: number;
  error?: string;
}

/**
 * Test backend connectivity
 */
async function testBackendConnection(): Promise<boolean> {
  try {
    console.log('[AI Processing] تست اتصال به سرور...');
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const isHealthy = response.ok;
    console.log('[AI Processing] وضعیت سرور:', {
      status: response.status,
      ok: response.ok,
      healthy: isHealthy
    });
    
    return isHealthy;
  } catch (error) {
    console.error('[AI Processing] خطا در تست اتصال:', error);
    return false;
  }
}

/**
 * Test if we can reach the specific process endpoint
 */
async function testProcessEndpoint(uniqueLink: string): Promise<boolean> {
  try {
    console.log('[AI Processing] تست endpoint پردازش...');
    const testUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROCESS_IMAGE(uniqueLink)}`;
    console.log('[AI Processing] تست URL:', testUrl);
    
    // Try a simple GET request to see if the endpoint exists
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('[AI Processing] تست endpoint نتیجه:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    
    // Even if it returns 405 (Method Not Allowed), it means the endpoint exists
    return response.status !== 404;
  } catch (error) {
    console.error('[AI Processing] خطا در تست endpoint:', error);
    return false;
  }
}

/**
 * Process image with AI using real backend API with retry mechanism
 */
export async function processImageWithAI(
  request: ProcessImageRequest,
  retryCount: number = 0
): Promise<ProcessImageResponse> {
  const maxRetries = 2;
  
  try {
    const startTime = Date.now();
    
    // Validate request parameters
    if (!request.uniqueLink || request.uniqueLink.trim() === '') {
      console.error('[AI Processing] uniqueLink is empty or invalid:', request.uniqueLink);
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: 0,
        confidence: 0,
        error: 'لینک محصول نامعتبر است',
      };
    }

    if (!request.imageFile) {
      console.error('[AI Processing] imageFile is missing');
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: 0,
        confidence: 0,
        error: 'فایل تصویر یافت نشد',
      };
    }

    // Test backend connection first
    if (retryCount === 0) {
      const isBackendHealthy = await testBackendConnection();
      if (!isBackendHealthy) {
        return {
          success: false,
          visualizedImageUrl: '',
          originalImageUrl: '',
          processingTime: 0,
          confidence: 0,
          error: 'سرور در دسترس نیست - لطفاً دوباره تلاش کنید',
        };
      }
      
      // Test the specific process endpoint
      const isEndpointReachable = await testProcessEndpoint(request.uniqueLink);
      if (!isEndpointReachable) {
        return {
          success: false,
          visualizedImageUrl: '',
          originalImageUrl: '',
          processingTime: 0,
          confidence: 0,
          error: 'endpoint پردازش تصویر در دسترس نیست',
        };
      }
    }
    
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', request.imageFile);
    
    // Debug FormData contents
    console.log('[AI Processing] FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }

    const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROCESS_IMAGE(request.uniqueLink)}`;
    
    console.log('[AI Processing] شروع پردازش تصویر:', {
      productId: request.productId,
      uniqueLink: request.uniqueLink,
      fileName: request.imageFile.name,
      fileSize: request.imageFile.size,
      retryAttempt: retryCount + 1,
      fullUrl: fullUrl,
      baseUrl: API_CONFIG.BASE_URL,
      endpoint: API_CONFIG.ENDPOINTS.PROCESS_IMAGE(request.uniqueLink),
    });

    // Call backend API with progress tracking
    console.log('[AI Processing] ارسال درخواست به:', fullUrl);
    
    // Add a progress indicator for long-running requests
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      console.log(`[AI Processing] در حال پردازش... (${Math.round(elapsed / 1000)}s)`);
    }, 10000); // Log every 10 seconds
    
    let response;
    try {
      response = await apiPostWithTimeout<BackendProcessResponse>(
        API_CONFIG.ENDPOINTS.PROCESS_IMAGE(request.uniqueLink),
        formData,
        API_CONFIG.IMAGE_PROCESSING_TIMEOUT
      );
      
      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
    
    console.log('[AI Processing] پاسخ دریافت شد:', {
      success: response.success,
      status: response.status,
      error: response.error,
      hasData: !!response.data
    });

    const processingTime = Date.now() - startTime;

    if (response.success && response.data) {
      // Create URLs for the processed images
      const originalImageUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(response.data.customer_image_path)}`;
      const visualizedImageUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(response.data.processed_image_path)}`;

      console.log('[AI Processing] تصویر با موفقیت پردازش شد:', {
        productId: request.productId,
        processingTime: Math.round(processingTime),
        processedImageId: response.data.id,
      });

      return {
        success: true,
        visualizedImageUrl,
        originalImageUrl,
        processingTime: Math.round(processingTime),
        confidence: 0.95, // High confidence for successful processing
      };
    } else {
      console.error('[AI Processing] خطا در پردازش:', response.error);
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: Math.round(processingTime),
        confidence: 0,
        error: response.error || 'خطا در پردازش تصویر توسط سرور',
      };
    }
  } catch (error) {
    console.error('[AI Processing] خطا در پردازش تصویر:', error);
    
    // Check if we should retry
    const shouldRetry = retryCount < maxRetries && error instanceof Error && (
      error.message.includes('NS_BINDING_ABORTED') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Request timeout') ||
      error.message.includes('درخواست لغو شد') ||
      error.message.includes('اتصال قطع شد') ||
      error.message.includes('خطا در اتصال به سرور')
    );
    
    if (shouldRetry) {
      console.log(`[AI Processing] تلاش مجدد (${retryCount + 1}/${maxRetries}):`, error.message);
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return processImageWithAI(request, retryCount + 1);
    }
    
    let persianError = 'خطای ناشناخته در پردازش تصویر';
    
    if (error instanceof Error) {
      if (error.message.includes('NS_BINDING_ABORTED')) {
        persianError = 'اتصال به سرور قطع شد - لطفاً اتصال اینترنت خود را بررسی کنید';
      } else if (error.message.includes('Failed to fetch')) {
        persianError = 'خطا در اتصال به سرور - لطفاً دوباره تلاش کنید';
      } else if (error.message.includes('Request timeout')) {
        persianError = 'زمان پردازش تمام شد - لطفاً دوباره تلاش کنید';
      } else if (error.message.includes('درخواست لغو شد')) {
        persianError = 'درخواست لغو شد - لطفاً دوباره تلاش کنید';
      } else if (error.message.includes('اتصال قطع شد')) {
        persianError = 'اتصال قطع شد - لطفاً اتصال اینترنت خود را بررسی کنید';
      } else if (error.message.includes('خطا در اتصال به سرور')) {
        persianError = 'خطا در اتصال به سرور - لطفاً دوباره تلاش کنید';
      } else {
        persianError = `خطا در پردازش: ${error.message}`;
      }
    }
    
    return {
      success: false,
      visualizedImageUrl: '',
      originalImageUrl: '',
      processingTime: 0,
      confidence: 0,
      error: persianError,
    };
  }
}

/**
 * ذخیره نتیجه و tracking metrics
 */
export interface SaveVisualizationRequest {
  productId: string;
  originalImageUrl: string;
  visualizedImageUrl: string;
  userId?: string;
  sessionId?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export interface SaveVisualizationResponse {
  success: boolean;
  visualizationId: string;
  error?: string;
}

/**
 * ذخیره نتیجه visualization و KPI tracking
 */
export async function saveVisualization(
  request: SaveVisualizationRequest
): Promise<SaveVisualizationResponse> {
  try {
    // شبیه‌سازی ذخیره در دیتابیس
    await new Promise((resolve) => setTimeout(resolve, 500));

    const visualizationId = `viz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('[Save Visualization] ذخیره موفق:', {
      visualizationId,
      productId: request.productId,
      utm: request.utm,
    });

    // در حالت واقعی، اینجا باید:
    // 1. در دیتابیس ذخیره شود
    // 2. KPIs را به‌روز کند (upload rate, conversion metrics)
    // 3. tracking events را ارسال کند

    return {
      success: true,
      visualizationId,
    };
  } catch (error) {
    console.error('[Save Visualization] خطا در ذخیره:', error);
    return {
      success: false,
      visualizationId: '',
      error: error instanceof Error ? error.message : 'خطای ناشناخته',
    };
  }
}

/**
 * Tracking KPIs
 */
export interface TrackEventRequest {
  eventType: 'upload_start' | 'upload_success' | 'upload_error' | 'view_result' | 'click_purchase' | 'feedback';
  productId: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export async function trackEvent(request: TrackEventRequest): Promise<void> {
  try {
    console.log('[Analytics] رویداد ثبت شد:', {
      eventType: request.eventType,
      productId: request.productId,
      timestamp: new Date().toISOString(),
      metadata: request.metadata,
    });

    // در حالت واقعی، اینجا باید به analytics service ارسال شود
    // مثلاً Google Analytics, Mixpanel, یا Supabase Analytics
  } catch (error) {
    console.error('[Analytics] خطا در ثبت رویداد:', error);
  }
}
