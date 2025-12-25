/**
 * Discovery Flow Processing Service
 * Handles AI-powered room analysis and furniture recommendations
 *
 * Uses the Session API:
 * 1. POST /api/recommendations/sessions/ - Create session
 * 2. GET /api/recommendations/sessions/{session_id}/ - Poll status
 */

import { apiPost, apiGet } from '../services/api';
import { stripExifData } from './stripExif';
import type {
  DiscoveryRequest,
  DiscoveryResult,
  DiscoveryResultWithQuestions,
  ProductRecommendation,
  ProcessingStep,
  BackendSessionResponse,
  BackendSessionCreateResponse,
  BackendMatchedProduct,
  BackendSessionItem,
  SessionStatus,
  DiscoveryRateLimitError,
  GroupedRecommendations,
  DiscoveryQuestionsPayload,
  DiscoveryAnswers,
} from '../types/discovery';

// Polling configuration
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_TIME = 300000; // 5 minutes

// Item type display labels (Persian)
const ITEM_TYPE_LABELS: Record<string, string> = {
  'rug': 'فرش و قالی',
  'Rug': 'فرش و قالی',
  'carpet': 'فرش و قالی',
  'Carpet': 'فرش و قالی',
  'sofa': 'مبل و کاناپه',
  'Sofa': 'مبل و کاناپه',
  'couch': 'مبل و کاناپه',
  'Couch': 'مبل و کاناپه',
  'armchair': 'صندلی راحتی',
  'Armchair': 'صندلی راحتی',
  'chair': 'صندلی',
  'Chair': 'صندلی',
  'table': 'میز',
  'Table': 'میز',
  'coffee_table': 'میز جلو مبلی',
  'Coffee_table': 'میز جلو مبلی',
  'dining_table': 'میز ناهارخوری',
  'Dining_table': 'میز ناهارخوری',
  'bed': 'تخت خواب',
  'Bed': 'تخت خواب',
  'lamp': 'لامپ و روشنایی',
  'Lamp': 'لامپ و روشنایی',
  'curtain': 'پرده',
  'Curtain': 'پرده',
  'cushion': 'کوسن',
  'Cushion': 'کوسن',
  'pillow': 'بالش',
  'Pillow': 'بالش',
};

function getItemTypeDisplay(itemType: string): string {
  return ITEM_TYPE_LABELS[itemType] || ITEM_TYPE_LABELS[itemType.toLowerCase()] || itemType;
}

// AbortController for cancellation support
let currentAbortController: AbortController | null = null;

export interface DiscoveryProcessResponse {
  success: boolean;
  result?: DiscoveryResultWithQuestions;
  processingTime: number;
  error?: string;
  errorCode?: string;
  status?: number;
  requiresLogin?: boolean;
  isRateLimited?: boolean;
  rateLimitInfo?: DiscoveryRateLimitError;
  // Indicates session paused waiting for user to answer questions
  waitingForAnswers?: boolean;
}

/**
 * Response type for submitting answers
 */
export interface SubmitAnswersResponse {
  success: boolean;
  status?: SessionStatus;
  error?: string;
  requiresLogin?: boolean;
}

export interface DiscoveryProgressCallback {
  (step: ProcessingStep, progress: number): void;
}

/**
 * Map backend matched product to frontend ProductRecommendation
 * Optionally includes Persian explanation fields from the parent session item
 */
function mapProduct(
  product: BackendMatchedProduct,
  itemContext?: BackendSessionItem
): ProductRecommendation {
  return {
    id: product.id,
    name: product.name,
    imageUrl: product.image_url,
    matchScore: Math.round(product.match_score * 100), // Convert 0-1 to 0-100
    price: product.price,
    currency: product.currency,
    shopName: product.shop_name,
    uniqueLink: product.unique_link,
    category: product.category,
    categoryDisplay: product.category_display,
    // Smart Redesign Flow: Persian explanations from item context
    persianReason: itemContext?.persian_reason,
    matchHighlights: itemContext?.match_highlights,
    replacesItem: itemContext?.replaces_item,
  };
}

/**
 * Extract all product recommendations from session items
 * Includes Persian explanations from item context
 */
function extractRecommendations(items: BackendSessionItem[]): ProductRecommendation[] {
  const allProducts: ProductRecommendation[] = [];

  for (const item of items) {
    for (const product of item.matched_products) {
      // Pass item context to include Persian explanations
      allProducts.push(mapProduct(product, item));
    }
  }

  // Sort by match score (highest first) and remove duplicates
  const uniqueProducts = allProducts.reduce((acc, product) => {
    if (!acc.find(p => p.id === product.id)) {
      acc.push(product);
    }
    return acc;
  }, [] as ProductRecommendation[]);

  return uniqueProducts.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Extract product recommendations grouped by item type (category)
 * Includes Persian explanations from item context
 */
function extractGroupedRecommendations(items: BackendSessionItem[]): GroupedRecommendations[] {
  return items
    .map(item => ({
      itemType: item.item_type,
      itemTypeDisplay: getItemTypeDisplay(item.item_type),
      products: item.matched_products
        // Pass item context to include Persian explanations
        .map(product => mapProduct(product, item))
        .sort((a, b) => b.matchScore - a.matchScore),
    }))
    .filter(group => group.products.length > 0);
}

/**
 * Create a new session by uploading a room photo
 */
async function createSession(
  request: DiscoveryRequest
): Promise<{ sessionId: string; status: SessionStatus } | { error: string; status?: number; requiresLogin?: boolean; isRateLimited?: boolean; rateLimitInfo?: DiscoveryRateLimitError }> {
  // Validate request
  if (!request.image) {
    console.error('[Discovery] image file is missing');
    return { error: 'فایل تصویر یافت نشد' };
  }

  // Strip EXIF data for privacy
  console.log('[Discovery] Stripping EXIF metadata from image...');
  let imageFileWithoutExif: File;

  try {
    imageFileWithoutExif = await stripExifData(request.image);
  } catch (stripError) {
    console.error('[Discovery] EXIF stripping failed:', stripError);
    imageFileWithoutExif = request.image;
  }

  // Validate file after EXIF stripping
  if (!imageFileWithoutExif || imageFileWithoutExif.size === 0) {
    console.error('[Discovery] Image is empty after EXIF stripping');
    return { error: 'خطا در پردازش تصویر - فایل نامعتبر است' };
  }

  // Create FormData per API spec
  const formData = new FormData();

  try {
    if (imageFileWithoutExif instanceof Blob) {
      formData.append('room_image', imageFileWithoutExif, imageFileWithoutExif.name || 'image.jpg');
    } else {
      const blob = new Blob([imageFileWithoutExif], { type: imageFileWithoutExif.type || 'image/jpeg' });
      formData.append('room_image', blob, imageFileWithoutExif.name || 'image.jpg');
    }
  } catch (formDataError) {
    console.error('[Discovery] Failed to append file to FormData:', formDataError);
    return { error: 'خطا در آماده‌سازی فایل برای ارسال' };
  }

  // Add optional parameters per API spec
  if (request.userNotes) {
    formData.append('user_notes', request.userNotes);
  }

  // Debug FormData contents
  console.log('[Discovery] FormData contents:');
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
    } else if (value instanceof Blob) {
      console.log(`  ${key}: Blob(${value.size} bytes, ${value.type})`);
    } else {
      console.log(`  ${key}:`, value);
    }
  }

  // Create session via POST /api/recommendations/sessions/
  const endpoint = '/api/recommendations/sessions/';
  console.log('[Discovery] Creating session at:', endpoint);

  const response = await apiPost<BackendSessionCreateResponse['data']>(endpoint, formData);

  console.log('[Discovery] Create session response:', {
    success: response.success,
    status: response.status,
    error: response.error,
    hasData: !!response.data,
  });

  // Handle error responses
  if (response.status === 401 && response.requiresLogin) {
    return {
      error: response.error || 'نشست شما منقضی شده است',
      status: 401,
      requiresLogin: true,
    };
  }

  if (response.status === 429 && response.isRateLimited) {
    return {
      error: response.error || 'محدودیت تعداد درخواست رسیده است',
      status: 429,
      isRateLimited: true,
      rateLimitInfo: response.rateLimitInfo as DiscoveryRateLimitError,
    };
  }

  if (!response.success || !response.data) {
    return {
      error: response.error || 'خطا در ایجاد جلسه',
      status: response.status,
    };
  }

  return {
    sessionId: response.data.session_id,
    status: response.data.status,
  };
}

/**
 * Poll session status until ready, questions_ready, or failed
 * Returns early with questions if status = 'questions_ready'
 */
async function pollSession(
  sessionId: string,
  onProgress?: DiscoveryProgressCallback,
  abortSignal?: AbortSignal,
  skipQuestionsReady: boolean = false
): Promise<DiscoveryResultWithQuestions> {
  const startTime = Date.now();
  const endpoint = `/api/recommendations/sessions/${sessionId}/`;

  console.log('[Discovery] Starting to poll session:', sessionId, { skipQuestionsReady });

  let lastStatus: SessionStatus = 'pending';

  while (Date.now() - startTime < MAX_POLL_TIME) {
    // Check for cancellation
    if (abortSignal?.aborted) {
      console.log('[Discovery] Polling cancelled by user');
      throw new Error('درخواست لغو شد');
    }

    // Poll session status
    const response = await apiGet<BackendSessionResponse['data']>(endpoint);

    if (!response.success) {
      // Handle errors during polling
      if (response.status === 401 && response.requiresLogin) {
        throw new Error('نشست شما منقضی شده است. لطفاً دوباره وارد شوید');
      }
      if (response.status === 404) {
        throw new Error('جلسه یافت نشد');
      }
      console.error('[Discovery] Poll error:', response.error);
      throw new Error(response.error || 'خطا در دریافت وضعیت جلسه');
    }

    const data = response.data;
    const currentStatus = data.status;

    // Log status change
    if (currentStatus !== lastStatus) {
      console.log('[Discovery] Status changed:', lastStatus, '->', currentStatus);
      lastStatus = currentStatus;
    }

    // Map API status to UI progress steps
    // API: pending -> analyzing -> questions_ready -> generating -> matching -> ready
    // UI: upload -> analysis -> (questions UI) -> matching -> generation
    switch (currentStatus) {
      case 'pending':
        onProgress?.('upload', 100);
        break;

      case 'analyzing':
        onProgress?.('analysis', 50);
        break;

      case 'questions_ready':
        // Return early with questions for user to answer
        // Unless we're resuming after answers (skipQuestionsReady = true)
        if (!skipQuestionsReady) {
          onProgress?.('analysis', 100);
          onProgress?.('questions', 50); // Show questions step as active
          console.log('[Discovery] Questions ready, returning for user input');

          const questionsResult: DiscoveryResultWithQuestions = {
            sessionId: data.session_id,
            originalImageUrl: '',
            processedImageUrl: undefined,
            recommendations: [],
            groupedRecommendations: [],
            roomAnalysis: undefined,
            status: 'questions_ready',
            discoveryQuestions: data.discovery_questions,
          };

          console.log('[Discovery] Questions payload:', {
            sessionId: questionsResult.sessionId,
            hasQuestions: !!questionsResult.discoveryQuestions,
            questionCount: questionsResult.discoveryQuestions?.questions?.length || 0,
          });

          return questionsResult;
        }
        // If skipQuestionsReady, continue polling
        break;

      case 'generating':
        onProgress?.('analysis', 100);
        onProgress?.('questions', 100); // Questions answered
        onProgress?.('matching', 25);
        break;

      case 'matching':
        onProgress?.('questions', 100); // Questions answered
        onProgress?.('matching', 75);
        break;

      case 'ready':
        onProgress?.('generation', 100);

        // Map the response to DiscoveryResult
        console.log('[Discovery] Session ready, mapping results');

        const recommendations = data.items ? extractRecommendations(data.items) : [];
        const groupedRecommendations = data.items ? extractGroupedRecommendations(data.items) : [];

        const result: DiscoveryResultWithQuestions = {
          sessionId: data.session_id,
          originalImageUrl: '', // Original image not returned by API
          processedImageUrl: data.redesigned_image_url,
          recommendations,
          groupedRecommendations,
          roomAnalysis: undefined, // Session API doesn't return room analysis in the same format
          status: 'ready',
        };

        console.log('[Discovery] Mapped result:', {
          sessionId: result.sessionId,
          recommendationsCount: result.recommendations.length,
          groupedCount: result.groupedRecommendations?.length || 0,
          hasProcessedImage: !!result.processedImageUrl,
          itemsCount: data.items?.length || 0,
        });

        return result;

      case 'failed':
        console.error('[Discovery] Session failed');
        throw new Error('پردازش با خطا مواجه شد. لطفاً دوباره تلاش کنید');
    }

    // Wait before next poll
    await sleep(POLL_INTERVAL);
  }

  // Timeout reached
  console.error('[Discovery] Polling timeout after', MAX_POLL_TIME, 'ms');
  throw new Error('زمان پردازش تمام شد - لطفاً دوباره تلاش کنید');
}

/**
 * Helper function to sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process room image for AI-powered furniture discovery
 * Main entry point that orchestrates the session-based flow
 */
export async function processDiscoveryImage(
  request: DiscoveryRequest,
  onProgress?: DiscoveryProgressCallback,
  retryCount: number = 0
): Promise<DiscoveryProcessResponse> {
  const maxRetries = 2;
  const startTime = Date.now();

  // Create new AbortController for this request
  currentAbortController = new AbortController();
  const abortSignal = currentAbortController.signal;

  try {
    // Report progress: upload step starting
    onProgress?.('upload', 0);

    console.log('[Discovery] Starting image processing:', {
      fileName: request.image.name,
      fileSize: request.image.size,
      retryAttempt: retryCount + 1,
    });

    // Step 1: Create session (upload image)
    onProgress?.('upload', 50);

    const createResult = await createSession(request);

    // Check for error in session creation
    if ('error' in createResult) {
      console.error('[Discovery] Session creation failed:', createResult.error);
      return {
        success: false,
        processingTime: Date.now() - startTime,
        error: createResult.error,
        status: createResult.status,
        requiresLogin: createResult.requiresLogin,
        isRateLimited: createResult.isRateLimited,
        rateLimitInfo: createResult.rateLimitInfo,
      };
    }

    onProgress?.('upload', 100);
    console.log('[Discovery] Session created:', createResult.sessionId);

    // Step 2: Poll for results (may return early with questions)
    onProgress?.('analysis', 0);

    const result = await pollSession(
      createResult.sessionId,
      onProgress,
      abortSignal
    );

    const processingTime = Date.now() - startTime;

    // Check if we stopped at questions_ready
    if (result.status === 'questions_ready') {
      console.log('[Discovery] Paused for questions:', {
        processingTime: Math.round(processingTime),
        questionCount: result.discoveryQuestions?.questions?.length || 0,
      });

      return {
        success: true,
        result,
        processingTime: Math.round(processingTime),
        waitingForAnswers: true,
      };
    }

    console.log('[Discovery] Processing complete:', {
      processingTime: Math.round(processingTime),
      recommendationsCount: result.recommendations.length,
    });

    return {
      success: true,
      result,
      processingTime: Math.round(processingTime),
    };
  } catch (error) {
    console.error('[Discovery] Processing exception:', error);

    // Check for cancellation
    if (error instanceof Error && error.message === 'درخواست لغو شد') {
      return {
        success: false,
        processingTime: Date.now() - startTime,
        error: 'درخواست لغو شد',
      };
    }

    // Check if we should retry
    const shouldRetry =
      retryCount < maxRetries &&
      error instanceof Error &&
      (error.message.includes('NS_BINDING_ABORTED') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('اتصال قطع شد') ||
        error.message.includes('خطا در اتصال به سرور'));

    if (shouldRetry) {
      console.log(`[Discovery] Retrying (${retryCount + 1}/${maxRetries}):`, error.message);

      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      await sleep(delay);

      return processDiscoveryImage(request, onProgress, retryCount + 1);
    }

    let persianError = 'خطای ناشناخته در پردازش تصویر';

    if (error instanceof Error) {
      if (error.message.includes('NS_BINDING_ABORTED')) {
        persianError = 'اتصال به سرور قطع شد - لطفاً اتصال اینترنت خود را بررسی کنید';
      } else if (error.message.includes('Failed to fetch')) {
        persianError = 'خطا در اتصال به سرور - لطفاً دوباره تلاش کنید';
      } else if (error.message.includes('اتصال قطع شد')) {
        persianError = 'اتصال قطع شد - لطفاً اتصال اینترنت خود را بررسی کنید';
      } else if (error.message.includes('خطا در اتصال به سرور')) {
        persianError = 'خطا در اتصال به سرور - لطفاً دوباره تلاش کنید';
      } else {
        // Use the error message directly if it's already in Persian
        persianError = error.message;
      }
    }

    return {
      success: false,
      processingTime: Date.now() - startTime,
      error: persianError,
    };
  } finally {
    // Clean up AbortController
    currentAbortController = null;
  }
}

/**
 * Cancel an ongoing discovery request
 */
export function cancelDiscoveryRequest(): void {
  if (currentAbortController) {
    console.log('[Discovery] Cancelling request');
    currentAbortController.abort();
    currentAbortController = null;
  } else {
    console.log('[Discovery] No active request to cancel');
  }
}

/**
 * Submit answers to discovery questions (Phase 1 → Phase 2)
 * POST /api/recommendations/sessions/{session_id}/answers/
 */
export async function submitDiscoveryAnswers(
  sessionId: string,
  answers: DiscoveryAnswers
): Promise<SubmitAnswersResponse> {
  const endpoint = `/api/recommendations/sessions/${sessionId}/answers/`;

  console.log('[Discovery] Submitting answers:', {
    sessionId,
    answerCount: Object.keys(answers).length,
    answers,
  });

  try {
    const response = await apiPost<{ session_id: string; status: SessionStatus }>(
      endpoint,
      { answers }
    );

    console.log('[Discovery] Submit answers response:', {
      success: response.success,
      status: response.status,
      error: response.error,
      data: response.data,
    });

    if (response.status === 401 && response.requiresLogin) {
      return {
        success: false,
        error: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید',
        requiresLogin: true,
      };
    }

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'خطا در ارسال پاسخ‌ها',
      };
    }

    return {
      success: true,
      status: response.data?.status,
    };
  } catch (error) {
    console.error('[Discovery] Submit answers exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطا در ارسال پاسخ‌ها',
    };
  }
}

/**
 * Continue polling after answers are submitted (Phase 2)
 * Skips questions_ready check since answers were already submitted
 */
export async function pollSessionAfterAnswers(
  sessionId: string,
  onProgress?: DiscoveryProgressCallback
): Promise<DiscoveryProcessResponse> {
  const startTime = Date.now();

  // Create new AbortController for this request
  currentAbortController = new AbortController();
  const abortSignal = currentAbortController.signal;

  try {
    console.log('[Discovery] Resuming polling after answers:', sessionId);

    // Mark questions as complete since answers were submitted
    onProgress?.('analysis', 100);
    onProgress?.('questions', 100);
    onProgress?.('matching', 0);

    // Poll with skipQuestionsReady = true to continue past questions_ready
    const result = await pollSession(
      sessionId,
      onProgress,
      abortSignal,
      true // skipQuestionsReady
    );

    const processingTime = Date.now() - startTime;

    console.log('[Discovery] Phase 2 complete:', {
      processingTime: Math.round(processingTime),
      recommendationsCount: result.recommendations.length,
    });

    return {
      success: true,
      result,
      processingTime: Math.round(processingTime),
    };
  } catch (error) {
    console.error('[Discovery] Phase 2 polling exception:', error);

    let persianError = 'خطای ناشناخته در پردازش';

    if (error instanceof Error) {
      if (error.message === 'درخواست لغو شد') {
        return {
          success: false,
          processingTime: Date.now() - startTime,
          error: 'درخواست لغو شد',
        };
      }
      persianError = error.message;
    }

    return {
      success: false,
      processingTime: Date.now() - startTime,
      error: persianError,
    };
  } finally {
    currentAbortController = null;
  }
}

/**
 * Fetch an existing session by ID
 * Used for URL-based session recovery (e.g., after page refresh or sharing)
 */
export async function fetchDiscoverySession(
  sessionId: string
): Promise<DiscoveryProcessResponse> {
  const endpoint = `/api/recommendations/sessions/${sessionId}/`;

  console.log('[Discovery] Fetching session:', sessionId);

  try {
    const response = await apiGet<BackendSessionResponse['data']>(endpoint);

    if (!response.success || !response.data) {
      console.error('[Discovery] Fetch session failed:', response.error);
      return {
        success: false,
        processingTime: 0,
        error: response.error || 'جلسه یافت نشد',
        status: response.status,
        requiresLogin: response.requiresLogin,
      };
    }

    const data = response.data;

    // Handle questions_ready status - return questions for user to answer
    if (data.status === 'questions_ready' && data.discovery_questions) {
      console.log('[Discovery] Session has questions ready:', {
        sessionId: data.session_id,
        questionCount: data.discovery_questions.questions?.length || 0,
      });

      const questionsResult: DiscoveryResultWithQuestions = {
        sessionId: data.session_id,
        originalImageUrl: '',
        processedImageUrl: undefined,
        recommendations: [],
        groupedRecommendations: [],
        roomAnalysis: undefined,
        status: 'questions_ready',
        discoveryQuestions: data.discovery_questions,
      };

      return {
        success: true,
        result: questionsResult,
        processingTime: 0,
        waitingForAnswers: true,
      };
    }

    // Handle processing states (pending, analyzing, generating, matching)
    // Return success with the status so UI can show processing state and poll
    if (data.status !== 'ready' && data.status !== 'failed') {
      console.log('[Discovery] Session still processing:', data.status);

      // Return a partial result with status so UI knows to show processing
      const processingResult: DiscoveryResultWithQuestions = {
        sessionId: data.session_id,
        originalImageUrl: '',
        processedImageUrl: undefined,
        recommendations: [],
        groupedRecommendations: [],
        roomAnalysis: undefined,
        status: data.status,
      };

      return {
        success: true,
        result: processingResult,
        processingTime: 0,
      };
    }

    // Handle failed status
    if (data.status === 'failed') {
      console.log('[Discovery] Session failed');
      return {
        success: false,
        processingTime: 0,
        error: 'پردازش با خطا مواجه شد',
      };
    }

    // Map backend products to frontend using existing functions
    const recommendations = data.items
      ? extractRecommendations(data.items)
      : [];
    const groupedRecommendations = data.items
      ? extractGroupedRecommendations(data.items)
      : [];

    const result: DiscoveryResultWithQuestions = {
      sessionId: data.session_id,
      originalImageUrl: '',
      processedImageUrl: data.redesigned_image_url,
      recommendations,
      groupedRecommendations,
      roomAnalysis: undefined,
      status: 'ready', // Include status so UI knows session is complete
    };

    console.log('[Discovery] Fetched session successfully:', {
      sessionId: result.sessionId,
      recommendationsCount: result.recommendations.length,
      groupedCount: result.groupedRecommendations?.length || 0,
      hasProcessedImage: !!result.processedImageUrl,
    });

    return {
      success: true,
      result,
      processingTime: 0,
    };
  } catch (error) {
    console.error('[Discovery] Fetch session exception:', error);
    return {
      success: false,
      processingTime: 0,
      error: error instanceof Error ? error.message : 'خطا در دریافت جلسه',
    };
  }
}
