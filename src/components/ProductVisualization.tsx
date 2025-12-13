import { useState } from "react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { Download, RotateCcw, AlertTriangle, Store, Check, X, Ruler } from "lucide-react";
import { ProductChip } from "./ProductChip";
import { isMobileDevice } from "../utils/deviceDetection";
import type { Product } from "../types/product";
import type { User } from "../types/auth";
import { RUG_CATEGORY_ID } from "../constants/rugSizes";
import roomImage from "figma:asset/2dcfa98ed64c38bd654f16130835649de4da1a8f.png";

interface ProductVisualizationProps {
  product: Product;
  userImage: string;
  apiStatus: 'idle' | 'pending' | 'success' | 'failure';
  errorMessage?: string | null; // Specific error message from backend
  fileName: string;
  placementSuccess: boolean;
  isSaved?: boolean;
  onSave: () => void;
  onShare: () => void;
  onChangeVariant: (type: "color" | "size", value: string) => void;
  onTryAnother: () => void;
  onViewProductDetails: () => void;
  onPurchase: () => void;
  onBackToStore: () => void;
  onBack?: () => void;
  isAuthenticated?: boolean;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onAboutClick?: () => void;
  onSellerDashboard?: () => void;
  onChangeSize?: () => void; // Callback to change rug size (for rug products with multiple sizes)
}

// Helper function to get contextual subtext for errors
const getErrorSubtext = (error?: string | null): string => {
  if (!error) return 'تصویر پردازش‌شده دریافت نشد';

  if (error.includes('اعتبار') && error.includes('پایان')) {
    return '';  // No subtext for shop credit issue
  }
  if (error.includes('محدودیت') || error.includes('مجاز به')) {
    return 'لطفاً کمی صبر کنید و دوباره تلاش کنید';
  }
  if (error.includes('فرمت')) {
    return 'لطفاً تصویر دیگری آپلود کنید';
  }
  return 'لطفاً دوباره تلاش کنید';
};

export function ProductVisualization({
  product,
  userImage,
  apiStatus,
  errorMessage,
  fileName,
  placementSuccess,
  isSaved = false,
  onSave,
  onShare,
  onChangeVariant,
  onTryAnother,
  onViewProductDetails,
  onPurchase,
  onBackToStore,
  onBack,
  isAuthenticated,
  user,
  onLogin,
  onLogout,
  onAboutClick,
  onSellerDashboard,
  onChangeSize
}: ProductVisualizationProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = isMobileDevice();

  const handleSave = () => {
    onSave();
  };

  const openFullscreen = () => {
    // Only allow fullscreen if image is successfully loaded
    if (apiStatus === 'success' && userImage) {
      setIsFullscreen(true);
    }
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-6">
        <div className="max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
          {/* Title - Mobile only */}
          <div className="mb-4 lg:hidden">
            <h2 className="font-bold text-center text-[20px]">تصویر نهایی</h2>
          </div>

          {/* Two-column layout on desktop */}
          <div className="lg:flex lg:gap-8 lg:items-start">
            {/* Image Column - 60% on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-3/5"
            >
              {/* Preview Image */}
              <div className="relative mb-6 lg:mb-0">
            {apiStatus === 'success' && userImage ? (
              // Show processed image on success
              <div
                className="w-full aspect-square rounded-3xl overflow-hidden relative cursor-pointer transition-all duration-300 hover:shadow-lg"
                onClick={openFullscreen}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openFullscreen();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="کلیک کنید برای مشاهده تمام صفحه"
              >
                <img
                  src={userImage}
                  alt="تصویر نهایی اتاق شما"
                  className="absolute inset-0 w-full h-full object-cover"
                  width={400}
                  height={400}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Show error message instead of fallback image
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'absolute inset-0 flex items-center justify-center bg-red-50 text-red-600 p-4 text-center';
                    errorDiv.innerHTML = `
                      <div>
                        <div class="text-2xl mb-2">⚠️</div>
                        <div class="font-medium">خطا در بارگذاری تصویر</div>
                        <div class="text-sm mt-1">لطفاً دوباره تلاش کنید</div>
                      </div>
                    `;
                    target.parentNode?.appendChild(errorDiv);
                  }}
                />
              </div>
            ) : (
              // Show error state on failure or empty
              <div className="w-full aspect-square rounded-3xl overflow-hidden bg-red-50 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="text-4xl mb-4">⚠️</div>
                  <div className="font-medium text-red-900 mb-2">
                    {errorMessage || 'خطا در پردازش تصویر'}
                  </div>
                  {getErrorSubtext(errorMessage) && (
                    <div className="text-sm text-red-700">{getErrorSubtext(errorMessage)}</div>
                  )}
                </div>
              </div>
            )}
              </div>
            </motion.div>

            {/* Actions Column - 40% on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:w-2/5"
            >
              {/* Desktop Title */}
              <div className="mb-4 hidden lg:block">
                <h2 className="font-bold text-[20px]">تصویر نهایی</h2>
              </div>

              {/* Product Info Compact */}
              <div className="pb-4 mt-4 lg:mt-0">
                <ProductChip
                  product={product}
                  onShowDetails={onViewProductDetails}
                  compact
                />
              </div>

              {/* Actions */}
              <div className="pb-6">
            {placementSuccess ? (
              <>
                {/* Save Button - Full Width */}
                {!isSaved ? (
                  <Button
                    onClick={handleSave}
                    className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl flex items-center justify-center gap-2 mb-4"
                  >
                    <Download className="w-5 h-5" />
                    {isMobile ? 'ذخیره در گالری' : 'ذخیره عکس'}
                  </Button>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center gap-2 mb-4"
                  >
                    <Check className="w-5 h-5" />
                    {isMobile ? 'در گالری ذخیره شد' : 'ذخیره شد'}
                  </motion.div>
                )}

                {/* Secondary Actions */}
                <div className="space-y-2">
                  <button
                    onClick={onTryAnother}
                    className="w-full flex items-center justify-center gap-2 py-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    امتحان عکس دیگر
                  </button>

                  {/* Try different size - Only for rug products with multiple available sizes */}
                  {product.category === RUG_CATEGORY_ID &&
                   product.available_sizes &&
                   product.available_sizes.length > 1 &&
                   onChangeSize && (
                    <button
                      onClick={onChangeSize}
                      className="w-full flex items-center justify-center gap-2 py-3 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <Ruler className="w-4 h-4" />
                      امتحان با سایز دیگر
                    </button>
                  )}

                  {/* Show shop button only if product has a link */}
                  {product.link && (
                    <button
                      onClick={onPurchase}
                      className="w-full flex items-center justify-center gap-2 py-3 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <Store className="w-4 h-4" />
                      مشاهده فروشگاه
                    </button>
                  )}

                  <button
                    onClick={onBackToStore}
                    className="w-full flex items-center justify-center gap-2 py-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    بازگشت به پیج فروشگاه
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Failed Placement Actions */}
                <Button
                  onClick={onTryAnother}
                  className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors mb-3"
                >
                  <RotateCcw className="w-5 h-5 ml-2" />
                  عکس بهتری آپلود کنید
                </Button>

                <Button
                  onClick={onSave}
                  variant="outline"
                  className="w-full h-14 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
                >
                  ادامه به هر حال (بتا)
                </Button>

                {/* Improvement Tips */}
                <div className="mt-4 bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                  <p className="text-yellow-900 mb-2">💡 نکات بهبود عکس:</p>
                  <ul className="text-yellow-800 space-y-1 mr-4">
                    <li>• نور کافی داشته باشه</li>
                    <li>• کل اتاق یا دیوار رو نشون بده</li>
                    <li>• عکس واضح و بدون تاری باشه</li>
                  </ul>
                </div>
              </>
            )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeFullscreen}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="نمایش تصویر تمام صفحه"
            tabIndex={-1}
          >
            {/* Close Button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-6 left-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 focus-ring"
              aria-label="بستن نمای تمام صفحه"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Fullscreen Image */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full p-6 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={userImage}
                alt="تصویر نهایی اتاق شما - نمای تمام صفحه"
                className="max-w-full max-h-full object-contain"
                width={800}
                height={800}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // Show error message instead of fallback image
                  target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'flex items-center justify-center bg-red-50 text-red-600 p-8 text-center rounded-lg';
                  errorDiv.innerHTML = `
                    <div>
                      <div class="text-4xl mb-4">⚠️</div>
                      <div class="font-medium text-lg">خطا در بارگذاری تصویر</div>
                      <div class="text-sm mt-2">لطفاً دوباره تلاش کنید</div>
                    </div>
                  `;
                  target.parentNode?.appendChild(errorDiv);
                }}
              />
            </motion.div>

            {/* Hint Text */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-center">
              <p>کلیک کنید یا ESC بزنید برای بستن</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}