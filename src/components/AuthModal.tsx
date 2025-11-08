import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, LogIn, UserPlus, Phone, Lock, User } from "lucide-react";
import { trackEvent } from "../utils/analytics";

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  token?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  onRequestTerms?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess, onRequestTerms }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  if (!isOpen) return null;

  const resetForms = () => {
    setLoginPhone("");
    setLoginPassword("");
    setRegisterName("");
    setRegisterPhone("");
    setRegisterPassword("");
    setError(null);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const mockSuccess = (user: AuthUser) => {
    localStorage.setItem("authToken", `mock_token_${Date.now()}`);
    trackEvent("auth_session_created", { userId: user.id, phone: user.phone });
    onSuccess(user);
    handleClose();
    setIsLoading(false);
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    trackEvent("auth_login_attempt", { phone: loginPhone });

    setTimeout(() => {
      const mockUser: AuthUser = {
        id: `user_${Date.now()}`,
        phone: loginPhone,
        name: "کاربر HOMA",
      };

      trackEvent("auth_login_success", { phone: loginPhone, userId: mockUser.id });
      mockSuccess(mockUser);
    }, 1000);
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    trackEvent("auth_register_attempt", { phone: registerPhone });

    setTimeout(() => {
      const mockUser: AuthUser = {
        id: `user_${Date.now()}`,
        phone: registerPhone,
        name: registerName,
      };

      trackEvent("auth_register_success", { phone: registerPhone, userId: mockUser.id });
      mockSuccess(mockUser);
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(event) => event.stopPropagation()}
          className="bg-card rounded-[var(--radius-card)] max-w-md w-full p-6 relative shadow-2xl"
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <h2>ورود یا ثبت‌نام</h2>
            <p className="text-muted-foreground mt-2">برای ادامه وارد حساب کاربری خود شوید</p>
          </div>

          <div className="flex gap-2 mb-6 bg-muted rounded-[var(--radius-md)] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-[var(--radius-sm)] transition-colors ${
                activeTab === "login" ? "bg-card shadow-sm" : "hover:bg-card/50"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>ورود</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-[var(--radius-sm)] transition-colors ${
                activeTab === "register" ? "bg-card shadow-sm" : "hover:bg-card/50"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>ثبت‌نام</span>
            </button>
          </div>

          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2 text-right">
                <label className="flex items-center justify-end gap-2">
                  شماره تلفن
                  <Phone className="w-4 h-4" />
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="09123456789"
                  value={loginPhone}
                  onChange={(event) => setLoginPhone(event.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300 text-right"
                />
              </div>

              <div className="space-y-2 text-right">
                <label className="flex items-center justify-end gap-2">
                  رمز عبور
                  <Lock className="w-4 h-4" />
                </label>
                <input
                  type="password"
                  placeholder="رمز عبور خود را وارد کنید"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                  disabled={isLoading}
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
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-[var(--radius-button)] h-12 transition-colors disabled:opacity-50"
              >
                {isLoading ? "در حال ورود..." : "ورود"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2 text-right">
                <label className="flex items-center justify-end gap-2">
                  نام و نام خانوادگی
                  <User className="w-4 h-4" />
                </label>
                <input
                  type="text"
                  placeholder="نام خود را وارد کنید"
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300"
                />
              </div>

              <div className="space-y-2 text-right">
                <label className="flex items-center justify-end gap-2">
                  شماره تلفن
                  <Phone className="w-4 h-4" />
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="09123456789"
                  value={registerPhone}
                  onChange={(event) => setRegisterPhone(event.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300 text-right"
                />
              </div>

              <div className="space-y-2 text-right">
                <label className="flex items-center justify-end gap-2">
                  رمز عبور
                  <Lock className="w-4 h-4" />
                </label>
                <input
                  type="password"
                  placeholder="رمز عبور خود را وارد کنید"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300"
                />
                <p className="text-muted-foreground text-right">رمز عبور باید حداقل ۶ کاراکتر باشد</p>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-[var(--radius-sm)]">
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-[var(--radius-button)] h-12 transition-colors disabled:opacity-50"
              >
                {isLoading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            با ورود یا ثبت‌نام، شما{" "}
            <button
              type="button"
              className="text-accent hover:underline"
              onClick={() => {
                trackEvent("auth_terms_requested");
                onRequestTerms?.();
              }}
            >
              قوانین و مقررات
            </button>{" "}
            HOMA را می‌پذیرید
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

