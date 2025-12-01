import { useState, useEffect } from 'react';
import { User, LogOut, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { sellerApiService } from '../../../services/sellerApiService';
import { sellerAuthService } from '../../../services/sellerAuthService';
import { SellerProfileCard } from '../dashboard/components/SellerProfileCard';
import type { Seller } from '../../../integrations/seller-dashboard/types/seller';
import type { ShopSettingsResponse, UpdateSettingsData } from '../../../types/seller-api';

interface SettingsPageProps {
  onLogout: () => void;
}

export function SettingsPage({ onLogout }: SettingsPageProps) {
  const [settings, setSettings] = useState<ShopSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateSettingsData>({});
  const [hasChanges, setHasChanges] = useState(false);

  const apiSeller = sellerAuthService.getShop();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const result = await sellerApiService.getSettings();

      if (result.success && result.data) {
        setSettings(result.data);
        setFormData({
          username: result.data.username,
          shop_name: result.data.shop_name,
          phone_number: result.data.phone_number,
          shop_website_link: result.data.shop_website_link,
        });
      } else {
        toast.error(result.error || 'خطا در دریافت تنظیمات');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateSettingsData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await sellerApiService.updateSettings(formData);

      if (result.success) {
        toast.success('تنظیمات با موفقیت بروزرسانی شد');
        setHasChanges(false);
        // Update the local shop data
        if (apiSeller) {
          sellerAuthService.updateShopData({
            ...apiSeller,
            username: formData.username || apiSeller.username,
            shop_name: formData.shop_name || apiSeller.shop_name,
            phone_number: formData.phone_number || apiSeller.phone_number,
          });
        }
        fetchSettings(); // Refresh data
      } else {
        toast.error(result.error || 'خطا در بروزرسانی تنظیمات');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('خطا در اتصال به سرور');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
      onLogout();
    }
  };

  const seller: Seller | null = apiSeller ? {
    id: apiSeller.id.toString(),
    name: apiSeller.username,
    shopName: apiSeller.shop_name,
    email: apiSeller.phone_number,
    createdAt: apiSeller.created_at,
  } : null;

  if (loading || !settings || !seller) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seller Profile Card */}
      <SellerProfileCard seller={seller} />

      {/* Settings Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold">تنظیمات فروشگاه</h2>
        </div>

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نام کاربری
            </label>
            <input
              type="text"
              value={formData.username || ''}
              onChange={(e) => handleChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EEFF41] focus:border-transparent"
            />
          </div>

          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نام فروشگاه
            </label>
            <input
              type="text"
              value={formData.shop_name || ''}
              onChange={(e) => handleChange('shop_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EEFF41] focus:border-transparent"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              شماره موبایل
            </label>
            <input
              type="text"
              value={formData.phone_number || ''}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EEFF41] focus:border-transparent"
            />
          </div>

          {/* Website Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              لینک وبسایت (اختیاری)
            </label>
            <input
              type="url"
              value={formData.shop_website_link || ''}
              onChange={(e) => handleChange('shop_website_link', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EEFF41] focus:border-transparent"
            />
          </div>

          {/* Shop Link (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              لینک فروشگاه (خواندنی)
            </label>
            <input
              type="text"
              value={settings.shop_link}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              این لینک برای مشتریان شما نمایش داده می‌شود
            </p>
          </div>

          {/* Registration Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">اطلاعات ثبت‌نام</h3>
            <p className="text-sm text-gray-600">
              تاریخ عضویت: {settings.registered_since_display}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>

          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#EEFF41] text-black px-6 py-2 rounded-lg hover:bg-[#D9E838] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  ذخیره تغییرات
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block mb-2 text-[#212121] text-[12px] sm:text-[13px]">لوگوی فروشگاه (اختیاری)</label>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[24px] sm:text-[28px]">
              {seller.logo ? (
                <img
                  src={seller.logo}
                  alt="Logo"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                '🏪'
              )}
            </div>
            <button className="bg-[#f5f5f5] text-[#212121] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all duration-300 hover:bg-[#e6e6e6] text-[13px] sm:text-[14px]">
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>آپلود لوگو</span>
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block mb-1.5 sm:mb-2 text-[#212121] text-left text-[12px] sm:text-[13px]">
            نام شما
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#f5f5f5] border border-[#e6e6e6] rounded-[10px] sm:rounded-[12px] text-[#212121] text-[14px] sm:text-[15px] focus:outline-none focus:border-[#212121] transition-all duration-300"
            placeholder="نام کامل"
          />
        </div>

        {/* Shop Name */}
        <div>
          <label htmlFor="shopName" className="block mb-1.5 sm:mb-2 text-[#212121] text-[12px] sm:text-[13px]">
            نام فروشگاه
          </label>
          <input
            id="shopName"
            type="text"
            value={formData.shopName}
            onChange={(e) => handleChange('shopName', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#f5f5f5] border border-[#e6e6e6] rounded-[10px] sm:rounded-[12px] text-[#212121] text-[14px] sm:text-[15px] focus:outline-none focus:border-[#212121] transition-all duration-300"
            placeholder="نام فروشگاه"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block mb-1.5 sm:mb-2 text-[#212121] text-[12px] sm:text-[13px]">
            ایمیل
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#f5f5f5] border border-[#e6e6e6] rounded-[10px] sm:rounded-[12px] text-[#212121] text-[14px] sm:text-[15px] focus:outline-none focus:border-[#212121] transition-all duration-300"
            placeholder="email@example.com"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-[16px] sm:rounded-[20px] md:rounded-[24px] p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-[#e6e6e6]">
          <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-[#212121]" />
          <h2 className="text-[#1a1a1a] text-[15px] sm:text-[16px]">شبکه‌های اجتماعی</h2>
        </div>

        {/* Instagram */}
        <div>
          <label htmlFor="instagram" className="block mb-1.5 sm:mb-2 text-[#212121] text-[12px] sm:text-[13px]">
            آیدی اینستاگرام
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[#666] text-[14px] sm:text-[15px]">@</span>
            <input
              id="instagram"
              type="text"
              value={formData.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#f5f5f5] border border-[#e6e6e6] rounded-[10px] sm:rounded-[12px] text-[#212121] text-[14px] sm:text-[15px] focus:outline-none focus:border-[#212121] transition-all duration-300"
              placeholder="username"
            />
          </div>
          <p className="text-[#666] mt-1 text-[11px] sm:text-[12px]">
            برای اشتراک لینک Try در استوری و بیو
          </p>
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsapp" className="block mb-1.5 sm:mb-2 text-[#212121] text-[12px] sm:text-[13px]">
            شماره واتساپ (اختیاری)
          </label>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#666]" />
            <input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#f5f5f5] border border-[#e6e6e6] rounded-[10px] sm:rounded-[12px] text-[#212121] text-[14px] sm:text-[15px] focus:outline-none focus:border-[#212121] transition-all duration-300"
              placeholder="09123456789"
            />
          </div>
          <p className="text-[#666] mt-1 text-[11px] sm:text-[12px]">
            برای دریافت سفارشات مستقیم
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 sm:space-y-3">
        {/* Save Button */}
        {hasChanges && (
          <button
            onClick={handleSave}
            className="w-full bg-[#f0f0f0] text-black py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#e0e0e0] text-[14px] sm:text-[15px]"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>ذخیره تغییرات</span>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-[#fee] text-[#E31E24] py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#fdd] transition-all duration-300 text-[14px] sm:text-[15px]"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>خروج از حساب</span>
        </button>
      </div>

      {/* Account Info */}
      <div className="bg-[#f5f5f5] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] p-3 sm:p-4">
        <p className="text-[12px] sm:text-[13px] text-[#666] text-center">
          عضویت از: {seller.createdAt}
        </p>
      </div>
    </div>
  );
}