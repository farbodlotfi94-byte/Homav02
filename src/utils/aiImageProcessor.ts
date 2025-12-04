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
import { ImageProcessingScope } from "./imageProcessingSentry";

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
  isRateLimited?: boolean;   // 429 rate limit flag
  rateLimitInfo?: {          // Rate limit details (only present if isRateLimited is true)
    retryAfter: number;      // Seconds until retry
    availableIn: string;     // Human-readable time
    message: string;         // Error message
  };
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

    // Initialize Sentry tracking for this processing session
    ImageProcessingScope.startProcessing({
      productId: parseInt(request.productId.replace('prod_', '')) || 0,
      fileName: request.imageFile.name,
      fileSize: request.imageFile.size,
      sessionId: request.sessionId,
      uniqueLink: request.uniqueLink,
    });

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
    ImageProcessingScope.trackStep('exif_stripping', { fileName: request.imageFile.name });
    let imageFileWithoutExif: File;

    try {
      imageFileWithoutExif = await stripExifData(request.imageFile);
      ImageProcessingScope.trackStep('exif_stripping_complete', { success: true });
    } catch (stripError) {
      console.error('[AI Processing] EXIF stripping failed:', stripError);
      ImageProcessingScope.trackStep('exif_stripping_fallback', { error: String(stripError) });
      // If EXIF stripping fails completely, try with original file
      console.warn('[AI Processing] Using original file as fallback');
      imageFileWithoutExif = request.imageFile;
    }

    // Validate that the file is not empty after EXIF stripping
    if (!imageFileWithoutExif) {
      console.error('[AI Processing] تصویر بعد از حذف EXIF null است');
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: 0,
        confidence: 0,
        error: 'خطا در پردازش تصویر - فایل نامعتبر است',
      };
    }

    if (imageFileWithoutExif.size === 0) {
      console.error('[AI Processing] تصویر بعد از حذف EXIF خالی است', {
        originalSize: request.imageFile.size,
        originalType: request.imageFile.type,
        originalName: request.imageFile.name
      });
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: 0,
        confidence: 0,
        error: 'خطا در پردازش تصویر - فایل خالی است',
      };
    }

    // Validate file type - ensure it's a supported format
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(imageFileWithoutExif.type)) {
      console.warn('[AI Processing] Unexpected file type after processing:', imageFileWithoutExif.type);
      // Don't fail, but log for debugging
    }

    // Create FormData for multipart upload
    ImageProcessingScope.trackStep('formdata_creation');
    const formData = new FormData();

    // Ensure we're appending a proper File/Blob object
    // Some browsers need explicit Blob construction for FormData to work correctly
    try {
      // For maximum compatibility, re-construct as Blob if needed
      if (imageFileWithoutExif instanceof Blob) {
        formData.append('customer_image', imageFileWithoutExif, imageFileWithoutExif.name || 'image.jpg');
      } else {
        // Last resort: convert to Blob
        console.warn('[AI Processing] File is not a Blob instance, converting...');
        const blob = new Blob([imageFileWithoutExif], { type: imageFileWithoutExif.type || 'image/jpeg' });
        formData.append('customer_image', blob, imageFileWithoutExif.name || 'image.jpg');
      }
    } catch (formDataError) {
      console.error('[AI Processing] Failed to append file to FormData:', formDataError);
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: 0,
        confidence: 0,
        error: 'خطا در آماده‌سازی فایل برای ارسال',
      };
    }

    // Debug FormData contents
    console.log('[AI Processing] FormData contents:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else if (value instanceof Blob) {
        console.log(`  ${key}: Blob(${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    // Verify file was appended to FormData
    const fileInFormData = formData.get('customer_image');
    if (!fileInFormData) {
      console.error('[AI Processing] فایل به FormData اضافه نشد');
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: 0,
        confidence: 0,
        error: 'خطا در آماده‌سازی فایل برای ارسال',
      };
    }

    // Check if it's a Blob/File and has content
    if (fileInFormData instanceof Blob && fileInFormData.size === 0) {
      console.error('[AI Processing] فایل در FormData خالی است', {
        type: fileInFormData.type,
        size: fileInFormData.size
      });
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: 0,
        confidence: 0,
        error: 'خطا در آماده‌سازی فایل برای ارسال - فایل خالی است',
      };
    }

    console.log('[AI Processing] FormData validation passed:', {
      hasFile: !!fileInFormData,
      fileSize: fileInFormData instanceof Blob ? fileInFormData.size : 'unknown',
      fileType: fileInFormData instanceof Blob ? fileInFormData.type : 'unknown'
    });

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
    ImageProcessingScope.trackStep('api_request_start', { url: fullUrl });
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
    
    ImageProcessingScope.trackStep('api_response_received', {
      success: response.success,
      status: response.status
    });
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
      ImageProcessingScope.trackAuthError('Token expired or invalid');
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

    // Handle 429 rate limit error - DO NOT retry
    if (response.status === 429 && response.isRateLimited) {
      console.log('[AI Processing] محدودیت تعداد درخواست رسیده است');
      ImageProcessingScope.trackRateLimit(
        response.rateLimitInfo?.retryAfter || 0,
        response.rateLimitInfo?.message || 'Rate limit exceeded'
      );
      return {
        success: false,
        visualizedImageUrl: '',
        originalImageUrl: '',
        processingTime: Math.round(processingTime),
        confidence: 0,
        error: response.error || 'محدودیت تعداد درخواست رسیده است',
        status: 429,
        isRateLimited: true,
        rateLimitInfo: response.rateLimitInfo,
      };
    }

    if (response.success && response.data) {
      // Backend returns image_path (relative path)
      const imagePath = response.data.image_path;

      if (!imagePath || imagePath.length === 0) {
        console.error('[AI Processing] image_path is empty despite success status');
        return {
          success: false,
          visualizedImageUrl: '',
          originalImageUrl: '',
          processingTime: Math.round(processingTime),
          confidence: 0,
          error: 'سرور مسیر تصویر را برنگرداند',
        };
      }

      // Construct full URL using backend endpoint for serving images
      const imageEndpoint = API_CONFIG.ENDPOINTS.IMAGE_SERVE(imagePath);
      console.log('[AI Processing] Fetching image from endpoint:', imageEndpoint);
      ImageProcessingScope.trackStep('blob_fetch_start', { imagePath });

      // Fetch image as blob URL through backend
      const visualizedImageUrl = await apiGetImageBlob(imageEndpoint) || '';
      ImageProcessingScope.trackStep('blob_fetch_complete', { success: !!visualizedImageUrl });

      if (!visualizedImageUrl) {
        console.error('[AI Processing] Failed to fetch image blob');
        return {
          success: false,
          visualizedImageUrl: '',
          originalImageUrl: '',
          processingTime: Math.round(processingTime),
          confidence: 0,
          error: 'خطا در دریافت تصویر از سرور',
        };
      }

      // Original image URL - we don't need it anymore (backend deletes customer image after processing)
      const originalImageUrl = '';

      const processedImageId = response.data.image_id;

      console.log('[AI Processing] تصویر با موفقیت پردازش شد:', {
        productId: request.productId,
        processingTime: Math.round(processingTime),
        processedImageId,
        imagePath: imagePath,
        blobUrl: visualizedImageUrl,
      });

      // Track successful completion
      ImageProcessingScope.trackSuccess({
        processingTime: Math.round(processingTime),
        imageId: processedImageId || 0,
        imagePath: imagePath,
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
      ImageProcessingScope.trackApiError(
        response.status || 500,
        response.error || 'Server processing error',
        { responseData: response.data }
      );
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

    // Track the error in Sentry
    const errorObj = error instanceof Error ? error : new Error(String(error));
    ImageProcessingScope.trackError(errorObj, {
      step: 'processing_exception',
      productId: parseInt(request.productId.replace('prod_', '')) || 0,
      fileName: request.imageFile?.name,
      fileSize: request.imageFile?.size,
      retryCount,
      errorMessage: errorObj.message,
    });
    
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
