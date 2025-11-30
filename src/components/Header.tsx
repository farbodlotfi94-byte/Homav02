import { ChevronLeft, Menu } from "lucide-react";
import { Logo } from "./Logo";
import { formatPhoneForDisplay } from "../utils/phoneValidator";
import type { User } from "../types/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  onBack?: () => void;
  showBackButton?: boolean;
  isAuthenticated?: boolean;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onAboutClick?: () => void;
  onSellerDashboard?: () => void;
}

export function Header({
  onBack,
  showBackButton = true,
  isAuthenticated = false,
  user = null,
  onLogin,
  onLogout,
  onAboutClick,
  onSellerDashboard
}: HeaderProps) {
  return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
          <div className="relative max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
              {/* First: Hamburger Menu (will appear on RIGHT in RTL) */}
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <button
                          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-50 transition-colors"
                          aria-label="منو"
                      >
                          <Menu className="w-5 h-5 text-gray-900" />
                      </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-white" dir="rtl">
                      {isAuthenticated && user ? (
                          <>
                              {/* User Info */}
                              <div className="px-3 py-2 border-b border-gray-200 bg-white">
                                  <p className="text-sm text-gray-500">کاربر</p>
                                  <p className="text-sm font-medium text-gray-900">
                                      {formatPhoneForDisplay(user.phone_number)}
                                  </p>
                              </div>
                              {/* Logout Option */}
                              <DropdownMenuItem
                                  onClick={onLogout}
                                  className="cursor-pointer text-right"
                              >
                                  خروج
                              </DropdownMenuItem>
                          </>
                      ) : (
                          <>
                              {/* Login Option */}
                              <DropdownMenuItem
                                  onClick={onLogin}
                                  className="cursor-pointer text-right"
                              >
                                  ورود / ثبت نام
                              </DropdownMenuItem>
                          </>
                      )}
                      {/* Seller Dashboard Option */}
                      <DropdownMenuItem
                          onClick={onSellerDashboard}
                          className="cursor-pointer text-right"
                      >
                          پنل فروشنده
                      </DropdownMenuItem>
                      {/* About Us Option */}
                      <DropdownMenuItem
                          onClick={onAboutClick}
                          className="cursor-pointer text-right"
                      >
                          درباره ما
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>

              {/* Center: Logo (ABSOLUTELY CENTERED) */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                  <Logo />
              </div>

              {/* Last: Back button or spacer (will appear on LEFT in RTL) */}
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
          </div>
      </header>
  );
}