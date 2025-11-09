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
    if (!phone || typeof phone !== 'string') {
        return { isValid: false, error: 'شماره موبایل معتبر نیست. مثال: 09123456789' };
    }

    // 1) Convert Persian and Arabic-Indic digits to ASCII digits
    const convertPersianArabicToEnglish = (s: string) =>
        s
            .replace(/[\u06F0-\u06F9]/g, ch => String(ch.charCodeAt(0) - 0x06F0))  // Persian ۰-۹
            .replace(/[\u0660-\u0669]/g, ch => String(ch.charCodeAt(0) - 0x0660)); // Arabic-Indic ٠-٩

    let normalizedInput = convertPersianArabicToEnglish(phone);

    // 2) Trim and remove extra spaces
    normalizedInput = normalizedInput.trim();

    // 3) Preserve a single leading '+' if present, remove all other non-digits
    if (normalizedInput.startsWith('+')) {
        normalizedInput = '+' + normalizedInput.slice(1).replace(/\D/g, '');
    } else {
        normalizedInput = normalizedInput.replace(/\D/g, '');
    }

    // Now the same three patterns (on ASCII digits / optional leading +)
    const pattern1 = /^09\d{9}$/;       // 09XXXXXXXXX (11 digits)
    const pattern2 = /^\+989\d{9}$/;    // +989XXXXXXXXX (13 chars)
    const pattern3 = /^989\d{9}$/;      // 989XXXXXXXXX (12 digits)

    if (pattern1.test(normalizedInput)) {
        // e.g. 09123456789 -> +989123456789
        return {
            isValid: true,
            normalized: `+98${normalizedInput.substring(1)}`,
        };
    }

    if (pattern2.test(normalizedInput)) {
        // already in +98...
        return {
            isValid: true,
            normalized: normalizedInput,
        };
    }

    if (pattern3.test(normalizedInput)) {
        // e.g. 989123456789 -> +989123456789
        return {
            isValid: true,
            normalized: `+${normalizedInput}`,
        };
    }

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
