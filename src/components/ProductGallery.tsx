/**
 * ProductGallery Component
 *
 * Displays a horizontal scrollable gallery of user-submitted try-on images
 * for a specific product. Shows social proof on product pages.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getProductGallery, getRoomTypeLabel } from "../services/galleryService";
import type { GalleryImage } from "../types/gallery";

interface ProductGalleryProps {
  /** Product ID to fetch gallery for */
  productId: number;
  /** Product name for display */
  productName: string;
}

export function ProductGallery({ productId, productName }: ProductGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch gallery images on mount
  useEffect(() => {
    async function fetchGallery() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getProductGallery(productId);
        if (response) {
          setImages(response.results);
          setTotalCount(response.count);
        } else {
          setError('خطا در بارگذاری گالری');
        }
      } catch (err) {
        console.error('[ProductGallery] Fetch error:', err);
        setError('خطا در بارگذاری گالری');
      } finally {
        setIsLoading(false);
      }
    }

    fetchGallery();
  }, [productId]);

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Don't render if no images and not loading
  if (!isLoading && images.length === 0) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="py-4" dir="rtl">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-400">در حال بارگذاری گالری...</span>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-32 h-32 bg-gray-100 rounded-xl animate-pulse shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state (silent - don't show error to user)
  if (error) {
    return null;
  }

  return (
    <>
      <div className="py-4" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#0088FF]" />
            <span className="text-sm font-medium text-gray-900">
              تصاویر کاربران
              {totalCount > 0 && (
                <span className="text-gray-500 mr-1">({totalCount})</span>
              )}
            </span>
          </div>

          {/* Scroll arrows for desktop */}
          {images.length > 3 && (
            <div className="hidden sm:flex gap-1">
              <button
                onClick={scrollRight}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="اسکرول به راست"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={scrollLeft}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="اسکرول به چپ"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Gallery */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((image, index) => (
            <motion.button
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="
                relative shrink-0 snap-start
                w-32 h-32 sm:w-36 sm:h-36
                rounded-xl overflow-hidden
                bg-gray-100
                group
              "
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={image.imageUrl}
                alt={`تصویر ${index + 1} از ${productName}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Room type badge */}
              <div className="absolute bottom-2 right-2 left-2">
                <span className="
                  inline-block px-2 py-1
                  bg-black/60 backdrop-blur-sm
                  text-white text-[10px]
                  rounded-full
                  truncate max-w-full
                ">
                  {getRoomTypeLabel(image.roomType)}
                </span>
              </div>

              {/* Hover overlay */}
              <div className="
                absolute inset-0
                bg-black/0 group-hover:bg-black/20
                transition-colors
              " />
            </motion.button>
          ))}

          {/* "More" indicator if there are more images */}
          {totalCount > images.length && (
            <div className="
              shrink-0 snap-start
              w-32 h-32 sm:w-36 sm:h-36
              rounded-xl
              bg-gray-100
              flex flex-col items-center justify-center
              text-gray-500
            ">
              <span className="text-2xl font-bold">+{totalCount - images.length}</span>
              <span className="text-xs">نمونه دیگر</span>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="
                absolute top-4 left-4 z-10
                w-10 h-10 rounded-full
                bg-white/10 hover:bg-white/20
                flex items-center justify-center
                transition-colors
              "
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.imageUrl}
                alt={`تصویر ${productName}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />

              {/* Image info */}
              <div className="mt-4 text-center" dir="rtl">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="px-3 py-1.5 bg-white/10 text-white text-sm rounded-full">
                    {getRoomTypeLabel(selectedImage.roomType)}
                  </span>
                  {selectedImage.roomStyle && (
                    <span className="px-3 py-1.5 bg-white/10 text-white text-sm rounded-full">
                      {selectedImage.roomStyle}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Click hint */}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              برای بستن کلیک کنید
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProductGallery;
