/**
 * Rate Limiting Types
 * Handles X-RateLimit-* headers from API responses
 */

export interface RateLimitState {
  limit: number;           // Total allowed requests in window (e.g., 5)
  remaining: number;       // Requests remaining in current window (e.g., 3)
  resetAt: number | null;  // Unix timestamp when limit resets
  isExceeded: boolean;     // Whether limit is exceeded (remaining === 0)
  resetIn: string | null;  // Human-readable time until reset (e.g., "45 دقیقه")
}

/**
 * Rate limit headers from API responses
 */
export interface RateLimitHeaders {
  'X-RateLimit-Limit'?: string;
  'X-RateLimit-Remaining'?: string;
  'X-RateLimit-Reset'?: string;
}

/**
 * Rate limit error response (429 Too Many Requests)
 */
export interface RateLimitError {
  error: string;
  message: string;
  detail: string;  // e.g., "5 per 1 hour"
}

/**
 * Storage key for localStorage
 */
export const RATE_LIMIT_STORAGE_KEY = 'homa_rate_limit';
