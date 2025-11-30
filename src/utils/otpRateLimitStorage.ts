const STORAGE_KEY_PREFIX = "homa_otp_rate_limit_";
const MAX_REQUESTS_PER_HOUR = 3;
const HOUR_IN_MS = 60 * 60 * 1000;
export const OTP_COOLDOWNS_SECONDS = [60, 90, 120] as const; // seconds

interface OTPRateLimitState {
  phoneHash: string;
  lastRequestTimestamp: number;
  requestCount: number;
  cooldownExpiry: number | null;
  resendCount: number;
}

function getStorageKey(phoneNumber: string): string {
  return `${STORAGE_KEY_PREFIX}${hashPhoneNumber(phoneNumber)}`;
}

export function getOTPRateLimitState(phoneNumber: string): OTPRateLimitState | null {
  const key = getStorageKey(phoneNumber);

  const stored = localStorage.getItem(key);
  if (!stored) {
    return null;
  }

  try {
    const parsed: OTPRateLimitState = JSON.parse(stored);
    const now = Date.now();

    if (now - parsed.lastRequestTimestamp > HOUR_IN_MS) {
      clearOTPRateLimitState(phoneNumber);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("[OTPRateLimit] Failed to parse state:", error);
    clearOTPRateLimitState(phoneNumber);
    return null;
  }
}

export function canSendOTP(phoneNumber: string): {
  allowed: boolean;
  reason?: "cooldown" | "rate_limit";
  waitTime?: number;
} {
  const state = getOTPRateLimitState(phoneNumber);
  if (!state) {
    return { allowed: true };
  }

  const now = Date.now();

  if (state.cooldownExpiry && now < state.cooldownExpiry) {
    return {
      allowed: false,
      reason: "cooldown",
      waitTime: Math.ceil((state.cooldownExpiry - now) / 1000),
    };
  }

  if (state.requestCount >= MAX_REQUESTS_PER_HOUR) {
    const hourExpiry = state.lastRequestTimestamp + HOUR_IN_MS;
    if (now < hourExpiry) {
      return {
        allowed: false,
        reason: "rate_limit",
        waitTime: Math.ceil((hourExpiry - now) / 1000),
      };
    }
  }

  return { allowed: true };
}

export function recordOTPRequest(phoneNumber: string, isResend: boolean = false): void {
  const key = getStorageKey(phoneNumber);
  const now = Date.now();
  const previousState = getOTPRateLimitState(phoneNumber);

  const state: OTPRateLimitState = previousState || {
    phoneHash: hashPhoneNumber(phoneNumber),
    lastRequestTimestamp: now,
    requestCount: 0,
    cooldownExpiry: null,
    resendCount: 0,
  };

  state.lastRequestTimestamp = now;

  if (isResend) {
    state.resendCount = Math.min(state.resendCount + 1, OTP_COOLDOWNS_SECONDS.length - 1);
  } else {
    state.resendCount = 0;
  }

  state.requestCount = (previousState ? previousState.requestCount : 0) + 1;

  const cooldownIndex = Math.min(state.resendCount, OTP_COOLDOWNS_SECONDS.length - 1);
  state.cooldownExpiry = now + OTP_COOLDOWNS_SECONDS[cooldownIndex] * 1000;

  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error("[OTPRateLimit] Failed to persist state:", error);
  }
}

export function clearOTPRateLimitState(phoneNumber: string): void {
  const key = getStorageKey(phoneNumber);
  localStorage.removeItem(key);
}

function hashPhoneNumber(phone: string): string {
  let hash = 0;
  for (let i = 0; i < phone.length; i++) {
    const char = phone.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

