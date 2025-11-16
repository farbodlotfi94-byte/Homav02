/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://104.234.46.187:8888',
  ENDPOINTS: {
    PRODUCTS: '/api/products/',
    PRODUCT_DETAILS: (uniqueLink: string) => `/api/products/${uniqueLink}/`,
    PROCESS_IMAGE: (uniqueLink: string) => `/api/products/${uniqueLink}/process/`,
    IMAGE_SERVE: (objectPath: string) => `/api/products/images/${objectPath}`,
    VOTE: '/api/products/vote/',
    HEALTH: '/health/',
  },
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 300000, // 5 minutes - increased for image processing
  IMAGE_PROCESSING_TIMEOUT: Number(import.meta.env.VITE_API_IMAGE_PROCESSING_TIMEOUT) || 600000, // 10 minutes - specific timeout for image processing
} as const;

export type ApiEndpoint = keyof typeof API_CONFIG.ENDPOINTS;