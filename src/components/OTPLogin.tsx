import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, RefreshCcw, X } from "lucide-react";
import { PhoneInput } from "./ui/PhoneInput";
import { OTPInputField } from "./ui/OTPInput";
import { CountdownTimer } from "./ui/CountdownTimer";
import { otpService } from "../services/otpService";
import { userAuthService } from "../services/userAuthService";
import { validateAndNormalizePhone, formatPhoneForDisplay } from "../utils/phoneValidator";
import { canSendOTP, recordOTPRequest, clearOTPRateLimitState, OTP_COOLDOWNS_SECONDS } from "../utils/otpRateLimitStorage";
import { handleSendOTPError, handleVerifyOTPError } from "../utils/otpErrorHandler";
import { validateOTPCode } from "../utils/otpValidator";
import { requestWebOTP, isWebOTPSupported } from "../utils/webOTP";
import type { AuthData } from "../types/auth";

type AuthStep = "phone" | "otp" | "success";

interface OTPLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authData: AuthData) => void;
  initialPhoneNumber?: string;
}

export function OTPLogin({ isOpen, onClose, onSuccess, initialPhoneNumber }: OTPLoginProps) {
  const primaryButtonStyles: CSSProperties = {
    backgroundImage: "linear-gradient(135deg, #ff4f64, #c60012)",
    borderColor: "#9c0b12",
    color: "#ffffff",
    boxShadow: "0 18px 45px rgba(166, 12, 17, 0.45)",
    isolation: "isolate",
  };
  const primaryButtonClasses =
    "relative w-full rounded-[20px] py-3 text-base font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E31E24]/70 transition disabled:opacity-60";

  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState(initialPhoneNumber ? formatPhoneForDisplay(initialPhoneNumber) : "");
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(initialPhoneNumber || null);
  const [otpCode, setOTPCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [countdownExpiry, setCountdownExpiry] = useState<number | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [rateLimitMessage, setRateLimitMessage] = useState("");
  const [rateLimitExpiry, setRateLimitExpiry] = useState<number | null>(null);

  const maskedPhone = useMemo(() => {
    if (!normalizedPhone) return "";
    const display = formatPhoneForDisplay(normalizedPhone);
    if (display.length !== 11) return display;
    return `${display.slice(0, 4)}****${display.slice(-3)}`;
  }, [normalizedPhone]);

  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setOTPCode("");
      setError(null);
      setPhoneError(null);
      setCountdownExpiry(null);
      setCanResend(false);
      setRemainingAttempts(5);
      setResendCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!countdownExpiry) {
      setCanResend(true);
      return;
    }

    setCanResend(false);
    const interval = setInterval(() => {
      if (Date.now() >= countdownExpiry) {
        setCanResend(true);
        setCountdownExpiry(null);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [countdownExpiry]);

  useEffect(() => {
    if (step === "otp" && isWebOTPSupported()) {
      requestWebOTP().then((result) => {
        if (result?.code) {
          setOTPCode(result.code);
          handleOTPSubmit(result.code);
        }
      });
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePhoneSubmit = async () => {
    setError(null);
    setPhoneError(null);
    const validation = validateAndNormalizePhone(phone.replace(/\s+/g, ""));
    if (!validation.isValid) {
      setPhoneError(validation.error || "شماره موبایل معتبر نیست");
      return;
    }

    const normalized = validation.normalized!;
    const rateCheck = canSendOTP(normalized);

    if (!rateCheck.allowed) {
      if (rateCheck.reason === "cooldown" && rateCheck.waitTime) {
        setError(`لطفاً ${rateCheck.waitTime} ثانیه دیگر تلاش کنید`);
      } else if (rateCheck.reason === "rate_limit" && rateCheck.waitTime) {
        const minutes = Math.ceil(rateCheck.waitTime / 60);
        setError(`محدودیت تعداد درخواست. لطفاً ${minutes} دقیقه دیگر تلاش کنید`);
      }
      return;
    }

    setLoading(true);
    const result = await otpService.sendOTP({
      phone_number: normalized,
      purpose: "login",
    });
    setLoading(false);

    if (result.success) {
      recordOTPRequest(normalized);
      setNormalizedPhone(normalized);
      setStep("otp");
      setRemainingAttempts(5);
      setResendCount(0);
      const expiry = Date.now() + OTP_COOLDOWNS_SECONDS[0] * 1000;
      setCountdownExpiry(expiry);
      setCanResend(false);
      setRateLimitMessage("");
      setRateLimitExpiry(null);
    } else {
      const errorHandling = handleSendOTPError(result, result.status);
      setError(errorHandling.userMessage);
      if (errorHandling.action === "wait" && errorHandling.retryDelay) {
        setRateLimitExpiry(Date.now() + errorHandling.retryDelay * 1000);
        setRateLimitMessage(errorHandling.userMessage);
      }
    }
  };

  const handleOTPSubmit = async (codeOverride?: string) => {
    const code = codeOverride ?? otpCode;
    if (!normalizedPhone) {
      setError("لطفاً ابتدا شماره موبایل را وارد کنید");
      setStep("phone");
      return;
    }

    const validation = validateOTPCode(code);
    if (!validation.isValid) {
      setError(validation.error || "کد تایید معتبر نیست");
      return;
    }

    const digits = code.replace(/\D/g, "");
    setVerifying(true);
    setError(null);

    const result = await otpService.verifyOTP({
      phone_number: normalizedPhone,
      otp_code: digits,
      purpose: "login",
    });

    setVerifying(false);

    if (result.success && result.data) {
      userAuthService.saveAuthData(result.data);
      clearOTPRateLimitState(normalizedPhone);
      setStep("success");
      setTimeout(() => {
        onSuccess(result.data!);
      }, 600);
    } else {
      const errorHandling = handleVerifyOTPError(result, result.status);
      setError(errorHandling.userMessage);

      // Update remaining attempts
      if (errorHandling.remainingAttempts !== undefined) {
        setRemainingAttempts(errorHandling.remainingAttempts);
      } else {
        // Decrement if not provided by backend
        setRemainingAttempts((prev) => Math.max(prev - 1, 0));
      }

      // Clear OTP after a short delay so user can see the error
      if (errorHandling.clearOTP) {
        setTimeout(() => setOTPCode(""), 300);
      }

      if (errorHandling.action === "resend") {
        setCanResend(true);
        setCountdownExpiry(null);
      }
    }
  };

  const handleResendOTP = async () => {
    if (!normalizedPhone) return;

    setError(null);
    const rateCheck = canSendOTP(normalizedPhone);
    if (!rateCheck.allowed) {
      if (rateCheck.reason === "cooldown" && rateCheck.waitTime) {
        setError(`لطفاً ${rateCheck.waitTime} ثانیه دیگر تلاش کنید`);
      } else if (rateCheck.reason === "rate_limit" && rateCheck.waitTime) {
        const minutes = Math.ceil(rateCheck.waitTime / 60);
        setError(`محدودیت تعداد درخواست. لطفاً ${minutes} دقیقه دیگر تلاش کنید`);
      }
      return;
    }

    setResending(true);
    const result = await otpService.resendOTP({
      phone_number: normalizedPhone,
      purpose: "login",
    });
    setResending(false);

    if (result.success) {
      recordOTPRequest(normalizedPhone, true);
      const nextCount = Math.min(resendCount + 1, OTP_COOLDOWNS_SECONDS.length - 1);
      setResendCount(nextCount);
      const expiry = Date.now() + OTP_COOLDOWNS_SECONDS[nextCount] * 1000;
      setCountdownExpiry(expiry);
      setCanResend(false);
      setOTPCode("");
    } else {
      const errorHandling = handleSendOTPError(result, result.status);
      setError(errorHandling.userMessage);
      if (errorHandling.action === "wait" && errorHandling.retryDelay) {
        setRateLimitExpiry(Date.now() + errorHandling.retryDelay * 1000);
        setRateLimitMessage(errorHandling.userMessage);
      }
    }
  };

  const handleEditPhone = () => {
    setStep("phone");
    setOTPCode("");
    setError(null);
    setPhoneError(null);
    setCountdownExpiry(null);
    setCanResend(false);
    setRemainingAttempts(5);
    setResendCount(0);
    setRateLimitMessage("");
    setRateLimitExpiry(null);
    if (normalizedPhone) {
      clearOTPRateLimitState(normalizedPhone);
    }
    setNormalizedPhone(null);
  };

  const handleClose = () => {
    handleEditPhone();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.55)" }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(event) => event.stopPropagation()}
          className="relative w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0px_25px_60px_rgba(0,0,0,0.25)] max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
          <button
            onClick={handleClose}
            className="absolute left-4 top-4 h-10 w-10 rounded-full border border-border bg-muted text-gray-800 transition hover:bg-muted/80"
            aria-label="بستن"
          >
            <X className="mx-auto h-5 w-5" />
          </button>

          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <p className="text-lg font-bold">ورود یا ثبت‌نام</p>
              <p className="text-sm text-muted-foreground">
                شماره تلفن خود را وارد کنید
              </p>
            </div>

            {error && (
              <div className="rounded-[15px] border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {error}
              </div>
            )}

            {step === "phone" && (
              <div className="space-y-4">
                <PhoneInput
                  value={phone}
                  onChange={(value) => setPhone(value)}
                  onValidationChange={(isValid) => {
                    if (isValid) {
                      setPhoneError(null);
                    }
                  }}
                  onSubmit={handlePhoneSubmit}
                  error={phoneError || undefined}
                  autoFocus
                />

                <button
                  type="button"
                  onClick={handlePhoneSubmit}
                  disabled={loading}
                  className={primaryButtonClasses}
                  style={primaryButtonStyles}
                >
                  {loading ? "در حال ارسال کد..." : "ارسال کد تایید"}
                </button>

                <p className="text-xs text-muted-foreground">
                  با ادامه، قوانین و مقررات HOMA را می‌پذیرید.
                </p>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4 text-right">
                <p className="text-sm text-muted-foreground">
                  کد ۶ رقمی به شماره <span dir="ltr" className="inline-block">{maskedPhone || "شماره شما"}</span> ارسال شد
                </p>

                <OTPInputField
                  value={otpCode}
                  onChange={setOTPCode}
                  onComplete={(code) => handleOTPSubmit(code)}
                  disabled={verifying}
                  error={!!error}
                />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <RefreshCcw className="h-4 w-4" />
                    {!canResend && countdownExpiry ? (
                      <CountdownTimer
                        expiryTimestamp={countdownExpiry}
                        onExpire={() => setCanResend(true)}
                        format="seconds"
                      />
                    ) : (
                      <span>ارسال مجدد</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!canResend || resending}
                    className="rounded-lg border border-muted px-3 py-1 text-xs transition disabled:border-gray-200 disabled:text-gray-300"
                  >
                    {resending ? "در حال ارسال..." : "ارسال مجدد کد"}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>تلاش‌های باقی‌مانده: {remainingAttempts}</span>
                  <button
                    type="button"
                    onClick={handleEditPhone}
                    className="text-[13px] text-primary underline-offset-2 hover:underline"
                  >
                    ویرایش شماره
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleOTPSubmit()}
                  disabled={verifying}
                  className={primaryButtonClasses}
                  style={primaryButtonStyles}
                >
                  {verifying ? "در حال تایید..." : "تایید کد"}
                </button>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-3 text-center">
                <CheckCircle className="mx-auto h-14 w-14 text-green-500" />
                <p className="text-lg font-semibold">ورود موفقیت‌آمیز بود</p>
                <p className="text-sm text-muted-foreground">
                  در حال انتقال به مرحله بعدی...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

