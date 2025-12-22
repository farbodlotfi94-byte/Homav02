import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationContextType {
  navigateToAbout: () => void;
  navigateToSeller: () => void;
  navigateToHome: () => void;
  navigateToShop: (shopName: string) => void;
  navigateToProduct: (shopName: string, uniqueLink: string) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const navigate = useNavigate();

  const navigateToAbout = useCallback(() => {
    console.log('[NavigationContext] Navigating to /about-us');
    navigate('/about-us');
  }, [navigate]);

  const navigateToSeller = useCallback(() => {
    console.log('[NavigationContext] Navigating to /seller');
    navigate('/seller');
  }, [navigate]);

  const navigateToHome = useCallback(() => {
    console.log('[NavigationContext] Navigating to /');
    navigate('/');
  }, [navigate]);

  const navigateToShop = useCallback((shopName: string) => {
    console.log('[NavigationContext] Navigating to shop:', shopName);
    navigate(`/${shopName}`);
  }, [navigate]);

  const navigateToProduct = useCallback((shopName: string, uniqueLink: string) => {
    console.log('[NavigationContext] Navigating to product:', { shopName, uniqueLink });
    navigate(`/${shopName}/product/${uniqueLink}`);
  }, [navigate]);

  const goBack = useCallback(() => {
    console.log('[NavigationContext] Going back');
    navigate(-1);
  }, [navigate]);

  return (
    <NavigationContext.Provider
      value={{
        navigateToAbout,
        navigateToSeller,
        navigateToHome,
        navigateToShop,
        navigateToProduct,
        goBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

// Optional hook that returns null if not in NavigationProvider
export function useNavigationOptional() {
  return useContext(NavigationContext);
}
