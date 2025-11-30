# OTP Authentication Implementation Plan
## HOMA Furniture Visualization App

**Version:** 1.0
**Date:** 2025-11-20
**Status:** Ready for Implementation

---

## Executive Summary

This document provides a production-ready architectural plan for implementing OTP (One-Time Password) authentication as the primary login/register method in the HOMA application. The plan is based on extensive research of industry best practices from major platforms (WhatsApp, Telegram, Google) and modern authentication standards for 2025.

**Key Decisions:**
- **Passwordless-first approach**: OTP as primary authentication (no password required for most users)
- **Auto-registration**: New users are automatically created on first successful OTP verification
- **Single-field OTP input**: Superior accessibility and UX compared to 6-box approach
- **Progressive enhancement**: WebOTP API for auto-fill on supported browsers
- **Mobile-first design**: RTL support, Persian number handling, numeric keyboard
- **Security-hardened**: Client-side rate limiting feedback, secure token storage, comprehensive error handling

**Implementation Phases:**
1. Core OTP flow (1-2 weeks)
2. Enhanced UX features (1 week)
3. Security hardening (3-5 days)
4. Analytics and monitoring (2-3 days)

---

## Table of Contents

1. [Research Findings Summary](#1-research-findings-summary)
2. [User Flow Design](#2-user-flow-design)
3. [Component Architecture](#3-component-architecture)
4. [State Management Strategy](#4-state-management-strategy)
5. [API Integration Patterns](#5-api-integration-patterns)
6. [UI/UX Design Specifications](#6-uiux-design-specifications)
7. [Security Implementation](#7-security-implementation)
8. [Error Handling Matrix](#8-error-handling-matrix)
9. [Implementation Phases](#9-implementation-phases)
10. [Testing Strategy](#10-testing-strategy)
11. [Code Organization](#11-code-organization)
12. [Accessibility Checklist](#12-accessibility-checklist)

---

## 1. Research Findings Summary

### 1.1 Industry Best Practices (2025)

#### OTP Input Field Design: Single Field vs Multiple Boxes

**Research Consensus: Single Field Wins**

After analyzing implementations from major platforms (WhatsApp, Telegram, Google, Twitter), the single-field approach is recommended for the following reasons:

**Advantages of Single Field:**
- **Superior Accessibility**: Screen readers work naturally with a single input
- **Auto-fill Support**: WebOTP API and browser autofill "just work" without complex implementation
- **Copy-Paste Friendly**: Users can paste the full OTP without complex logic
- **Simpler Implementation**: Fewer edge cases, less state management
- **Mobile Keyboard**: Natural input flow without focus-juggling complexity

**Disadvantages of 6-Box Approach:**
- Screen reader confusion (reads 6 separate inputs)
- Complex focus management (auto-advance, backspace handling)
- Auto-fill requires custom implementation
- Paste handling requires complex parsing logic
- Higher maintenance burden

**Industry Examples:**
- **WhatsApp Web**: Single field with visual slot styling
- **Google**: Single field with autocomplete="one-time-code"
- **Telegram**: Single field with numeric input mode
- **Recommended by**: Twilio, Auth0, MDN, WCAG 2.2 standards

#### WebOTP API (SMS Auto-Fill)

**Browser Support (2025):**
- Chrome/Edge on Android: Full support
- Safari on iOS: Partial support (SMS format auto-fill)
- Desktop browsers: No support
- **Implementation Strategy**: Progressive enhancement (fallback to manual entry)

**SMS Format Requirements:**
```
کد تایید شما: 123456

@yourdomain.com #123456
```

**Key Points:**
- Must be served over HTTPS
- Domain must match exactly
- OTP must be last line with # prefix
- Keep SMS under 140 characters
- Works as progressive enhancement (not required for functionality)

#### Timer and Resend Button UX

**Research Findings:**
- **Initial countdown**: 60 seconds (industry standard)
- **Visual treatment**: Gray out resend button during countdown
- **Show remaining time**: "ارسال مجدد (۴۵ ثانیه)" format
- **After expiry**: Enable button with clear CTA
- **Multiple resends**: Increase countdown (60s → 90s → 120s) to prevent abuse
- **Max resends**: 3 attempts per 10-minute window

**Best Practice Pattern:**
```
[Send OTP] → Timer starts (60s) → [Resend disabled (45s)] → [Resend enabled] → Click → [New OTP sent, timer reset to 90s]
```

#### Security Best Practices

**Rate Limiting (Critical):**
- **Server-side**: Already implemented (3 requests/hour per phone, 10/hour per IP)
- **Client-side feedback**: Show remaining time to user, disable buttons
- **Storage**: localStorage to persist rate limit state across page refreshes
- **Key**: `homa_otp_rate_limit_{phone_number_hash}`

**OTP Security:**
- 6-digit numeric code (standard)
- 3-minute expiration (180 seconds) - already implemented
- 5 verification attempts max - already implemented
- One-time use (invalidated after success)
- Hash storage on server (security best practice)

**Token Storage (JWT):**
- **Access Token**: localStorage (acceptable for SPAs without sensitive operations)
- **Refresh Token**: localStorage (with auto-refresh on 401)
- **Alternative**: HttpOnly cookies (better security, requires backend change)
- **Current Implementation**: localStorage (already in use, acceptable)
- **XSS Mitigation**: Content Security Policy (CSP), input sanitization

### 1.2 Persian/RTL-Specific Considerations

#### Phone Number Format
- **Display Format**: ۰۹۱۲ ۳۴۵ ۶۷۸۹ (Persian digits with spaces)
- **Input Format**: Accept both Persian (۰-۹) and English (0-9) digits
- **Normalization**: Convert to +989XXXXXXXXX for API calls
- **Validation**: Already implemented in `/src/utils/phoneValidator.ts`

#### RTL Input Fields
- **Direction**: `dir="ltr"` for phone and OTP inputs (numbers are LTR)
- **Text Alignment**: `text-align: right` for Persian labels
- **Layout**: RTL layout for overall modal/page
- **Number Conversion**: Already handled by `normalizePersianDigits()` utility

#### Mobile Keyboard
- **Input Type**: `type="tel"` for phone, `type="text"` for OTP
- **Input Mode**: `inputmode="numeric"` to show numeric keypad
- **Pattern**: `pattern="[0-9]*"` for iOS numeric keyboard
- **Autocomplete**: `autocomplete="one-time-code"` for OTP field

### 1.3 Passwordless Authentication Pattern

**Auto-Registration Flow:**
1. User enters phone number
2. OTP sent via SMS
3. User enters OTP
4. Backend verifies OTP
5. **If new user**: Auto-create account (no password required)
6. **If existing user**: Log in with OTP
7. Return JWT tokens (access + refresh)

**Security Considerations:**
- **User Enumeration Risk**: Backend should use same success message for new/existing users
- **Account Takeover Prevention**: Rate limiting on OTP send prevents SIM swap attacks
- **MFA Recommendation**: For sensitive operations (future: profile changes, payments)

**Backend API (Already Implemented):**
- `POST /api/users/otp/send/` - Send OTP
- `POST /api/users/otp/verify/` - Verify OTP (auto-creates user if new)
- `POST /api/users/otp/resend/` - Resend OTP (invalidates previous)

---

## 2. User Flow Design

### 2.1 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Authentication Flow                      │
└─────────────────────────────────────────────────────────────────┘

[User not authenticated] → Clicks "Upload" or "Login"
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Phone Number Entry                                      │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ ورود یا ثبت‌نام                                          │   │
│ │                                                           │   │
│ │ شماره موبایل خود را وارد کنید                            │   │
│ │ ┌───────────────────────────────────────┐               │   │
│ │ │ 09XX XXX XXXX                          │ [dir=ltr]    │   │
│ │ └───────────────────────────────────────┘               │   │
│ │                                                           │   │
│ │ [ارسال کد تایید]                                         │   │
│ │                                                           │   │
│ │ با ادامه، شما قوانین و مقررات HOMA را می‌پذیرید         │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
    ↓ (API: POST /api/users/otp/send/)
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: OTP Verification                                        │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ کد تایید را وارد کنید                                    │   │
│ │                                                           │   │
│ │ کد ۶ رقمی به شماره ۰۹۱۲****۷۸۹ ارسال شد                 │   │
│ │                                                           │   │
│ │ ┌─────────────────────────────────────┐                 │   │
│ │ │  ╔═══╗ ╔═══╗ ╔═══╗ ╔═══╗ ╔═══╗ ╔═══╗│ (visual only)  │   │
│ │ │  ║ 1 ║ ║ 2 ║ ║ 3 ║ ║ 4 ║ ║ 5 ║ ║ 6 ║│                 │   │
│ │ │  ╚═══╝ ╚═══╝ ╚═══╝ ╚═══╝ ╚═══╝ ╚═══╝│                 │   │
│ │ │  [Single hidden input with styled overlay]           │   │
│ │ └─────────────────────────────────────┘                 │   │
│ │                                                           │   │
│ │ ⏱ کد جدید در ۴۵ ثانیه دیگر                               │   │
│ │                                                           │   │
│ │ [تایید]                                                  │   │
│ │ [ارسال مجدد] (disabled during countdown)                 │   │
│ │ [ویرایش شماره]                                           │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
    ↓ (API: POST /api/users/otp/verify/)
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Success State                                                   │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ ✅ ورود موفق!                                            │   │
│ │                                                           │   │
│ │ [Loading animation]                                       │   │
│ │                                                           │   │
│ │ در حال انتقال...                                         │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
    ↓
[Navigate to next step: Upload or Product Selection]
```

### 2.2 Error Recovery Flows

#### Flow A: Incorrect OTP (Attempts < 5)
```
[User enters wrong OTP] → API returns 400 {"detail": "Invalid OTP"}
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ ❌ کد وارد شده اشتباه است                                      │
│ باقیمانده تلاش‌ها: ۳ بار                                        │
│ [Input field cleared, focused]                                  │
│ [تلاش مجدد] [ارسال کد جدید]                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Flow B: Max Attempts Exceeded (5 failures)
```
[5th incorrect OTP] → API returns 400 {"detail": "Max attempts exceeded"}
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ ❌ تعداد تلاش‌های مجاز تمام شد                                  │
│ لطفاً کد جدید دریافت کنید                                       │
│ [ارسال کد جدید] (enabled)                                      │
│ [بازگشت]                                                        │
└─────────────────────────────────────────────────────────────────┘
```

#### Flow C: OTP Expired (3 minutes)
```
[User enters expired OTP] → API returns 400 {"detail": "OTP expired"}
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ ⏱ کد تایید منقضی شده است                                       │
│ کد جدید دریافت کنید                                             │
│ [ارسال کد جدید] (enabled)                                      │
│ [بازگشت]                                                        │
└─────────────────────────────────────────────────────────────────┘
```

#### Flow D: Rate Limit Exceeded
```
[Too many OTP requests] → API returns 429 {"detail": "Rate limit..."}
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ ⚠ محدودیت تعداد درخواست                                        │
│ شما بیش از حد مجاز درخواست کد تایید داده‌اید                   │
│ لطفاً ۱۵ دقیقه دیگر تلاش کنید                                  │
│                                                                  │
│ زمان باقیمانده: ۱۴:۳۲                                          │
│ [بازگشت به صفحه اصلی]                                          │
└─────────────────────────────────────────────────────────────────┘
```

#### Flow E: Network Error
```
[Network timeout/failure] → API call fails
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ 🔌 خطا در اتصال به سرور                                        │
│ لطفاً اتصال اینترنت خود را بررسی کنید                          │
│ [تلاش مجدد] [بازگشت]                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Resend OTP Flow

```
[User clicks "Resend"]
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Are we within 60s of last send?                                 │
│   Yes → Show client-side error "لطفاً ۳۵ ثانیه دیگر تلاش کنید" │
│   No  → Continue                                                 │
└─────────────────────────────────────────────────────────────────┘
    ↓
(API: POST /api/users/otp/resend/)
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Success:                                                        │
│ - Invalidate old OTP                                            │
│ - New OTP sent                                                  │
│ - Reset verification attempts counter                           │
│ - Reset timer (60s → 90s on 2nd resend → 120s on 3rd)         │
│ - Show toast: "کد جدید ارسال شد"                               │
│ - Clear input field                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Integration with Existing App Flow

**Current App Steps:**
```
product-selection → product-landing → user-auth (NEW) → upload → ...
```

**Modified Flow:**
```
product-landing → [Upload button clicked]
    ↓
    Is user authenticated? (check userAuthService.isAuthenticated())
    ↓
    No → setCurrentStep('user-auth')  [Show OTP Modal]
    ↓
    [User completes OTP verification]
    ↓
    Yes → setCurrentStep('upload')
```

**Implementation in App.tsx:**
- Already has `user-auth` step in Step type union (line 62)
- Already has `handleAuthSuccess()` handler (line 486-508)
- Already guards upload step (line 1393-1423)
- **No major changes needed** - just replace `UserLogin` component with `OTPLogin`

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
src/components/
├── OTPLogin.tsx                 (NEW - Main OTP auth component)
│   ├── PhoneNumberStep          (Sub-component or state)
│   └── OTPVerificationStep      (Sub-component or state)
├── ui/
│   ├── OTPInput.tsx             (NEW - Reusable OTP input field)
│   ├── PhoneInput.tsx           (NEW - Persian phone input with validation)
│   └── CountdownTimer.tsx       (NEW - Resend countdown timer)
├── UserLogin.tsx                (EXISTING - Keep for password fallback)
└── ...
```

### 3.2 Component Specifications

#### 3.2.1 OTPLogin Component (Main Container)

**File:** `/src/components/OTPLogin.tsx`

**Purpose:** Main authentication modal that replaces or extends `UserLogin.tsx`

**Props Interface:**
```typescript
interface OTPLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authData: AuthData) => void;
  initialPhoneNumber?: string; // Pre-fill phone if available
}
```

**Internal State:**
```typescript
type AuthStep = 'phone' | 'otp' | 'success';

interface OTPLoginState {
  step: AuthStep;
  phoneNumber: string;           // Normalized: +989XXXXXXXXX
  displayPhone: string;          // Formatted for display: ۰۹۱۲ *** ۷۸۹
  otpCode: string;               // 6 digits
  loading: boolean;
  error: string | null;
  otpSentAt: number | null;      // Timestamp for timer
  resendCount: number;           // Track resends (0, 1, 2, 3)
  remainingAttempts: number;     // Verification attempts (5, 4, 3, ...)
  rateLimitExpiry: number | null; // Timestamp for rate limit
}
```

**Key Methods:**
```typescript
// Phone step
handlePhoneSubmit: () => Promise<void>
  - Validate phone number (validateAndNormalizePhone)
  - Check client-side rate limit
  - Call API: POST /api/users/otp/send/
  - On success: transition to 'otp' step
  - On error: show error message

// OTP step
handleOTPSubmit: () => Promise<void>
  - Validate OTP format (6 digits)
  - Call API: POST /api/users/otp/verify/
  - On success: call onSuccess(authData), transition to 'success'
  - On error: decrement remainingAttempts, show error

handleResendOTP: () => Promise<void>
  - Check client-side timer (must wait 60s)
  - Call API: POST /api/users/otp/resend/
  - Increment resendCount
  - Reset timer (60s/90s/120s based on count)

handleEditPhone: () => void
  - Reset state
  - Transition back to 'phone' step

// Lifecycle
useEffect(() => {
  // Start countdown timer when OTP sent
  // Persist rate limit to localStorage
  // Auto-submit OTP when 6 digits entered (optional UX enhancement)
})
```

**UI States:**
- **Loading**: Show spinner on submit buttons
- **Error**: Red alert banner above input
- **Success**: Green checkmark + "ورود موفق" + auto-close after 1s
- **Rate Limited**: Disable inputs, show countdown, no close button

#### 3.2.2 OTPInput Component (Reusable)

**File:** `/src/components/ui/OTPInput.tsx`

**Purpose:** Accessible single-field OTP input with visual 6-box styling

**Library Recommendation:** Use `input-otp` by @guilherme_rodz
- Install: `npm install input-otp`
- Accessibility: Single input (screen reader friendly)
- Styling: Unstyled, full customization
- Auto-paste: Built-in support
- RTL: Compatible

**Props Interface:**
```typescript
interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void; // Auto-submit callback
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  length?: number; // Default: 6
}
```

**Implementation Example (using input-otp):**
```typescript
import { OTPInput } from 'input-otp';

export function OTPInputField({ value, onChange, onComplete, ... }: OTPInputProps) {
  return (
    <OTPInput
      value={value}
      onChange={onChange}
      maxLength={6}
      render={({ slots }) => (
        <div className="flex gap-2 dir-ltr">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={cn(
                "w-12 h-14 border-2 rounded-lg flex items-center justify-center",
                "text-2xl font-bold",
                slot.isActive && "border-accent ring-2 ring-accent/20",
                error && "border-red-500",
                disabled && "bg-gray-100 cursor-not-allowed"
              )}
            >
              {slot.char}
            </div>
          ))}
        </div>
      )}
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="one-time-code"
      onComplete={onComplete}
      disabled={disabled}
    />
  );
}
```

**Accessibility Features:**
- Single `<input>` element (WCAG 2.2 compliant)
- `aria-label="کد تایید ۶ رقمی"`
- `inputmode="numeric"` for mobile keyboard
- `autocomplete="one-time-code"` for WebOTP
- Auto-focus on mount
- Clear error announcements

#### 3.2.3 PhoneInput Component

**File:** `/src/components/ui/PhoneInput.tsx`

**Purpose:** Persian-friendly phone number input with validation

**Props Interface:**
```typescript
interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}
```

**Features:**
- Accept both Persian (۰۹۱۲) and English (0912) digits
- Real-time normalization using `normalizePersianDigits()`
- Validation using existing `validateAndNormalizePhone()`
- Format display: `09XX XXX XXXX` (with spaces)
- LTR input direction for numbers
- Placeholder: "۰۹۱۲ ۳۴۵ ۶۷۸۹"

**Implementation:**
```typescript
export function PhoneInput({ value, onChange, error, ... }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const normalized = normalizePersianDigits(input);
    const digitsOnly = normalized.replace(/\D/g, '');

    // Format: 09XX XXX XXXX
    let formatted = digitsOnly;
    if (digitsOnly.length > 4) {
      formatted = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7, 11)}`;
    }

    onChange(formatted);

    // Validate
    if (digitsOnly.length === 11) {
      const validation = validateAndNormalizePhone(digitsOnly);
      onValidationChange?.(validation.isValid);
    }
  };

  return (
    <input
      type="tel"
      value={value}
      onChange={handleChange}
      inputMode="numeric"
      pattern="[0-9]*"
      dir="ltr"
      className={cn("...", error && "border-red-500")}
      maxLength={15} // "09XX XXX XXXX" with spaces
      placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
      {...props}
    />
  );
}
```

#### 3.2.4 CountdownTimer Component

**File:** `/src/components/ui/CountdownTimer.tsx`

**Purpose:** Countdown display for resend OTP button

**Props Interface:**
```typescript
interface CountdownTimerProps {
  expiryTimestamp: number;  // Unix timestamp (ms)
  onExpire: () => void;
  format?: 'mm:ss' | 'seconds'; // Default: 'mm:ss'
}
```

**Implementation:**
```typescript
export function CountdownTimer({ expiryTimestamp, onExpire, format = 'mm:ss' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const diff = Math.max(0, expiryTimestamp - now);
      setTimeLeft(Math.floor(diff / 1000));

      if (diff <= 0) {
        onExpire();
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [expiryTimestamp, onExpire]);

  const formatTime = () => {
    if (format === 'seconds') {
      return `${timeLeft} ثانیه`;
    }
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return <span className="font-mono" dir="ltr">{formatTime()}</span>;
}
```

**Usage:**
```typescript
<button disabled={!canResend}>
  {canResend ? (
    "ارسال مجدد"
  ) : (
    <>
      ارسال مجدد (
      <CountdownTimer
        expiryTimestamp={otpExpiryTimestamp}
        onExpire={() => setCanResend(true)}
        format="seconds"
      />
      )
    </>
  )}
</button>
```

---

## 4. State Management Strategy

### 4.1 Local Component State vs Global State

**Decision: Local Component State (useState)**

**Rationale:**
- OTP auth is self-contained within `OTPLogin` component
- No need for cross-component state sharing
- App.tsx already uses local state pattern (no Redux/Context)
- Simpler mental model, easier to reason about

**What Goes in Local State:**
- Current step (phone/otp/success)
- Form inputs (phoneNumber, otpCode)
- Loading/error states
- Timer state (otpSentAt, resendCount)

**What Goes in Persistent Storage (localStorage):**
- Rate limit state (per phone number)
- Last OTP request timestamp
- Resend count (for escalating cooldown)

### 4.2 Rate Limit State Management

**Problem:** Backend rate limits (3 requests/hour) should be reflected in UI to prevent unnecessary API calls and improve UX.

**Solution:** Client-side rate limit tracking with localStorage persistence.

**Implementation:**

```typescript
// File: /src/utils/otpRateLimitStorage.ts

interface OTPRateLimitState {
  phoneNumber: string;           // Hashed for privacy
  lastRequestTimestamp: number;  // Unix timestamp (ms)
  requestCount: number;          // Requests in current hour
  cooldownExpiry: number | null; // Timestamp when user can request again
  resendCount: number;           // Resends for current OTP session
}

const STORAGE_KEY_PREFIX = 'homa_otp_rate_limit_';
const MAX_REQUESTS_PER_HOUR = 3;
const HOUR_IN_MS = 60 * 60 * 1000;
const COOLDOWNS = [60, 90, 120]; // seconds for 1st, 2nd, 3rd resend

export function getOTPRateLimitState(phoneNumber: string): OTPRateLimitState | null {
  const key = STORAGE_KEY_PREFIX + hashPhoneNumber(phoneNumber);
  const stored = localStorage.getItem(key);
  if (!stored) return null;

  const state: OTPRateLimitState = JSON.parse(stored);

  // Check if hour window has passed
  const now = Date.now();
  if (now - state.lastRequestTimestamp > HOUR_IN_MS) {
    // Reset request count
    clearOTPRateLimitState(phoneNumber);
    return null;
  }

  return state;
}

export function canSendOTP(phoneNumber: string): {
  allowed: boolean;
  reason?: string;
  waitTime?: number; // seconds
} {
  const state = getOTPRateLimitState(phoneNumber);
  if (!state) return { allowed: true };

  const now = Date.now();

  // Check cooldown from last resend
  if (state.cooldownExpiry && now < state.cooldownExpiry) {
    const waitTime = Math.ceil((state.cooldownExpiry - now) / 1000);
    return {
      allowed: false,
      reason: 'cooldown',
      waitTime,
    };
  }

  // Check hourly limit
  if (state.requestCount >= MAX_REQUESTS_PER_HOUR) {
    const hourExpiry = state.lastRequestTimestamp + HOUR_IN_MS;
    const waitTime = Math.ceil((hourExpiry - now) / 1000);
    return {
      allowed: false,
      reason: 'rate_limit',
      waitTime,
    };
  }

  return { allowed: true };
}

export function recordOTPRequest(phoneNumber: string, isResend: boolean = false) {
  const state = getOTPRateLimitState(phoneNumber) || {
    phoneNumber: hashPhoneNumber(phoneNumber),
    lastRequestTimestamp: 0,
    requestCount: 0,
    cooldownExpiry: null,
    resendCount: 0,
  };

  const now = Date.now();
  state.lastRequestTimestamp = now;
  state.requestCount += 1;

  if (isResend) {
    state.resendCount += 1;
    const cooldownSeconds = COOLDOWNS[Math.min(state.resendCount - 1, COOLDOWNS.length - 1)];
    state.cooldownExpiry = now + (cooldownSeconds * 1000);
  }

  const key = STORAGE_KEY_PREFIX + hashPhoneNumber(phoneNumber);
  localStorage.setItem(key, JSON.stringify(state));
}

export function clearOTPRateLimitState(phoneNumber: string) {
  const key = STORAGE_KEY_PREFIX + hashPhoneNumber(phoneNumber);
  localStorage.removeItem(key);
}

function hashPhoneNumber(phone: string): string {
  // Simple hash for privacy (not cryptographic)
  let hash = 0;
  for (let i = 0; i < phone.length; i++) {
    const char = phone.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}
```

**Usage in Component:**
```typescript
const handleSendOTP = async () => {
  const check = canSendOTP(phoneNumber);
  if (!check.allowed) {
    if (check.reason === 'cooldown') {
      setError(`لطفاً ${check.waitTime} ثانیه دیگر تلاش کنید`);
    } else if (check.reason === 'rate_limit') {
      setError(`شما بیش از حد مجاز درخواست داده‌اید. لطفاً ${Math.ceil(check.waitTime / 60)} دقیقه دیگر تلاش کنید`);
    }
    return;
  }

  // Proceed with API call
  const result = await otpService.sendOTP(phoneNumber);
  if (result.success) {
    recordOTPRequest(phoneNumber, isResend);
  }
};
```

### 4.3 Form State Management

**Pattern: Controlled Components**

```typescript
// Phone step state
const [phoneNumber, setPhoneNumber] = useState('');
const [phoneError, setPhoneError] = useState<string | null>(null);

// OTP step state
const [otpCode, setOTPCode] = useState('');
const [otpError, setOTPError] = useState<string | null>(null);
const [remainingAttempts, setRemainingAttempts] = useState(5);

// Loading states
const [sendingOTP, setSendingOTP] = useState(false);
const [verifyingOTP, setVerifyingOTP] = useState(false);

// Timer state
const [otpSentAt, setOTPSentAt] = useState<number | null>(null);
const [canResend, setCanResend] = useState(false);
```

**Validation Strategy:**
- **Client-side**: Immediate feedback (format, length)
- **Server-side**: Authoritative validation (phone exists, OTP correct)
- **Error display**: Inline below input field

---

## 5. API Integration Patterns

### 5.1 OTP Service Layer

**File:** `/src/services/otpService.ts`

**Purpose:** Encapsulate all OTP-related API calls with error handling and retry logic.

```typescript
import { API_CONFIG } from '../config/api';
import type { AuthData } from '../types/auth';

export interface SendOTPRequest {
  phone_number: string;  // +989XXXXXXXXX format
  purpose: 'login' | 'reset_password' | 'verify_phone';
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data?: {
    expires_in: number;  // Seconds (180)
    retry_after?: number; // If rate limited
  };
  error?: string;
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp_code: string;     // 6 digits
  purpose: 'login' | 'reset_password' | 'verify_phone';
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: AuthData;  // JWT tokens + user data
  error?: string;
  remaining_attempts?: number;
}

export interface ResendOTPRequest {
  phone_number: string;
  purpose: 'login' | 'reset_password' | 'verify_phone';
}

class OTPService {
  private baseURL = API_CONFIG.BASE_URL;

  /**
   * Send OTP to phone number
   * POST /api/users/otp/send/
   */
  async sendOTP(request: SendOTPRequest): Promise<SendOTPResponse> {
    try {
      console.log('[OTPService] Sending OTP to:', request.phone_number);

      const response = await fetch(`${this.baseURL}/api/users/otp/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[OTPService] Send OTP failed:', data);

        // Handle rate limit (429)
        if (response.status === 429) {
          return {
            success: false,
            message: data.message || 'محدودیت تعداد درخواست',
            error: data.message,
            data: {
              expires_in: 0,
              retry_after: data.retry_after || 900, // 15 min default
            },
          };
        }

        // Handle validation errors (400)
        if (response.status === 400) {
          return {
            success: false,
            message: data.message || 'شماره موبایل نامعتبر است',
            error: data.detail || data.message,
          };
        }

        // Generic error
        return {
          success: false,
          message: data.message || 'خطا در ارسال کد تایید',
          error: data.detail || data.message,
        };
      }

      console.log('[OTPService] OTP sent successfully');
      return {
        success: true,
        message: data.message || 'کد تایید ارسال شد',
        data: {
          expires_in: data.expires_in || 180,
        },
      };
    } catch (error) {
      console.error('[OTPService] Send OTP error:', error);
      return {
        success: false,
        message: 'خطا در اتصال به سرور',
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Verify OTP code
   * POST /api/users/otp/verify/
   */
  async verifyOTP(request: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    try {
      console.log('[OTPService] Verifying OTP for:', request.phone_number);

      const response = await fetch(`${this.baseURL}/api/users/otp/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[OTPService] Verify OTP failed:', data);

        // Handle invalid OTP (400)
        if (response.status === 400) {
          return {
            success: false,
            message: data.message || 'کد تایید اشتباه است',
            error: data.detail || data.message,
            remaining_attempts: data.remaining_attempts,
          };
        }

        // Generic error
        return {
          success: false,
          message: data.message || 'خطا در تایید کد',
          error: data.detail || data.message,
        };
      }

      console.log('[OTPService] OTP verified successfully');

      // Auto-registration successful, user logged in
      return {
        success: true,
        message: data.message || 'ورود موفق',
        data: data.data, // { access_token, refresh_token, user, ... }
      };
    } catch (error) {
      console.error('[OTPService] Verify OTP error:', error);
      return {
        success: false,
        message: 'خطا در اتصال به سرور',
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Resend OTP (invalidates previous)
   * POST /api/users/otp/resend/
   */
  async resendOTP(request: ResendOTPRequest): Promise<SendOTPResponse> {
    try {
      console.log('[OTPService] Resending OTP to:', request.phone_number);

      const response = await fetch(`${this.baseURL}/api/users/otp/resend/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[OTPService] Resend OTP failed:', data);

        // Handle rate limit (429)
        if (response.status === 429) {
          return {
            success: false,
            message: data.message || 'محدودیت تعداد درخواست',
            error: data.message,
            data: {
              expires_in: 0,
              retry_after: data.retry_after || 900,
            },
          };
        }

        return {
          success: false,
          message: data.message || 'خطا در ارسال مجدد کد',
          error: data.detail || data.message,
        };
      }

      console.log('[OTPService] OTP resent successfully');
      return {
        success: true,
        message: data.message || 'کد جدید ارسال شد',
        data: {
          expires_in: data.expires_in || 180,
        },
      };
    } catch (error) {
      console.error('[OTPService] Resend OTP error:', error);
      return {
        success: false,
        message: 'خطا در اتصال به سرور',
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

export const otpService = new OTPService();
export default otpService;
```

### 5.2 Integration with Existing Auth Service

**Current:** `userAuthService` in `/src/services/userAuthService.ts` handles:
- `login()` - Username/password (keep for fallback)
- `register()` - Create account with password (keep for fallback)
- `refreshAccessToken()` - JWT refresh (reuse)
- `logout()` - Revoke tokens (reuse)
- `getUser()`, `isAuthenticated()` - (reuse)

**New:** OTP auth will use the same `AuthData` format, so after successful OTP verification:

```typescript
// In OTPLogin component
const handleOTPSubmit = async () => {
  const result = await otpService.verifyOTP({
    phone_number: normalizedPhone,
    otp_code: otpCode,
    purpose: 'login',
  });

  if (result.success && result.data) {
    // Save tokens to localStorage (reuse existing method)
    userAuthService['saveToStorage'](result.data); // Access private method via bracket notation, or make it public

    // OR: Just call onSuccess, and let App.tsx handle it
    onSuccess(result.data);
  }
};
```

**Recommendation:** Make `saveToStorage()` public in `userAuthService.ts`:

```typescript
// In userAuthService.ts
export function saveAuthData(authData: AuthData): void {
  this.saveToStorage(authData);
}
```

Then use it in OTPLogin:
```typescript
if (result.success && result.data) {
  userAuthService.saveAuthData(result.data);
  onSuccess(result.data);
}
```

### 5.3 WebOTP API Integration (Progressive Enhancement)

**File:** `/src/utils/webOTP.ts`

**Purpose:** Auto-fill OTP from SMS using WebOTP API (Chrome Android only).

```typescript
export interface WebOTPResult {
  code: string;
  error?: string;
}

/**
 * Request OTP from SMS using WebOTP API
 * Only works on Chrome/Edge Android with correctly formatted SMS
 *
 * SMS Format:
 * کد تایید شما: 123456
 *
 * @yourdomain.com #123456
 */
export async function requestWebOTP(): Promise<WebOTPResult | null> {
  // Feature detection
  if (!('OTPCredential' in window)) {
    console.log('[WebOTP] API not supported');
    return null;
  }

  try {
    // @ts-ignore - OTPCredential not in TS types yet
    const otp = await navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: AbortSignal.timeout(5 * 60 * 1000), // 5 min timeout
    });

    if (otp && 'code' in otp) {
      console.log('[WebOTP] OTP received:', otp.code);
      return { code: otp.code };
    }

    return null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('[WebOTP] User cancelled or timeout');
    } else {
      console.error('[WebOTP] Error:', error);
    }
    return { code: '', error: error.message };
  }
}

/**
 * Check if WebOTP is supported
 */
export function isWebOTPSupported(): boolean {
  return 'OTPCredential' in window;
}
```

**Usage in OTPLogin:**
```typescript
useEffect(() => {
  if (step === 'otp' && isWebOTPSupported()) {
    console.log('[OTPLogin] Starting WebOTP listener');

    requestWebOTP().then((result) => {
      if (result?.code) {
        console.log('[OTPLogin] Auto-filled OTP from SMS');
        setOTPCode(result.code);
        // Optionally auto-submit
        // handleOTPSubmit();
      }
    });
  }
}, [step]);
```

**SMS Format Recommendation (Backend):**
```
کد تایید HOMA: {otp_code}

@myhoma.ir #{otp_code}
```

---

## 6. UI/UX Design Specifications

### 6.1 Visual Design (Figma-Inspired)

**Design System:** Reuse existing HOMA design tokens from `/src/index.css`

**Colors:**
- Primary: `#E31E24` (HOMA red)
- Background: `#FAFAFA`
- Card: `#FFFFFF`
- Border: `#E5E7EB`
- Error: `#DC2626`
- Success: `#16A34A`
- Muted: `#6B7280`

**Typography:**
- Font: Vazirmatn (already loaded)
- Heading: 24px/700 (تایید شماره موبایل)
- Body: 16px/400
- Caption: 14px/400 (helper text)
- OTP digits: 32px/700 (large, monospace feel)

**Spacing:**
- Modal padding: 24px
- Input margin-bottom: 16px
- Button height: 48px
- Input height: 56px
- OTP box size: 48x56px, gap: 8px

**Borders & Radius:**
- Border radius: 12px (inputs), 16px (modal)
- Border width: 2px (focus), 1px (default)
- Focus ring: 4px offset, 20% opacity

### 6.2 Phone Number Step UI

```
┌─────────────────────────────────────────────────────────────┐
│ [X] Close                                                    │
│                                                              │
│                  ورود یا ثبت‌نام                             │
│            شماره موبایل خود را وارد کنید                    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ شماره موبایل                                         │    │
│ │ ┌───────────────────────────────────────────────┐   │    │
│ │ │ 📱 09XX XXX XXXX                              │   │    │
│ │ └───────────────────────────────────────────────┘   │    │
│ │ مثال: ۰۹۱۲ ۳۴۵ ۶۷۸۹                                 │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ [Error Banner - if error]                                   │
│ ❌ شماره موبایل وارد شده معتبر نیست                        │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │            ارسال کد تایید                            │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│      با ادامه، شما قوانین و مقررات HOMA را می‌پذیرید      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Specs:**
- Modal width: 400px (desktop), 100vw-32px (mobile)
- Close button: Top-left, 32x32px, gray hover
- Title: 24px/700, center-aligned
- Subtitle: 16px/400, gray-600, center-aligned
- Input: 56px height, 16px padding, LTR direction
- Icon: Phone emoji/icon, 20x20px, left-aligned in input
- Helper text: 14px, gray-500, below input
- Error banner: Red bg-50, red text-700, red border-500, 16px padding
- Submit button: Full width, 48px height, primary color
- Terms text: 12px, gray-500, center-aligned, "قوانین و مقررات" underlined link

### 6.3 OTP Verification Step UI

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Back                                      [X] Close      │
│                                                              │
│                   کد تایید را وارد کنید                     │
│          کد ۶ رقمی به شماره ۰۹۱۲****۷۸۹ ارسال شد          │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │  ╔═══╗ ╔═══╗ ╔═══╗ ╔═══╗ ╔═══╗ ╔═══╗                │    │
│ │  ║ 1 ║ ║ 2 ║ ║ 3 ║ ║ 4 ║ ║ 5 ║ ║ 6 ║                │    │
│ │  ╚═══╝ ╚═══╝ ╚═══╝ ╚═══╝ ╚═══╝ ╚═══╝                │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ [Error Banner - if error]                                   │
│ ❌ کد وارد شده اشتباه است (باقیمانده: ۳ تلاش)             │
│                                                              │
│ ⏱ کد جدید در ۴۵ ثانیه دیگر                                 │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │                  تایید                                │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │          ارسال مجدد (disabled, gray)                  │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│              ویرایش شماره موبایل                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Specs:**
- Back button: Top-right, arrow-left icon, 32x32px
- Title: 24px/700, center-aligned
- Subtitle: 14px/400, gray-600, center-aligned, phone masked (09XX****XXX)
- OTP boxes: 48x56px each, 8px gap, 2px border, 32px font size
- Active box: Border primary color, ring effect
- Filled box: Border gray-300, black text
- Empty box: Border gray-200, placeholder dash
- Timer: 14px, gray-500, clock icon, center-aligned
- Submit button: Full width, 48px height, primary color
- Resend button: Full width, 48px height, secondary style (outline)
  - Disabled state: Gray background, gray text, no hover
  - Enabled state: White background, primary border, primary text
- Edit phone link: 14px, primary color, underlined on hover, center-aligned

### 6.4 Loading & Success States

**Loading (During Verification):**
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│              [Spinner animation]                             │
│                                                              │
│                  در حال تایید...                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Success:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│              [Checkmark animation]                           │
│                   ✅                                         │
│                                                              │
│                  ورود موفق!                                 │
│             در حال انتقال...                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Animations:**
- Spinner: 24x24px, rotate 360deg in 1s, primary color
- Checkmark: Scale from 0 to 1 in 300ms, bounce easing
- Auto-close: After 1000ms success state
- Transition: Fade out modal (200ms), then call onSuccess()

### 6.5 Mobile Responsiveness

**Breakpoints:**
- Desktop: 768px+ (400px modal width)
- Mobile: <768px (full-width modal, 16px side padding)

**Mobile-Specific:**
- Modal: Full screen on mobile, bottom sheet animation
- OTP boxes: Slightly smaller (40x48px) on small screens
- Font sizes: Scale down by 10% on <360px screens
- Touch targets: Minimum 44x44px (WCAG guideline)
- Keyboard: inputmode="numeric" triggers numeric keypad
- Auto-scroll: Focus input scrolls into view

**iOS Safari Fixes:**
- Disable zoom on input focus: `maximum-scale=1.0` in viewport meta
- Safe area insets: `padding-bottom: env(safe-area-inset-bottom)`
- Prevent bounce: `overscroll-behavior: contain`

---

## 7. Security Implementation

### 7.1 Client-Side Security Measures

#### Input Validation

**Phone Number:**
```typescript
// Already implemented in /src/utils/phoneValidator.ts
export function validateAndNormalizePhone(phone: string) {
  const normalized = normalizePersianDigits(phone);
  const digitsOnly = normalized.replace(/\D/g, '');

  // Validation rules
  if (digitsOnly.length !== 11) return { isValid: false, error: 'شماره باید ۱۱ رقم باشد' };
  if (!digitsOnly.startsWith('09')) return { isValid: false, error: 'شماره باید با ۰۹ شروع شود' };

  const thirdDigit = digitsOnly[2];
  if (!['0', '1', '2', '3', '9'].includes(thirdDigit)) {
    return { isValid: false, error: 'شماره موبایل معتبر نیست' };
  }

  return {
    isValid: true,
    normalized: `+98${digitsOnly.substring(1)}`, // +989XXXXXXXXX
    display: digitsOnly, // 09XXXXXXXXX
  };
}
```

**OTP Code:**
```typescript
export function validateOTPCode(code: string): { isValid: boolean; error?: string } {
  const normalized = normalizePersianDigits(code);
  const digitsOnly = normalized.replace(/\D/g, '');

  if (digitsOnly.length !== 6) {
    return { isValid: false, error: 'کد تایید باید ۶ رقم باشد' };
  }

  if (!/^\d{6}$/.test(digitsOnly)) {
    return { isValid: false, error: 'کد تایید فقط باید شامل اعداد باشد' };
  }

  return { isValid: true };
}
```

#### Rate Limiting Feedback

**Client-Side Checks (Before API Call):**
```typescript
const handleSendOTP = async () => {
  // 1. Validate phone
  const phoneValidation = validateAndNormalizePhone(phoneNumber);
  if (!phoneValidation.isValid) {
    setError(phoneValidation.error);
    return;
  }

  // 2. Check client-side rate limit
  const rateLimitCheck = canSendOTP(phoneValidation.normalized);
  if (!rateLimitCheck.allowed) {
    if (rateLimitCheck.reason === 'cooldown') {
      setError(`لطفاً ${rateLimitCheck.waitTime} ثانیه دیگر تلاش کنید`);
    } else if (rateLimitCheck.reason === 'rate_limit') {
      const minutes = Math.ceil(rateLimitCheck.waitTime / 60);
      setError(`محدودیت تعداد درخواست. لطفاً ${minutes} دقیقه دیگر تلاش کنید`);
      // Set rate limit expiry for persistent UI update
      setRateLimitExpiry(Date.now() + (rateLimitCheck.waitTime * 1000));
    }
    return;
  }

  // 3. Call API
  setLoading(true);
  const result = await otpService.sendOTP({
    phone_number: phoneValidation.normalized,
    purpose: 'login',
  });

  if (result.success) {
    recordOTPRequest(phoneValidation.normalized, false);
    setStep('otp');
    setOTPSentAt(Date.now());
  } else {
    // Handle server-side rate limit (429)
    if (result.data?.retry_after) {
      setRateLimitExpiry(Date.now() + (result.data.retry_after * 1000));
      recordOTPRequest(phoneValidation.normalized, false); // Sync with server
    }
    setError(result.error || result.message);
  }
  setLoading(false);
};
```

#### XSS Prevention

**Input Sanitization:**
```typescript
// All user inputs are sanitized before display
import DOMPurify from 'dompurify'; // Optional: add library

// For phone number and OTP, we only allow digits, so no XSS risk
// But for error messages from API:
const sanitizeErrorMessage = (message: string): string => {
  // Remove HTML tags
  return message.replace(/<[^>]*>/g, '');

  // OR use DOMPurify for comprehensive sanitization
  // return DOMPurify.sanitize(message, { ALLOWED_TAGS: [] });
};

setError(sanitizeErrorMessage(result.error));
```

**Content Security Policy (CSP):**
```html
<!-- Add to index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.myhoma.ir;
    font-src 'self' data:;
  "
/>
```

### 7.2 Token Storage Strategy

**Current Implementation:** localStorage (acceptable for SPA)

**Security Trade-offs:**

| Storage Method | XSS Vulnerability | CSRF Vulnerability | Recommended? |
|----------------|-------------------|---------------------|--------------|
| localStorage   | ❌ High           | ✅ Immune           | ⚠️ OK for low-risk apps |
| sessionStorage | ❌ High           | ✅ Immune           | ⚠️ Slightly better (clears on tab close) |
| HttpOnly Cookie| ✅ Protected      | ❌ Vulnerable (needs CSRF token) | ✅ Best practice |

**Recommendation:** Keep localStorage for MVP, migrate to HttpOnly cookies in Phase 3 (Security Hardening).

**Current Flow (Already Implemented):**
```typescript
// After OTP verification success
const authData = result.data; // { access_token, refresh_token, user, ... }

// Save to localStorage
localStorage.setItem('homa_user_access_token', authData.access_token);
localStorage.setItem('homa_user_refresh_token', authData.refresh_token);
localStorage.setItem('homa_user_data', JSON.stringify(authData.user));

// Auto-refresh on 401 (already implemented in userAuthService)
// No changes needed
```

**Future Enhancement (Phase 3):**
- Backend: Set HttpOnly cookies on `/api/users/otp/verify/` response
- Frontend: Remove manual token storage, cookies sent automatically
- Add CSRF token mechanism for state-changing requests

### 7.3 Security Checklist

**Pre-Launch Checklist:**

- [ ] **Input Validation**
  - [ ] Phone number: Client-side format validation
  - [ ] OTP code: 6-digit numeric validation
  - [ ] Error messages: Sanitized before display

- [ ] **Rate Limiting**
  - [ ] Client-side: localStorage tracking (3 requests/hour)
  - [ ] Client-side: Resend cooldown (60s/90s/120s)
  - [ ] Server-side: Respect 429 responses, show user-friendly message

- [ ] **Token Security**
  - [ ] Access token: Stored in localStorage
  - [ ] Refresh token: Stored in localStorage
  - [ ] Auto-refresh: On 401 response (already implemented)
  - [ ] Logout: Clear all tokens

- [ ] **Session Management**
  - [ ] Token expiry: 30 min for access, handled by backend
  - [ ] Refresh flow: Automatic, no user action needed
  - [ ] Logout: Revoke refresh token on server

- [ ] **User Enumeration Protection**
  - [ ] Backend: Same response for existing/new users (already implemented)
  - [ ] Frontend: Generic success message "کد تایید ارسال شد"

- [ ] **HTTPS Only**
  - [ ] All API calls over HTTPS (check API_CONFIG.BASE_URL)
  - [ ] WebOTP requires HTTPS (production only)

- [ ] **Error Handling**
  - [ ] Never expose stack traces to user
  - [ ] Log errors to console (development only)
  - [ ] Generic error messages (خطا در اتصال به سرور)

- [ ] **Accessibility**
  - [ ] Screen reader: Single input (not 6 boxes)
  - [ ] ARIA labels: Descriptive labels for all inputs
  - [ ] Error announcements: aria-live regions

- [ ] **Privacy**
  - [ ] Phone number masking: Show 09XX****XXX in OTP step
  - [ ] No logging of OTP codes
  - [ ] localStorage keys hashed (phone number)

---

## 8. Error Handling Matrix

### 8.1 Comprehensive Error Scenarios

| Error Type | API Status | API Response | User Message (Persian) | UI Action | Retry Strategy |
|------------|-----------|--------------|----------------------|-----------|----------------|
| **Send OTP Errors** |
| Invalid phone format | 400 | `{"detail": "Invalid phone number"}` | شماره موبایل وارد شده معتبر نیست | Red border on input, error banner | User corrects input |
| Rate limit (hourly) | 429 | `{"retry_after": 900}` | محدودیت تعداد درخواست. لطفاً ۱۵ دقیقه دیگر تلاش کنید | Disable inputs, show countdown timer | Wait or edit phone |
| Resend cooldown | Client-side | N/A | لطفاً ۴۵ ثانیه دیگر تلاش کنید | Disable resend button, show countdown | Wait for timer |
| Network timeout | N/A | Network error | خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید | Error banner, retry button enabled | User clicks retry |
| Server error (5xx) | 500+ | `{"detail": "Internal error"}` | خطا در سرور. لطفاً چند دقیقه دیگر تلاش کنید | Error banner, retry button | Wait 1-2 min, retry |
| **Verify OTP Errors** |
| Invalid OTP code | 400 | `{"detail": "Invalid OTP", "remaining_attempts": 4}` | کد تایید اشتباه است (باقیمانده: ۴ تلاش) | Red border on OTP boxes, clear input, auto-focus | User re-enters code |
| OTP expired | 400 | `{"detail": "OTP expired"}` | کد تایید منقضی شده است. کد جدید دریافت کنید | Error banner, enable resend button | User clicks resend |
| Max attempts | 400 | `{"detail": "Maximum attempts exceeded"}` | تعداد تلاش‌های مجاز تمام شد. کد جدید دریافت کنید | Error banner, disable verify button, enable resend | User clicks resend |
| Network timeout | N/A | Network error | خطا در اتصال به سرور. لطفاً دوباره تلاش کنید | Error banner, retry button | User clicks retry |
| **Resend OTP Errors** |
| Same as Send OTP | (same) | (same) | (same) | (same) | (same) |

### 8.2 Error Handling Implementation

```typescript
// File: /src/utils/otpErrorHandler.ts

export interface ErrorHandlingResult {
  userMessage: string;        // Persian message to display
  severity: 'error' | 'warning' | 'info';
  action: 'retry' | 'wait' | 'edit_phone' | 'resend' | 'none';
  retryDelay?: number;        // Seconds to wait before retry
  disableInputs?: boolean;
  clearOTP?: boolean;
  remainingAttempts?: number;
}

export function handleSendOTPError(
  error: SendOTPResponse,
  statusCode?: number
): ErrorHandlingResult {
  // Rate limit (429)
  if (statusCode === 429 || error.data?.retry_after) {
    const retryAfter = error.data?.retry_after || 900;
    const minutes = Math.ceil(retryAfter / 60);
    return {
      userMessage: `محدودیت تعداد درخواست. لطفاً ${minutes} دقیقه دیگر تلاش کنید`,
      severity: 'warning',
      action: 'wait',
      retryDelay: retryAfter,
      disableInputs: true,
    };
  }

  // Invalid phone (400)
  if (statusCode === 400) {
    return {
      userMessage: error.message || 'شماره موبایل وارد شده معتبر نیست',
      severity: 'error',
      action: 'edit_phone',
    };
  }

  // Network error
  if (!statusCode) {
    return {
      userMessage: 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید',
      severity: 'error',
      action: 'retry',
    };
  }

  // Server error (500+)
  if (statusCode >= 500) {
    return {
      userMessage: 'خطا در سرور. لطفاً چند دقیقه دیگر تلاش کنید',
      severity: 'error',
      action: 'retry',
      retryDelay: 120, // 2 minutes
    };
  }

  // Generic error
  return {
    userMessage: error.message || 'خطا در ارسال کد تایید',
    severity: 'error',
    action: 'retry',
  };
}

export function handleVerifyOTPError(
  error: VerifyOTPResponse,
  statusCode?: number
): ErrorHandlingResult {
  // Invalid OTP (400)
  if (statusCode === 400) {
    const remaining = error.remaining_attempts || 0;

    // Max attempts exceeded
    if (remaining === 0 || error.message?.includes('Maximum attempts')) {
      return {
        userMessage: 'تعداد تلاش‌های مجاز تمام شد. کد جدید دریافت کنید',
        severity: 'error',
        action: 'resend',
        clearOTP: true,
        remainingAttempts: 0,
      };
    }

    // OTP expired
    if (error.message?.includes('expired') || error.message?.includes('منقضی')) {
      return {
        userMessage: 'کد تایید منقضی شده است. کد جدید دریافت کنید',
        severity: 'warning',
        action: 'resend',
        clearOTP: true,
      };
    }

    // Invalid OTP (has remaining attempts)
    return {
      userMessage: `کد تایید اشتباه است (باقیمانده: ${remaining} تلاش)`,
      severity: 'error',
      action: 'retry',
      clearOTP: true,
      remainingAttempts: remaining,
    };
  }

  // Network error
  if (!statusCode) {
    return {
      userMessage: 'خطا در اتصال به سرور. لطفاً دوباره تلاش کنید',
      severity: 'error',
      action: 'retry',
    };
  }

  // Generic error
  return {
    userMessage: error.message || 'خطا در تایید کد',
    severity: 'error',
    action: 'retry',
  };
}
```

**Usage in Component:**
```typescript
const handleOTPSubmit = async () => {
  setLoading(true);
  const result = await otpService.verifyOTP({
    phone_number: normalizedPhone,
    otp_code: otpCode,
    purpose: 'login',
  });
  setLoading(false);

  if (!result.success) {
    const errorHandling = handleVerifyOTPError(result, result.status);

    setError(errorHandling.userMessage);
    setRemainingAttempts(errorHandling.remainingAttempts || remainingAttempts - 1);

    if (errorHandling.clearOTP) {
      setOTPCode('');
      // Auto-focus OTP input
      otpInputRef.current?.focus();
    }

    if (errorHandling.action === 'resend') {
      // Enable resend button, disable verify button
      setCanResend(true);
    }
  } else {
    // Success
    onSuccess(result.data!);
  }
};
```

---

## 9. Implementation Phases

### Phase 1: Core OTP Flow (Week 1-2)

**Goal:** Basic OTP authentication working end-to-end

**Tasks:**
1. **Setup** (Day 1)
   - [ ] Install dependencies: `npm install input-otp`
   - [ ] Create new files:
     - `/src/services/otpService.ts`
     - `/src/components/OTPLogin.tsx`
     - `/src/components/ui/OTPInput.tsx`
     - `/src/components/ui/PhoneInput.tsx`
     - `/src/components/ui/CountdownTimer.tsx`
     - `/src/utils/otpRateLimitStorage.ts`
     - `/src/utils/otpErrorHandler.ts`

2. **Phone Number Step** (Day 2-3)
   - [ ] Build PhoneInput component
     - Persian/English digit support
     - Real-time validation
     - Format display (09XX XXX XXXX)
   - [ ] Build phone number step UI in OTPLogin
     - Modal layout (reuse UserLogin modal structure)
     - Phone input field
     - Submit button
     - Terms acceptance text
   - [ ] Integrate otpService.sendOTP()
   - [ ] Add error handling
   - [ ] Test with backend API

3. **OTP Verification Step** (Day 4-5)
   - [ ] Build OTPInput component using input-otp library
     - 6-box visual design
     - Single input (accessible)
     - Auto-focus on mount
     - Auto-submit on complete (optional)
   - [ ] Build OTP verification step UI
     - OTP input field
     - Phone number masking (09XX****XXX)
     - Verify button
     - Edit phone link
   - [ ] Integrate otpService.verifyOTP()
   - [ ] Add error handling (invalid OTP, attempts)
   - [ ] Test with backend API

4. **Resend Flow** (Day 6-7)
   - [ ] Build CountdownTimer component
   - [ ] Add resend button with countdown
   - [ ] Integrate otpService.resendOTP()
   - [ ] Implement escalating cooldown (60s → 90s → 120s)
   - [ ] Test resend edge cases

5. **Integration with App.tsx** (Day 8-9)
   - [ ] Replace UserLogin with OTPLogin in auth guard
   - [ ] Test full flow: product-landing → OTP → upload
   - [ ] Test with existing JWT refresh logic
   - [ ] Verify localStorage token storage
   - [ ] Test logout flow

6. **Testing & Bug Fixes** (Day 10)
   - [ ] Test all error scenarios
   - [ ] Test on mobile devices (iOS Safari, Chrome Android)
   - [ ] Test Persian number input
   - [ ] Test rate limiting
   - [ ] Fix any bugs

**Deliverable:** Working OTP authentication, users can log in/register via OTP

---

### Phase 2: Enhanced UX Features (Week 3)

**Goal:** Polish user experience with auto-fill, animations, and accessibility

**Tasks:**
1. **WebOTP API Integration** (Day 1-2)
   - [ ] Create `/src/utils/webOTP.ts`
   - [ ] Add feature detection
   - [ ] Implement requestWebOTP()
   - [ ] Integrate with OTPInput component
   - [ ] Test on Chrome Android
   - [ ] Coordinate with backend for SMS format

2. **Animations & Transitions** (Day 3)
   - [ ] Add Framer Motion animations
     - Modal enter/exit
     - Step transitions (phone → OTP)
     - Success checkmark animation
   - [ ] Loading states
     - Button spinners
     - Skeleton loaders
   - [ ] Error shake animation
   - [ ] Focus animations (input rings)

3. **Accessibility Improvements** (Day 4)
   - [ ] Add ARIA labels to all inputs
   - [ ] Implement aria-live regions for errors
   - [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
   - [ ] Ensure keyboard navigation (Tab, Enter)
   - [ ] Add focus visible states
   - [ ] Test with axe DevTools

4. **Mobile Optimizations** (Day 5)
   - [ ] Test numeric keyboard on iOS/Android
   - [ ] Implement auto-scroll to input on focus
   - [ ] Add safe area insets for notched phones
   - [ ] Test landscape orientation
   - [ ] Optimize touch targets (44x44px minimum)
   - [ ] Test with slow 3G network

5. **Analytics Integration** (Day 6-7)
   - [ ] Track OTP send events
   - [ ] Track OTP verify success/failure
   - [ ] Track error types (rate limit, invalid OTP, etc.)
   - [ ] Track time-to-verify (from send to success)
   - [ ] Track resend count per session
   - [ ] Add to existing trackKPI() calls

**Deliverable:** Polished OTP experience with auto-fill, smooth animations, and full accessibility

---

### Phase 3: Security Hardening (3-5 days)

**Goal:** Production-ready security measures

**Tasks:**
1. **Advanced Rate Limiting** (Day 1)
   - [ ] Persist rate limit state to localStorage
   - [ ] Implement UI countdown for rate limit expiry
   - [ ] Add visual indication (disabled inputs + timer)
   - [ ] Test rate limit recovery (after expiry)

2. **Input Sanitization** (Day 2)
   - [ ] Review all user inputs for XSS risks
   - [ ] Sanitize error messages from API
   - [ ] Add DOMPurify library (optional)
   - [ ] Audit all innerHTML usage

3. **Token Security Review** (Day 3)
   - [ ] Audit localStorage usage
   - [ ] Consider sessionStorage for access token
   - [ ] Document token expiry handling
   - [ ] Test auto-refresh flow
   - [ ] Test logout token revocation

4. **Error Message Hardening** (Day 4)
   - [ ] Review all error messages (no info leakage)
   - [ ] Ensure generic messages for security errors
   - [ ] Remove stack traces from production
   - [ ] Add error logging (console.error only in dev)

5. **Security Testing** (Day 5)
   - [ ] Penetration testing checklist
   - [ ] Test XSS vectors (script injection)
   - [ ] Test CSRF scenarios (already immune with localStorage)
   - [ ] Test rate limit bypass attempts
   - [ ] Test token replay attacks
   - [ ] Run OWASP ZAP scan

**Deliverable:** Security-hardened OTP authentication ready for production

---

### Phase 4: Analytics & Monitoring (2-3 days)

**Goal:** Track OTP performance and user behavior

**Tasks:**
1. **KPI Tracking** (Day 1)
   - [ ] Define OTP-specific KPIs:
     - OTP send success rate
     - OTP verify success rate (first attempt)
     - Average time to verify
     - Resend rate
     - Error rate by type
     - Drop-off rate (phone → OTP → success)
   - [ ] Implement tracking calls in OTPLogin component
   - [ ] Test with existing analytics service

2. **Dashboard Integration** (Day 2)
   - [ ] Add OTP metrics to AdminDashboard
   - [ ] Create OTP analytics tab
   - [ ] Charts:
     - OTP send/verify over time
     - Success rate by step
     - Error distribution (pie chart)
     - Average verification time (line chart)
   - [ ] Test with mock data

3. **Monitoring & Alerts** (Day 3)
   - [ ] Set up error rate alerts (>5% errors)
   - [ ] Monitor API response times
   - [ ] Track rate limit hits
   - [ ] Set up Sentry/error reporting (optional)

**Deliverable:** Full visibility into OTP authentication performance

---

## 10. Testing Strategy

### 10.1 Unit Tests

**Tools:** Vitest + React Testing Library (already in project if using Vite)

**Test Coverage:**

```typescript
// File: /src/components/__tests__/OTPLogin.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OTPLogin } from '../OTPLogin';

describe('OTPLogin Component', () => {
  it('renders phone input step by default', () => {
    render(<OTPLogin isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText(/شماره موبایل/i)).toBeInTheDocument();
  });

  it('validates phone number format', async () => {
    render(<OTPLogin isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    const input = screen.getByPlaceholderText(/09XX/i);

    fireEvent.change(input, { target: { value: '0811234567' } }); // Invalid
    fireEvent.click(screen.getByText(/ارسال کد/i));

    await waitFor(() => {
      expect(screen.getByText(/معتبر نیست/i)).toBeInTheDocument();
    });
  });

  it('sends OTP on valid phone number', async () => {
    const mockSendOTP = vi.fn().mockResolvedValue({ success: true });
    // Mock otpService
    vi.mock('../services/otpService', () => ({
      otpService: { sendOTP: mockSendOTP },
    }));

    render(<OTPLogin isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    const input = screen.getByPlaceholderText(/09XX/i);

    fireEvent.change(input, { target: { value: '09123456789' } });
    fireEvent.click(screen.getByText(/ارسال کد/i));

    await waitFor(() => {
      expect(mockSendOTP).toHaveBeenCalledWith({
        phone_number: '+989123456789',
        purpose: 'login',
      });
    });
  });

  it('transitions to OTP step after successful send', async () => {
    // ... (similar setup)
    // Assert OTP input is rendered
    expect(screen.getByText(/کد تایید/i)).toBeInTheDocument();
  });

  it('verifies OTP and calls onSuccess', async () => {
    const mockOnSuccess = vi.fn();
    const mockVerifyOTP = vi.fn().mockResolvedValue({
      success: true,
      data: { access_token: 'token123', user: { id: 1 } },
    });

    // ... (render in OTP step)
    // Enter OTP
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/تایید/i));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({
        access_token: 'token123',
      }));
    });
  });

  it('shows error on invalid OTP', async () => {
    const mockVerifyOTP = vi.fn().mockResolvedValue({
      success: false,
      message: 'کد اشتباه است',
      remaining_attempts: 4,
    });

    // ... (enter wrong OTP)
    await waitFor(() => {
      expect(screen.getByText(/کد اشتباه است/i)).toBeInTheDocument();
      expect(screen.getByText(/باقیمانده: ۴/i)).toBeInTheDocument();
    });
  });

  it('disables resend button during countdown', () => {
    // ... (render in OTP step)
    const resendButton = screen.getByText(/ارسال مجدد/i);
    expect(resendButton).toBeDisabled();
  });

  it('handles rate limit error', async () => {
    const mockSendOTP = vi.fn().mockResolvedValue({
      success: false,
      message: 'محدودیت',
      data: { retry_after: 900 },
    });

    // ... (send OTP)
    await waitFor(() => {
      expect(screen.getByText(/۱۵ دقیقه/i)).toBeInTheDocument();
    });
  });
});
```

**Additional Test Files:**
- `/src/components/ui/__tests__/OTPInput.test.tsx`
- `/src/components/ui/__tests__/PhoneInput.test.tsx`
- `/src/utils/__tests__/otpRateLimitStorage.test.ts`
- `/src/utils/__tests__/otpErrorHandler.test.ts`

### 10.2 Integration Tests

**Scenarios:**
1. Full flow: Enter phone → Send OTP → Enter code → Verify → Success
2. Error flow: Enter wrong OTP 5 times → Max attempts → Resend
3. Resend flow: Send OTP → Wait 60s → Resend → New OTP
4. Rate limit: Send OTP 3 times → 4th attempt blocked
5. Network error: Simulate timeout → Retry button works

**Tools:** Playwright or Cypress for E2E

### 10.3 Manual Testing Checklist

**Desktop Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile Browsers:**
- [ ] iOS Safari (iPhone)
- [ ] Chrome Android
- [ ] Samsung Internet

**Test Cases:**
- [ ] Enter Persian digits (۰۹۱۲۳۴۵۶۷۸۹)
- [ ] Enter English digits (09123456789)
- [ ] Copy-paste OTP code
- [ ] Auto-fill OTP (Chrome Android only)
- [ ] Rotate to landscape (mobile)
- [ ] Slow 3G network (Chrome DevTools)
- [ ] Offline → Online recovery
- [ ] Multiple tabs open (token sync)
- [ ] Browser back button behavior

**Accessibility:**
- [ ] Screen reader (NVDA on Windows, VoiceOver on Mac/iOS)
- [ ] Keyboard-only navigation (Tab, Enter, Escape)
- [ ] High contrast mode
- [ ] 200% zoom level
- [ ] Color blindness simulation

### 10.4 Performance Testing

**Metrics:**
- Time to Interactive (TTI) for modal: < 200ms
- OTP input response time: < 16ms (60fps)
- API response time: < 2s for sendOTP, < 1s for verifyOTP
- Animation frame rate: 60fps

**Tools:**
- Chrome DevTools Performance tab
- Lighthouse audit
- React DevTools Profiler

---

## 11. Code Organization

### 11.1 File Structure

```
src/
├── components/
│   ├── OTPLogin.tsx                 # Main OTP auth component (NEW)
│   ├── UserLogin.tsx                # Existing password login (KEEP as fallback)
│   └── ui/
│       ├── OTPInput.tsx             # Reusable OTP input (NEW)
│       ├── PhoneInput.tsx           # Persian phone input (NEW)
│       ├── CountdownTimer.tsx       # Countdown timer (NEW)
│       ├── button.tsx               # Existing Radix UI button
│       ├── input.tsx                # Existing Radix UI input
│       └── ...
├── services/
│   ├── otpService.ts                # OTP API calls (NEW)
│   ├── userAuthService.ts           # Existing auth service (EXTEND)
│   └── api.ts                       # Existing API client
├── utils/
│   ├── otpRateLimitStorage.ts       # Rate limit tracking (NEW)
│   ├── otpErrorHandler.ts           # Error handling helpers (NEW)
│   ├── webOTP.ts                    # WebOTP API wrapper (NEW)
│   ├── phoneValidator.ts            # Existing phone validation (REUSE)
│   ├── normalizeDigits.ts           # Existing digit normalization (REUSE)
│   └── ...
├── types/
│   ├── auth.ts                      # Existing auth types (REUSE)
│   └── otp.ts                       # OTP-specific types (NEW, optional)
└── App.tsx                          # Main app with auth guard (MODIFY)
```

### 11.2 Naming Conventions

**Components:**
- PascalCase: `OTPLogin`, `PhoneInput`, `CountdownTimer`
- File names match component names: `OTPLogin.tsx`

**Services:**
- camelCase: `otpService`, `userAuthService`
- Export as singleton: `export const otpService = new OTPService()`

**Utils:**
- camelCase functions: `validateOTPCode()`, `canSendOTP()`
- Descriptive file names: `otpRateLimitStorage.ts`

**Types:**
- PascalCase interfaces: `SendOTPRequest`, `VerifyOTPResponse`
- Grouped in relevant files: `types/auth.ts`, `services/otpService.ts`

**CSS Classes:**
- Tailwind utility classes (existing pattern)
- Custom classes: kebab-case (rare, prefer Tailwind)

### 11.3 Import Organization

**Standard Order:**
```typescript
// 1. React imports
import { useState, useEffect, useRef } from 'react';

// 2. Third-party libraries
import { motion, AnimatePresence } from 'motion/react';
import { OTPInput as BaseOTPInput } from 'input-otp';

// 3. Internal components
import { PhoneInput } from './ui/PhoneInput';
import { CountdownTimer } from './ui/CountdownTimer';

// 4. Services
import { otpService } from '../services/otpService';
import { userAuthService } from '../services/userAuthService';

// 5. Utils
import { validateOTPCode } from '../utils/otpErrorHandler';
import { canSendOTP, recordOTPRequest } from '../utils/otpRateLimitStorage';

// 6. Types
import type { AuthData } from '../types/auth';
import type { SendOTPResponse } from '../services/otpService';

// 7. Styles (rare)
import './OTPLogin.css'; // Only if absolutely necessary
```

### 11.4 Code Style Guidelines

**TypeScript Strict Mode:**
- All props have explicit interfaces
- No `any` types (use `unknown` if needed)
- Return types for functions (optional for simple ones)

**React Patterns:**
- Functional components only
- Hooks at top of component (before returns/conditionals)
- Custom hooks for complex state (`useOTPTimer`, `useRateLimit`)
- Controlled components (all inputs)

**Error Handling:**
- Try-catch for async operations
- Graceful fallbacks (show error message, don't crash)
- Console.error in development, silent in production

**Comments:**
- JSDoc for exported functions
- Inline comments for complex logic only
- Persian comments OK for Persian-specific code

**Example:**
```typescript
/**
 * Send OTP to user's phone number
 * Handles rate limiting and error responses
 *
 * @param phoneNumber - Normalized phone (+989XXXXXXXXX)
 * @returns Promise with success status and error message
 */
export async function sendOTP(phoneNumber: string): Promise<SendOTPResponse> {
  // Check client-side rate limit before API call
  const rateLimitCheck = canSendOTP(phoneNumber);
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      message: getRateLimitMessage(rateLimitCheck),
    };
  }

  try {
    // API call...
  } catch (error) {
    // Error handling...
  }
}
```

---

## 12. Accessibility Checklist

### 12.1 WCAG 2.2 AA Compliance

**Perceivable:**
- [x] Text alternatives (ARIA labels)
- [x] Color contrast ratio ≥ 4.5:1 (text on background)
- [x] Resize text up to 200% without loss of functionality
- [x] Visual focus indicators (2px outline, primary color)

**Operable:**
- [x] Keyboard accessible (Tab, Enter, Escape)
- [x] No keyboard traps (modal can be closed)
- [x] Focus order follows logical reading order
- [x] Touch targets ≥ 44x44px (WCAG 2.2)
- [x] Timeout warnings (for countdown timer)

**Understandable:**
- [x] Clear error messages (Persian, concise)
- [x] Consistent navigation (same patterns as app)
- [x] Input assistance (placeholders, hints)
- [x] Error prevention (client-side validation)

**Robust:**
- [x] Valid HTML (semantic tags)
- [x] ARIA roles and states
- [x] Works with assistive technologies

### 12.2 Screen Reader Support

**ARIA Attributes:**

```typescript
// Phone input
<input
  type="tel"
  aria-label="شماره موبایل"
  aria-describedby="phone-help"
  aria-invalid={!!phoneError}
  aria-required="true"
/>
<p id="phone-help" className="text-sm text-gray-500">
  مثال: ۰۹۱۲ ۳۴۵ ۶۷۸۹
</p>

// OTP input
<OTPInput
  aria-label="کد تایید ۶ رقمی"
  aria-describedby="otp-help"
  aria-invalid={!!otpError}
/>
<p id="otp-help" className="sr-only">
  کد ۶ رقمی که به شماره موبایل شما ارسال شده را وارد کنید
</p>

// Error announcements
<div role="alert" aria-live="assertive" className="error-banner">
  {errorMessage}
</div>

// Loading state
<button aria-busy={loading} aria-label={loading ? "در حال ارسال..." : "ارسال کد تایید"}>
  {loading ? <Spinner /> : "ارسال کد تایید"}
</button>
```

**Screen Reader Testing:**
- Test with NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS)
- All interactive elements must be announced
- Error messages must be announced immediately
- Loading states must be announced
- Success confirmation must be announced

### 12.3 Keyboard Navigation

**Tab Order:**
1. Phone input
2. Submit button
3. Terms link (if present)
4. Close button (modal)

**Shortcuts:**
- `Tab`: Move to next element
- `Shift+Tab`: Move to previous element
- `Enter`: Submit form, click button
- `Escape`: Close modal
- `Space`: Toggle checkbox (if terms acceptance added)

**Focus Management:**
```typescript
// Auto-focus phone input on modal open
useEffect(() => {
  if (isOpen && step === 'phone') {
    phoneInputRef.current?.focus();
  }
}, [isOpen, step]);

// Auto-focus OTP input on step change
useEffect(() => {
  if (step === 'otp') {
    otpInputRef.current?.focus();
  }
}, [step]);

// Return focus to trigger after close
useEffect(() => {
  if (!isOpen && triggerRef.current) {
    triggerRef.current.focus();
  }
}, [isOpen]);
```

### 12.4 Mobile Accessibility

**Touch Targets:**
- Minimum 44x44px (WCAG 2.2 AA)
- OTP boxes: 48x56px (exceeds minimum)
- Buttons: 48px height (full width)

**Voice Input:**
- Persian dictation support (iOS/Android)
- Number dictation: "صفر نه یک دو..." should work

**Screen Magnification:**
- No horizontal scrolling at 200% zoom
- No content clipping
- Clear focus indicators (visible when zoomed)

**Reduced Motion:**
```typescript
// Respect prefers-reduced-motion
const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
  animate={shouldReduceMotion ? false : { opacity: 1, scale: 1 }}
  exit={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
>
  {/* Modal content */}
</motion.div>
```

---

## Appendix A: API Contract Documentation

### Backend Endpoints (Already Implemented)

**1. Send OTP**
```
POST /api/users/otp/send/
Content-Type: application/json

Request:
{
  "phone_number": "+989123456789",
  "purpose": "login"  // or "reset_password", "verify_phone"
}

Success Response (200):
{
  "success": true,
  "message": "کد تایید ارسال شد",
  "data": {
    "expires_in": 180  // seconds
  }
}

Error Response (400 - Invalid Phone):
{
  "success": false,
  "message": "شماره موبایل معتبر نیست",
  "data": {
    "error": "Invalid phone number format"
  }
}

Error Response (429 - Rate Limit):
{
  "success": false,
  "message": "شما بیش از حد مجاز درخواست داده‌اید",
  "data": {
    "retry_after": 900  // seconds until next allowed request
  }
}
```

**Rate Limits:**
- 3 requests per hour per phone number
- 10 requests per hour per IP address

---

**2. Verify OTP**
```
POST /api/users/otp/verify/
Content-Type: application/json

Request:
{
  "phone_number": "+989123456789",
  "otp_code": "123456",
  "purpose": "login"
}

Success Response (200 - Existing User):
{
  "success": true,
  "message": "ورود موفق",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "expires_in": 1800,  // 30 minutes
    "user": {
      "id": 123,
      "phone_number": "+989123456789",
      "name": "علی احمدی",
      "created_at": "2025-01-15T10:30:00Z"
    }
  }
}

Success Response (200 - New User, Auto-Created):
{
  "success": true,
  "message": "حساب کاربری با موفقیت ایجاد شد",
  "data": {
    // Same as above, user.created_at will be recent
  }
}

Error Response (400 - Invalid OTP):
{
  "success": false,
  "message": "کد تایید اشتباه است",
  "data": {
    "error": "Invalid OTP code",
    "remaining_attempts": 4
  }
}

Error Response (400 - OTP Expired):
{
  "success": false,
  "message": "کد تایید منقضی شده است",
  "data": {
    "error": "OTP has expired"
  }
}

Error Response (400 - Max Attempts):
{
  "success": false,
  "message": "تعداد تلاش‌های مجاز تمام شد",
  "data": {
    "error": "Maximum verification attempts exceeded",
    "remaining_attempts": 0
  }
}
```

**Verification Limits:**
- Maximum 5 attempts per OTP code
- OTP expires after 3 minutes (180 seconds)
- One-time use (invalidated after successful verification)

---

**3. Resend OTP**
```
POST /api/users/otp/resend/
Content-Type: application/json

Request:
{
  "phone_number": "+989123456789",
  "purpose": "login"
}

Success Response (200):
{
  "success": true,
  "message": "کد جدید ارسال شد",
  "data": {
    "expires_in": 180
  }
}

Error Response (429 - Rate Limit):
{
  "success": false,
  "message": "محدودیت تعداد درخواست",
  "data": {
    "retry_after": 900
  }
}
```

**Notes:**
- Invalidates previous OTP code
- Resets verification attempt counter (back to 5 attempts)
- Same rate limits as /send/ endpoint

---

## Appendix B: SMS Gateway Integration

**Backend Responsibility:** Send SMS via Kavenegar (already implemented)

**Frontend Responsibility:** Coordinate SMS format for WebOTP API

**Recommended SMS Format:**

```
کد تایید HOMA: {otp_code}

@myhoma.ir #{otp_code}
```

**Explanation:**
- Line 1: User-friendly message in Persian
- Line 2: Empty line (required for WebOTP format)
- Line 3: Domain (@myhoma.ir) for security
- Line 4: OTP with # prefix for browser auto-fill

**Example:**
```
کد تایید HOMA: 123456

@myhoma.ir #123456
```

**Backend Change Required:**
Update SMS template in Kavenegar integration to include the domain line. This enables WebOTP API to auto-fill the code on supported browsers (Chrome Android).

---

## Appendix C: Recommended Dependencies

```json
{
  "dependencies": {
    "input-otp": "^1.2.4",           // Accessible OTP input component
    "framer-motion": "^11.x",         // Already in project (animations)
    "react": "^18.x",                 // Already in project
    "react-router-dom": "^6.x"        // Already in project
  },
  "devDependencies": {
    "vitest": "^2.x",                 // Unit testing (if using Vite)
    "@testing-library/react": "^16.x", // Component testing
    "@testing-library/user-event": "^14.x", // User interaction testing
    "playwright": "^1.x",              // E2E testing (optional)
    "axe-core": "^4.x"                 // Accessibility testing
  }
}
```

**Installation Commands:**
```bash
# Core dependency
npm install input-otp

# Testing (if not already installed)
npm install -D vitest @testing-library/react @testing-library/user-event

# Accessibility testing (optional)
npm install -D axe-core @axe-core/playwright
```

---

## Appendix D: Migration from Password to OTP

**Scenario:** Existing users with password accounts

**Strategy:**
1. **Phase 1 (Current Plan):** OTP-only for new users
   - New users: Auto-created via OTP (no password)
   - Existing users: Can still use password login (UserLogin component)

2. **Phase 2 (Future):** Dual authentication
   - Add "ورود با کد یکبار مصرف" button in UserLogin
   - Existing users can choose password OR OTP
   - Encourage OTP via UI messaging

3. **Phase 3 (Future):** OTP-first, password optional
   - Primary flow: OTP (like current plan)
   - Fallback: "ورود با رمز عبور" link (for existing users)
   - Gradually deprecate password login

**Backend Support Needed:**
- Check if user has password set: `GET /api/users/profile/`
- Allow OTP verification for users with passwords
- Optional password reset via OTP: `POST /api/users/password/reset/` (already implemented)

---

## Appendix E: Localization Considerations

**Current:** Persian (Farsi) only

**Future:** Multi-language support

**Localization Points:**
- All UI text (buttons, labels, errors)
- Phone number format (Iran: 09XX, other countries: different)
- SMS gateway (Kavenegar for Iran, Twilio for international)
- Number formatting (Persian digits vs English)

**Preparation:**
- Use i18n library (react-i18next)
- Extract all Persian strings to translation files
- Support RTL/LTR switching
- Country code selector for phone input

---

## Summary

This plan provides a production-ready roadmap for implementing OTP authentication in the HOMA application. Key highlights:

1. **Research-Backed Decisions:** Single-field OTP input, progressive enhancement with WebOTP, client-side rate limiting
2. **Mobile-First Design:** RTL support, Persian number handling, numeric keyboard optimization
3. **Security-Hardened:** Input validation, rate limiting, secure token storage
4. **Accessibility-Compliant:** WCAG 2.2 AA standards, screen reader support, keyboard navigation
5. **Phased Implementation:** 4 clear phases over 4-5 weeks
6. **Comprehensive Testing:** Unit, integration, manual, and accessibility testing

**Next Steps:**
1. Review this plan with the team
2. Get backend confirmation on SMS format change (WebOTP support)
3. Begin Phase 1 implementation
4. Iterate based on user feedback

**Questions or Concerns:**
- Backend SMS format change required for WebOTP API
- Rate limiting: Should we show user IP-based limits or only phone-based?
- Analytics: Which metrics are most important to track?

---

**Plan saved to `/home/amirhossein/Desktop/projects/Homav02/OTP_IMPLEMENTATION_PLAN.md`**

Read this document before proceeding with implementation. It contains all architectural decisions, component specifications, and step-by-step tasks needed to build production-ready OTP authentication.