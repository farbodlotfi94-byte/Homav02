/**
 * VIP Authentication Service
 *
 * Handles login for VIP users (non-Iranian) who use username/password
 * instead of OTP-based phone authentication.
 */

import { API_CONFIG } from "../config/api";
import type { AuthData } from "../types/auth";

export interface VIPLoginRequest {
  username: string;
  password: string;
}

export interface VIPLoginResponse {
  success: boolean;
  message: string;
  data?: AuthData;
  error?: string;
  status?: number;
}

class VIPAuthService {
  private baseURL = API_CONFIG.BASE_URL;

  /**
   * Login VIP user with username and password.
   * Username is stored in the user's 'name' field in the backend.
   */
  async login(request: VIPLoginRequest): Promise<VIPLoginResponse> {
    try {
      console.log("[VIPAuthService] Logging in VIP user:", request.username);

      const response = await fetch(`${this.baseURL}/api/users/vip-login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      const status = response.status;

      if (!response.ok) {
        console.error("[VIPAuthService] Login failed:", data);

        return {
          success: false,
          message: data.message || "نام کاربری یا رمز عبور اشتباه است",
          error: data.detail || data.message,
          status,
        };
      }

      console.log("[VIPAuthService] Login successful");

      return {
        success: true,
        message: data.message || "ورود موفق",
        data: data.data,
        status,
      };
    } catch (error) {
      console.error("[VIPAuthService] Login error:", error);
      return {
        success: false,
        message: "خطا در اتصال به سرور",
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }
}

export const vipAuthService = new VIPAuthService();
export default vipAuthService;
