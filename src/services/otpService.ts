import { API_CONFIG } from "../config/api";
import type { AuthData } from "../types/auth";

export interface SendOTPRequest {
  phone_number: string; // +989XXXXXXXXX
  purpose: "login" | "reset_password" | "verify_phone";
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data?: {
    expires_in?: number;
    retry_after?: number;
  };
  error?: string;
  status?: number;
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp_code: string;
  purpose: "login" | "reset_password" | "verify_phone";
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: AuthData;
  error?: string;
  remaining_attempts?: number;
  status?: number;
}

export interface ResendOTPResponse extends SendOTPResponse {}

class OTPService {
  private baseURL = API_CONFIG.BASE_URL;

  async sendOTP(request: SendOTPRequest): Promise<SendOTPResponse> {
    try {
      console.log("[OTPService] Sending OTP to:", request.phone_number);

      const response = await fetch(`${this.baseURL}/api/users/otp/send/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      const status = response.status;

      if (!response.ok) {
        console.error("[OTPService] sendOTP failed:", data);

        if (status === 429) {
          return {
            success: false,
            message: data.message || "محدودیت تعداد درخواست",
            error: data.detail || data.message,
            status,
            data: {
              expires_in: data.data?.expires_in,
              retry_after: data.data?.retry_after || 900,
            },
          };
        }

        if (status === 400) {
          return {
            success: false,
            message: data.message || "شماره موبایل معتبر نیست",
            error: data.detail || data.message,
            status,
          };
        }

        return {
          success: false,
          message: data.message || "خطا در ارسال کد تایید",
          error: data.detail || data.message,
          status,
        };
      }

      console.log("[OTPService] OTP sent successfully");
      return {
        success: true,
        message: data.message || "کد تایید ارسال شد",
        status,
        data: {
          expires_in: data.data?.expires_in || 180,
        },
      };
    } catch (error) {
      console.error("[OTPService] sendOTP error:", error);
      return {
        success: false,
        message: "خطا در اتصال به سرور",
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async verifyOTP(request: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    try {
      console.log("[OTPService] Verifying OTP for:", request.phone_number);

      const response = await fetch(`${this.baseURL}/api/users/otp/verify/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      const status = response.status;

      if (!response.ok) {
        console.error("[OTPService] verifyOTP failed:", data);

        if (status === 400) {
          // Try to extract remaining_attempts from multiple possible locations
          let remainingAttempts = data.data?.remaining_attempts || data.remaining_attempts;

          // If not found, try to extract from message: "4 تلاش باقی مانده"
          if (remainingAttempts === undefined && data.message) {
            const match = data.message.match(/(\d+)\s*تلاش/);
            if (match) {
              remainingAttempts = parseInt(match[1], 10);
            }
          }

          return {
            success: false,
            message: data.message || "کد تایید اشتباه است",
            error: data.detail || data.message,
            remaining_attempts: remainingAttempts,
            status,
          };
        }

        return {
          success: false,
          message: data.message || "خطا در تایید کد",
          error: data.detail || data.message,
          status,
        };
      }

      console.log("[OTPService] OTP verified successfully");

      // Transform backend response to match AuthData interface
      // Backend returns: {user: {...}, tokens: {access: "...", refresh: "..."}}
      // Frontend expects: {access_token: "...", refresh_token: "...", user: {...}}
      const backendData = data.data;
      const authData = {
        access_token: backendData.tokens?.access || "",
        refresh_token: backendData.tokens?.refresh || "",
        token_type: "bearer" as const,
        expires_in: 1800, // 30 minutes default
        user: backendData.user,
      };

      console.log("[OTPService] Transformed auth data:", {
        hasAccessToken: !!authData.access_token,
        hasRefreshToken: !!authData.refresh_token,
        hasUser: !!authData.user,
        tokenPreview: authData.access_token.substring(0, 20) + "...",
      });

      return {
        success: true,
        message: data.message || "ورود موفق",
        data: authData,
        status,
      };
    } catch (error) {
      console.error("[OTPService] verifyOTP error:", error);
      return {
        success: false,
        message: "خطا در اتصال به سرور",
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async resendOTP(request: SendOTPRequest): Promise<ResendOTPResponse> {
    try {
      console.log("[OTPService] Resending OTP to:", request.phone_number);

      const response = await fetch(`${this.baseURL}/api/users/otp/resend/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      const status = response.status;

      if (!response.ok) {
        console.error("[OTPService] resendOTP failed:", data);

        if (status === 429) {
          return {
            success: false,
            message: data.message || "محدودیت تعداد درخواست",
            error: data.message,
            status,
            data: {
              expires_in: data.data?.expires_in,
              retry_after: data.data?.retry_after || 900,
            },
          };
        }

        return {
          success: false,
          message: data.message || "خطا در ارسال مجدد کد",
          error: data.detail || data.message,
          status,
        };
      }

      console.log("[OTPService] OTP resent successfully");
      return {
        success: true,
        message: data.message || "کد جدید ارسال شد",
        status,
        data: {
          expires_in: data.data?.expires_in || 180,
        },
      };
    } catch (error) {
      console.error("[OTPService] resendOTP error:", error);
      return {
        success: false,
        message: "خطا در اتصال به سرور",
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }
}

export const otpService = new OTPService();
export default otpService;

