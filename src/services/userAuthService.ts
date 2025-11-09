/**
 * User Authentication Service
 * Handles user login, register, logout, and token refresh
 *
 * SIMPLIFIED APPROACH:
 * - No auto-refresh intervals or client-side expiry checking
 * - Refresh ONLY when API returns 401 Unauthorized
 * - No clock-based predictions (avoids client/server time skew issues)
 */

import { API_CONFIG } from '../config/api';
import type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  RefreshTokenRequest,
  LogoutRequest,
  AUTH_STORAGE_KEYS,
} from '../types/auth';
import { validateAndNormalizePhone, validatePassword } from '../utils/phoneValidator';
import { normalizePersianDigits } from '../utils/normalizeDigits';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'homa_user_access_token',
  REFRESH_TOKEN: 'homa_user_refresh_token',
  USER_DATA: 'homa_user_data',
} as const;

class UserAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;
  private refreshPromise: Promise<boolean> | null = null; // Prevent concurrent refreshes

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load tokens and user data from localStorage
   */
  private loadFromStorage(): void {
    try {
      this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        this.user = JSON.parse(userData);
      }

      console.log('[UserAuth] Loaded from storage:', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken,
        user: this.user?.phone_number,
      });
    } catch (error) {
      console.error('[UserAuth] Failed to load from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * Save tokens and user data to localStorage
   */
  private saveToStorage(authResponse: AuthResponse): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refresh_token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse.user));

      this.accessToken = authResponse.access_token;
      this.refreshToken = authResponse.refresh_token;
      this.user = authResponse.user;

      console.log('[UserAuth] Saved to storage:', {
        userId: authResponse.user.id,
        phone: authResponse.user.phone_number,
        expiresIn: authResponse.expires_in,
      });
    } catch (error) {
      console.error('[UserAuth] Failed to save to storage:', error);
    }
  }

  /**
   * Clear tokens and user data from localStorage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);

      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;

      console.log('[UserAuth] Cleared storage');
    } catch (error) {
      console.error('[UserAuth] Failed to clear storage:', error);
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
    try {
      console.log('[UserAuth] Attempting register:', credentials.phone_number);

      // Validate phone number
      const phoneValidation = validateAndNormalizePhone(credentials.phone_number);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          error: phoneValidation.error || 'شماره موبایل معتبر نیست',
        };
      }

      // Validate password
      const passwordValidation = validatePassword(credentials.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.error || 'رمز عبور معتبر نیست',
        };
      }

      // Make API request
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneValidation.normalized, // Use normalized phone
          password: credentials.password,
          name: credentials.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[UserAuth] Register failed:', data);
        return {
          success: false,
          error: data.detail || 'خطا در ثبت نام',
        };
      }

      // Save tokens
      this.saveToStorage(data);

      console.log('[UserAuth] Register successful:', data.user.phone_number);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('[UserAuth] Register error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
      try {
          // 🔹 Normalize Persian/Arabic digits before validation
          const normalizedPhone = normalizePersianDigits(credentials.phone_number);
          console.log('[UserAuth] Attempting login with normalized phone:', normalizedPhone);

          // Validate phone number
          const phoneValidation = validateAndNormalizePhone(normalizedPhone);
          if (!phoneValidation.isValid) {
              return {
                  success: false,
                  error: phoneValidation.error || 'شماره موبایل معتبر نیست',
              };
          }

          // Make API request
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  phone_number: phoneValidation.normalized, // English digits only
                  password: credentials.password,
              }),
          });

          const data = await response.json();

          if (!response.ok) {
              console.error('[UserAuth] Login failed:', data);
              return {
                  success: false,
                  error: data.detail || 'شماره موبایل یا رمز عبور اشتباه است',
              };
          }

          this.saveToStorage(data);
          console.log('[UserAuth] Login successful:', data.user.phone_number);

          return { success: true, data };
      } catch (error) {
          console.error('[UserAuth] Login error:', error);
          return {
              success: false,
              error: 'خطا در اتصال به سرور',
          };
      }
  }

  /**
   * Refresh access token using refresh token
   * ONLY called when API returns 401 Unauthorized
   *
   * Uses lock mechanism to prevent concurrent refresh attempts
   */
  async refreshAccessToken(): Promise<boolean> {
    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      console.log('[UserAuth] Refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    // Start new refresh
    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Actual refresh logic
   */
  private async performRefresh(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        console.error('[UserAuth] No refresh token available');
        return false;
      }

      console.log('[UserAuth] Refreshing access token...');

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[UserAuth] Refresh failed:', data);
        // Refresh token is invalid or expired
        this.clearStorage();
        return false;
      }

      // Save new tokens (old refresh token is revoked by backend)
      this.saveToStorage(data);

      console.log('[UserAuth] Refresh successful, new tokens saved');
      return true;
    } catch (error) {
      console.error('[UserAuth] Refresh error:', error);
      this.clearStorage();
      return false;
    }
  }

  /**
   * Logout user
   * Simplified: Always logout current device only
   */
  async logout(): Promise<void> {
    try {
      if (!this.refreshToken || !this.accessToken) {
        console.log('[UserAuth] No tokens to logout');
        this.clearStorage();
        return;
      }

      console.log('[UserAuth] Logging out...');

      // Call logout API (revoke refresh token)
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken, // Logout current device only
        }),
      });

      if (response.ok) {
        console.log('[UserAuth] Logout successful');
      } else {
        console.warn('[UserAuth] Logout API failed, clearing local storage anyway');
      }
    } catch (error) {
      console.error('[UserAuth] Logout error:', error);
    } finally {
      // Always clear local storage
      this.clearStorage();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.accessToken && this.refreshToken);
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get current user data
   */
  getUser(): User | null {
    return this.user;
  }

  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    if (!this.accessToken) {
      return {};
    }

    return {
      'Authorization': `Bearer ${this.accessToken}`,
    };
  }
}

// Export singleton instance
export const userAuthService = new UserAuthService();
export default userAuthService;
