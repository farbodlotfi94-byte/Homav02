import { useState } from 'react';
import { User, Instagram, MessageCircle, LogOut, Save, Upload } from 'lucide-react';
import type { Seller } from '../types/seller';
import { toast } from 'sonner';
import { SellerProfileCard } from './SellerProfileCard';

interface SettingsPageProps {
  seller: Seller;
  onUpdate: (data: Partial<Seller>) => void;
  onLogout: () => void;
}

export function SettingsPage({ seller, onUpdate, onLogout }: SettingsPageProps) {
  const [formData, setFormData] = useState({
    name: seller.name,
    shopName: seller.shopName,
    instagram: seller.instagram || '',
    whatsapp: seller.whatsapp || '',
    email: seller.email,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(formData);
    setHasChanges(false);
    toast.success('تغییرات ذخیره شد');
  };

  const handleLogout = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
      onLogout();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-20 md:pb-6">
      {/* Seller Profile Card */}
      <SellerProfileCard seller={seller} />

      {/* Profile Section */}
      <div className="bg-white rounded-[16px] sm:rounded-[20px] md:rounded-[24px] p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-[#e6e6e6]">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#212121]" />
          <h2 className="text-[#1a1a1a] text-[15px] sm:text-[16px]">اطلاعات پروفایل</h2>
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
          عضویت از: {new Date(seller.createdAt).toLocaleDateString('fa-IR')}
        </p>
      </div>
    </div>
  );
}