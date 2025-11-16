/**
 * User Login/Register Component
 * Modal with tabs for login and registration
 * Uses Iranian phone number format
 * Figma Design-based UI with real API integration
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, Phone, Lock, User } from 'lucide-react';
import { userAuthService } from '../services/userAuthService';
import { validateAndNormalizePhone, validatePassword } from '../utils/phoneValidator';
import type { AuthData } from '../types/auth';

interface UserLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authData: AuthData) => void;
}

type TabType = 'login' | 'register';

export function UserLogin({ isOpen, onClose, onSuccess }: UserLoginProps) {
  const [activeTab, setActiveTab] = useState<TabType>('login');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForms = () => {
    setLoginPhone('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterPhone('');
    setRegisterPassword('');
    setError(null);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate phone
      const phoneValidation = validateAndNormalizePhone(loginPhone);
      if (!phoneValidation.isValid) {
        setError(phoneValidation.error || 'شماره موبایل معتبر نیست');
        setLoading(false);
        return;
      }

      // Validate password
      const passwordValidation = validatePassword(loginPassword);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.error || 'رمز عبور معتبر نیست');
        setLoading(false);
        return;
      }

      // Login
      const result = await userAuthService.login({
        phone_number: loginPhone,
        password: loginPassword,
      });

      if (result.success && result.data) {
        onSuccess(result.data);
        // Don't call handleClose here - let handleAuthSuccess handle navigation
        resetForms();
      } else {
        setError(result.error || 'خطا در ورود');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate phone
      const phoneValidation = validateAndNormalizePhone(registerPhone);
      if (!phoneValidation.isValid) {
        setError(phoneValidation.error || 'شماره موبایل معتبر نیست');
        setLoading(false);
        return;
      }

      // Validate password
      const passwordValidation = validatePassword(registerPassword);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.error || 'رمز عبور معتبر نیست');
        setLoading(false);
        return;
      }

      // Register
      const result = await userAuthService.register({
        phone_number: registerPhone,
        password: registerPassword,
        name: registerName.trim() || undefined,
      });

      if (result.success && result.data) {
        onSuccess(result.data);
        // Don't call handleClose here - let handleAuthSuccess handle navigation
        resetForms();
      } else {
        setError(result.error || 'خطا در ثبت نام');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-[var(--radius-card)] max-w-md w-full p-6 relative"
          style={{ boxShadow: "var(--elevation-md)" }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-all duration-300"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="text-center mb-6">
            <h2>ورود یا ثبت‌نام</h2>
            <p className="text-muted-foreground mt-2">
              برای ادامه وارد حساب کاربری خود شوید
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-muted rounded-[var(--radius-md)] p-1">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-[var(--radius-sm)] transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-card shadow-sm'
                  : 'hover:bg-card/50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>ورود</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-[var(--radius-sm)] transition-all duration-300 ${
                activeTab === 'register'
                  ? 'bg-card shadow-sm'
                  : 'hover:bg-card/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>ثبت‌نام</span>
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  شماره تلفن
                </label>
                <input
                  type="tel"
                  placeholder="09123456789"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300 text-right"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  رمز عبور
                </label>
                <input
                  type="password"
                  placeholder="رمز عبور خود را وارد کنید"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-[var(--radius-sm)]">
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-[var(--radius-button)] h-12 transition-all duration-300 disabled:opacity-50 text-center"
              >
                {loading ? 'در حال ورود...' : 'ورود'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  placeholder="نام خود را وارد کنید"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  شماره تلفن
                </label>
                <input
                  type="tel"
                  placeholder="09123456789"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  رمز عبور
                </label>
                <input
                  type="password"
                  placeholder="حداقل ۸ کاراکتر، حروف بزرگ و کوچک و عدد"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300"
                />
                <p className="text-xs text-muted-foreground">
                  حداقل ۸ کاراکتر، شامل حروف بزرگ و کوچک انگلیسی و عدد
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-[var(--radius-sm)]">
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-[var(--radius-button)] h-12 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
              </button>
            </form>
          )}

          {/* Privacy Note */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              با ورود یا ثبت‌نام، شما{' '}
              <button
                type="button"
                className="text-accent hover:underline"
                onClick={() => {
                  // TODO: Open terms modal
                }}
              >
                قوانین و مقررات
              </button>{' '}
              HOMA را می‌پذیرید
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
