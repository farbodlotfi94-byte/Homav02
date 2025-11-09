/**
 * Auth Status Badge Component
 * Simple indicator showing user is logged in with logout button
 * Minimal UI as per requirements (no profile section)
 */

import { formatPhoneForDisplay } from '../utils/phoneValidator';
import type { User } from '../types/auth';

interface AuthStatusBadgeProps {
  user: User;
  onLogout: () => void;
}

export function AuthStatusBadge({ user, onLogout }: AuthStatusBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      {/* User indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold">
          {user.name ? user.name.charAt(0) : '👤'}
        </div>
        <span className="hidden sm:inline">
          {formatPhoneForDisplay(user.phone_number)}
        </span>
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        خروج
      </button>
    </div>
  );
}
