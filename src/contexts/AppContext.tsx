/**
 * AppContext - Combined context for auth state and navigation handlers
 *
 * This context eliminates prop drilling by providing:
 * - Auth state: user, isAuthenticated
 * - Auth actions: onLogin, onLogout
 * - Navigation actions: onAboutClick, onSellerDashboard
 *
 * Usage:
 * 1. Wrap your app with AppProvider (passing handlers from App.tsx)
 * 2. Use useApp() hook in components instead of prop drilling
 *
 * Components can optionally still accept props for backward compatibility
 * during the migration period.
 */

import { createContext, useContext, type ReactNode } from 'react';
import type { User } from '../types/auth';

export interface AppContextType {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;

  // Auth actions
  onLogin: () => void;
  onLogout: (redirectToAuth?: boolean) => void | Promise<void>;

  // Navigation actions
  onAboutClick: () => void;
  onSellerDashboard: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
  value: AppContextType;
}

export function AppProvider({ children, value }: AppProviderProps) {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to access app context (auth + navigation)
 * Throws if used outside AppProvider
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

/**
 * Optional hook that returns null if not in AppProvider
 * Useful for components that can work with or without context
 */
export function useAppOptional(): AppContextType | null {
  return useContext(AppContext);
}

/**
 * Hook to get only auth-related values from context
 */
export function useAppAuth() {
  const context = useApp();
  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    onLogin: context.onLogin,
    onLogout: context.onLogout,
  };
}

/**
 * Hook to get only navigation-related values from context
 */
export function useAppNavigation() {
  const context = useApp();
  return {
    onAboutClick: context.onAboutClick,
    onSellerDashboard: context.onSellerDashboard,
  };
}
