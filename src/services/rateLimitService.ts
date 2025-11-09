/**
 * Rate Limit Service
 * Extracts and manages rate limit information from API response headers
 * Stores in localStorage for persistence across page refreshes
 */

import type { RateLimitState } from '../types/rateLimit';

const STORAGE_KEY = 'homa_rate_limit';

class RateLimitService {
  /**
   * Extract rate limit information from response headers
   */
  extractFromHeaders(headers: Headers): RateLimitState | null {
    try {
      const limitHeader = headers.get('X-RateLimit-Limit');
      const remainingHeader = headers.get('X-RateLimit-Remaining');
      const resetHeader = headers.get('X-RateLimit-Reset');

      // If headers are missing, return null
      if (!limitHeader || !remainingHeader || !resetHeader) {
        console.log('[RateLimit] Headers not found in response');
        return null;
      }

      const limit = parseInt(limitHeader, 10);
      const remaining = parseInt(remainingHeader, 10);
      const resetAt = parseInt(resetHeader, 10);

      const state: RateLimitState = {
        limit,
        remaining,
        resetAt,
        isExceeded: remaining === 0,
        resetIn: this.calculateResetTime(resetAt),
      };

      console.log('[RateLimit] Extracted from headers:', state);
      return state;
    } catch (error) {
      console.error('[RateLimit] Error extracting headers:', error);
      return null;
    }
  }

  /**
   * Calculate human-readable time until reset (in Persian)
   */
  calculateResetTime(resetAtTimestamp: number): string {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const secondsRemaining = resetAtTimestamp - now;

    if (secondsRemaining <= 0) {
      return 'اکنون';
    }

    const minutes = Math.floor(secondsRemaining / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} روز`;
    }
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes > 0) {
        return `${hours} ساعت و ${remainingMinutes} دقیقه`;
      }
      return `${hours} ساعت`;
    }
    if (minutes > 0) {
      return `${minutes} دقیقه`;
    }
    return `${secondsRemaining} ثانیه`;
  }

  /**
   * Save rate limit state to localStorage
   */
  save(rateLimit: RateLimitState): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...rateLimit,
          lastUpdated: Date.now(),
        })
      );
      console.log('[RateLimit] Saved to storage:', rateLimit);
    } catch (error) {
      console.error('[RateLimit] Failed to save to storage:', error);
    }
  }

  /**
   * Load rate limit state from localStorage
   * Automatically resets if reset time has passed
   */
  load(): RateLimitState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('[RateLimit] No stored data found');
        return null;
      }

      const data = JSON.parse(stored);

      // Check if reset time has passed
      const now = Math.floor(Date.now() / 1000);
      if (data.resetAt && now >= data.resetAt) {
        console.log('[RateLimit] Reset time has passed, clearing limit');
        // Reset has occurred, return default state
        return {
          limit: data.limit || 5,
          remaining: data.limit || 5, // Reset to full limit
          resetAt: null,
          isExceeded: false,
          resetIn: null,
        };
      }

      // Recalculate resetIn with current time
      const state: RateLimitState = {
        limit: data.limit,
        remaining: data.remaining,
        resetAt: data.resetAt,
        isExceeded: data.remaining === 0,
        resetIn: data.resetAt ? this.calculateResetTime(data.resetAt) : null,
      };

      console.log('[RateLimit] Loaded from storage:', state);
      return state;
    } catch (error) {
      console.error('[RateLimit] Failed to load from storage:', error);
      return null;
    }
  }

  /**
   * Clear rate limit data from localStorage
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[RateLimit] Cleared storage');
    } catch (error) {
      console.error('[RateLimit] Failed to clear storage:', error);
    }
  }

  /**
   * Create initial default state
   */
  createDefault(): RateLimitState {
    return {
      limit: 5, // Default from API spec
      remaining: 5,
      resetAt: null,
      isExceeded: false,
      resetIn: null,
    };
  }

  /**
   * Get color class for UI display based on remaining count
   */
  getColorClass(remaining: number, limit: number): string {
    const percentage = (remaining / limit) * 100;

    if (percentage > 60) return 'text-green-600'; // 4-5 remaining
    if (percentage > 20) return 'text-yellow-600'; // 2-3 remaining
    if (percentage > 0) return 'text-orange-600'; // 1 remaining
    return 'text-red-600'; // 0 remaining
  }

  /**
   * Determine if rate limit badge should be shown
   * Show if less than 50% remaining OR if exceeded
   */
  shouldShowBadge(remaining: number, limit: number): boolean {
    return remaining < limit / 2 || remaining === 0;
  }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();
export default rateLimitService;
