/**
 * Product Analytics Component
 *
 * Shows product performance analytics
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Eye, ImageIcon, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { sellerApiService } from '../../../services/sellerApiService';
import type { ProductAnalyticsItem } from '../../../types/seller-api';

export function ProductAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<ProductAnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const result = await sellerApiService.getProductAnalytics({ period, ordering: '-ai_total' });

      if (result.success && result.data) {
        setAnalytics(result.data.results);
      } else {
        toast.error(result.error || 'خطا در دریافت آمار محصولات');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const totalViews = analytics.reduce((sum, item) => sum + item.views.total, 0);
  const totalAiGenerations = analytics.reduce((sum, item) => sum + item.ai_generations.total, 0);
  const avgEngagement = analytics.length > 0
    ? analytics.reduce((sum, item) => sum + item.engagement_rate, 0) / analytics.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/seller/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowRight className="w-5 h-5" />
            بازگشت به محصولات
          </button>
          <h1 className="text-2xl font-bold">آمار محصولات</h1>
        </div>

        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as typeof period)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EEFF41] focus:border-transparent"
        >
          <option value="today">امروز</option>
          <option value="week">هفته گذشته</option>
          <option value="month">ماه گذشته</option>
          <option value="all">همه زمان‌ها</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">کل بازدیدها</p>
              <p className="text-2xl font-bold">{totalViews.toLocaleString('fa-IR')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">تصاویر تولید شده</p>
              <p className="text-2xl font-bold">{totalAiGenerations.toLocaleString('fa-IR')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">میانگین مشارکت</p>
              <p className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">آمار محصولات</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EEFF41]"></div>
          </div>
        ) : analytics.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">آماری برای نمایش وجود ندارد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    محصول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    بازدید امروز
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    بازدید کل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تصاویر تولید شده
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نرخ مشارکت
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.category_display}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.views.today.toLocaleString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.views.total.toLocaleString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.ai_generations.total.toLocaleString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.engagement_rate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
