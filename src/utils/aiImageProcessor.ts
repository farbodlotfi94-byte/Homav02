/**
 * AI Image Processing Service
 * Connects to real backend API for image processing
 *
 * ENHANCED WITH:
 * - Auth token auto-injection (via api.ts)
 * - 401 error handling
 */

import { apiPost, apiPostWithTimeout, apiGetImageBlob } from "../services/api";
import { API_CONFIG } from "../config/api";
import type { BackendProcessResponse } from "../types/product";
import { stripExifData } from "./stripExif";
import { userAuthService } from "../services/userAuthService";

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
  imageId?: number;          // ID of the processed image record
  error?: string;
  status?: number;           // HTTP status code
  requiresLogin?: boolean;   // 401 error flag
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
    }

    // Strip EXIF data to prevent backend from auto-rotating the image
    console.log('[AI Processing] Stripping EXIF metadata from image...');
    const imageFileWithoutExif = await stripExifData(request.imageFile);

    // Validate that the file is not empty after EXIF stripping
    if (!imageFileWithoutExif || imageFileWithoutExif.size === 0) {
      console.error('[AI Processing] تصویر بعد از حذف EXIF خالی است');
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: 0,
        confidence: 0,
        error: 'خطا در پردازش تصویر - فایل خالی است',
      };
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', imageFileWithoutExif);

    // Debug FormData contents
    console.log('[AI Processing] FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }

    // Verify file was appended to FormData
    const fileInFormData = formData.get('file') as File | null;
    if (!fileInFormData || fileInFormData.size === 0) {
      console.error('[AI Processing] فایل به FormData اضافه نشد یا خالی است');
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: 0,
        confidence: 0,
        error: 'خطا در آماده‌سازی فایل برای ارسال',
      };
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
      hasData: !!response.data,
      hasHeaders: !!response.headers,
      dataFields: response.data ? Object.keys(response.data) : [],
      backendStatus: response.data?.status,
      imagePath: response.data?.image_path,
      imagePathLength: response.data?.image_path?.length,
      imageId: response.data?.image_id,
    });

    const processingTime = Date.now() - startTime;

    // Handle 401 error (token expired, already handled by api.ts but might fail)
    if (response.status === 401 && response.requiresLogin) {
      console.error('[AI Processing] نیاز به ورود مجدد');
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: Math.round(processingTime),
        confidence: 0,
        error: response.error || 'نشست شما منقضی شده است',
        status: 401,
        requiresLogin: true,
      };
    }

    if (response.success && response.data) {
      // Handle new backend response format
      const isNewFormat = response.data.status === "success" &&
                         typeof response.data.image_path === "string" &&
                         response.data.image_path.length > 0;

      let visualizedImageUrl: string;
      let originalImageUrl: string;

      if (isNewFormat) {
        // New format: relative image_path from backend, construct full URL
        const imageEndpoint = API_CONFIG.ENDPOINTS.IMAGE_SERVE(response.data.image_path);
        visualizedImageUrl = await apiGetImageBlob(imageEndpoint) || '';

        if (!response.data.image_path || response.data.image_path.length === 0) {
          console.warn('[AI Processing] image_path is empty despite success status');
        }

        // For original image, we don't have it in the new format, so use empty string or placeholder
        // The backend should ideally return both URLs
        originalImageUrl = response.data.customer_image_path
          ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(response.data.customer_image_path)}`
          : '';
      } else {
        // Legacy format: customer_image_path and processed_image_path
        originalImageUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(response.data.customer_image_path || '')}`;
        visualizedImageUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(response.data.processed_image_path || '')}`;
      }

      const processedImageId = response.data.image_id ?? response.data.id;
      
      console.log('[AI Processing] تصویر با موفقیت پردازش شد:', {
        productId: request.productId,
        processingTime: Math.round(processingTime),
        processedImageId,
        imageUrl: visualizedImageUrl,
        format: isNewFormat ? 'new' : 'legacy',
      });

      return {
        success: true,
        visualizedImageUrl,
        originalImageUrl,
        processingTime: Math.round(processingTime),
        confidence: 0.95, // High confidence for successful processing
        imageId: processedImageId, // Include processed image ID for vote API
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
        status: response.status,
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
