// localStorage utility for persisting rate limit state per shop

interface RateLimitState {
  shopId: number;
  expiryTimestamp: number; // Unix timestamp in milliseconds when rate limit expires
  message: string;
  availableIn: string;
}

const STORAGE_KEY_PREFIX = 'rate-limit-shop';

/**
 * Save rate limit state to localStorage for a specific shop
 * @param shopId - Shop ID from product
 * @param expiryTimestamp - Unix timestamp (ms) when rate limit expires
 * @param message - User-facing error message
 * @param availableIn - Human-readable time until available
 */
export function saveRateLimitState(
  shopId: number,
  expiryTimestamp: number,
  message: string,
  availableIn: string
): void {
  const key = `${STORAGE_KEY_PREFIX}-${shopId}`;
  const state: RateLimitState = {
    shopId,
    expiryTimestamp,
    message,
    availableIn,
  };

  try {
    localStorage.setItem(key, JSON.stringify(state));
    console.log(`[RateLimit] Saved state for shop ${shopId}, expires at ${new Date(expiryTimestamp).toISOString()}`);
  } catch (error) {
    console.error('[RateLimit] Failed to save to localStorage:', error);
  }
}

/**
 * Get rate limit state from localStorage for a specific shop
 * @param shopId - Shop ID to check
 * @returns RateLimitState if rate limit is still active, null if expired or not found
 */
export function getRateLimitState(shopId: number | null): RateLimitState | null {
  if (shopId === null) {
    return null;
  }

  const key = `${STORAGE_KEY_PREFIX}-${shopId}`;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return null;
    }

    const state: RateLimitState = JSON.parse(stored);
    const now = Date.now();

    // Check if rate limit has expired
    if (state.expiryTimestamp <= now) {
      console.log(`[RateLimit] State for shop ${shopId} has expired, clearing`);
      clearRateLimitState(shopId);
      return null;
    }

    console.log(`[RateLimit] Restored state for shop ${shopId}, ${Math.round((state.expiryTimestamp - now) / 1000)}s remaining`);
    return state;
  } catch (error) {
    console.error('[RateLimit] Failed to read from localStorage:', error);
    return null;
  }
}

/**
 * Clear rate limit state from localStorage for a specific shop
 * @param shopId - Shop ID to clear
 */
export function clearRateLimitState(shopId: number): void {
  const key = `${STORAGE_KEY_PREFIX}-${shopId}`;
  try {
    localStorage.removeItem(key);
    console.log(`[RateLimit] Cleared state for shop ${shopId}`);
  } catch (error) {
    console.error('[RateLimit] Failed to clear localStorage:', error);
  }
}

/**
 * Clear all expired rate limit states from localStorage (cleanup utility)
 */
export function clearExpiredRateLimits(): void {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const state: RateLimitState = JSON.parse(stored);
            if (state.expiryTimestamp <= now) {
              keysToRemove.push(key);
            }
          } catch {
            // Invalid JSON, remove it
            keysToRemove.push(key);
          }
        }
      }
    }

    // Remove expired entries
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    if (keysToRemove.length > 0) {
      console.log(`[RateLimit] Cleaned up ${keysToRemove.length} expired rate limit(s)`);
    }
  } catch (error) {
    console.error('[RateLimit] Failed to clean up expired rate limits:', error);
  }
}
