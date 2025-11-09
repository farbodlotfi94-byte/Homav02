/**
 * Iranian Phone Number Validator and Normalizer
 * Handles phone formats: 09XX, +989XX, 989XX
 * Normalizes to E.164 format: +989XXXXXXXXX
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;  // Normalized to +989XXXXXXXXX
  error?: string;
}

/**
 * Validate and normalize Iranian phone number
 *
 * Accepts formats:
 * - 09123456789
 * - +989123456789
 * - 989123456789
 *
 * Returns normalized format: +989123456789
 */
export function validateAndNormalizePhone(phone: string): PhoneValidationResult {
  // Remove whitespace
  const cleaned = phone.trim().replace(/\s+/g, '');

  // Pattern 1: 09XXXXXXXXX (11 digits starting with 09)
  const pattern1 = /^09\d{9}$/;
  if (pattern1.test(cleaned)) {
    return {
      isValid: true,
      normalized: `+98${cleaned.substring(1)}`, // Remove leading 0, add +98
    };
  }

  // Pattern 2: +989XXXXXXXXX (13 chars starting with +989)
  const pattern2 = /^\+989\d{9}$/;
  if (pattern2.test(cleaned)) {
    return {
      isValid: true,
      normalized: cleaned,
    };
  }

  // Pattern 3: 989XXXXXXXXX (12 digits starting with 989)
  const pattern3 = /^989\d{9}$/;
  if (pattern3.test(cleaned)) {
    return {
      isValid: true,
      normalized: `+${cleaned}`, // Add + prefix
    };
  }

  // Invalid format
  return {
    isValid: false,
    error: 'شماره موبایل معتبر نیست. مثال: 09123456789',
  };
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'رمز عبور باید حداقل ۸ کاراکتر باشد',
    };
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد',
    };
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد',
    };
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'رمز عبور باید حداقل یک عدد داشته باشد',
    };
  }

  return { isValid: true };
}

/**
 * Format phone number for display (remove country code)
 * +989123456789 → 09123456789
 */
export function formatPhoneForDisplay(phone: string): string {
  if (phone.startsWith('+98')) {
    return `0${phone.substring(3)}`;
  }
  if (phone.startsWith('98')) {
    return `0${phone.substring(2)}`;
  }
  return phone;
}
