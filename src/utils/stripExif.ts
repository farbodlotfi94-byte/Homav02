/**
 * Utility to strip EXIF metadata from images
 * This prevents the backend from automatically rotating images based on EXIF orientation
 *
 * Cross-browser/device compatibility:
 * - Handles HEIC/HEIF from iOS devices by converting to JPEG
 * - Provides File constructor fallback for older browsers
 * - Handles canvas size limits on mobile devices
 * - Validates output before returning
 */

// Maximum canvas dimensions for mobile browsers (Safari has ~16MP limit)
const MAX_CANVAS_DIMENSION = 4096;
const MAX_CANVAS_AREA = 16777216; // 4096 * 4096

/**
 * Determines the output MIME type for canvas.toBlob
 * Always returns a supported format (JPEG or PNG)
 */
function getOutputMimeType(originalType: string): string {
  const type = originalType.toLowerCase();

  // PNG for transparency support
  if (type === 'image/png') {
    return 'image/png';
  }

  // Always use JPEG for other formats (including HEIC, HEIF, WebP)
  // This ensures maximum browser compatibility
  return 'image/jpeg';
}

/**
 * Gets the file extension based on MIME type
 */
function getFileExtension(mimeType: string): string {
  if (mimeType === 'image/png') return '.png';
  return '.jpg';
}

/**
 * Updates filename with correct extension
 */
function updateFilename(originalName: string, mimeType: string): string {
  const ext = getFileExtension(mimeType);
  const baseName = originalName.replace(/\.[^/.]+$/, ''); // Remove original extension
  return baseName + ext;
}

/**
 * Creates a File object with fallback for browsers that don't support File constructor
 */
function createFile(blob: Blob, filename: string, mimeType: string, lastModified: number): File {
  try {
    // Try standard File constructor first
    return new File([blob], filename, {
      type: mimeType,
      lastModified: lastModified
    });
  } catch (e) {
    // Fallback for browsers without File constructor (older Safari, some Android)
    console.warn('[stripExif] File constructor not supported, using Blob fallback');

    // Create a Blob and add File-like properties
    const fileBlob = new Blob([blob], { type: mimeType }) as File;

    // Add File properties to the Blob
    Object.defineProperties(fileBlob, {
      name: {
        value: filename,
        writable: false
      },
      lastModified: {
        value: lastModified,
        writable: false
      }
    });

    return fileBlob;
  }
}

/**
 * Calculates scaled dimensions to fit within canvas limits
 */
function calculateScaledDimensions(
  width: number,
  height: number
): { width: number; height: number; scaled: boolean } {
  let newWidth = width;
  let newHeight = height;
  let scaled = false;

  // Check if either dimension exceeds the maximum
  if (newWidth > MAX_CANVAS_DIMENSION || newHeight > MAX_CANVAS_DIMENSION) {
    const ratio = Math.min(
      MAX_CANVAS_DIMENSION / newWidth,
      MAX_CANVAS_DIMENSION / newHeight
    );
    newWidth = Math.floor(newWidth * ratio);
    newHeight = Math.floor(newHeight * ratio);
    scaled = true;
  }

  // Check if total area exceeds the maximum
  if (newWidth * newHeight > MAX_CANVAS_AREA) {
    const ratio = Math.sqrt(MAX_CANVAS_AREA / (newWidth * newHeight));
    newWidth = Math.floor(newWidth * ratio);
    newHeight = Math.floor(newHeight * ratio);
    scaled = true;
  }

  return { width: newWidth, height: newHeight, scaled };
}

/**
 * Strips EXIF data from an image file by re-encoding it via Canvas
 * This preserves the original pixel data without EXIF metadata
 *
 * Handles cross-browser and cross-device compatibility:
 * - iOS HEIC/HEIF → converts to JPEG
 * - Large images → scales down to fit canvas limits
 * - Old browsers → File constructor fallback
 *
 * @param file - The image File to strip EXIF from
 * @returns Promise<File> - New File object without EXIF data
 */
export async function stripExifData(file: File): Promise<File> {
  console.log('[stripExif] Starting EXIF strip for:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  let objectUrl: string | null = null;

  try {
    // Create object URL for the file
    objectUrl = URL.createObjectURL(file);

    // Create image element
    const image = new Image();

    // Set crossOrigin to handle potential CORS issues
    image.crossOrigin = 'anonymous';

    // Wait for image to load with timeout
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 30000); // 30 second timeout

      image.onload = () => {
        clearTimeout(timeout);
        resolve();
      };

      image.onerror = (e) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image: ${e}`));
      };

      image.src = objectUrl!;
    });

    // Calculate dimensions respecting canvas limits
    const { width, height, scaled } = calculateScaledDimensions(
      image.naturalWidth || image.width,
      image.naturalHeight || image.height
    );

    if (scaled) {
      console.log('[stripExif] Image scaled for canvas limits:', {
        original: `${image.naturalWidth}x${image.naturalHeight}`,
        scaled: `${width}x${height}`
      });
    }

    // Create canvas with calculated dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // Draw image to canvas (this removes EXIF data)
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context');
    }

    // Use high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(image, 0, 0, width, height);

    // Determine output MIME type (always use supported format)
    const outputMimeType = getOutputMimeType(file.type);
    const outputFilename = updateFilename(file.name, outputMimeType);

    // Quality setting (0.92 for JPEG, 1.0 for PNG)
    const quality = outputMimeType === 'image/png' ? 1.0 : 0.92;

    console.log('[stripExif] Converting to:', {
      originalType: file.type,
      outputType: outputMimeType,
      outputFilename,
      quality
    });

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('toBlob timeout - canvas may be too large'));
      }, 10000); // 10 second timeout for toBlob

      canvas.toBlob(
        (blob) => {
          clearTimeout(timeoutId);

          if (!blob) {
            console.error('[stripExif] toBlob returned null', {
              mimeType: outputMimeType,
              canvasSize: `${canvas.width}x${canvas.height}`
            });
            reject(new Error(`Failed to create blob from canvas (${outputMimeType})`));
            return;
          }

          if (blob.size === 0) {
            console.error('[stripExif] toBlob returned empty blob');
            reject(new Error('Created blob is empty'));
            return;
          }

          // Create new File object with fallback for old browsers
          const newFile = createFile(
            blob,
            outputFilename,
            outputMimeType,
            file.lastModified || Date.now()
          );

          // Validate the created file
          if (!newFile || newFile.size === 0) {
            console.error('[stripExif] Created file is invalid or empty');
            reject(new Error('Created file is invalid'));
            return;
          }

          console.log('[stripExif] Successfully stripped EXIF:', {
            originalSize: file.size,
            newSize: newFile.size,
            sizeChange: `${((newFile.size / file.size) * 100).toFixed(1)}%`,
            originalName: file.name,
            newName: newFile.name
          });

          resolve(newFile);
        },
        outputMimeType,
        quality
      );
    });
  } catch (error) {
    console.error('[stripExif] Error stripping EXIF:', error);

    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('[stripExif] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
    }

    // Return original file as fallback
    console.warn('[stripExif] Returning original file due to error');
    return file;
  } finally {
    // Always clean up object URL
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
