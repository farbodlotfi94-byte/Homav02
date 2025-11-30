import { useState } from 'react';
import { Search } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardStats } from '../types/seller';
import type { Seller } from '../types/seller';
import { SellerProfileCard } from './SellerProfileCard';

interface SellerDashboardProps {
  stats: DashboardStats;
  seller: Seller;
  onAddProduct: () => void;
}

// Mock data for 7 days chart
const last7DaysData = [
  { day: 'شنبه', visits: 245 },
  { day: 'یکشنبه', visits: 312 },
  { day: 'دوشنبه', visits: 189 },
  { day: 'سه‌شنبه', visits: 421 },
  { day: 'چهارشنبه', visits: 298 },
  { day: 'پنجشنبه', visits: 367 },
  { day: 'جمعه', visits: 312 },
];

// Mock product views data
const productViewsData = [
  { id: 1, name: 'مبل راحتی مدرن', viewsToday: 78, viewsTotal: 2140 },
  { id: 2, name: 'فرش دستباف کاشان', viewsToday: 54, viewsTotal: 1203 },
  { id: 3, name: 'میز عسلی چوبی', viewsToday: 21, viewsTotal: 480 },
  { id: 4, name: 'صندلی ناهارخوری', viewsToday: 10, viewsTotal: 250 },
];

export function SellerDashboard({ stats, seller, onAddProduct }: SellerDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState<'all' | 'high' | 'low'>('all');

  // Get current date and time in Persian
  const getCurrentDateTime = () => {
    const now = new Date();
    const persianDate = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    const time = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);
    return `${persianDate} - ${time}`;
  };

  // Filter products based on search and filter option
  const filteredProducts = productViewsData
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (filterOption === 'high') return b.viewsTotal - a.viewsTotal;
      if (filterOption === 'low') return a.viewsTotal - b.viewsTotal;
      return 0;
    });

  return (
    <div 
      className="space-y-5 pb-20 md:pb-6"
      style={{ minHeight: '100vh' }}
    >
      {/* Seller Profile Card */}
      <SellerProfileCard seller={seller} />

      {/* Header with Sparkle */}
      <div className="text-right relative">
        {/* Decorative Sparkle */}
        <div className="absolute -top-2 left-0 hidden sm:block">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 0L11.5 8.5L20 10L11.5 11.5L10 20L8.5 11.5L0 10L8.5 8.5L10 0Z" fill="var(--old-flax)"/>
          </svg>
        </div>

        <h1 
          className="text-white mb-2"
          style={{
            fontSize: '24px',
            fontWeight: 'var(--font-weight-bold)',
            lineHeight: '1.3'
          }}
        >
          داشبورد آمار بازدید
        </h1>
        <p 
          className="text-white/60"
          style={{ 
            fontSize: '14px',
            fontWeight: 'var(--font-weight-normal)'
          }}
        >
          آخرین به‌روزرسانی: {getCurrentDateTime()}
        </p>
      </div>

      {/* Site Visits Card */}
      <div 
        className="rounded-[24px] p-5 space-y-4"
        style={{
          background: 'var(--jet-black)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <h2 
          className="text-white text-right"
          style={{
            fontSize: '16px',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          بازدید کل سایت
        </h2>
        
        {/* Totals - Mobile: One compact row | Desktop: 3 cards */}
        <div className="md:hidden">
          {/* Mobile: Compact stats bar */}
          <div 
            className="rounded-[16px] p-4 flex items-center justify-between text-center"
            style={{ background: 'rgba(0, 0, 0, 0.2)' }}
          >
            <div className="flex-1">
              <p 
                className="text-white/50 mb-1"
                style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
              >
                امروز
              </p>
              <p 
                className="text-white"
                style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)' }}
              >
                {(312).toLocaleString('fa-IR')}
              </p>
            </div>
            <div 
              className="w-px h-10"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            />
            <div className="flex-1">
              <p 
                className="text-white/50 mb-1"
                style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
              >
                این هفته
              </p>
              <p 
                className="text-white"
                style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)' }}
              >
                {(1845).toLocaleString('fa-IR')}
              </p>
            </div>
            <div 
              className="w-px h-10"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            />
            <div className="flex-1">
              <p 
                className="text-white/50 mb-1"
                style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
              >
                این ماه
              </p>
              <p 
                className="text-white"
                style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)' }}
              >
                {(7910).toLocaleString('fa-IR')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Desktop: Original 3 cards */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          <div 
            className="rounded-[20px] p-5 text-center"
            style={{ background: 'rgba(0, 0, 0, 0.2)' }}
          >
            <p 
              className="text-white/50 mb-2"
              style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}
            >
              امروز
            </p>
            <p 
              className="text-white"
              style={{ fontSize: '32px', fontWeight: 'var(--font-weight-bold)' }}
            >
              {(312).toLocaleString('fa-IR')}
            </p>
          </div>
          <div 
            className="rounded-[20px] p-5 text-center"
            style={{ background: 'rgba(0, 0, 0, 0.2)' }}
          >
            <p 
              className="text-white/50 mb-2"
              style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}
            >
              این هفته
            </p>
            <p 
              className="text-white"
              style={{ fontSize: '32px', fontWeight: 'var(--font-weight-bold)' }}
            >
              {(1845).toLocaleString('fa-IR')}
            </p>
          </div>
          <div 
            className="rounded-[20px] p-5 text-center"
            style={{ background: 'rgba(0, 0, 0, 0.2)' }}
          >
            <p 
              className="text-white/50 mb-2"
              style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}
            >
              این ماه
            </p>
            <p 
              className="text-white"
              style={{ fontSize: '32px', fontWeight: 'var(--font-weight-bold)' }}
            >
              {(7910).toLocaleString('fa-IR')}
            </p>
          </div>
        </div>

        {/* Chart - iOS Sparkline Style */}
        <div className="pt-2">
          <h3 
            className="text-white mb-3 text-right"
            style={{
              fontSize: '14px',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            بازدید ۷ روز اخیر
          </h3>
          <ResponsiveContainer width="100%" height={135} className="md:!h-[180px]">
            <LineChart data={last7DaysData}>
              <XAxis 
                dataKey="day" 
                stroke="rgba(255, 255, 255, 0.3)"
                style={{ fontSize: '11px' }}
                tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  direction: 'rtl',
                  fontSize: '12px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
                labelStyle={{ 
                  color: '#FFFFFF', 
                  fontWeight: 'var(--font-weight-bold)' 
                }}
                itemStyle={{ color: 'var(--old-flax)' }}
              />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#FFFFFF" 
                strokeWidth={2.5}
                dot={{ fill: '#FFFFFF', r: 4 }}
                activeDot={{ r: 6, fill: 'var(--old-flax)', stroke: '#000000', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Token Usage Card */}
      <div 
        className="rounded-[24px] p-5 space-y-4"
        style={{
          background: 'var(--jet-black)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <h2 
          className="text-white text-right"
          style={{
            fontSize: '16px',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          مصرف توکن
        </h2>
        
        <div className="space-y-4">
          {/* Token Stats - Mobile: One row | Desktop: 2 cards */}
          <div className="md:hidden">
            {/* Mobile: Compact unified stats */}
            <div 
              className="rounded-[16px] p-4"
              style={{ background: 'rgba(0, 0, 0, 0.2)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-right">
                  <p 
                    className="text-white/50 mb-1"
                    style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    مصرف شده
                  </p>
                  <p 
                    className="text-white"
                    style={{ 
                      fontSize: '20px',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    {(7450).toLocaleString('fa-IR')}
                  </p>
                </div>
                <div className="text-left">
                  <p 
                    className="text-white/50 mb-1"
                    style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    باقی‌مانده
                  </p>
                  <p 
                    className="text-white"
                    style={{ 
                      fontSize: '20px',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    {(2550).toLocaleString('fa-IR')}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div 
                  className="w-full rounded-full h-2 overflow-hidden"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: '75%', background: 'var(--old-flax)' }}
                  />
                </div>
                <div 
                  className="flex items-center justify-between text-white/60"
                  style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
                >
                  <span>۷۵٪ مصرف شده</span>
                  <span>از ۱۰,۰۰۰ توکن</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Desktop: Original 2 cards + progress */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div 
                className="rounded-[20px] p-5"
                style={{ background: 'rgba(0, 0, 0, 0.2)' }}
              >
                <p 
                  className="text-white/50 mb-2 text-right"
                  style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}
                >
                  توکن مصرف شده
                </p>
                <p 
                  className="text-white text-right"
                  style={{ fontSize: '24px', fontWeight: 'var(--font-weight-bold)' }}
                >
                  {(7450).toLocaleString('fa-IR')}
                </p>
              </div>
              <div 
                className="rounded-[20px] p-5"
                style={{ background: 'rgba(0, 0, 0, 0.2)' }}
              >
                <p 
                  className="text-white/50 mb-2 text-right"
                  style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}
                >
                  توکن باقی‌مانده
                </p>
                <p 
                  className="text-white text-right"
                  style={{ fontSize: '24px', fontWeight: 'var(--font-weight-bold)' }}
                >
                  {(2550).toLocaleString('fa-IR')}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div 
                className="flex items-center justify-between text-white/60"
                style={{ fontSize: '13px', fontWeight: 'var(--font-weight-medium)' }}
              >
                <span>۷۵٪ مصرف شده</span>
                <span>از ۱۰,۰۰۰ توکن</span>
              </div>
              <div 
                className="w-full rounded-full h-3 overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: '75%', background: 'var(--old-flax)' }}
                />
              </div>
            </div>
          </div>

          {/* Warning - Minimal Dark Yellow */}
          <div 
            className="rounded-[16px] p-4 text-right"
            style={{
              backgroundColor: 'rgba(238, 255, 65, 0.1)',
              border: '1px solid rgba(238, 255, 65, 0.2)'
            }}
          >
            <p 
              style={{ 
                fontSize: '13px',
                color: 'var(--old-flax)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              💡 توکن‌های شما در حال اتمام است. برای ادامه استفاده، اشتراک خود را تمدید کنید.
            </p>
          </div>
        </div>
      </div>

      {/* Product Views Section */}
      <div 
        className="rounded-[24px] p-5 space-y-4"
        style={{
          background: 'var(--jet-black)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Section Header with Controls */}
        <div className="flex flex-col gap-4">
          <h2 
            className="text-white text-right"
            style={{
              fontSize: '16px',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            بازدید محصولات
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'rgba(255, 255, 255, 0.3)' }}
              />
              <input
                type="text"
                placeholder="جستجوی محصول..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border transition-all duration-200"
                dir="rtl"
                style={{ 
                  height: '46px',
                  borderRadius: '16px',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-normal)',
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  outline: 'none',
                  paddingRight: '40px',
                  paddingLeft: '16px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--old-flax)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                }}
              />
            </div>

            {/* Filter */}
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value as 'all' | 'high' | 'low')}
              className="border transition-all duration-200"
              style={{ 
                height: '46px',
                borderRadius: '16px',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-normal)',
                color: '#FFFFFF',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                outline: 'none',
                paddingLeft: '16px',
                paddingRight: '16px',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--old-flax)';
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
              }}
            >
              <option value="all">همه محصولات</option>
              <option value="high">پربازدیدترین</option>
              <option value="low">کم‌بازدیدترین</option>
            </select>
          </div>
        </div>

        {/* Product Views - Table */}
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full">
            <thead>
              <tr 
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
                }}
              >
                <th 
                  className="text-right py-3 px-2 text-white/50"
                  style={{ 
                    fontSize: '13px',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  محصول
                </th>
                <th 
                  className="text-center py-3 px-2 text-white/50"
                  style={{ 
                    fontSize: '13px',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  امروز
                </th>
                <th 
                  className="text-center py-3 px-2 text-white/50"
                  style={{ 
                    fontSize: '13px',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  کل
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    className="transition-colors duration-200"
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td 
                      className="py-3 px-2 text-white text-right"
                      style={{ 
                        fontSize: '14px',
                        fontWeight: 'var(--font-weight-normal)'
                      }}
                    >
                      {product.name}
                    </td>
                    <td 
                      className="py-3 px-2 text-white text-center"
                      style={{ 
                        fontSize: '14px',
                        fontWeight: 'var(--font-weight-medium)'
                      }}
                    >
                      {product.viewsToday.toLocaleString('fa-IR')}
                    </td>
                    <td 
                      className="py-3 px-2 text-white text-center"
                      style={{ 
                        fontSize: '14px',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      {product.viewsTotal.toLocaleString('fa-IR')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={3} 
                    className="py-10 text-center text-white/60"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 'var(--font-weight-normal)'
                    }}
                  >
                    محصولی یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}