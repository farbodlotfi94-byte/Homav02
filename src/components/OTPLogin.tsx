import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, RefreshCcw, X, Eye, EyeOff, Smartphone, Crown, User, Lock } from "lucide-react";
import { PhoneInput } from "./ui/PhoneInput";
import { OTPInputField } from "./ui/OTPInput";
import { CountdownTimer } from "./ui/CountdownTimer";
import { otpService } from "../services/otpService";
import { userAuthService } from "../services/userAuthService";
import { vipAuthService } from "../services/vipAuthService";
import { validateAndNormalizePhone, formatPhoneForDisplay } from "../utils/phoneValidator";
import { canSendOTP, recordOTPRequest, clearOTPRateLimitState, OTP_COOLDOWNS_SECONDS } from "../utils/otpRateLimitStorage";
import { handleSendOTPError, handleVerifyOTPError } from "../utils/otpErrorHandler";
import { validateOTPCode } from "../utils/otpValidator";
import { requestWebOTP, isWebOTPSupported } from "../utils/webOTP";
import type { AuthData } from "../types/auth";

type AuthStep = "phone" | "otp" | "success";
type LoginMode = "phone" | "vip";

interface OTPLoginProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (authData: AuthData) => void;
    initialPhoneNumber?: string;
}

export function OTPLogin({ isOpen, onClose, onSuccess, initialPhoneNumber }: OTPLoginProps) {
    // HOMA Orange primary button
    const primaryButtonStyles: CSSProperties = {
        backgroundImage: "linear-gradient(135deg, #FFB020 0%, #FFA000 50%, #E68A00 100%)",
        borderColor: "#E68A00",
        color: "#ffffff",
        boxShadow: "0 8px 24px rgba(255, 160, 0, 0.4), 0 4px 8px rgba(255, 160, 0, 0.2)",
        isolation: "isolate",
    };

    // VIP Gold button
    const vipButtonStyles: CSSProperties = {
        backgroundImage: "linear-gradient(135deg, #D4AF37 0%, #C5A028 50%, #B8860B 100%)",
        borderColor: "#9A7209",
        color: "#ffffff",
        boxShadow: "0 8px 24px rgba(212, 175, 55, 0.4), 0 4px 8px rgba(212, 175, 55, 0.2)",
        isolation: "isolate",
    };
    const primaryButtonClasses =
        "relative w-full rounded-2xl py-4 text-base font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FFA000]/50 transition-all duration-200 disabled:opacity-60 active:scale-[0.98] hover:brightness-110";

    const [step, setStep] = useState<AuthStep>("phone");
    const [loginMode, setLoginMode] = useState<LoginMode>("phone");
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

    // VIP Login state
    const [vipUsername, setVipUsername] = useState("");
    const [vipPassword, setVipPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [vipLoading, setVipLoading] = useState(false);

    const maskedPhone = useMemo(() => {
        if (!normalizedPhone) return "";
        const display = formatPhoneForDisplay(normalizedPhone);
        if (display.length !== 11) return display;
        return `${display.slice(0, 4)}****${display.slice(-3)}`;
    }, [normalizedPhone]);

    useEffect(() => {
        if (isOpen) {
            setStep("phone");
            setLoginMode("phone");
            setOTPCode("");
            setError(null);
            setPhoneError(null);
            setCountdownExpiry(null);
            setCanResend(false);
            setRemainingAttempts(5);
            setResendCount(0);
            // Reset VIP state
            setVipUsername("");
            setVipPassword("");
            setShowPassword(false);
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

    // VIP Login handler
    const handleVIPLogin = async () => {
        setError(null);

        if (!vipUsername.trim()) {
            setError("لطفاً نام کاربری را وارد کنید");
            return;
        }

        if (!vipPassword) {
            setError("لطفاً رمز عبور را وارد کنید");
            return;
        }

        setVipLoading(true);
        const result = await vipAuthService.login({
            username: vipUsername.trim(),
            password: vipPassword,
        });
        setVipLoading(false);

        if (result.success && result.data) {
            userAuthService.saveAuthData(result.data);
            setStep("success");
            setTimeout(() => {
                onSuccess(result.data!);
            }, 600);
        } else {
            setError(result.message || "نام کاربری یا رمز عبور اشتباه است");
        }
    };

    // Switch between login modes
    const switchToVIP = () => {
        setLoginMode("vip");
        setError(null);
        setPhoneError(null);
    };

    const switchToPhone = () => {
        setLoginMode("phone");
        setError(null);
        setVipUsername("");
        setVipPassword("");
        setShowPassword(false);
    };

    const handleClose = () => {
        handleEditPhone();
        onClose();
    };

    // Tab component for mode switching - Clean minimal design
    const LoginModeTabs = () => (
        <div className="relative flex w-full rounded-xl bg-gray-100 p-1">
            {/* Animated background indicator */}
            <motion.div
                className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm"
                initial={false}
                animate={{
                    right: loginMode === "phone" ? "4px" : "50%",
                    left: loginMode === "phone" ? "50%" : "4px",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />

            {/* VIP Tab */}
            <button
                type="button"
                onClick={switchToVIP}
                className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors duration-200 ${
                    loginMode === "vip"
                        ? "text-[#B8860B]"
                        : "text-gray-500 hover:text-gray-700"
                }`}
            >
                <Crown className={`h-4 w-4 ${loginMode === "vip" ? "text-[#D4AF37]" : "text-gray-400"}`} />
                <span>ورود VIP</span>
            </button>

            {/* Phone Tab */}
            <button
                type="button"
                onClick={switchToPhone}
                className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors duration-200 ${
                    loginMode === "phone"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                }`}
            >
                <Smartphone className={`h-4 w-4 ${loginMode === "phone" ? "text-[#FFA000]" : "text-gray-400"}`} />
                <span>شماره موبایل</span>
            </button>
        </div>
    );

    // Don't render if not open
    if (!isOpen) return null;

    // Use portal to render modal at document.body level, outside any parent containers
    return createPortal(
        <AnimatePresence>
            {/* Backdrop with blur effect */}
            <motion.div
                key="otp-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0"
                style={{
                    zIndex: 9998,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                }}
                onClick={handleClose}
            />
            {/* Modal container */}
            <motion.div
                key="otp-modal-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4 sm:p-6 pointer-events-none"
                style={{ zIndex: 9999 }}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    onClick={(event) => event.stopPropagation()}
                    className="relative rounded-2xl overflow-hidden pointer-events-auto"
                    style={{
                        width: "100%",
                        maxWidth: "400px",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        backgroundColor: "#ffffff",
                    }}
                >
                    {/* Content wrapper */}
                    <div className="p-6 sm:p-8" style={{ backgroundColor: "#ffffff" }}>
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all duration-200 flex items-center justify-center"
                            aria-label="بستن"
                        >
                            <X className="h-4 w-4" strokeWidth={2.5} />
                        </button>

                    <div className="space-y-6 text-center">
                        {/* Minimal Header */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-gray-900">
                                ورود به حساب کاربری
                            </h2>
                            <p className="text-sm text-gray-500">
                                {loginMode === "vip" ? "ورود با حساب ویژه" : "روش ورود خود را انتخاب کنید"}
                            </p>
                        </div>

                        {/* Mode Tabs - Only show on phone step */}
                        {step === "phone" && <LoginModeTabs />}

                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm"
                                role="alert"
                            >
                                <p className="text-red-600 font-medium text-center">{error}</p>
                            </motion.div>
                        )}

                        {/* Phone Login Form */}
                        {step === "phone" && loginMode === "phone" && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
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
                                    className="w-full"
                                />

                                <button
                                    type="button"
                                    onClick={handlePhoneSubmit}
                                    disabled={loading}
                                    className={primaryButtonClasses}
                                    style={primaryButtonStyles}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                      در حال ارسال کد...
                    </span>
                                    ) : (
                                        "ارسال کد تایید"
                                    )}
                                </button>

                                <p className="text-xs text-gray-400 pt-4 text-center">
                                    با ادامه، <span className="text-gray-500">قوانین و مقررات</span> HOMA را می‌پذیرید.
                                </p>
                            </motion.div>
                        )}

                        {/* VIP Login Form */}
                        {step === "phone" && loginMode === "vip" && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
                                {/* VIP Text Label */}
                                <div className="flex items-center justify-center gap-2">
                                    <Crown className="h-4 w-4 text-[#D4AF37]" />
                                    <span className="text-sm font-medium text-[#9A7209]">ویژه کاربران VIP</span>
                                </div>

                                <div className="space-y-4">
                                    {/* Username input */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="vip-username" className="block text-sm font-medium text-gray-700 text-right">
                                            نام کاربری
                                        </label>
                                        <div className="relative flex items-center">
                                            <input
                                                id="vip-username"
                                                type="text"
                                                value={vipUsername}
                                                onChange={(e) => setVipUsername(e.target.value)}
                                                placeholder="نام کاربری خود را وارد کنید"
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-4 text-right text-base transition-all duration-200 placeholder:text-gray-400"
                                                style={{ outline: "none", paddingRight: "3rem", paddingLeft: "1rem" }}
                                                autoFocus
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = "#D4AF37";
                                                    e.target.style.backgroundColor = "#fff";
                                                    e.target.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.15)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = "#e5e7eb";
                                                    e.target.style.backgroundColor = "rgb(249 250 251)";
                                                    e.target.style.boxShadow = "none";
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleVIPLogin();
                                                    }
                                                }}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                <User className="h-5 w-5" strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password input */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="vip-password" className="block text-sm font-medium text-gray-700 text-right">
                                            رمز عبور
                                        </label>
                                        <div className="relative flex items-center">
                                            <input
                                                id="vip-password"
                                                type={showPassword ? "text" : "password"}
                                                value={vipPassword}
                                                onChange={(e) => setVipPassword(e.target.value)}
                                                placeholder="رمز عبور خود را وارد کنید"
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-4 text-right text-base transition-all duration-200 placeholder:text-gray-400"
                                                style={{ outline: "none", paddingRight: "3rem", paddingLeft: "3rem" }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = "#D4AF37";
                                                    e.target.style.backgroundColor = "#fff";
                                                    e.target.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.15)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = "#e5e7eb";
                                                    e.target.style.backgroundColor = "rgb(249 250 251)";
                                                    e.target.style.boxShadow = "none";
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleVIPLogin();
                                                    }
                                                }}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                <Lock className="h-5 w-5" strokeWidth={1.5} />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors duration-200"
                                                style={{ left: '1rem' }}
                                                tabIndex={-1}
                                                aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                                                ) : (
                                                    <Eye className="h-5 w-5" strokeWidth={1.5} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleVIPLogin}
                                    disabled={vipLoading}
                                    className={primaryButtonClasses}
                                    style={vipButtonStyles}
                                >
                                    {vipLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <RefreshCcw className="h-4 w-4 animate-spin" />
                                            در حال ورود...
                                        </span>
                                    ) : (
                                        "ورود"
                                    )}
                                </button>

                                <p className="text-xs text-gray-400 text-center">
                                    با ورود، <span className="text-gray-500 hover:underline cursor-pointer">قوانین و مقررات</span> HOMA را می‌پذیرید.
                                </p>
                            </motion.div>
                        )}

                        {step === "otp" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-5 text-right"
                            >
                                <p className="text-sm text-gray-500 text-center">
                                    کد ۶ رقمی به شماره <span dir="ltr" className="inline-block font-medium text-gray-700">{maskedPhone || "شماره شما"}</span> ارسال شد
                                </p>

                                <OTPInputField
                                    value={otpCode}
                                    onChange={setOTPCode}
                                    onComplete={(code) => handleOTPSubmit(code)}
                                    disabled={verifying}
                                    error={!!error}
                                    className="w-full"
                                />

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <RefreshCcw className={`h-4 w-4 transition-colors duration-300 ${canResend ? 'text-[#FFA000]' : 'text-gray-400'}`} />
                                        {!canResend && countdownExpiry ? (
                                            <CountdownTimer
                                                expiryTimestamp={countdownExpiry}
                                                onExpire={() => setCanResend(true)}
                                                format="seconds"
                                                className="text-sm font-medium text-gray-600"
                                            />
                                        ) : (
                                            <span className="text-[#FFA000] font-medium">ارسال مجدد</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={!canResend || resending}
                                        className={`rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                            canResend && !resending
                                                ? 'bg-[#FFA000] text-white font-semibold shadow-md hover:bg-[#E68A00]'
                                                : 'border border-gray-200 text-gray-300 bg-transparent'
                                        }`}
                                    >
                                        {resending ? "در حال ارسال..." : "ارسال مجدد کد"}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                                    <span className="text-gray-600">تلاش‌های باقی‌مانده: <span className="font-medium text-gray-700">{remainingAttempts}</span></span>
                                    <button
                                        type="button"
                                        onClick={handleEditPhone}
                                        className="text-[13px] text-[#FFA000] font-medium hover:underline underline-offset-2"
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
                                    {verifying ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <RefreshCcw className="h-4 w-4 animate-spin" />
                                            در حال تایید...
                                        </span>
                                    ) : (
                                        "تایید کد"
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-5 text-center py-6"
                            >
                                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-10 w-10 text-green-500" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-bold text-gray-900">ورود موفقیت‌آمیز</p>
                                    <p className="text-sm text-gray-500">
                                        در حال انتقال به صفحه اصلی...
                                    </p>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2, ease: "linear" }}
                                        className="bg-[#FFA000] h-1.5 rounded-full"
                                    />
                                </div>
                            </motion.div>
                        )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}