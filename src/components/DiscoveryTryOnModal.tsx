import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { X, Download, Share2, RotateCcw, Check, Loader2 } from "lucide-react";
import type { ProductRecommendation, DiscoveryTryOnState } from "../types/discovery";
import { getSizeDisplay } from "../constants/rugSizes";

interface DiscoveryTryOnModalProps {
  isOpen: boolean;
  product: ProductRecommendation | null;
  selectedSize: string | null;
  status: DiscoveryTryOnState['status'];
  resultImageUrl: string | null;
  errorMessage: string | null;
  onSizeSelect: (size: string) => void;
  onConfirmSize: () => void;
  onClose: () => void;
  onRetry: () => void;
  onSave: () => void;
  onShare: () => void;
}

export function DiscoveryTryOnModal({
  isOpen,
  product,
  selectedSize,
  status,
  resultImageUrl,
  errorMessage,
  onSizeSelect,
  onConfirmSize,
  onClose,
  onRetry,
  onSave,
  onShare,
}: DiscoveryTryOnModalProps) {
  if (!product) return null;

  const sizes = product.available_sizes || [];
  const sizeDisplays = product.available_sizes_display || [];

  // Get display label for a size (use display array if available, otherwise use rugSizes utility)
  const getSizeLabel = (sizeCode: string, index: number): string => {
    if (sizeDisplays[index]) {
      return sizeDisplays[index];
    }
    return getSizeDisplay(sizeCode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border-gray-200 p-0">
        {/* Header with close button */}
        <DialogHeader className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-gray-900 text-lg">
                {status === 'selecting-size' && 'انتخاب سایز'}
                {status === 'generating' && 'در حال ایجاد تصویر...'}
                {status === 'completed' && 'نتیجه امتحان محصول'}
                {status === 'error' && 'خطا در پردازش'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm mt-1">
                {product.name}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="بستن"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          {/* Size Selection State */}
          {status === 'selecting-size' && (
            <div className="space-y-6">
              {/* Product thumbnail */}
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Size grid */}
              <div>
                <h3 className="text-gray-700 text-sm mb-3">سایز مورد نظر را انتخاب کنید:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {sizes.map((sizeCode, index) => (
                    <button
                      key={sizeCode}
                      onClick={() => onSizeSelect(sizeCode)}
                      className={`
                        p-4 rounded-xl border-2 text-center transition-all
                        ${selectedSize === sizeCode
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
                      `}
                    >
                      <span className="text-gray-900 text-sm font-medium">
                        {getSizeLabel(sizeCode, index)}
                      </span>
                      {selectedSize === sizeCode && (
                        <Check className="w-4 h-4 text-gray-900 mx-auto mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm button */}
              <Button
                onClick={onConfirmSize}
                disabled={!selectedSize}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                تایید و ایجاد تصویر
              </Button>
            </div>
          )}

          {/* Generating State */}
          {status === 'generating' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              {/* Product thumbnail */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Loading spinner */}
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                <p className="text-gray-600 text-sm">در حال پردازش تصویر...</p>
                <p className="text-gray-400 text-xs">این فرآیند ممکن است چند ثانیه طول بکشد</p>
              </div>

              {/* Selected size indicator */}
              {selectedSize && (
                <div className="bg-gray-100 px-4 py-2 rounded-full">
                  <span className="text-gray-600 text-sm">
                    سایز: {getSizeLabel(selectedSize, sizes.indexOf(selectedSize))}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Completed State */}
          {status === 'completed' && resultImageUrl && (
            <div className="space-y-6">
              {/* Result image */}
              <div className="rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={resultImageUrl}
                  alt="نتیجه امتحان محصول"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Product info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm font-medium truncate">{product.name}</p>
                  {selectedSize && (
                    <p className="text-gray-500 text-xs">
                      سایز: {getSizeLabel(selectedSize, sizes.indexOf(selectedSize))}
                    </p>
                  )}
                </div>
                {product.matchScore && (
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    {product.matchScore}% تطابق
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={onSave}
                  className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  ذخیره
                </Button>
                <Button
                  onClick={onShare}
                  variant="outline"
                  className="flex-1 h-12 border-gray-300 hover:bg-gray-50 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  اشتراک‌گذاری
                </Button>
              </div>

              {/* Try another product hint */}
              <p className="text-center text-gray-400 text-xs">
                برای امتحان محصول دیگر، این پنجره را ببندید
              </p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              {/* Error icon */}
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-8 h-8 text-red-500" />
              </div>

              {/* Error message */}
              <div className="text-center space-y-2">
                <p className="text-gray-900 font-medium">خطا در پردازش تصویر</p>
                <p className="text-gray-500 text-sm">
                  {errorMessage || 'متأسفانه در ایجاد تصویر مشکلی پیش آمد. لطفاً دوباره تلاش کنید.'}
                </p>
              </div>

              {/* Retry button */}
              <Button
                onClick={onRetry}
                className="h-12 px-8 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                تلاش مجدد
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
