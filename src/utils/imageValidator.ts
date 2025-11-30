/**
 * Image Blob Validator
 *
 * Validates that a blob is a readable image by attempting to load it.
 * This catches corrupted canvas output before sending to backend.
 *
 * Used primarily in stripExif.ts to validate canvas.toBlob() output.
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  width?: number;
  height?: number;
}

/**
 * Validates that a blob is a readable image
 *
 * @param blob - The blob to validate
 * @param timeout - Max validation time in ms (default: 5000)
 * @returns Validation result with dimensions and error details
 *
 * @example
 * ```typescript
 * const validation = await validateImageBlob(blob);
 * if (!validation.isValid) {
 *   console.error('Invalid blob:', validation.error);
 *   // Fallback to original file
 * }
 * ```
 */
export async function validateImageBlob(
  blob: Blob,
  timeout: number = 5000
): Promise<ImageValidationResult> {
  // Create object URL from blob
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = new Image();

    // Wait for image to load with timeout
    const result = await Promise.race([
      // Image load promise
      new Promise<{ isValid: boolean; width: number; height: number }>((resolve, reject) => {
        image.onload = () => {
          resolve({
            isValid: true,
            width: image.naturalWidth || image.width,
            height: image.naturalHeight || image.height
          });
        };

        image.onerror = (e) => {
          reject(new Error('Failed to load blob as image'));
        };

        image.src = objectUrl;
      }),

      // Timeout promise
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Image validation timeout')), timeout);
      })
    ]);

    return result;

  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  } finally {
    // Always cleanup object URL to prevent memory leaks
    URL.revokeObjectURL(objectUrl);
  }
}
