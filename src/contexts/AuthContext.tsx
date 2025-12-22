import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthData } from '../types/auth';
import { userAuthService } from '../services/userAuthService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (authData: AuthData) => void;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  onOpenLoginModal?: () => void;
  onLogoutComplete?: (redirectToAuth: boolean) => void;
}

export function AuthProvider({
  children,
  onOpenLoginModal,
  onLogoutComplete
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize: Load auth state from storage
  useEffect(() => {
    const isAuth = userAuthService.isAuthenticated();
    setIsAuthenticated(isAuth);

    if (isAuth) {
      const userData = userAuthService.getUser();
      setUser(userData);
      console.log('[AuthContext] Auth initialized:', { isAuthenticated: isAuth, user: userData?.phone_number });
    } else {
      console.log('[AuthContext] Auth initialized: Not authenticated');
    }
  }, []);

  const login = useCallback((authData: AuthData) => {
    setUser(authData.user);
    setIsAuthenticated(true);
    console.log('[AuthContext] User logged in:', authData.user.phone_number);
  }, []);

  const logout = useCallback(async () => {
    await userAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    console.log('[AuthContext] User logged out');
    onLogoutComplete?.(false);
  }, [onLogoutComplete]);

  const openLoginModal = useCallback(() => {
    console.log('[AuthContext] Opening login modal');
    onOpenLoginModal?.();
  }, [onOpenLoginModal]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        openLoginModal,
        setUser,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Optional hook that returns null if not in AuthProvider (for optional usage)
export function useAuthOptional() {
  return useContext(AuthContext);
}
