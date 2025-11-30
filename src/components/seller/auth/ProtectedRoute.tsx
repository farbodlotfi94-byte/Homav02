/**
 * Protected Route Component for Seller Dashboard
 *
 * Redirects to login if seller is not authenticated
 */

import { Navigate, useLocation } from 'react-router-dom';
import { sellerAuthService } from '../../../services/sellerAuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = sellerAuthService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/seller/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
