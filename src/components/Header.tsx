import { ChevronLeft } from "lucide-react";
import { Logo } from "./Logo";
import { formatPhoneForDisplay } from "../utils/phoneValidator";
import type { User } from "../types/auth";

interface HeaderProps {
  onBack?: () => void;
  showBackButton?: boolean;
  isAuthenticated?: boolean;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function Header({
  onBack,
  showBackButton = true,
  isAuthenticated = false,
  user = null,
  onLogin,
  onLogout
}: HeaderProps) {
  return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
          <div className="relative max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
              {/* Left side: Back button or spacer */}
              {showBackButton ? (
                  <button
                      onClick={onBack}
                      className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-900 transition-colors group"
                  >
                      <ChevronLeft className="w-5 h-5 text-gray-900 group-hover:text-white transition-colors" />
                  </button>
              ) : (
                  <div className="w-9" />
              )}

              {/* Center: Logo (ABSOLUTELY CENTERED) */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                  <Logo />
              </div>

              {/* Right side: Auth UI */}
              <div className="flex items-center gap-3">
                  {isAuthenticated && user ? (
                      <>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="hidden sm:inline">
              {formatPhoneForDisplay(user.phone_number)}
            </span>
                          </div>
                          <button
                              onClick={onLogout}
                              className="px-6 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800
              font-medium transition-colors duration-200 text-sm flex items-center justify-center"
                          >
                              خروج
                          </button>
                      </>
                  ) : (
                      <button
                          onClick={onLogin}
                          className="px-6 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800
            font-medium transition-colors duration-200 text-sm flex items-center justify-center"
                      >
                          ثبت نام/ورود
                      </button>
                  )}
              </div>
          </div>
      </header>
  );
}