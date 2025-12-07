import { motion, AnimatePresence } from "motion/react";
import { Upload, ChevronDown, Clock } from "lucide-react";
import type { Product } from "../types/product";
import type { User as UserType } from "../types/auth";
import { useState } from "react";
import { useAnimationPreference } from "../hooks/useAnimationPreference";
import { useCountdown } from "../hooks/useCountdown";

interface ProductAwareLandingProps {
  product: Product;
  onUploadStart: () => void;
  onShowProductDetails: () => void;
  onShowTerms: () => void;
  onBack?: () => void;
  isAuthenticated?: boolean;
  user?: UserType | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onAboutClick?: () => void;
  onSellerDashboard?: () => void;
  rateLimitExpiry?: number | null;
  rateLimitMessage?: string;
}

export function ProductAwareLanding({
  product,
  onUploadStart,
  onShowProductDetails,
  onBack,
  isAuthenticated,
  user,
  onLogin,
  onLogout,
  onAboutClick,
  onSellerDashboard,
  rateLimitExpiry,
}: ProductAwareLandingProps) {
  const shouldAnimate = useAnimationPreference();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Rate limit countdown
  const countdown = useCountdown(rateLimitExpiry || null);
  const isRateLimited = rateLimitExpiry && !countdown.isExpired;

  const displayPrice = product.price && product.price > 0
    ? `${product.price.toLocaleString('fa-IR')} ${product.currency || 'تومان'}`
    : product.priceRange
    ? `${product.priceRange.min.toLocaleString('fa-IR')} - ${product.priceRange.max.toLocaleString('fa-IR')} ${product.currency || 'تومان'}`
    : null;

  return (
    <div className="min-h-screen bg-[#F9FAFB]" dir="rtl">
      {/* Main Content - Two Column Split */}
      <main className="min-h-screen">
        <div className="lg:flex lg:min-h-screen">
          {/* Right Column - Product Image (First in RTL) */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : false}
            animate={shouldAnimate ? { opacity: 1, scale: 1 } : false}
            transition={shouldAnimate ? { duration: 0.6, ease: "easeOut" } : undefined}
            className="lg:w-1/2 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-gray-50"
          >
            <div className="relative w-full h-full max-w-2xl flex items-center justify-center">
              {/* Product Image Container - Full height on desktop */}
              <div className="relative w-full h-full max-h-[70vh] lg:max-h-full rounded-2xl lg:rounded-3xl overflow-hidden bg-white shadow-2xl shadow-gray-900/10">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  fetchPriority="high"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.backgroundColor = '#f3f4f6';
                  }}
                />

                {/* Category Badge - Inside image */}
                {product.category_display && (
                  <div className="absolute top-4 right-4 lg:top-6 lg:right-6">
                    <span className="px-3 py-1.5 lg:px-4 lg:py-2 bg-white/95 backdrop-blur-sm rounded-full text-xs lg:text-sm font-medium text-gray-700 shadow-lg">
                      {product.category_display}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Left Column - Product Details (Second in RTL) */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: -20 } : false}
            animate={shouldAnimate ? { opacity: 1, x: 0 } : false}
            transition={shouldAnimate ? { duration: 0.6, delay: 0.2, ease: "easeOut" } : undefined}
            className="lg:w-1/2 flex flex-col justify-center p-6 lg:p-12 xl:p-16"
          >
            {/* Right-aligned content for RTL */}
            <div className="max-w-lg w-full text-right">
              {/* Seller/Brand */}
              <p className="text-gray-500 text-sm lg:text-base mb-2">
                {product.seller.name}
              </p>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Price - Large and Bold */}
              {displayPrice && (
                <div className="mb-6 lg:mb-8">
                  <p className="text-3xl lg:text-4xl font-extrabold text-gray-900">
                    {displayPrice}
                  </p>
                </div>
              )}

              {/* Short Description */}
              {product.description && (
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-6 lg:mb-8 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="space-y-4 mb-8">
                {/* Details Toggle - Clean Text Trigger with Chevron */}
                <button
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  className="w-full py-4 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  <span>مشاهده جزئیات محصول</span>
                  <motion.div
                    animate={{ rotate: isDetailsOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
              </div>

              {/* Expandable Details Section */}
              <AnimatePresence>
                {isDetailsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-200 pt-6 space-y-6">
                      {/* Description */}
                      {product.description && (
                        <div>
                          <h3 className="text-gray-900 font-semibold mb-2">توضیحات</h3>
                          <p className="text-gray-600 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      )}

                      {/* Extra Details */}
                      {product.extra_details && Object.keys(product.extra_details).length > 0 && (
                        <div>
                          <h3 className="text-gray-900 font-semibold mb-3">مشخصات</h3>
                          <div className="space-y-2">
                            {Object.entries(product.extra_details).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500">{key}</span>
                                <span className="text-gray-900 font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Colors */}
                      {product.variants?.colors && product.variants.colors.length > 0 && (
                        <div>
                          <h3 className="text-gray-900 font-semibold mb-3">رنگ‌های موجود</h3>
                          <div className="flex flex-wrap gap-2 justify-end">
                            {product.variants.colors.map((color, index) => (
                              <span
                                key={index}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                  color.available
                                    ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer'
                                    : 'bg-gray-50 text-gray-400 line-through'
                                }`}
                              >
                                {color.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sizes */}
                      {product.variants?.sizes && product.variants.sizes.length > 0 && (
                        <div>
                          <h3 className="text-gray-900 font-semibold mb-3">سایزهای موجود</h3>
                          <div className="flex flex-wrap gap-2 justify-end">
                            {product.variants.sizes.map((size, index) => (
                              <span
                                key={index}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                  size.available
                                    ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer'
                                    : 'bg-gray-50 text-gray-400 line-through'
                                }`}
                              >
                                {size.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trust Badges - Right aligned */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-end gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>ضمانت اصالت</span>
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>ارسال سریع</span>
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Sticky CTA - Solid Dark Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
        <button
          onClick={onUploadStart}
          disabled={!!isRateLimited}
          className="w-full h-14 bg-gray-900 hover:bg-gray-800 active:bg-black text-white rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 text-base font-bold shadow-xl shadow-gray-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRateLimited ? (
            <>
              <Clock className="w-5 h-5" />
              تلاش مجدد در {countdown.formattedTime}
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              امتحان کن تو فضای خودت
            </>
          )}
        </button>
      </div>
    </div>
  );
}
