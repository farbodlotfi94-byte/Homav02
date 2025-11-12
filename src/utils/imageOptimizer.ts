import imageCompression from 'browser-image-compression';

/**
 * Image optimization configuration
 */
const OPTIMIZATION_CONFIG = {
  // Size threshold for optimization (500KB)
  SIZE_THRESHOLD: 500 * 1024,

  // Target quality (85-90%)
  QUALITY: 0.88,

  // Target max file size (400KB)
  MAX_SIZE_MB: 0.4,

  // WebP output type
  OUTPUT_TYPE: 'image/webp' as const,
};

/**
 * Check if image needs optimization
 * Returns true if:
 * - Image is not already WebP format, OR
 * - Image size exceeds threshold (500KB)
 */
function needsOptimization(file: File): boolean {
  const isNotWebP = file.type !== 'image/webp';
  const isLargeFile = file.size > OPTIMIZATION_CONFIG.SIZE_THRESHOLD;

  return isNotWebP || isLargeFile;
}

/**
 * Convert file to WebP format with specified quality
 */
async function convertToWebP(file: File): Promise<File> {
  try {
    const options = {
      maxSizeMB: OPTIMIZATION_CONFIG.MAX_SIZE_MB,
      maxWidthOrHeight: 2048, // Preserve reasonable dimensions
      useWebWorker: true,
      fileType: OPTIMIZATION_CONFIG.OUTPUT_TYPE,
      initialQuality: OPTIMIZATION_CONFIG.QUALITY,
    };

    console.log('[ImageOptimizer] Starting optimization:', {
      originalName: file.name,
      originalSize: (file.size / 1024).toFixed(2) + ' KB',
      originalType: file.type,
    });

    const compressedFile = await imageCompression(file, options);

    // Create a new File object with WebP extension
    const fileName = file.name.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp');
    const optimizedFile = new File([compressedFile], fileName, {
      type: OPTIMIZATION_CONFIG.OUTPUT_TYPE,
      lastModified: Date.now(),
    });

    console.log('[ImageOptimizer] Optimization complete:', {
      newName: optimizedFile.name,
      newSize: (optimizedFile.size / 1024).toFixed(2) + ' KB',
      newType: optimizedFile.type,
      reduction: (((file.size - optimizedFile.size) / file.size) * 100).toFixed(1) + '%',
    });

    return optimizedFile;
  } catch (error) {
    console.error('[ImageOptimizer] Optimization failed:', error);
    throw new Error('فشرده‌سازی تصویر با خطا مواجه شد');
  }
}

/**
 * Optimize image file for upload
 * - Checks if optimization is needed
 * - Converts to WebP format with high quality (85-90%)
 * - Reduces file size to ~200-400KB without significant quality loss
 * - Falls back to original file if optimization fails
 *
 * @param file - The image file to optimize
 * @param onProgress - Optional callback for progress updates (0-100)
 * @returns Optimized file or original file if no optimization needed
 */
export async function optimizeImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  try {
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('فایل باید یک تصویر باشد');
    }

    // Check if optimization is needed
    if (!needsOptimization(file)) {
      console.log('[ImageOptimizer] No optimization needed for:', file.name);
      return file;
    }

    // Report progress
    onProgress?.(10);

    // Convert to WebP
    onProgress?.(30);
    const optimizedFile = await convertToWebP(file);
    onProgress?.(100);

    return optimizedFile;
  } catch (error) {
    console.error('[ImageOptimizer] Error during optimization:', error);

    // Fallback to original file if optimization fails
    console.warn('[ImageOptimizer] Falling back to original file');
    return file;
  }
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بایت';

  const k = 1024;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
