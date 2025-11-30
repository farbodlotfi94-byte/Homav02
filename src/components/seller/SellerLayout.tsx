/**
 * Seller Layout Component
 *
 * Main layout for seller dashboard with new UI components
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { shopAuthService } from '../../services/shopAuthService';
import { LogOut } from 'lucide-react';
import { HomaHeader } from './common/HomaHeader';
import { SellerNavigation } from './SellerNavigation';

export function SellerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const shop = shopAuthService.getShop();

  const handleLogout = async () => {
    await shopAuthService.logout();
    navigate('/seller/login');
  };

  // Get current page from pathname
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/products')) return 'products';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  return (
    <div className="min-h-screen bg-[#FAFAFA]" dir="rtl" data-seller-theme="true">
      {/* Header */}
      <HomaHeader />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#FAFAFA] border-l border-black/6 min-h-[calc(100vh-3.5rem)] p-5">
          {/* Profile Card */}
          <div className="mb-8 text-right">
            <div className="w-16 h-16 rounded-[20px] bg-white border border-black/6 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3zM7 7h10M7 12h10M7 17h7"/>
              </svg>
            </div>
            <h2
              className="mb-1 text-black"
              style={{
                fontSize: '16px',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              {shop?.shop_name || 'فروشگاه'}
            </h2>
            <p
              className="text-black/60"
              style={{
                fontSize: '14px',
                fontWeight: 'var(--font-weight-normal)'
              }}
            >
              {shop?.username || 'فروشنده'}
            </p>
          </div>

          {/* Navigation */}
          <SellerNavigation currentPage={currentPage} onNavigate={(page) => navigate(`/seller/${page}`)} />

          {/* Logout Button */}
          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-[16px] text-sm font-medium transition-all duration-300 text-[#E31E24] border border-transparent hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>خروج</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-5 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
