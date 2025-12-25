/**
 * Gallery Types
 *
 * Types for the social proof gallery feature where users can share
 * their try-on images for community viewing.
 */

/**
 * Gallery image from approved user submissions
 */
export interface GalleryImage {
  id: string;
  imageUrl: string;
  roomType: string;
  roomStyle: string;
  dominantColors: string[];
  createdAt: string;
}

/**
 * Backend API response for gallery images
 * GET /api/recommendations/gallery/product/{id}/
 */
export interface GalleryResponse {
  results: GalleryImage[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

/**
 * Request body for submitting try-on to gallery
 * POST /api/recommendations/gallery/submit/
 */
export interface GallerySubmissionRequest {
  sessionId: string;
  itemId: number;
}

/**
 * Response from gallery submission
 */
export interface GallerySubmissionResponse {
  success: boolean;
  message: string;
  submissionId?: string;
}

/**
 * Backend response shape (snake_case) for gallery images
 */
export interface BackendGalleryImage {
  id: string;
  image_url: string;
  room_type: string;
  room_style: string;
  dominant_colors: string[];
  created_at: string;
}

/**
 * Backend response shape for gallery list
 */
export interface BackendGalleryResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: BackendGalleryImage[];
  };
}

/**
 * Transform backend gallery image to frontend format
 */
export function mapBackendGalleryImage(backend: BackendGalleryImage): GalleryImage {
  return {
    id: backend.id,
    imageUrl: backend.image_url,
    roomType: backend.room_type,
    roomStyle: backend.room_style,
    dominantColors: backend.dominant_colors,
    createdAt: backend.created_at,
  };
}
