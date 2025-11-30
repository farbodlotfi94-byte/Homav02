import { normalizePersianDigits } from "./normalizeDigits";

export function validateOTPCode(code: string): { isValid: boolean; error?: string } {
  const normalized = normalizePersianDigits(code);
  const digitsOnly = normalized.replace(/\D/g, "");

  if (digitsOnly.length !== 6) {
    return {
      isValid: false,
      error: "کد تایید باید ۶ رقم باشد",
    };
  }

  if (!/^\d{6}$/.test(digitsOnly)) {
    return {
      isValid: false,
      error: "کد تایید فقط باید شامل اعداد باشد",
    };
  }

  return { isValid: true };
}

