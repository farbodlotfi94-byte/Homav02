/**
 * Upload Guidance Component
 *
 * Shows users visual examples of good vs. bad room photos for furniture visualization.
 * This is informational only - users can dismiss and upload immediately.
 *
 * TODO: Future enhancement - Add localStorage to auto-hide for returning users
 * TODO: Future enhancement - Add collapsible/expandable with info icon toggle
 */

import { motion } from "motion/react";
import { CheckCircle, XCircle } from "lucide-react";

interface UploadGuidanceProps {
  onDismiss: () => void;
  className?: string;
}

interface GuidanceSlide {
  id: number;
  type: "correct" | "incorrect";
  imageUrl: string;
  altText: string;
  label: string;
}

// Incorrect examples first, then correct one
const incorrectSlides: GuidanceSlide[] = [
  {
    id: 1,
    type: "incorrect",
    imageUrl: "/guidance-examples/incorrect-tilted.webp",
    altText: "مثال نادرست: عکس کج و نامناسب",
    label: "عکس کج و نامناسب",
  },
  {
    id: 2,
    type: "incorrect",
    imageUrl: "/guidance-examples/incorrect-outdoor.webp",
    altText: "مثال نادرست: محیط بیرونی",
    label: "محیط بیرونی (باید داخلی باشد)",
  },
  {
    id: 3,
    type: "incorrect",
    imageUrl: "/guidance-examples/incorrect-topdown.webp",
    altText: "مثال نادرست: زاویه از بالا",
    label: "زاویه از بالا (باید زاویه عادی باشد)",
  },
];

const correctSlide: GuidanceSlide = {
  id: 0,
  type: "correct",
  imageUrl: "/guidance-examples/correct-room.webp",
  altText: "مثال صحیح: عکس مستقیم از اتاق با نور طبیعی",
  label: "عکس مستقیم و واضح از اتاق",
};

export function UploadGuidance({ onDismiss, className = "" }: UploadGuidanceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`mb-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-3 text-right">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          راهنمای عکس‌برداری
        </h3>
        <p className="text-xs text-gray-600">
          برای بهترین نتیجه، این نکات را رعایت کنید
        </p>
      </div>

      {/* Layout: 3 incorrect on top, 1 correct centered below */}
      <div className="mb-3 space-y-2">
        {/* Row 1: 3 Incorrect Examples */}
        <div className="grid grid-cols-3 gap-2">
          {incorrectSlides.map((slide) => (
            <div
              key={slide.id}
              className="relative rounded-lg overflow-hidden ring-1 ring-gray-200"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                <img
                  src={slide.imageUrl}
                  alt={slide.altText}
                  className="w-full h-full object-cover"
                  loading="eager"
                />

                {/* Icon Badge - Smaller */}
                <div className="absolute top-1 left-1 rounded-full p-1 bg-red-500">
                  <XCircle className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Label - Compact */}
              <div className="p-1.5 bg-white">
                <p className="text-[10px] font-bold leading-tight text-red-700">
                  ❌ اشتباه
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: 1 Correct Example (Centered) */}
        <div className="flex justify-center">
          <div className="w-1/3 relative rounded-lg overflow-hidden ring-1 ring-gray-200">
            {/* Image Container */}
            <div className="relative w-full aspect-[4/3] bg-gray-100">
              <img
                src={correctSlide.imageUrl}
                alt={correctSlide.altText}
                className="w-full h-full object-cover"
                loading="eager"
              />

              {/* Icon Badge - Smaller */}
              <div className="absolute top-1 left-1 rounded-full p-1 bg-green-500">
                <CheckCircle className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Label - Compact */}
            <div className="p-1.5 bg-white">
              <p className="text-[10px] font-bold leading-tight text-green-700">
                ✅ صحیح
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Got it Button - Always enabled */}
      <button
        onClick={onDismiss}
        className="w-full h-11 rounded-full font-medium text-sm transition-all bg-gray-900 hover:bg-gray-800 text-white cursor-pointer"
      >
        متوجه شدم، بزن بریم!
      </button>
    </motion.div>
  );
}
