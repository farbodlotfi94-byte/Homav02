import { useState } from 'react';
import { User, LogOut, Save, Link as LinkIcon, Phone } from 'lucide-react';
import type { Seller } from '../types/seller';
import { toast } from 'sonner';
import { formatPhoneForDisplay, validateAndNormalizeUrl } from '../../../utils/phoneValidator';

interface SettingsPageProps {
  seller: Seller;
  onUpdate: (data: Partial<Seller>) => void;
  onLogout: () => void;
}

export function SettingsPage({ seller, onUpdate, onLogout }: SettingsPageProps) {
  const [formData, setFormData] = useState({
    name: seller.name,
    shopName: seller.shopName,
    shopWebsiteLink: seller.shopWebsiteLink || '',
  });

  const [urlError, setUrlError] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);

    // Real-time URL validation
    if (field === 'shopWebsiteLink') {
      const validation = validateAndNormalizeUrl(value);
      setUrlError(validation.error || '');
    }
  };

  const handleSave = () => {
    // Validate URL before saving
    const urlValidation = validateAndNormalizeUrl(formData.shopWebsiteLink);
    if (!urlValidation.isValid) {
      toast.error(urlValidation.error || 'آدرس وب‌سایت معتبر نیست');
      return;
    }

    // Send normalized URL to parent
    onUpdate({
      name: formData.name,
      shopName: formData.shopName,
      shopWebsiteLink: urlValidation.normalized,
    });

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
      {/* Profile Section */}
      <div className="bg-white rounded-[16px] sm:rounded-[20px] md:rounded-[24px] p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-[#e6e6e6]">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#212121]" />
          <h2 className="text-[#1a1a1a] text-[15px] sm:text-[16px]">اطلاعات پروفایل</h2>
        </div>

        {/* Name (Username) */}
        <div>
          <label htmlFor="name" className="block mb-1.5 sm:mb-2 text-[#212121] text-[12px] sm:text-[13px]">
            نام کاربری
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#f5f5f5] border border-[#e6e6e6] rounded-[10px] sm:rounded-[12px] text-[#212121] text-[14px] sm:text-[15px] focus:outline-none focus:border-[#212121] transition-all duration-300"
            placeholder="نام کاربری"
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

        {/* Phone Number (Read-Only) */}
        <div>
          <label htmlFor="phoneNumber" className="block mb-1.5 sm:mb-2 text-[#212121] text-[12px] sm:text-[13px]">
            شماره موبایل
          </label>
          <div className="relative">
            <input
              id="phoneNumber"
              type="text"
              value={formatPhoneForDisplay(seller.phoneNumber)}
              readOnly
              disabled
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 bg-[#fafafa] border border-[#e6e6e6] rounded-[10px] sm:rounded-[12px] text-[#666] text-[14px] sm:text-[15px] cursor-not-allowed"
            />
          </div>
          <p className="text-[#999] mt-1 text-[11px] sm:text-[12px]">
            شماره موبایل قابل تغییر نیست
          </p>
        </div>
      </div>

      {/* Shop Links Section */}
      <div className="bg-white rounded-[16px] sm:rounded-[20px] md:rounded-[24px] p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-[#e6e6e6]">
          <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#212121]" />
          <h2 className="text-[#1a1a1a] text-[15px] sm:text-[16px]">لینک فروشگاه</h2>
        </div>

        {/* Shop Website Link (Editable) */}
        <div>
          <label htmlFor="shopWebsiteLink" className="block mb-1.5 sm:mb-2 text-[#212121] text-[12px] sm:text-[13px]">
            آدرس وب‌سایت فروشگاه
          </label>
          <input
            id="shopWebsiteLink"
            type="url"
            value={formData.shopWebsiteLink}
            onChange={(e) => handleChange('shopWebsiteLink', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#f5f5f5] border rounded-[10px] sm:rounded-[12px] text-[#212121] text-[14px] sm:text-[15px] focus:outline-none transition-all duration-300 ${
              urlError
                ? 'border-[#E31E24] focus:border-[#E31E24]'
                : 'border-[#e6e6e6] focus:border-[#212121]'
            }`}
            placeholder="https://example.com"
            dir="ltr"
          />
          {urlError && (
            <p className="text-[#E31E24] mt-1 text-[11px] sm:text-[12px]">
              {urlError}
            </p>
          )}
          <p className="text-[#666] mt-1 text-[11px] sm:text-[12px]">
            آدرس وب‌سایت شخصی فروشگاه شما (اختیاری)
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 sm:space-y-3">
        {/* Save Button */}
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={!!urlError}
            className={`w-full py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 transition-all duration-300 text-[14px] sm:text-[15px] ${
              urlError
                ? 'bg-[#f5f5f5] text-[#999] cursor-not-allowed'
                : 'bg-[#f0f0f0] text-black hover:bg-[#e0e0e0]'
            }`}
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