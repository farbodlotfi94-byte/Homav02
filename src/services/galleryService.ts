/**
 * Gallery Service
 *
 * Handles gallery-related API calls for the social proof feature.
 * Users can submit their try-on images to a public gallery after moderation.
 */

import { apiGet, apiPost } from './api';
import type {
  GalleryResponse,
  GalleryImage,
  GallerySubmissionRequest,
  GallerySubmissionResponse,
  BackendGalleryResponse,
  mapBackendGalleryImage,
} from '../types/gallery';

/**
 * Fetch approved gallery images for a specific product
 *
 * @param productId - The product ID to get gallery images for
 * @param page - Page number for pagination (default: 1)
 * @returns Gallery response with images or null on error
 */
export async function getProductGallery(
  productId: number,
  page: number = 1
): Promise<GalleryResponse | null> {
  console.log('[Gallery] Fetching gallery for product:', productId, 'page:', page);

  const response = await apiGet<BackendGalleryResponse['data']>(
    `/api/recommendations/gallery/product/${productId}/`,
    { page }
  );

  if (response.success && response.data) {
    const { count, next, previous, results } = response.data;

    // Map backend response to frontend format
    const mappedResults: GalleryImage[] = results.map((item) => ({
      id: item.id,
      imageUrl: item.image_url,
      roomType: item.room_type,
      roomStyle: item.room_style,
      dominantColors: item.dominant_colors,
      createdAt: item.created_at,
    }));

    console.log('[Gallery] Fetched', mappedResults.length, 'images');

    return {
      results: mappedResults,
      count,
      next,
      previous,
    };
  }

  console.error('[Gallery] Failed to fetch gallery:', response.error);
  return null;
}

/**
 * Submit a try-on image to the gallery for moderation
 *
 * @param submission - The submission details (sessionId, itemId)
 * @returns Submission response with success status and message
 */
export async function submitToGallery(
  submission: GallerySubmissionRequest
): Promise<GallerySubmissionResponse> {
  console.log('[Gallery] Submitting to gallery:', submission);

  const response = await apiPost<{ submission_id?: string }>(
    '/api/recommendations/gallery/submit/',
    {
      session_id: submission.sessionId,
      item_id: submission.itemId,
    }
  );

  if (response.success) {
    console.log('[Gallery] Submission successful:', response.data);
    return {
      success: true,
      message: 'تصویر شما برای بررسی ارسال شد',
      submissionId: response.data?.submission_id,
    };
  }

  // Handle specific error cases
  if (response.status === 409) {
    return {
      success: false,
      message: 'این تصویر قبلا ارسال شده است',
    };
  }

  if (response.status === 404) {
    return {
      success: false,
      message: 'جلسه یا تصویر یافت نشد',
    };
  }

  console.error('[Gallery] Submission failed:', response.error);
  return {
    success: false,
    message: response.error || 'خطا در ارسال تصویر به گالری',
  };
}

/**
 * Get Persian label for room type
 */
export function getRoomTypeLabel(roomType: string): string {
  const labels: Record<string, string> = {
    living_room: 'اتاق نشیمن',
    living: 'اتاق نشیمن',
    bedroom: 'اتاق خواب',
    dining_room: 'اتاق غذاخوری',
    dining: 'اتاق غذاخوری',
    reception: 'پذیرایی',
    office: 'دفتر کار',
    kitchen: 'آشپزخانه',
    hallway: 'راهرو',
    entryway: 'ورودی',
    nursery: 'اتاق کودک',
  };
  return labels[roomType] || roomType;
}

/**
 * Get Persian label for room style
 */
export function getRoomStyleLabel(roomStyle: string): string {
  const labels: Record<string, string> = {
    modern: 'مدرن',
    contemporary: 'معاصر',
    classic: 'کلاسیک',
    minimal: 'مینیمال',
    minimalist: 'مینیمال',
    boho: 'بوهو',
    bohemian: 'بوهو',
    scandinavian: 'اسکاندیناوی',
    traditional: 'سنتی',
    persian: 'سنتی ایرانی',
    industrial: 'صنعتی',
    rustic: 'روستیک',
    vintage: 'وینتیج',
    eclectic: 'التقاطی',
  };
  return labels[roomStyle] || roomStyle;
}
