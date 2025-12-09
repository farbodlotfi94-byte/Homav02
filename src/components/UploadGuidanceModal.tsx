/**
 * Upload Guidance Modal Component
 *
 * Shows users visual examples of good vs. bad room photos in a modal.
 * This modal appears when user clicks on file selection or camera buttons.
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "./ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { CheckCircle, XCircle, X } from "lucide-react";

interface UploadGuidanceModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category?: string;
}

// Get category-specific image paths
// Categories use numeric strings from backend: '2' = Carpet, '3' = Bedcover
const getImagePaths = (category?: string) => {
  if (category === '3') {
    // Bedcover (روتختی)
    return {
      correct: '/guidance-examples/bedcover-correct.webp',
      correctFallback: '/guidance-examples/bedcover-correct.webp',
      incorrect: '/guidance-examples/bedcover-incorrect.webp',
    };
  }
  // Default: Carpet ('2' = فرش و قالی) or undefined
  return {
    correct: '/guidance-examples/correct-room-modern.webp',
    correctFallback: '/guidance-examples/correct-room.webp',
    incorrect: '/guidance-examples/incorrect-tilted.webp',
  };
};

export function UploadGuidanceModal({
  open,
  onClose,
  onConfirm,
  category,
}: UploadGuidanceModalProps) {
  const imagePaths = getImagePaths(category);
  const [step, setStep] = useState<1 | 2>(1); // 1: correct image, 2: incorrect image
  const [correctImageError, setCorrectImageError] = useState(false);
  const [correctImageSrc, setCorrectImageSrc] = useState(imagePaths.correct);
  const [correctImageLoading, setCorrectImageLoading] = useState(true);
  const [incorrectImageError, setIncorrectImageError] = useState(false);
  const [incorrectImageLoading, setIncorrectImageLoading] = useState(true);

  // Preload images when modal opens
  useEffect(() => {
    if (open) {
      const paths = getImagePaths(category);
      setStep(1);
      setCorrectImageError(false);
      setCorrectImageSrc(paths.correct);
      setCorrectImageLoading(true);
      setIncorrectImageError(false);
      setIncorrectImageLoading(true);

      // Preload correct image
      const correctImg = new Image();
      correctImg.src = paths.correct;
      correctImg.onload = () => {
        setCorrectImageLoading(false);
        console.log('[UploadGuidanceModal] Correct image preloaded');
      };
      correctImg.onerror = () => {
        console.log('[UploadGuidanceModal] Primary image failed, trying fallback...');
        const fallbackImg = new Image();
        fallbackImg.src = paths.correctFallback;
        fallbackImg.onload = () => {
          setCorrectImageSrc(paths.correctFallback);
          setCorrectImageLoading(false);
        };
        fallbackImg.onerror = () => {
          setCorrectImageError(true);
          setCorrectImageLoading(false);
        };
      };

      // Preload incorrect image
      const incorrectImg = new Image();
      incorrectImg.src = paths.incorrect;
      incorrectImg.onload = () => {
        setIncorrectImageLoading(false);
        console.log('[UploadGuidanceModal] Incorrect image preloaded');
      };
      incorrectImg.onerror = () => {
        setIncorrectImageError(true);
        setIncorrectImageLoading(false);
      };
    }
  }, [open, category]);

  const handleStep1Confirm = () => {
    // Move to step 2 (incorrect image)
    setStep(2);
  };

  const handleStep2Confirm = () => {
    // Final confirm - proceed to upload
    onConfirm();
    onClose();
  };

  const handleCorrectImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    console.log('[UploadGuidanceModal] Image error:', target.src);

    // Try fallback if not already on fallback
    if (correctImageSrc === imagePaths.correct && imagePaths.correct !== imagePaths.correctFallback) {
      console.log('[UploadGuidanceModal] Trying fallback image...');
      setCorrectImageLoading(true);
      setCorrectImageSrc(imagePaths.correctFallback);
    } else {
      // Both failed, show placeholder
      console.log('[UploadGuidanceModal] Both images failed, showing placeholder');
      setCorrectImageError(true);
      setCorrectImageLoading(false);
    }
  };

  const handleCorrectImageLoad = () => {
    console.log('[UploadGuidanceModal] Image loaded successfully:', correctImageSrc);
    setCorrectImageLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-md bg-black/10" />
        <DialogPrimitive.Content
          className="fixed top-[50%] left-[50%] z-50 w-[92vw] sm:w-[94vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Close button - dark style for better visibility */}
          <div
            role="button"
            tabIndex={0}
            onClick={onClose}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(31, 41, 55, 0.9)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 100,
            }}
          >
            <X className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-0">
            {/* Title - improved visibility */}
            <DialogHeader className="pb-4 pt-2 mb-2">
              <DialogTitle className="text-gray-800 text-center text-base sm:text-lg leading-relaxed font-bold px-4">
                {step === 1 ? "برای بهترین نتیجه، این نکات را رعایت کنید" : "مثال‌های نادرست"}
              </DialogTitle>
            </DialogHeader>

            {/* Image Section */}
            {step === 1 ? (
              /* Step 1: Correct Example */
              <div className="relative rounded-xl overflow-hidden ring-2 ring-green-200 bg-gray-100">
                <div className="relative w-full bg-gray-200 overflow-hidden h-[50vh] sm:h-[55vh] max-h-[400px]">
                  {correctImageError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                      <div className="text-center p-4">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" strokeWidth={2.5} />
                        <p className="text-xs text-green-700 font-medium">عکس مناسب</p>
                      </div>
                    </div>
                  ) : correctImageLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs text-gray-500">در حال بارگذاری...</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      key={correctImageSrc}
                      src={correctImageSrc}
                      alt="مثال صحیح: عکس مناسب از اتاق نشیمن با نور کافی و نمای واضح"
                      className="w-full h-full object-cover object-center"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      onError={handleCorrectImageError}
                      onLoad={() => {
                        setCorrectImageLoading(false);
                        handleCorrectImageLoad();
                      }}
                    />
                  )}
                  <div className="absolute top-2 left-2 rounded-full p-1.5 bg-green-500 z-10">
                    <CheckCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                {/* Caption inside the card */}
                <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-white border-t-2 border-green-400">
                  <p className="text-sm sm:text-base font-bold text-green-700 text-center leading-relaxed">
                    ✅ مثال صحیح: عکس مناسب از اتاق با نور کافی و نمای واضح
                  </p>
                </div>
              </div>
            ) : (
              /* Step 2: Incorrect Example */
              <div className="relative rounded-xl overflow-hidden ring-2 ring-red-200 bg-gray-100">
                <div className="relative w-full bg-gray-200 overflow-hidden h-[50vh] sm:h-[55vh] max-h-[400px]">
                  {incorrectImageError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                      <div className="text-center p-4">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" strokeWidth={2.5} />
                        <p className="text-xs text-red-700 font-medium">عکس نامناسب</p>
                      </div>
                    </div>
                  ) : incorrectImageLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs text-gray-500">در حال بارگذاری...</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={imagePaths.incorrect}
                      alt="مثال نادرست: عکس کج و نامناسب"
                      className="w-full h-full object-cover object-center"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      onError={() => {
                        setIncorrectImageError(true);
                        setIncorrectImageLoading(false);
                      }}
                      onLoad={() => setIncorrectImageLoading(false)}
                    />
                  )}
                  <div className="absolute top-2 left-2 rounded-full p-1.5 bg-red-500 z-10">
                    <XCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                {/* Caption inside the card */}
                <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50 to-white border-t-2 border-red-400">
                  <p className="text-sm sm:text-base font-bold text-red-700 text-center leading-relaxed">
                    ❌ مثال نادرست: عکس کج و نامناسب
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Button Footer - Always visible */}
          <div className="flex-shrink-0 p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
            <button
              onClick={step === 1 ? handleStep1Confirm : handleStep2Confirm}
              className="w-full h-12 sm:h-13 py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white cursor-pointer shadow-md hover:shadow-lg"
            >
              متوجه شدم، بزن بریم!
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

