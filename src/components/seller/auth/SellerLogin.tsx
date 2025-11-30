import { useState, useEffect } from 'react';
import { Lock, User, Phone, ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { HomaHeader } from '../common/HomaHeader';
import { sellerAuthService } from '../../../services/sellerAuthService';

interface SellerLoginProps {
  onLoginSuccess: () => void;
}

type Mode = 'login' | 'register' | 'reset';
type RegistrationStep = 'phone' | 'otp' | 'form';

export function SellerLogin({ onLoginSuccess }: SellerLoginProps) {
  // Mode state
  const [mode, setMode] = useState<Mode>('login');
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('phone');

  // Login state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration state
  const [regPhone, setRegPhone] = useState('');
  const [regOtp, setRegOtp] = useState(['', '', '', '', '', '']);
  const [regUsername, setRegUsername] = useState('');
  const [regShopName, setRegShopName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Password reset state
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState(['', '', '', '', '', '']);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState<'phone' | 'otp' | 'password'>('phone');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);

  // OTP Countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Clear messages when mode changes
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [mode, registrationStep, resetStep]);

  // ==================== Login Flow ====================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await sellerAuthService.login({
        phone_number: loginPhone,
        password: loginPassword,
      });

      if (result.success) {
        setSuccess('ورود موفقیت‌آمیز بود');
        setTimeout(onLoginSuccess, 500);
      } else {
        setError(result.error || 'خطا در ورود');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Registration Flow ====================
  // Step 1: Send OTP to phone
  const handleSendRegisterOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await sellerAuthService.sendPhoneVerificationOTP(regPhone);

      if (result.success) {
        setSuccess('کد تأیید به شماره شما ارسال شد');
        setRegistrationStep('otp');
        setOtpCountdown(180); // 3 minutes
      } else {
        setError(result.error || 'خطا در ارسال کد');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyRegisterOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = regOtp.join('');

    if (otpCode.length !== 6) {
      setError('لطفا کد ۶ رقمی را وارد کنید');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await sellerAuthService.verifyPhoneOTP(regPhone, otpCode);

      if (result.success) {
        setSuccess('شماره تماس تأیید شد');
        setRegistrationStep('form');
      } else {
        setError(result.error || 'کد وارد شده نامعتبر است');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regPassword !== regConfirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    if (regPassword.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await sellerAuthService.register({
        phone_number: regPhone,
        username: regUsername,
        shop_name: regShopName,
        password: regPassword,
        confirm_password: regConfirmPassword,
      });

      if (result.success) {
        setSuccess('ثبت‌نام با موفقیت انجام شد');
        setTimeout(onLoginSuccess, 500);
      } else {
        setError(result.error || 'خطا در ثبت‌نام');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Password Reset Flow ====================
  // Step 1: Send reset OTP
  const handleSendResetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await sellerAuthService.sendPasswordResetOTP(resetPhone);

      if (result.success) {
        setSuccess('کد بازیابی به شماره شما ارسال شد');
        setResetStep('otp');
        setOtpCountdown(180);
      } else {
        setError(result.error || 'خطا در ارسال کد');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete password reset
  const handleCompletePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = resetOtp.join('');

    if (otpCode.length !== 6) {
      setError('لطفا کد ۶ رقمی را وارد کنید');
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    if (resetPassword.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await sellerAuthService.resetPassword(
        resetPhone,
        otpCode,
        resetPassword,
        resetConfirmPassword
      );

      if (result.success) {
        setSuccess('رمز عبور با موفقیت تغییر کرد');
        setTimeout(() => {
          setMode('login');
          setResetStep('phone');
          setResetPhone('');
          setResetOtp(['', '', '', '', '', '']);
          setResetPassword('');
          setResetConfirmPassword('');
        }, 1500);
      } else {
        setError(result.error || 'خطا در تغییر رمز عبور');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Helper Functions ====================
  const handleOtpChange = (index: number, value: string, isReset: boolean = false) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const setter = isReset ? setResetOtp : setRegOtp;
    const currentOtp = isReset ? resetOtp : regOtp;

    const newOtp = [...currentOtp];
    newOtp[index] = value;
    setter(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent, isReset: boolean = false) => {
    const currentOtp = isReset ? resetOtp : regOtp;

    if (e.key === 'Backspace' && !currentOtp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const phone = mode === 'register' ? regPhone : resetPhone;
      const result = mode === 'register'
        ? await sellerAuthService.sendPhoneVerificationOTP(phone)
        : await sellerAuthService.sendPasswordResetOTP(phone);

      if (result.success) {
        setSuccess('کد مجدداً ارسال شد');
        setOtpCountdown(180);
      } else {
        setError(result.error || 'خطا در ارسال مجدد کد');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Render Functions ====================
  const renderMessage = () => {
    if (error) {
      return (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
          <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 'var(--font-weight-medium)' }}>
            {error}
          </span>
        </div>
      );
    }

    if (success) {
      return (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 'var(--font-weight-medium)' }}>
            {success}
          </span>
        </div>
      );
    }

    return null;
  };

  const renderOTPInputs = (otp: string[], isReset: boolean = false) => {
    return (
      <div className="flex justify-center gap-2 mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value, isReset)}
            onKeyDown={(e) => handleOtpKeyDown(index, e, isReset)}
            className="border transition-all duration-200 text-center"
            style={{
              width: '48px',
              height: '56px',
              borderRadius: '12px',
              borderColor: digit ? 'var(--old-flax)' : 'rgba(0, 0, 0, 0.1)',
              fontSize: '20px',
              fontWeight: 'var(--font-weight-bold)',
              color: '#000000',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--old-flax)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = digit ? 'var(--old-flax)' : 'rgba(0, 0, 0, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            }}
          />
        ))}
      </div>
    );
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="loginPhone" style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          color: '#000000',
          textAlign: 'right'
        }}>
          شماره تماس
        </label>
        <div className="relative">
          <Phone
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'rgba(0, 0, 0, 0.3)' }}
          />
          <input
            id="loginPhone"
            type="tel"
            value={loginPhone}
            onChange={(e) => setLoginPhone(e.target.value)}
            className="w-full border transition-all duration-200"
            dir="ltr"
            style={{
              height: '48px',
              borderRadius: '16px',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-normal)',
              color: '#000000',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              outline: 'none',
              paddingRight: '44px',
              paddingLeft: '16px',
              textAlign: 'left'
            }}
            placeholder="09123456789"
            required
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--old-flax)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="loginPassword" style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          color: '#000000',
          textAlign: 'right'
        }}>
          رمز عبور
        </label>
        <div className="relative">
          <Lock
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'rgba(0, 0, 0, 0.3)' }}
          />
          <input
            id="loginPassword"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full border transition-all duration-200"
            dir="rtl"
            style={{
              height: '48px',
              borderRadius: '16px',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-normal)',
              color: '#000000',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              outline: 'none',
              paddingRight: '44px',
              paddingLeft: '16px',
              textAlign: 'right'
            }}
            placeholder="••••••••"
            required
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--old-flax)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            }}
          />
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <button
          type="button"
          onClick={() => setMode('reset')}
          className="text-sm transition-colors duration-200"
          style={{
            color: 'rgba(0, 0, 0, 0.5)',
            fontSize: '13px',
            fontWeight: 'var(--font-weight-medium)',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--old-flax)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)'}
        >
          فراموشی رمز عبور
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
        style={{
          marginTop: '20px',
          height: '50px',
          borderRadius: '25px',
          backgroundColor: loading ? 'rgba(0, 0, 0, 0.3)' : 'var(--old-flax)',
          color: '#000000',
          fontSize: '15px',
          fontWeight: 'var(--font-weight-bold)',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: 'none'
        }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>در حال ورود...</span>
          </>
        ) : (
          <>
            <span>ورود</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );

  const renderRegisterPhoneForm = () => (
    <form onSubmit={handleSendRegisterOTP} className="space-y-4">
      <div>
        <label htmlFor="regPhone" style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          color: '#000000',
          textAlign: 'right'
        }}>
          شماره تماس
        </label>
        <div className="relative">
          <Phone
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'rgba(0, 0, 0, 0.3)' }}
          />
          <input
            id="regPhone"
            type="tel"
            value={regPhone}
            onChange={(e) => setRegPhone(e.target.value)}
            className="w-full border transition-all duration-200"
            dir="ltr"
            style={{
              height: '48px',
              borderRadius: '16px',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-normal)',
              color: '#000000',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              outline: 'none',
              paddingRight: '44px',
              paddingLeft: '16px',
              textAlign: 'left'
            }}
            placeholder="09123456789"
            required
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--old-flax)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
        style={{
          marginTop: '20px',
          height: '50px',
          borderRadius: '25px',
          backgroundColor: loading ? 'rgba(0, 0, 0, 0.3)' : 'var(--old-flax)',
          color: '#000000',
          fontSize: '15px',
          fontWeight: 'var(--font-weight-bold)',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: 'none'
        }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>در حال ارسال...</span>
          </>
        ) : (
          <>
            <span>دریافت کد تأیید</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );

  const renderRegisterOTPForm = () => (
    <form onSubmit={handleVerifyRegisterOTP} className="space-y-4">
      <div>
        <p style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '14px',
          color: 'rgba(0, 0, 0, 0.6)',
          fontWeight: 'var(--font-weight-normal)'
        }}>
          کد ۶ رقمی ارسال شده به شماره <span style={{ fontWeight: 'var(--font-weight-bold)', color: '#000000' }}>{regPhone}</span> را وارد کنید
        </p>

        {renderOTPInputs(regOtp)}

        {/* Countdown / Resend */}
        <div className="text-center">
          {otpCountdown > 0 ? (
            <p style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.5)', fontWeight: 'var(--font-weight-medium)' }}>
              ارسال مجدد کد در {formatCountdown(otpCountdown)}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="transition-colors duration-200"
              style={{
                fontSize: '13px',
                color: 'var(--old-flax)',
                fontWeight: 'var(--font-weight-medium)',
                background: 'none',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              ارسال مجدد کد
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || regOtp.some(d => !d)}
        className="w-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
        style={{
          marginTop: '20px',
          height: '50px',
          borderRadius: '25px',
          backgroundColor: (loading || regOtp.some(d => !d)) ? 'rgba(0, 0, 0, 0.3)' : 'var(--old-flax)',
          color: '#000000',
          fontSize: '15px',
          fontWeight: 'var(--font-weight-bold)',
          border: 'none',
          cursor: (loading || regOtp.some(d => !d)) ? 'not-allowed' : 'pointer',
          boxShadow: 'none'
        }}
        onMouseEnter={(e) => !(loading || regOtp.some(d => !d)) && (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>در حال تأیید...</span>
          </>
        ) : (
          <>
            <span>تأیید کد</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Back button */}
      <button
        type="button"
        onClick={() => {
          setRegistrationStep('phone');
          setRegOtp(['', '', '', '', '', '']);
        }}
        className="w-full transition-colors duration-200"
        style={{
          fontSize: '13px',
          color: 'rgba(0, 0, 0, 0.5)',
          fontWeight: 'var(--font-weight-medium)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginTop: '10px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)'}
      >
        تغییر شماره تماس
      </button>
    </form>
  );

  const renderRegisterFormStep = () => (
    <form onSubmit={handleCompleteRegistration} className="space-y-4">
      <div>
        <label htmlFor="regUsername" style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          color: '#000000',
          textAlign: 'right'
        }}>
          نام کاربری
        </label>
        <div className="relative">
          <User
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'rgba(0, 0, 0, 0.3)' }}
          />
          <input
            id="regUsername"
            type="text"
            value={regUsername}
            onChange={(e) => setRegUsername(e.target.value)}
            className="w-full border transition-all duration-200"
            dir="ltr"
            style={{
              height: '48px',
              borderRadius: '16px',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-normal)',
              color: '#000000',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              outline: 'none',
              paddingRight: '44px',
              paddingLeft: '16px',
              textAlign: 'left'
            }}
            placeholder="my_shop"
            required
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--old-flax)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="regShopName" style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          color: '#000000',
          textAlign: 'right'
        }}>
          نام فروشگاه
        </label>
        <div className="relative">
          <User
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'rgba(0, 0, 0, 0.3)' }}
          />
          <input
            id="regShopName"
            type="text"
            value={regShopName}
            onChange={(e) => setRegShopName(e.target.value)}
            className="w-full border transition-all duration-200"
            dir="rtl"
            style={{
              height: '48px',
              borderRadius: '16px',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-normal)',
              color: '#000000',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              outline: 'none',
              paddingRight: '44px',
              paddingLeft: '16px',
              textAlign: 'right'
            }}
            placeholder="فروشگاه من"
            required
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--old-flax)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="regPassword" style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          color: '#000000',
          textAlign: 'right'
        }}>
          رمز عبور
        </label>
        <div className="relative">
          <Lock
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'rgba(0, 0, 0, 0.3)' }}
          />
          <input
            id="regPassword"
            type="password"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            className="w-full border transition-all duration-200"
            dir="rtl"
            style={{
              height: '48px',
              borderRadius: '16px',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-normal)',
              color: '#000000',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              outline: 'none',
              paddingRight: '44px',
              paddingLeft: '16px',
              textAlign: 'right'
            }}
            placeholder="حداقل ۸ کاراکتر"
            required
            minLength={8}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--old-flax)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="regConfirmPassword" style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          color: '#000000',
          textAlign: 'right'
        }}>
          تکرار رمز عبور
        </label>
        <div className="relative">
          <Lock
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'rgba(0, 0, 0, 0.3)' }}
          />
          <input
            id="regConfirmPassword"
            type="password"
            value={regConfirmPassword}
            onChange={(e) => setRegConfirmPassword(e.target.value)}
            className="w-full border transition-all duration-200"
            dir="rtl"
            style={{
              height: '48px',
              borderRadius: '16px',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-normal)',
              color: '#000000',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              outline: 'none',
              paddingRight: '44px',
              paddingLeft: '16px',
              textAlign: 'right'
            }}
            placeholder="تکرار رمز عبور"
            required
            minLength={8}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--old-flax)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
        style={{
          marginTop: '20px',
          height: '50px',
          borderRadius: '25px',
          backgroundColor: loading ? 'rgba(0, 0, 0, 0.3)' : 'var(--old-flax)',
          color: '#000000',
          fontSize: '15px',
          fontWeight: 'var(--font-weight-bold)',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: 'none'
        }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>در حال ثبت‌نام...</span>
          </>
        ) : (
          <>
            <span>ساخت حساب کاربری</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );

  const renderPasswordResetFlow = () => {
    if (resetStep === 'phone') {
      return (
        <form onSubmit={handleSendResetOTP} className="space-y-4">
          <div>
            <label htmlFor="resetPhone" style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-medium)',
              color: '#000000',
              textAlign: 'right'
            }}>
              شماره تماس
            </label>
            <div className="relative">
              <Phone
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: 'rgba(0, 0, 0, 0.3)' }}
              />
              <input
                id="resetPhone"
                type="tel"
                value={resetPhone}
                onChange={(e) => setResetPhone(e.target.value)}
                className="w-full border transition-all duration-200"
                dir="ltr"
                style={{
                  height: '48px',
                  borderRadius: '16px',
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-normal)',
                  color: '#000000',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  outline: 'none',
                  paddingRight: '44px',
                  paddingLeft: '16px',
                  textAlign: 'left'
                }}
                placeholder="09123456789"
                required
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--old-flax)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
            style={{
              marginTop: '20px',
              height: '50px',
              borderRadius: '25px',
              backgroundColor: loading ? 'rgba(0, 0, 0, 0.3)' : 'var(--old-flax)',
              color: '#000000',
              fontSize: '15px',
              fontWeight: 'var(--font-weight-bold)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>در حال ارسال...</span>
              </>
            ) : (
              <>
                <span>دریافت کد بازیابی</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      );
    }

    // OTP + Password step (combined)
    return (
      <form onSubmit={handleCompletePasswordReset} className="space-y-4">
        <div>
          <p style={{
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.6)',
            fontWeight: 'var(--font-weight-normal)'
          }}>
            کد ۶ رقمی ارسال شده به شماره <span style={{ fontWeight: 'var(--font-weight-bold)', color: '#000000' }}>{resetPhone}</span> را وارد کنید
          </p>

          {renderOTPInputs(resetOtp, true)}

          {/* Countdown / Resend */}
          <div className="text-center mb-6">
            {otpCountdown > 0 ? (
              <p style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.5)', fontWeight: 'var(--font-weight-medium)' }}>
                ارسال مجدد کد در {formatCountdown(otpCountdown)}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="transition-colors duration-200"
                style={{
                  fontSize: '13px',
                  color: 'var(--old-flax)',
                  fontWeight: 'var(--font-weight-medium)',
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                ارسال مجدد کد
              </button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="resetPassword" style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: 'var(--font-weight-medium)',
            color: '#000000',
            textAlign: 'right'
          }}>
            رمز عبور جدید
          </label>
          <div className="relative">
            <Lock
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: 'rgba(0, 0, 0, 0.3)' }}
            />
            <input
              id="resetPassword"
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="w-full border transition-all duration-200"
              dir="rtl"
              style={{
                height: '48px',
                borderRadius: '16px',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-normal)',
                color: '#000000',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                outline: 'none',
                paddingRight: '44px',
                paddingLeft: '16px',
                textAlign: 'right'
              }}
              placeholder="حداقل ۸ کاراکتر"
              required
              minLength={8}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--old-flax)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="resetConfirmPassword" style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: 'var(--font-weight-medium)',
            color: '#000000',
            textAlign: 'right'
          }}>
            تکرار رمز عبور جدید
          </label>
          <div className="relative">
            <Lock
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: 'rgba(0, 0, 0, 0.3)' }}
            />
            <input
              id="resetConfirmPassword"
              type="password"
              value={resetConfirmPassword}
              onChange={(e) => setResetConfirmPassword(e.target.value)}
              className="w-full border transition-all duration-200"
              dir="rtl"
              style={{
                height: '48px',
                borderRadius: '16px',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-normal)',
                color: '#000000',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                outline: 'none',
                paddingRight: '44px',
                paddingLeft: '16px',
                textAlign: 'right'
              }}
              placeholder="تکرار رمز عبور"
              required
              minLength={8}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--old-flax)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || resetOtp.some(d => !d)}
          className="w-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
          style={{
            marginTop: '20px',
            height: '50px',
            borderRadius: '25px',
            backgroundColor: (loading || resetOtp.some(d => !d)) ? 'rgba(0, 0, 0, 0.3)' : 'var(--old-flax)',
            color: '#000000',
            fontSize: '15px',
            fontWeight: 'var(--font-weight-bold)',
            border: 'none',
            cursor: (loading || resetOtp.some(d => !d)) ? 'not-allowed' : 'pointer',
            boxShadow: 'none'
          }}
          onMouseEnter={(e) => !(loading || resetOtp.some(d => !d)) && (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>در حال تغییر...</span>
            </>
          ) : (
            <>
              <span>تغییر رمز عبور</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Back button */}
        <button
          type="button"
          onClick={() => {
            setResetStep('phone');
            setResetOtp(['', '', '', '', '', '']);
            setResetPassword('');
            setResetConfirmPassword('');
          }}
          className="w-full transition-colors duration-200"
          style={{
            fontSize: '13px',
            color: 'rgba(0, 0, 0, 0.5)',
            fontWeight: 'var(--font-weight-medium)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginTop: '10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)'}
        >
          تغییر شماره تماس
        </button>
      </form>
    );
  };

  // ==================== Main Render ====================
  const getTitle = () => {
    if (mode === 'reset') return 'بازیابی رمز عبور';
    if (mode === 'register') {
      if (registrationStep === 'phone') return 'ثبت‌نام - ورود شماره تماس';
      if (registrationStep === 'otp') return 'ثبت‌نام - تأیید شماره';
      return 'ثبت‌نام - تکمیل اطلاعات';
    }
    return 'ورود به پنل';
  };

  const getSubtitle = () => {
    if (mode === 'reset') return 'رمز عبور خود را بازیابی کنید';
    if (mode === 'register') return 'فروشنده جدید هستید؟ ثبت‌نام کنید';
    return 'به پنل فروشنده خوش آمدید';
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#ffffff' }}
    >
      {/* Header */}
      <HomaHeader />

      {/* Centered Login Content */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-6 pt-5 pb-8 sm:pt-8 sm:pb-12">
        <div className="w-full max-w-md" dir="rtl">
          {/* Decorative Element */}
          <div className="flex justify-end mb-6">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0L11.5 8.5L20 10L11.5 11.5L10 20L8.5 11.5L0 10L8.5 8.5L10 0Z" fill="var(--old-flax)"/>
            </svg>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 style={{
              fontSize: '26px',
              fontWeight: 'var(--font-weight-bold)',
              color: '#000000',
              marginBottom: '10px',
              lineHeight: '1.3'
            }}>
              {getTitle()}
            </h1>
            <p style={{
              fontSize: '15px',
              fontWeight: 'var(--font-weight-normal)',
              color: 'rgba(0, 0, 0, 0.6)'
            }}>
              {getSubtitle()}
            </p>
          </div>

          {/* Form Card */}
          <div
            className="rounded-[24px] p-7 mb-5"
            style={{
              background: '#f8f9fa',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: 'none'
            }}
          >
            {renderMessage()}

            {mode === 'login' && renderLoginForm()}
            {mode === 'register' && registrationStep === 'phone' && renderRegisterPhoneForm()}
            {mode === 'register' && registrationStep === 'otp' && renderRegisterOTPForm()}
            {mode === 'register' && registrationStep === 'form' && renderRegisterFormStep()}
            {mode === 'reset' && renderPasswordResetFlow()}

            {/* Mode Toggle */}
            {mode !== 'reset' && (
              <div className="text-center pt-5 mt-5" style={{
                borderTop: '1px solid rgba(0, 0, 0, 0.1)'
              }}>
                <button
                  onClick={() => {
                    const newMode = mode === 'login' ? 'register' : 'login';
                    setMode(newMode);
                    setRegistrationStep('phone');
                    setError('');
                    setSuccess('');
                  }}
                  className="transition-colors duration-200"
                  style={{
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'rgba(0, 0, 0, 0.5)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)'}
                >
                  {mode === 'login'
                    ? 'حساب ندارم - ثبت‌نام'
                    : 'قبلاً ثبت‌نام کرده‌ام - ورود'}
                </button>
              </div>
            )}

            {/* Back to Login from Reset */}
            {mode === 'reset' && (
              <div className="text-center pt-5 mt-5" style={{
                borderTop: '1px solid rgba(0, 0, 0, 0.1)'
              }}>
                <button
                  onClick={() => {
                    setMode('login');
                    setResetStep('phone');
                    setError('');
                    setSuccess('');
                  }}
                  className="transition-colors duration-200"
                  style={{
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'rgba(0, 0, 0, 0.5)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)'}
                >
                  بازگشت به ورود
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
