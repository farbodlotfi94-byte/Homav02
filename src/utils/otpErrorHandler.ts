import type {
  SendOTPResponse,
  VerifyOTPResponse,
} from "../services/otpService";

export interface ErrorHandlingResult {
  userMessage: string;
  severity: "error" | "warning" | "info";
  action: "retry" | "wait" | "edit_phone" | "resend" | "none";
  retryDelay?: number;
  disableInputs?: boolean;
  clearOTP?: boolean;
  remainingAttempts?: number;
}

export function handleSendOTPError(
  error: SendOTPResponse,
  statusCode?: number,
): ErrorHandlingResult {
  if (statusCode === 429 || error.data?.retry_after) {
    const retryAfter = error.data?.retry_after || 900;
    const minutes = Math.ceil(retryAfter / 60);
    return {
      userMessage: `محدودیت تعداد درخواست. لطفاً ${minutes} دقیقه دیگر تلاش کنید`,
      severity: "warning",
      action: "wait",
      retryDelay: retryAfter,
      disableInputs: true,
    };
  }

  if (statusCode === 400) {
    return {
      userMessage: error.message || "شماره موبایل وارد شده معتبر نیست",
      severity: "error",
      action: "edit_phone",
      disableInputs: false,
    };
  }

  if (!statusCode) {
    return {
      userMessage: "خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید",
      severity: "error",
      action: "retry",
    };
  }

  if (statusCode >= 500) {
    return {
      userMessage: "خطا در سرور. لطفاً چند دقیقه دیگر تلاش کنید",
      severity: "error",
      action: "retry",
      retryDelay: 120,
    };
  }

  return {
    userMessage: error.message || "خطا در ارسال کد تایید",
    severity: "error",
    action: "retry",
  };
}

export function handleVerifyOTPError(
  error: VerifyOTPResponse,
  statusCode?: number,
): ErrorHandlingResult {
  if (statusCode === 400) {
    let remaining = error.remaining_attempts;

    // If remaining_attempts not provided, try to extract from message
    if (remaining === undefined && error.message) {
      const match = error.message.match(/(\d+)\s*تلاش/);
      if (match) {
        remaining = parseInt(match[1], 10);
      }
    }

    // Default to undefined if still not found (let component handle it)
    if (remaining === undefined) {
      remaining = undefined;
    }

    if (remaining === 0 || (error.message || "").includes("Maximum attempts")) {
      return {
        userMessage: "تعداد تلاش‌های مجاز تمام شد. کد جدید دریافت کنید",
        severity: "error",
        action: "resend",
        clearOTP: true,
        remainingAttempts: 0,
      };
    }

    if (
      error.message?.includes("expired") ||
      error.message?.includes("منقضی")
    ) {
      return {
        userMessage: "کد تایید منقضی شده است. کد جدید دریافت کنید",
        severity: "warning",
        action: "resend",
        clearOTP: true,
      };
    }

    // Show the backend message directly if it contains attempt info
    const userMessage = remaining !== undefined
      ? error.message || `کد تایید اشتباه است (باقیمانده: ${remaining} تلاش)`
      : error.message || "کد تایید اشتباه است";

    return {
      userMessage,
      severity: "error",
      action: "retry",
      clearOTP: true,
      remainingAttempts: remaining,
    };
  }

  if (!statusCode) {
    return {
      userMessage: "خطا در اتصال به سرور. لطفاً دوباره تلاش کنید",
      severity: "error",
      action: "retry",
    };
  }

  return {
    userMessage: error.message || "خطا در تایید کد",
    severity: "error",
    action: "retry",
  };
}

