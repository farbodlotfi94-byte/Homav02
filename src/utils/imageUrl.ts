/**
 * Image URL Utility
 *
 * Generates optimized image URLs with dynamic sizing for CDN caching.
 * Supports responsive images with width/height parameters and version-based cache busting.
 *
 * @example
 * // Basic usage
 * getImageUrl('products/abc.jpg')
 * // → 'https://api.example.com/api/products/images/products/abc.jpg'
 *
 * // With dimensions
 * getImageUrl('products/abc.jpg', { width: 400 })
 * // → 'https://api.example.com/api/products/images/products/abc.jpg?w=400'
 *
 * // With version for cache busting
 * getImageUrl('products/abc.jpg', { width: 400, version: 2 })
 * // → 'https://api.example.com/api/products/images/products/abc.jpg?w=400&v=2'
 */

import { API_CONFIG } from '../config/api';

/**
 * Image size presets for common display contexts.
 * Use these for consistent sizing across the app.
 */
export const IMAGE_SIZES = {
  /** Thumbnail/avatar: 80x80 */
  THUMBNAIL: { width: 80, height: 80 },
  /** Small card: 150px wide */
  SMALL: { width: 150 },
  /** Product card in grid: 300px wide */
  CARD: { width: 300 },
  /** Product card for mobile: 200px wide */
  CARD_MOBILE: { width: 200 },
  /** Medium preview: 500px wide */
  MEDIUM: { width: 500 },
  /** Detail view: 800px wide */
  DETAIL: { width: 800 },
  /** Large view: 1200px wide */
  LARGE: { width: 1200 },
  /** Full screen: 1920px wide */
  FULL: { width: 1920 },
} as const;

/**
 * Options for generating image URLs.
 */
export interface ImageUrlOptions {
  /** Target width in pixels (1-4096) */
  width?: number;
  /** Target height in pixels (1-4096) */
  height?: number;
  /** WebP quality 1-100 (default: 75) */
  quality?: number;
  /** Version number for cache busting */
  version?: number;
}

/**
 * Generate an optimized image URL with optional resizing parameters.
 *
 * The backend will:
 * - Resize images on-demand (never upscale, only downscale)
 * - Convert to WebP format automatically
 * - Cache resized variants in MinIO for subsequent requests
 * - Return with 1-year CDN cache headers
 *
 * @param imagePath - MinIO object path (e.g., "products/uuid-filename.jpg")
 * @param options - Optional sizing and cache parameters
 * @returns Full URL with query parameters, or empty string if no path
 */
export function getImageUrl(imagePath: string | undefined | null, options?: ImageUrlOptions): string {
  if (!imagePath) {
    return '';
  }

  // Build base URL
  const baseUrl = API_CONFIG.BASE_URL;
  let url = `${baseUrl}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(imagePath)}`;

  // Build query parameters
  const params: string[] = [];

  if (options?.width) {
    params.push(`w=${options.width}`);
  }
  if (options?.height) {
    params.push(`h=${options.height}`);
  }
  if (options?.quality && options.quality !== 75) {
    params.push(`q=${options.quality}`);
  }
  if (options?.version) {
    params.push(`v=${options.version}`);
  }

  if (params.length > 0) {
    url += '?' + params.join('&');
  }

  return url;
}

/**
 * Generate image URL using a preset size.
 *
 * @param imagePath - MinIO object path
 * @param preset - Size preset from IMAGE_SIZES
 * @param version - Optional version for cache busting
 * @returns Full URL with preset dimensions
 *
 * @example
 * getImageUrlPreset('products/abc.jpg', 'CARD', 2)
 * // → 'https://api.example.com/api/products/images/products/abc.jpg?w=300&v=2'
 */
export function getImageUrlPreset(
  imagePath: string | undefined | null,
  preset: keyof typeof IMAGE_SIZES,
  version?: number
): string {
  const size = IMAGE_SIZES[preset];
  return getImageUrl(imagePath, {
    ...size,
    version,
  });
}

/**
 * Generate srcset for responsive images.
 *
 * Creates a srcset with multiple sizes for different device pixel ratios.
 * Useful for responsive images with the `srcset` and `sizes` attributes.
 *
 * @param imagePath - MinIO object path
 * @param baseWidth - Base width for 1x display
 * @param version - Optional version for cache busting
 * @returns srcset string for use in img elements
 *
 * @example
 * <img
 *   src={getImageUrl(path, { width: 300, version })}
 *   srcSet={getResponsiveSrcset(path, 300, version)}
 *   sizes="(max-width: 640px) 200px, 300px"
 * />
 */
export function getResponsiveSrcset(
  imagePath: string | undefined | null,
  baseWidth: number,
  version?: number
): string {
  if (!imagePath) {
    return '';
  }

  // Generate 1x, 1.5x, and 2x versions
  const widths = [
    { width: baseWidth, descriptor: '1x' },
    { width: Math.round(baseWidth * 1.5), descriptor: '1.5x' },
    { width: Math.round(baseWidth * 2), descriptor: '2x' },
  ];

  return widths
    .map(({ width, descriptor }) => {
      const url = getImageUrl(imagePath, { width, version });
      return `${url} ${descriptor}`;
    })
    .join(', ');
}

/**
 * Generate srcset with pixel-width descriptors for use with `sizes` attribute.
 *
 * @param imagePath - MinIO object path
 * @param widths - Array of widths to generate
 * @param version - Optional version for cache busting
 * @returns srcset string with 'w' descriptors
 *
 * @example
 * <img
 *   src={getImageUrl(path, { width: 800, version })}
 *   srcSet={getSrcsetWidths(path, [400, 800, 1200], version)}
 *   sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
 * />
 */
export function getSrcsetWidths(
  imagePath: string | undefined | null,
  widths: number[],
  version?: number
): string {
  if (!imagePath) {
    return '';
  }

  return widths
    .map(width => {
      const url = getImageUrl(imagePath, { width, version });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Product image helper for common product display scenarios.
 *
 * @param product - Product object with image_path and image_version
 * @param size - Size preset to use
 * @returns Full URL for the product image
 */
export function getProductImageUrl(
  product: { image_path?: string | null; image_version?: number } | null | undefined,
  size: keyof typeof IMAGE_SIZES = 'CARD'
): string {
  if (!product?.image_path) {
    return '';
  }

  return getImageUrlPreset(product.image_path, size, product.image_version);
}
