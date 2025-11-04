/**
 * Utility to strip EXIF metadata from images
 * This prevents the backend from automatically rotating images based on EXIF orientation
 */

/**
 * Strips EXIF data from an image file by re-encoding it via Canvas
 * This preserves the original pixel data without EXIF metadata
 * @param file - The image File to strip EXIF from
 * @returns Promise<File> - New File object without EXIF data
 */
export async function stripExifData(file: File): Promise<File> {
  console.log('[stripExif] Starting EXIF strip for:', file.name);

  try {
    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file);

    // Create image element
    const image = new Image();
    image.src = objectUrl;

    // Wait for image to load
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    // Create canvas with image dimensions
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw image to canvas (this removes EXIF data)
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context');
    }
    ctx.drawImage(image, 0, 0);

    // Clean up object URL
    URL.revokeObjectURL(objectUrl);

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }

          // Create new File object with original filename
          const newFile = new File([blob], file.name, {
            type: file.type,
            lastModified: file.lastModified
          });

          console.log('[stripExif] Successfully stripped EXIF. Original size:', file.size, 'New size:', newFile.size);
          resolve(newFile);
        },
        file.type, // Use original MIME type
        0.95 // Quality (0.95 to maintain good quality while reducing file size slightly)
      );
    });
  } catch (error) {
    console.error('[stripExif] Error stripping EXIF:', error);
    // If stripping fails, return original file
    console.warn('[stripExif] Returning original file due to error');
    return file;
  }
}
