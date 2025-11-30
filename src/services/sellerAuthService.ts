/**
 * Seller Authentication Service
 * Handles shop login, OTP-based registration, password reset, and token management
 *
 * Pattern: Follows userAuthService.ts architecture
 * Key Differences:
 * - OTP-based registration (3 steps: send OTP → verify → register)
 * - Automatic token refresh using refresh tokens
 * - Shop-specific endpoints and data structures
 */

import { API_CONFIG } from '../config/api';
import { normalizePersianDigits } from '../utils/normalizeDigits';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'homa_shop_access_token',
  REFRESH_TOKEN: 'homa_shop_refresh_token',
  SHOP_DATA: 'homa_shop_data',
} as const;

// Seller/Shop data structure (from backend)
export interface Shop {
  id: number;
  username: string;
  phone_number: string;
  shop_name: string;
  role: 'shop' | 'admin';
  link: string | null;
  created_at: string;
  try_on_credits: number;
}

// Authentication data returned by backend
export interface ShopAuthData {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  shop: Shop;
}

// Login credentials
export interface LoginCredentials {
  phone_number: string;
  password: string;
}

// Registration data
export interface RegisterData {
  username: string;
  password: string;
  shop_name: string;
  phone_number: string;
  shop_website_link?: string | null;
}

// API result types
export interface AuthResult {
  success: boolean;
  data?: ShopAuthData;
  error?: string;
}

export interface OTPResult {
  success: boolean;
  data?: {
    phone_number: string;
    expires_in_seconds: number;
    message: string;
  };
  error?: string;
}

export interface VerifyResult {
  success: boolean;
  data?: {
    phone_number: string;
    verified: boolean;
  };
  error?: string;
}

export interface Result {
  success: boolean;
  error?: string;
}

// Phone validation result
interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

class SellerAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private shop: Shop | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load tokens and shop data from localStorage
   */
  private loadFromStorage(): void {
    try {
      this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      const shopData = localStorage.getItem(STORAGE_KEYS.SHOP_DATA);
      if (shopData) {
        this.shop = JSON.parse(shopData);
      }

      console.log('[SellerAuth] Loaded from storage:', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken,
        shopName: this.shop?.shop_name,
      });
    } catch (error) {
      console.error('[SellerAuth] Failed to load from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * Save tokens and shop data to localStorage
   */
  private saveToStorage(authData: ShopAuthData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refresh_token);
      localStorage.setItem(STORAGE_KEYS.SHOP_DATA, JSON.stringify(authData.shop));

      this.accessToken = authData.access_token;
      this.refreshToken = authData.refresh_token;
      this.shop = authData.shop;

      console.log('[SellerAuth] Saved to storage:', {
        shopId: authData.shop.id,
        shopName: authData.shop.shop_name,
        credits: authData.shop.try_on_credits,
      });
    } catch (error) {
      console.error('[SellerAuth] Failed to save to storage:', error);
    }
  }

  /**
   * Clear tokens and shop data from localStorage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.SHOP_DATA);

      this.accessToken = null;
      this.refreshToken = null;
      this.shop = null;

      console.log('[SellerAuth] Cleared storage');
    } catch (error) {
      console.error('[SellerAuth] Failed to clear storage:', error);
    }
  }

  /**
   * Validate and normalize phone number for Iranian format
   */
  private validatePhone(phone: string): PhoneValidationResult {
    // Normalize Persian/Arabic digits
    const normalized = normalizePersianDigits(phone);

    // Remove spaces and dashes
    const cleaned = normalized.replace(/[\s\-]/g, '');

    // Validate format: 09XXXXXXXXX or +989XXXXXXXXX
    const mobileRegex = /^(\+?98|0)?9\d{9}$/;
    if (!mobileRegex.test(cleaned)) {
      return {
        isValid: false,
        error: 'فرمت شماره موبایل صحیح نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)',
      };
    }

    // Normalize to +989XXXXXXXXX
    const normalizedPhone = cleaned.startsWith('+98')
      ? cleaned
      : cleaned.startsWith('0')
      ? `+98${cleaned.slice(1)}`
      : `+98${cleaned}`;

    return {
      isValid: true,
      normalized: normalizedPhone,
    };
  }

  /**
   * Login shop with phone number and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      console.log('[SellerAuth] Attempting login');

      // Validate phone number
      const phoneValidation = this.validatePhone(credentials.phone_number);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          error: phoneValidation.error || 'شماره موبایل معتبر نیست',
        };
      }

      // Make API request
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/shops/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneValidation.normalized,
          password: credentials.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[SellerAuth] Login failed:', responseData);
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

      // Standard format: { success: true, message, data: { access_token, token_type, shop } }
      const authData = responseData.data;
      this.saveToStorage(authData);

      console.log('[SellerAuth] Login successful:', authData.shop.shop_name);
      return { success: true, data: authData };
    } catch (error) {
      console.error('[SellerAuth] Login error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Step 1: Send OTP code to phone number for registration verification
   */
  async sendPhoneVerificationOTP(phone: string): Promise<OTPResult> {
    try {
      console.log('[SellerAuth] Sending phone verification OTP');

      // Validate phone number
      const phoneValidation = this.validatePhone(phone);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          error: phoneValidation.error || 'شماره موبایل معتبر نیست',
        };
      }

      // Make API request
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/shops/otp/phone-verify/send/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneValidation.normalized,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[SellerAuth] Send OTP failed:', responseData);
        let errorMessage = responseData.message || 'خطا در ارسال کد تایید';
        if (responseData.data?.error) {
          errorMessage = responseData.data.error;
        }
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Standard format: { success: true, message, data: { phone_number, expires_in_seconds, message } }
      console.log('[SellerAuth] OTP sent successfully');
      return { success: true, data: responseData.data };
    } catch (error) {
      console.error('[SellerAuth] Send OTP error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Step 2: Verify OTP code for phone number
   */
  async verifyPhoneOTP(phone: string, otpCode: string): Promise<VerifyResult> {
    try {
      console.log('[SellerAuth] Verifying phone OTP');

      // Validate phone number
      const phoneValidation = this.validatePhone(phone);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          error: phoneValidation.error || 'شماره موبایل معتبر نیست',
        };
      }

      // Validate OTP code (6 digits)
      if (!/^\d{6}$/.test(otpCode)) {
        return {
          success: false,
          error: 'کد تایید باید ۶ رقم باشد',
        };
      }

      // Make API request
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/shops/otp/phone-verify/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneValidation.normalized,
          otp_code: otpCode,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[SellerAuth] Verify OTP failed:', responseData);
        let errorMessage = responseData.message || 'کد تایید نامعتبر است';
        if (responseData.data?.error) {
          errorMessage = responseData.data.error;
        }
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Standard format: { success: true, message, data: { phone_number, verified } }
      console.log('[SellerAuth] OTP verified successfully');
      return { success: true, data: responseData.data };
    } catch (error) {
      console.error('[SellerAuth] Verify OTP error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Step 3: Complete registration after phone verification
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      console.log('[SellerAuth] Attempting registration');

      // Validate phone number
      const phoneValidation = this.validatePhone(data.phone_number);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          error: phoneValidation.error || 'شماره موبایل معتبر نیست',
        };
      }

      // Make API request
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/shops/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          shop_name: data.shop_name,
          phone_number: phoneValidation.normalized,
          shop_website_link: data.shop_website_link || null,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[SellerAuth] Registration failed:', responseData);
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

      // Standard format: { success: true, message, data: { access_token, refresh_token, shop } }
      const authData = responseData.data;
      this.saveToStorage(authData);

      console.log('[SellerAuth] Registration successful:', authData.shop.shop_name);
      return { success: true, data: authData };
    } catch (error) {
      console.error('[SellerAuth] Registration error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Send OTP code for password reset
   */
  async sendPasswordResetOTP(phone: string): Promise<OTPResult> {
    try {
      console.log('[SellerAuth] Sending password reset OTP');

      // Validate phone number
      const phoneValidation = this.validatePhone(phone);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          error: phoneValidation.error || 'شماره موبایل معتبر نیست',
        };
      }

      // Make API request
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/shops/otp/password-reset/send/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneValidation.normalized,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[SellerAuth] Send password reset OTP failed:', responseData);
        let errorMessage = responseData.message || 'خطا در ارسال کد تایید';
        if (responseData.data?.error) {
          errorMessage = responseData.data.error;
        }
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Standard format: { success: true, message, data: { phone_number, expires_in_seconds, message } }
      console.log('[SellerAuth] Password reset OTP sent successfully');
      return { success: true, data: responseData.data };
    } catch (error) {
      console.error('[SellerAuth] Send password reset OTP error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Reset password using OTP verification
   */
  async resetPassword(
    phone: string,
    otpCode: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<Result> {
    try {
      console.log('[SellerAuth] Attempting password reset');

      // Validate phone number
      const phoneValidation = this.validatePhone(phone);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          error: phoneValidation.error || 'شماره موبایل معتبر نیست',
        };
      }

      // Validate OTP code
      if (!/^\d{6}$/.test(otpCode)) {
        return {
          success: false,
          error: 'کد تایید باید ۶ رقم باشد',
        };
      }

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          error: 'رمزهای عبور مطابقت ندارند',
        };
      }

      // Validate password strength (min 8 chars)
      if (newPassword.length < 8) {
        return {
          success: false,
          error: 'رمز عبور باید حداقل ۸ کاراکتر داشته باشد',
        };
      }

      // Make API request
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/shops/password/reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneValidation.normalized,
          otp_code: otpCode,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[SellerAuth] Password reset failed:', responseData);
        let errorMessage = responseData.message || 'خطا در تغییر رمز عبور';
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

      // Standard format: { success: true, message, data: {} }
      console.log('[SellerAuth] Password reset successful');
      return { success: true };
    } catch (error) {
      console.error('[SellerAuth] Password reset error:', error);
      return {
        success: false,
        error: 'خطا در اتصال به سرور',
      };
    }
  }

  /**
   * Logout (client-side only, no API call needed for shops)
   */
  logout(): void {
    console.log('[SellerAuth] Logging out');
    this.clearStorage();
  }

  /**
   * Refresh access token using refresh token
   * ONLY called when API returns 401 Unauthorized
   * Uses lock mechanism to prevent concurrent refresh attempts
   */
  async refreshAccessToken(): Promise<boolean> {
    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      console.log('[SellerAuth] Refresh already in progress, waiting...');
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
   * Actual refresh logic (private)
   */
  private async performRefresh(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        console.error('[SellerAuth] No refresh token available');
        return false;
      }

      console.log('[SellerAuth] Refreshing access token...');

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/shops/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[SellerAuth] Refresh failed:', responseData);
        this.clearStorage();
        return false;
      }

      // Backend returns: { success: true, data: { access_token, token_type } }
      const newAccessToken = responseData.data.access_token;

      // Update only access token (refresh token stays the same)
      this.accessToken = newAccessToken;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

      console.log('[SellerAuth] Access token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[SellerAuth] Refresh error:', error);
      this.clearStorage();
      return false;
    }
  }

  /**
   * Check if shop is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get current shop data
   */
  getShop(): Shop | null {
    return this.shop;
  }

  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    if (!this.accessToken) {
      console.warn('[SellerAuth] getAuthHeaders called but no access token available');
      return {};
    }

    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  /**
   * Update shop data in storage (e.g., after credits change)
   */
  updateShopData(shop: Shop): void {
    this.shop = shop;
    localStorage.setItem(STORAGE_KEYS.SHOP_DATA, JSON.stringify(shop));
    console.log('[SellerAuth] Shop data updated:', shop.shop_name);
  }
}

// Export singleton instance
export const sellerAuthService = new SellerAuthService();
export default sellerAuthService;
