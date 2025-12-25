/**
 * DiscoveryResults Component
 *
 * Results screen for Discovery Flow.
 * Shows before/after image comparison and product recommendations with match scores.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Download,
  Share2,
  RotateCcw,
  Store,
  Check,
  X,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { useAnimationPreference } from "../hooks/useAnimationPreference";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { MatchHighlightTags } from "./MatchHighlightTags";
import { isMobileDevice } from "../utils/deviceDetection";
import type { DiscoveryResult, ProductRecommendation, GroupedRecommendations } from "../types/discovery";

interface DiscoveryResultsProps {
  result: DiscoveryResult;
  onRetry: () => void;
  onBackToShops: () => void;
  onProductClick: (product: ProductRecommendation) => void;
  onShare: () => void;
  onSave: () => void;
}

export function DiscoveryResults({
  result,
  onRetry,
  onBackToShops,
  onProductClick,
  onShare,
  onSave,
}: DiscoveryResultsProps) {
  const shouldAnimate = useAnimationPreference();
  const [isSaved, setIsSaved] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const isMobile = isMobileDevice();

  const handleSave = () => {
    onSave();
    setIsSaved(true);
  };

  const openFullscreen = () => {
    // Open fullscreen if any image is available
    if (result.processedImageUrl || result.originalImageUrl) {
      setIsFullscreen(true);
    }
  };

  // Determine which image to show (fallback to original if processed not available)
  const displayImage = showOriginal
    ? result.originalImageUrl
    : (result.processedImageUrl || result.originalImageUrl);

  const hasMultipleImages = result.processedImageUrl && result.originalImageUrl;

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeFullscreen();
    }
  };

  const containerVariants = shouldAnimate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: "easeOut" },
      }
    : {};

  // Sort recommendations by match score (highest first)
  const sortedRecommendations = [...result.recommendations].sort(
    (a, b) => b.matchScore - a.matchScore
  );

  return (
    <div className="min-h-screen bg-[#F2F2F7]" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-xl mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToShops}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-gray-700" />
            </button>
            <span className="text-lg font-semibold text-gray-900">
              نتایج AI
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div {...containerVariants} className="max-w-xl mx-auto px-4 py-6 pb-32">
        {/* Title Section */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-[#0088FF]" />
            <h1 className="text-xl font-bold text-gray-900">
              محصولات پیشنهادی AI
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            بر اساس تحلیل فضای اتاق شما
          </p>
        </div>

        {/* Image Section */}
        <div className="bg-white rounded-[20px] p-4 border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900">
              {result.processedImageUrl ? "تصویر پردازش‌شده" : "تصویر اتاق شما"}
            </span>
            {hasMultipleImages && (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-xs text-[#0088FF] font-medium"
              >
                {showOriginal ? "نمایش نتیجه" : "نمایش اصلی"}
              </button>
            )}
          </div>

          {/* Image Container */}
          {displayImage ? (
            <div
              className="relative aspect-[4/3] rounded-[14px] overflow-hidden cursor-pointer"
              onClick={openFullscreen}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openFullscreen();
                }
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={showOriginal ? "original" : "processed"}
                  src={displayImage}
                  alt={showOriginal ? "تصویر اصلی" : "تصویر پردازش‌شده"}
                  className="w-full h-full object-cover"
                  initial={shouldAnimate ? { opacity: 0 } : false}
                  animate={shouldAnimate ? { opacity: 1 } : false}
                  exit={shouldAnimate ? { opacity: 0 } : undefined}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>

              {/* Image Label */}
              {hasMultipleImages && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {showOriginal ? "تصویر اصلی" : "با پیشنهادات AI"}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-[14px] bg-gray-100 flex items-center justify-center">
              <p className="text-gray-500 text-sm">تصویری موجود نیست</p>
            </div>
          )}

          {/* Room Analysis Info */}
          {result.roomAnalysis && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {result.roomAnalysis.detectedRoomType && (
                  <span className="text-xs bg-blue-50 text-[#0088FF] px-3 py-1.5 rounded-full">
                    🏠 {getRoomTypeLabel(result.roomAnalysis.detectedRoomType)}
                  </span>
                )}
                {result.roomAnalysis.detectedStyle && (
                  <span className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-full">
                    🎨 {getStyleLabel(result.roomAnalysis.detectedStyle)}
                  </span>
                )}
                {result.roomAnalysis.suggestedStyles?.slice(0, 2).map((style, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full"
                  >
                    ✨ {getStyleLabel(style)}
                  </span>
                ))}
                {result.roomAnalysis.dominantColors?.slice(0, 3).map((color, i) => (
                  <span
                    key={`color-${i}`}
                    className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full"
                  >
                    🎨 {color}
                  </span>
                ))}
              </div>
              {/* Design Notes */}
              {result.roomAnalysis.designNotes && (
                <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                  {result.roomAnalysis.designNotes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recommendations Section - Grouped by Category */}
        <div className="mb-6">
          {result.groupedRecommendations && result.groupedRecommendations.length > 0 ? (
            // Grouped Display
            result.groupedRecommendations.map((group, groupIndex) => (
              <div key={group.itemType} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900">
                    {group.itemTypeDisplay} ({group.products.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {group.products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                      animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
                      transition={{ delay: (groupIndex * 0.1) + (index * 0.05), duration: 0.3 }}
                    >
                      <ProductRecommendationCard
                        product={product}
                        rank={index + 1}
                        onClick={() => onProductClick(product)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          ) : sortedRecommendations.length > 0 ? (
            // Fallback to flat list
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">
                  محصولات مناسب ({sortedRecommendations.length})
                </h2>
              </div>
              <div className="space-y-3">
                {sortedRecommendations.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                    animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <ProductRecommendationCard
                      product={product}
                      rank={index + 1}
                      onClick={() => onProductClick(product)}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            // No products found
            <div className="bg-white rounded-[14px] p-8 text-center border border-gray-200">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-600 font-medium mb-1">
                محصولی پیدا نشد
              </p>
              <p className="text-gray-500 text-sm">
                با تصویر دیگری امتحان کنید
              </p>
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="space-y-3">
          {/* Save Button */}
          {!isSaved ? (
            <button
              onClick={handleSave}
              className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-[14px] flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              {isMobile ? "ذخیره در گالری" : "ذخیره عکس"}
            </button>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full h-14 bg-green-600 text-white rounded-[14px] flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              ذخیره شد
            </motion.div>
          )}

          {/* Secondary Actions */}
          <div className="flex gap-3">
            <button
              onClick={onShare}
              className="flex-1 h-12 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-[14px] flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              اشتراک‌گذاری
            </button>
            <button
              onClick={onRetry}
              className="flex-1 h-12 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-[14px] flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              امتحان مجدد
            </button>
          </div>

          {/* Back to shops */}
          <button
            onClick={onBackToShops}
            className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Store className="w-4 h-4" />
            بازگشت به فروشگاه‌ها
          </button>
        </div>
      </motion.div>

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
            tabIndex={-1}
          >
            {/* Close Button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-6 left-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Toggle Button - only show if we have both images */}
            {hasMultipleImages && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOriginal(!showOriginal);
                }}
                className="absolute top-6 right-6 z-10 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white text-sm transition-all"
              >
                {showOriginal ? "نمایش نتیجه" : "نمایش اصلی"}
              </button>
            )}

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
                src={displayImage}
                alt={showOriginal ? "تصویر اصلی" : "تصویر پردازش‌شده"}
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>

            {/* Hint Text */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-center text-sm">
              کلیک کنید یا ESC بزنید برای بستن
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Product Recommendation Card Component
interface ProductRecommendationCardProps {
  product: ProductRecommendation;
  rank: number;
  onClick: () => void;
}

function ProductRecommendationCard({
  product,
  rank,
  onClick,
}: ProductRecommendationCardProps) {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        bg-white
        rounded-[14px]
        border border-gray-200
        p-3
        flex items-center gap-3
        hover:border-[#0088FF]/30
        hover:shadow-sm
        transition-all
        text-right
      "
    >
      {/* Rank Badge */}
      <div
        className={`
          w-7 h-7
          rounded-full
          flex items-center justify-center
          text-xs font-bold
          shrink-0
          ${
            rank === 1
              ? "bg-yellow-100 text-yellow-700"
              : rank === 2
              ? "bg-gray-100 text-gray-600"
              : rank === 3
              ? "bg-orange-100 text-orange-700"
              : "bg-gray-50 text-gray-500"
          }
        `}
      >
        {rank}
      </div>

      {/* Product Image */}
      <div className="w-16 h-16 rounded-[10px] overflow-hidden bg-gray-100 shrink-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">
          {product.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{product.shopName}</span>
          {product.categoryDisplay && (
            <>
              <span>•</span>
              <span>{product.categoryDisplay}</span>
            </>
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {formatPrice(product.price, product.currency)}
          </span>
          <MatchScoreBadge score={product.matchScore} />
        </div>

        {/* Persian Reason & Match Highlights (Smart Redesign Flow) */}
        {product.persianReason && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed flex items-start gap-1">
              <span className="shrink-0">💡</span>
              <span>{product.persianReason}</span>
            </p>
            {product.matchHighlights && product.matchHighlights.length > 0 && (
              <MatchHighlightTags highlights={product.matchHighlights} size="sm" />
            )}
          </div>
        )}
      </div>

      {/* Arrow */}
      <ChevronLeft className="w-5 h-5 text-gray-400 shrink-0" />
    </button>
  );
}

// Helper functions
function formatPrice(price?: number, currency?: string): string {
  if (price === undefined || price === null) {
    return "قیمت نامشخص";
  }
  if (currency === "تومان" || currency === "IRR" || currency === "IRT" || !currency) {
    return `${price.toLocaleString("fa-IR")} تومان`;
  }
  return `${price.toLocaleString()} ${currency}`;
}

function getRoomTypeLabel(roomType: string): string {
  const labels: Record<string, string> = {
    living: "اتاق نشیمن",
    living_room: "اتاق نشیمن",
    bedroom: "اتاق خواب",
    dining: "اتاق غذاخوری",
    dining_room: "اتاق غذاخوری",
    office: "دفتر کار",
    kitchen: "آشپزخانه",
    hallway: "راهرو",
    entryway: "ورودی",
    nursery: "اتاق کودک",
    reception: "پذیرایی",
  };
  return labels[roomType] || roomType;
}

function getStyleLabel(style: string): string {
  const labels: Record<string, string> = {
    modern: "مدرن",
    contemporary: "معاصر",
    classic: "کلاسیک",
    minimal: "مینیمال",
    minimalist: "مینیمال",
    boho: "بوهو",
    bohemian: "بوهو",
    scandinavian: "اسکاندیناوی",
    traditional: "سنتی",
    persian: "سنتی ایرانی",
    industrial: "صنعتی",
    rustic: "روستیک",
    vintage: "وینتیج",
    eclectic: "التقاطی",
  };
  return labels[style] || style;
}
