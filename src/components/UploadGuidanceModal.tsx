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
}

export function UploadGuidanceModal({
  open,
  onClose,
  onConfirm,
}: UploadGuidanceModalProps) {
  const [step, setStep] = useState<1 | 2>(1); // 1: correct image, 2: incorrect image
  const [correctImageError, setCorrectImageError] = useState(false);
  const [correctImageSrc, setCorrectImageSrc] = useState("/guidance-examples/correct-room-modern.webp");
  const [incorrectImageError, setIncorrectImageError] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setCorrectImageError(false);
      setCorrectImageSrc("/guidance-examples/correct-room-modern.webp");
      setIncorrectImageError(false);
    }
  }, [open]);

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
    
    if (correctImageSrc.includes('correct-room-modern.webp')) {
      // Try fallback image
      console.log('[UploadGuidanceModal] Trying fallback image...');
      setCorrectImageSrc('/guidance-examples/correct-room.webp');
    } else {
      // Both failed, show placeholder
      console.log('[UploadGuidanceModal] Both images failed, showing placeholder');
      setCorrectImageError(true);
    }
  };

  const handleCorrectImageLoad = () => {
    console.log('[UploadGuidanceModal] Image loaded successfully:', correctImageSrc);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-md bg-black/10" />
        <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-2xl p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-right">
            {step === 1 ? "برای بهترین نتیجه، این نکات را رعایت کنید" : "مثال‌های نادرست"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {step === 1 ? (
            /* Step 1: Correct Example */
            <div className="space-y-2">
              <div className="relative rounded-lg overflow-hidden ring-2 ring-green-200 bg-gray-100">
                <div className="relative w-full aspect-[4/3] bg-gray-200 flex items-center justify-center">
                  {correctImageError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                      <div className="text-center p-4">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" strokeWidth={2.5} />
                        <p className="text-xs text-green-700 font-medium">عکس مناسب</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      key={correctImageSrc}
                      src={correctImageSrc}
                      alt="مثال صحیح: عکس مناسب از اتاق نشیمن با نور کافی و نمای واضح"
                      className="w-full h-full object-cover"
                      loading="eager"
                      onError={handleCorrectImageError}
                      onLoad={handleCorrectImageLoad}
                    />
                  )}
                  <div className="absolute top-2 left-2 rounded-full p-1.5 bg-green-500 z-10">
                    <CheckCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="p-3 bg-white/80 backdrop-blur-sm">
                  <p className="text-sm font-bold text-green-700 text-right">
                    ✅ مثال صحیح: عکس مناسب از اتاق با نور کافی و نمای واضح
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: Incorrect Example */
            <div className="space-y-2">
              <div className="relative rounded-lg overflow-hidden ring-2 ring-red-200 bg-gray-100">
                <div className="relative w-full aspect-[4/3] bg-gray-200 flex items-center justify-center">
                  {incorrectImageError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                      <div className="text-center p-4">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" strokeWidth={2.5} />
                        <p className="text-xs text-red-700 font-medium">عکس نامناسب</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src="/guidance-examples/incorrect-tilted.webp"
                      alt="مثال نادرست: عکس کج و نامناسب"
                      className="w-full h-full object-cover"
                      loading="eager"
                      onError={() => setIncorrectImageError(true)}
                    />
                  )}
                  <div className="absolute top-2 left-2 rounded-full p-1.5 bg-red-500 z-10">
                    <XCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="p-3 bg-white/80 backdrop-blur-sm">
                  <p className="text-sm font-bold text-red-700 text-right">
                    ❌ مثال نادرست: عکس کج و نامناسب
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={step === 1 ? handleStep1Confirm : handleStep2Confirm}
            className="w-full h-12 rounded-full font-medium text-sm transition-all bg-gray-900 hover:bg-gray-800 text-white cursor-pointer mt-6"
          >
            متوجه شدم، بزن بریم!
          </button>
        </div>
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

