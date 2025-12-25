/**
 * GallerySubmissionModal Component
 *
 * Modal for submitting try-on images to the public gallery.
 * Shown after successful visualization to allow users to share their results.
 */

import { useState } from "react";
import { motion } from "motion/react";
import { Share2, X, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface GallerySubmissionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback to submit to gallery */
  onSubmit: () => Promise<void>;
  /** URL of the processed try-on image */
  imageUrl: string;
  /** Name of the product being visualized */
  productName: string;
}

export function GallerySubmissionModal({
  isOpen,
  onClose,
  onSubmit,
  imageUrl,
  productName,
}: GallerySubmissionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
      setIsSubmitted(true);
      // Close after success animation
      setTimeout(() => {
        onClose();
        // Reset state for next open
        setIsSubmitted(false);
      }, 1500);
    } catch (error) {
      console.error('[GallerySubmission] Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setIsSubmitted(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-sm sm:max-w-md bg-white rounded-3xl border-gray-200 p-0 overflow-hidden"
        dir="rtl"
      >
        {/* Custom close button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute left-4 top-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Image Preview */}
        <div className="relative aspect-[4/3] bg-gray-100">
          <img
            src={imageUrl}
            alt={`نتیجه امتحان ${productName}`}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-4 relative">
          <DialogHeader className="text-center mb-4">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
              اشتراک در گالری
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm leading-relaxed">
              آیا می‌خواهید این تصویر را با دیگران به اشتراک بگذارید؟
              <br />
              <span className="text-gray-500">
                تصاویر پس از بررسی در گالری محصول نمایش داده می‌شوند.
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting || isSubmitted}
              className={`
                flex-1 h-12 rounded-xl font-medium
                flex items-center justify-center gap-2
                transition-all
                ${isSubmitted
                  ? 'bg-green-500 text-white'
                  : 'bg-[#0088FF] hover:bg-[#0077E6] text-white'
                }
                disabled:opacity-70
              `}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال ارسال...</span>
                </>
              ) : isSubmitted ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>ارسال شد!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  <span>اشتراک‌گذاری</span>
                </>
              )}
            </motion.button>

            {/* Skip Button */}
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="
                flex-1 h-12 rounded-xl font-medium
                bg-gray-100 hover:bg-gray-200 text-gray-700
                transition-colors
                disabled:opacity-50
              "
            >
              بعدا
            </button>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-gray-400 text-center mt-4">
            تصاویر به صورت ناشناس منتشر می‌شوند
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GallerySubmissionModal;
