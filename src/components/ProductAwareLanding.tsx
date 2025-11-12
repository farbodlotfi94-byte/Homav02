import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Info, X, Check } from "lucide-react";
import type { Product } from "../types/product";
import type { User } from "../types/auth";
import { Header } from "./Header";
import { useState, useEffect } from "react";
import svgPaths from "../imports/svg-an2xierte7";
import { useAnimationPreference } from "../hooks/useAnimationPreference";

interface ProductAwareLandingProps {
  product: Product;
  onUploadStart: () => void;
  onShowProductDetails: () => void;
  onShowTerms: () => void;
  isAuthenticated?: boolean;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function ProductAwareLanding({
  product,
  onUploadStart,
  onShowProductDetails,
  isAuthenticated,
  user,
  onLogin,
  onLogout
}: ProductAwareLandingProps) {
  const shouldAnimate = useAnimationPreference();
  const [showSnackbar, setShowSnackbar] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Auto-hide snackbar after 5 seconds
  useEffect(() => {
    if (showSnackbar) {
      const timer = setTimeout(() => {
        setShowSnackbar(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showSnackbar]);
  
  const displayPrice = product.price && product.price > 0
    ? `${product.price.toLocaleString('fa-IR')} ${product.currency || 'ریال'}`
    : product.priceRange
    ? `${product.priceRange.min.toLocaleString('fa-IR')} - ${product.priceRange.max.toLocaleString('fa-IR')} ${product.currency || 'تومان'}`
    : null;

  return (
    <div className="min-h-screen bg-white">
      <Header
        showBackButton={false}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
      />

      {/* Snackbar */}
      <AnimatePresence>
        {showSnackbar && (
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: -20 } : false}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
            exit={shouldAnimate ? { opacity: 0, y: -20 } : false}
            transition={shouldAnimate ? { duration: 0.3 } : undefined}
            className="fixed top-14 left-0 right-0 z-40"
          >
            <div className="max-w-lg mx-auto px-6 pt-4">
              <div className="glass border border-border rounded-[var(--radius-card)] p-4 flex items-start gap-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1a1a1a' }} />
                <p className="flex-1 text-start" style={{ color: '#1a1a1a' }}>
با آپلود عکس فضای خودت، می‌تونی ببینی که این محصول تو خونه‌ات چطور به نظر میاد!
                </p>
                <button
                  onClick={() => setShowSnackbar(false)}
                  className="flex-shrink-0 transition-colors"
                  style={{ color: '#1a1a1a' }}
                  aria-label="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-14 pb-32">
        <div className="max-w-lg mx-auto px-6">
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
            transition={shouldAnimate ? { duration: 0.4 } : undefined}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden mb-6 mt-6">
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
                width={400}
                height={400}
                fetchPriority="high"
              />
            </div>

            {/* Product Info */}
            <div className="mb-8">
              {/* Seller Name - Small and Gray */}
              <p className="text-gray-500 mb-2 text-start" style={{ fontSize: '14px' }}>
                {product.seller.name}
              </p>

              {/* Product Name and Price - Inline */}
              <div className="flex items-baseline gap-4 mb-4">
                {/* Product Name */}
                <h1 className="text-gray-900 text-start" style={{ fontSize: '20px', fontWeight: 700 }}>
                  {product.name}
                </h1>

                {/* Price */}
                {displayPrice && (
                  <p className="text-gray-900 text-start" style={{ fontSize: '18px', fontWeight: 600 }}>{displayPrice}</p>
                )}
              </div>
            </div>

            {/* Product Details Accordion */}
            <div className="mb-6 bg-white rounded-[24px] overflow-hidden">
              {/* Toggle Button */}
              <button
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="w-full bg-gray-100 h-12 rounded-[16px] flex items-center justify-center gap-2 px-4 py-2 transition-colors hover:bg-gray-200"
              >
                <motion.svg
                  animate={shouldAnimate ? { rotate: isDetailsOpen ? 180 : 0 } : false}
                  transition={shouldAnimate ? { duration: 0.3, ease: "easeInOut" } : undefined}
                  className="block size-6 shrink-0"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 24 24"
                >
                  <path d={svgPaths.p2b1b0180} fill="#101828" />
                </motion.svg>
                <span className="text-[#101828] text-[14px] leading-[20px] font-medium whitespace-nowrap" style={{ fontFamily: 'var(--font-family-vazirmatn)' }}>
                  جزئیات محصول
                </span>
              </button>

              {/* Accordion Content */}
              <AnimatePresence>
                {isDetailsOpen && (
                  <motion.div
                    initial={shouldAnimate ? { height: 0, opacity: 0 } : false}
                    animate={shouldAnimate ? { height: "auto", opacity: 1 } : false}
                    exit={shouldAnimate ? { height: 0, opacity: 0 } : false}
                    transition={shouldAnimate ? { duration: 0.3, ease: "easeInOut" } : undefined}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-6 space-y-6" style={{ fontFamily: 'var(--font-family-vazirmatn)' }}>
                      {/* Price */}
                      {displayPrice && (
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                          <p className="text-gray-600 mb-1 text-start" style={{ fontSize: '14px' }}>قیمت</p>
                          <p className="text-gray-900 text-start" style={{ fontSize: '16px', fontWeight: 600 }}>{displayPrice}</p>
                        </div>
                      )}

                      {/* Description */}
                      {product.description && (
                        <div className="space-y-2">
                          <h3 className="text-gray-900 text-start" style={{ fontSize: '16px', fontWeight: 600 }}>
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-start leading-relaxed" style={{ fontSize: '14px' }}>
                            {product.description}
                          </p>
                          {product.brand && (
                            <p className="text-gray-500 text-start" style={{ fontSize: '14px' }}>
                              برند: {product.brand}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Features */}
                      {product.features && product.features.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-gray-900 text-start" style={{ fontSize: '16px', fontWeight: 600 }}>
                            توضیحات
                          </h4>
                          <div className="space-y-2">
                            {product.features.map((feature, index) => (
                              <div key={index} className="flex items-start gap-2 text-start">
                                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                <span className="text-gray-700" style={{ fontSize: '14px' }}>
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Colors */}
                      {product.variants?.colors && product.variants.colors.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-gray-900 text-start" style={{ fontSize: '16px', fontWeight: 600 }}>
                            رنگ‌های موجود
                          </h4>
                          <div className="flex gap-2 flex-wrap">
                            {product.variants.colors.map((color, index) => (
                              <div
                                key={index}
                                className={`px-4 py-2 rounded-full border ${
                                  color.available
                                    ? 'border-gray-300 bg-white'
                                    : 'border-gray-200 bg-gray-50 opacity-50'
                                }`}
                              >
                                <span className="text-gray-700" style={{ fontSize: '14px' }}>
                                  {color.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sizes */}
                      {product.variants?.sizes && product.variants.sizes.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-gray-900 text-start" style={{ fontSize: '16px', fontWeight: 600 }}>
                            سایزهای موجود
                          </h4>
                          <div className="flex gap-2 flex-wrap">
                            {product.variants.sizes.map((size, index) => (
                              <div
                                key={index}
                                className={`px-4 py-2 rounded-full border ${
                                  size.available
                                    ? 'border-gray-300 bg-white'
                                    : 'border-gray-200 bg-gray-50 opacity-50'
                                }`}
                              >
                                <span className="text-gray-700" style={{ fontSize: '14px' }}>
                                  {size.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
        <div className="max-w-lg mx-auto px-6 py-4">
          <Button
            onClick={onUploadStart}
            className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            امتحان کن تو فضای خودت
          </Button>
        </div>
      </div>
    </div>
  );
}