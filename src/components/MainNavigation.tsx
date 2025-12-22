/**
 * MainNavigation - Desktop sidebar navigation for the main app
 *
 * Shows on md+ breakpoints, hidden on mobile (Header shows instead)
 * Follows the same pattern as seller dashboard's SellerNavigation
 *
 * Uses AppContext for auth state and navigation handlers.
 * Falls back to props if context is not available (for backward compatibility).
 */

import { Home, Info, Store, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { Logo } from "./Logo";
import { formatPhoneForDisplay } from "../utils/phoneValidator";
import { useAppOptional } from "../contexts";
import type { User } from "../types/auth";

interface MainNavigationProps {
  // These props are optional - will use context if available
  isAuthenticated?: boolean;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onAboutClick?: () => void;
  onSellerDashboard?: () => void;
  onHomeClick?: () => void;
}

export function MainNavigation({
  isAuthenticated: propIsAuthenticated,
  user: propUser,
  onLogin: propOnLogin,
  onLogout: propOnLogout,
  onAboutClick: propOnAboutClick,
  onSellerDashboard: propOnSellerDashboard,
  onHomeClick,
}: MainNavigationProps) {
  // Use context if available, fall back to props
  const appContext = useAppOptional();

  const isAuthenticated = appContext?.isAuthenticated ?? propIsAuthenticated ?? false;
  const user = appContext?.user ?? propUser ?? null;
  const onLogin = appContext?.onLogin ?? propOnLogin;
  const onLogout = appContext?.onLogout ?? propOnLogout;
  const onAboutClick = appContext?.onAboutClick ?? propOnAboutClick;
  const onSellerDashboard = appContext?.onSellerDashboard ?? propOnSellerDashboard;
  const navItems = [
    { id: "home", label: "خانه", icon: Home, onClick: onHomeClick },
    { id: "about", label: "درباره ما", icon: Info, onClick: onAboutClick },
    { id: "seller", label: "پنل فروشنده", icon: Store, onClick: onSellerDashboard },
  ];

  const inactiveColor = "rgba(17, 24, 39, 0.6)";

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Logo Section - Centered */}
      <div className="p-5 border-b border-gray-100" dir="ltr">
        <button
          onClick={onHomeClick}
          className="w-full hover:opacity-80 transition-opacity flex justify-center"
        >
          <Logo />
        </button>
      </div>

      {/* Auth Section - Prominently placed near top for visibility */}
      <div className="px-4 py-4 border-b border-gray-100">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-sm"
              >
                <UserIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">کاربر</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {formatPhoneForDisplay(user.phone_number)}
                </p>
              </div>
            </div>
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              style={{ fontSize: "13px" }}
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            style={{ fontSize: "14px" }}
          >
            <LogIn className="w-4 h-4" />
            <span>ورود / ثبت نام</span>
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex items-center justify-start gap-3 px-4 py-3 rounded-2xl transition-all duration-200 hover:bg-gray-100"
                style={{
                  color: inactiveColor,
                  fontSize: "15px",
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
