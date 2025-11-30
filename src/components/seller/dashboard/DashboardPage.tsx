/**
 * Dashboard Page Component
 *
 * Fetches dashboard data from API and renders the dashboard overview
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardOverview } from './DashboardOverview';
import { sellerApiService } from '../../../services/sellerApiService';
import { sellerAuthService } from '../../../services/sellerAuthService';
import type { DashboardResponse } from '../../../types/seller-api';
import type { DashboardStats, Seller } from '../../../integrations/seller-dashboard/types/seller';

export function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiShop = sellerAuthService.getShop();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Transform API shop data to component's expected format
  const seller: Seller | null = apiShop ? {
    id: apiShop.id.toString(),
    name: apiShop.username,
    shopName: apiShop.shop_name,
    email: apiShop.phone_number, // Using phone as email for now
    createdAt: apiShop.created_at,
  } : null;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await sellerApiService.getDashboardStats();

      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        setError(result.error || 'خطا در دریافت اطلاعات داشبورد');
        toast.error(result.error || 'خطا در دریافت اطلاعات داشبورد');
      }
    } catch (err) {
      console.error('[DashboardPage] Error fetching dashboard data:', err);
      setError('خطا در اتصال به سرور');
      toast.error('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    navigate('/seller/products/new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EEFF41] mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData || !seller) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">خطا در بارگذاری داشبورد</h3>
          <p className="text-gray-600 mb-4">{error || 'داده‌های داشبورد در دسترس نیست'}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-[#EEFF41] text-black px-4 py-2 rounded-lg hover:bg-[#D9E838] transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // Transform API data to match component expectations
  const stats: DashboardStats & {
    visits: typeof dashboardData.visits;
    credits: typeof dashboardData.credits;
    last7Days: typeof dashboardData.last_7_days;
  } = {
    totalProducts: 0, // We'll need to fetch this from products API
    totalViews: dashboardData.visits.this_month, // بازدید کل سایت
    totalUploads: dashboardData.credits.total_used, // مصرف توکن (total credits used)
    totalPurchases: 0, // This will need to be fetched separately
    avgCTR: 0, // This will need to be calculated
    recentActivity: [], // This will need to be fetched separately
    // Add all the raw API data for component access
    visits: dashboardData.visits,
    credits: dashboardData.credits,
    last7Days: dashboardData.last_7_days,
  };

  return (
    <DashboardOverview
      key={JSON.stringify(stats)} // Force re-render when data changes
      stats={stats}
      seller={seller}
      onAddProduct={handleAddProduct}
    />
  );
}
