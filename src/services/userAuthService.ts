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
  AuthData,
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
  private saveToStorage(authData: AuthData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refresh_token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user));

      this.accessToken = authData.access_token;
      this.refreshToken = authData.refresh_token;
      this.user = authData.user;

      console.log('[UserAuth] Saved to storage:', {
        userId: authData.user.id,
        phone: authData.user.phone_number,
        expiresIn: authData.expires_in,
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
  async register(credentials: RegisterCredentials): Promise<{ success: boolean; data?: AuthData; error?: string }> {
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
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/register/`, {
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

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[UserAuth] Register failed:', responseData);
        // Standard format: {success: false, message, data}
        // Check for specific error details in data.error
        let errorMessage = responseData.message || 'خطا در ثبت نام';
        if (responseData.data?.error) {
          if (Array.isArray(responseData.data.error)) {
            errorMessage = responseData.data.error.join(', ');
          } else {
            errorMessage = responseData.data.error;
          }
        }
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Standard format: {success: true, message, data: {access_token, refresh_token, token_type, expires_in, user}}
      const authData = responseData.data;
      this.saveToStorage(authData);

      console.log('[UserAuth] Register successful:', authData.user.phone_number);
      return {
        success: true,
        data: authData,
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
  async login(credentials: LoginCredentials): Promise<{ success: boolean; data?: AuthData; error?: string }> {
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
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/login/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  phone_number: phoneValidation.normalized, // English digits only
                  password: credentials.password,
              }),
          });

          const responseData = await response.json();

          if (!response.ok) {
              console.error('[UserAuth] Login failed:', responseData);
              // Standard format: {success: false, message, data}
              // Check for specific error details in data.error
              let errorMessage = responseData.message || 'شماره موبایل یا رمز عبور اشتباه است';
              if (responseData.data?.error) {
                if (Array.isArray(responseData.data.error)) {
                  errorMessage = responseData.data.error.join(', ');
                } else {
                  errorMessage = responseData.data.error;
                }
              }
              return {
                  success: false,
                  error: errorMessage,
              };
          }

          // Standard format: {success: true, message, data: {access_token, refresh_token, token_type, expires_in, user}}
          const authData = responseData.data;
          this.saveToStorage(authData);
          console.log('[UserAuth] Login successful:', authData.user.phone_number);

          return { success: true, data: authData };
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

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: this.refreshToken,  // Changed from refresh_token to refresh
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[UserAuth] Refresh failed:', data);
        // Refresh token is invalid or expired
        this.clearStorage();
        return false;
      }

      // API now returns only new access token: { access: string }
      // Keep existing refresh token (it's still valid)
      const newAccessToken = data.access;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
      this.accessToken = newAccessToken;

      console.log('[UserAuth] Refresh successful, new access token saved');
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
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken,
          all_devices: false,  // Logout current device only
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        // Standard format: {success: true, message, data: {}}
        console.log('[UserAuth] Logout successful:', responseData.message);
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

  /**
   * Get user profile
   * GET /api/users/profile/
   */
  async getProfile(): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      if (!this.accessToken) {
        return {
          success: false,
          error: 'نیاز به ورود',
        };
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || 'خطا در دریافت پروفایل',
        };
      }

      // Standard format: {success: true, message, data: {user}}
      const user = responseData.data;
      this.user = user;
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('[UserAuth] Get profile error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Update user profile (name only)
   * PUT /api/users/profile/
   */
  async updateProfile(name: string): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      if (!this.accessToken) {
        return {
          success: false,
          error: 'نیاز به ورود',
        };
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({ name }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || 'خطا در به‌روزرسانی پروفایل',
        };
      }

      // Standard format: {success: true, message, data: {user}}
      const user = responseData.data;
      this.user = user;
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('[UserAuth] Update profile error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Get user gallery (processed images)
   * GET /api/users/gallery/
   */
  async getGallery(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      if (!this.accessToken) {
        return {
          success: false,
          error: 'نیاز به ورود',
        };
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/gallery/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || 'خطا در دریافت گالری',
        };
      }

      // Standard format: {success: true, message, data: [{processed images}]}
      return {
        success: true,
        data: responseData.data || [],
      };
    } catch (error) {
      console.error('[UserAuth] Get gallery error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }
}

// Export singleton instance
export const userAuthService = new UserAuthService();
export default userAuthService;
