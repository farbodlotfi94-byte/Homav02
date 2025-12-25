/**
 * DiscoveryProcessing Component
 *
 * Processing screen for Discovery Flow with step indicator.
 * Shows AI processing progress with 4 steps.
 */

import { motion } from "motion/react";
import { X } from "lucide-react";
import { useAnimationPreference } from "../hooks/useAnimationPreference";
import type { ProcessingStep } from "../types/discovery";

interface DiscoveryProcessingProps {
  currentStep: ProcessingStep;
  onCancel: () => void;
}

const STEPS: { key: ProcessingStep; label: string }[] = [
  { key: "upload", label: "آپلود عکس" },
  { key: "analysis", label: "تحلیل فضای اتاق" },
  { key: "questions", label: "پاسخ به سوالات AI" },
  { key: "matching", label: "جستجوی محصولات مناسب" },
  { key: "generation", label: "آماده‌سازی نتایج" },
];

// Tips to show during processing
const TIPS = [
  "AI ما رنگ‌ها، سبک و ابعاد اتاق شما رو تحلیل می‌کنه تا بهترین محصولات رو پیشنهاد بده.",
  "هر محصول با درصد تطابق نشون داده میشه تا بهترین انتخاب رو داشته باشی.",
  "می‌تونی با چند عکس مختلف امتحان کنی تا بهترین نتیجه رو بگیری.",
  "نتایج بر اساس سبک و رنگ‌بندی اتاق شما شخصی‌سازی میشن.",
];

function getStepStatus(
  step: ProcessingStep,
  currentStep: ProcessingStep
): "done" | "active" | "pending" {
  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

export function DiscoveryProcessing({
  currentStep,
  onCancel,
}: DiscoveryProcessingProps) {
  const shouldAnimate = useAnimationPreference();

  // Get a random tip
  const tipIndex = Math.floor(Math.random() * TIPS.length);
  const tip = TIPS[tipIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col items-center justify-center p-6"
      dir="rtl"
    >
      <div className="max-w-md w-full text-center">
        {/* Spinner Container */}
        <motion.div
          initial={shouldAnimate ? { scale: 0.8, opacity: 0 } : false}
          animate={shouldAnimate ? { scale: 1, opacity: 1 } : false}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-[120px] h-[120px] mx-auto mb-8"
        >
          {/* Spinner Ring - Smooth conic gradient spinner */}
          <div
            className="absolute inset-0 w-full h-full rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0%, #0088FF 50%, transparent 100%)',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
              animation: 'spin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />

          {/* Brain Icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-4xl"
            animate={{
              opacity: [1, 0.7, 1],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🧠
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-xl font-bold text-gray-900 mb-2"
        >
          AI داره فکر می‌کنه...
        </motion.h1>

        <motion.p
          initial={shouldAnimate ? { opacity: 0 } : false}
          animate={shouldAnimate ? { opacity: 1 } : false}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-gray-500 mb-10"
        >
          لطفاً صبر کنید، این کار حدود ۳۰ ثانیه طول می‌کشه
        </motion.p>

        {/* Steps Card */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white rounded-[20px] p-6 border border-gray-200 mb-6 text-right"
        >
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.key, currentStep);
            const isLast = index === STEPS.length - 1;

            return (
              <div
                key={step.key}
                className={`
                  flex items-center gap-4 py-4
                  ${!isLast ? "border-b border-gray-100" : ""}
                `}
              >
                {/* Step Icon */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0
                    ${
                      status === "done"
                        ? "bg-green-100 text-green-600"
                        : status === "active"
                        ? "bg-blue-100 text-[#0088FF]"
                        : "bg-gray-100 text-gray-400"
                    }
                    ${status === "active" ? "animate-pulse" : ""}
                  `}
                >
                  {status === "done" ? (
                    "✓"
                  ) : status === "active" ? (
                    <span className="animate-pulse">⏳</span>
                  ) : (
                    "○"
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <p
                    className={`
                      text-sm font-medium
                      ${status === "pending" ? "text-gray-400" : "text-gray-900"}
                    `}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`
                      text-xs mt-0.5
                      ${
                        status === "done"
                          ? "text-green-600"
                          : status === "active"
                          ? "text-[#0088FF]"
                          : "text-gray-400"
                      }
                    `}
                  >
                    {status === "done"
                      ? "انجام شد"
                      : status === "active"
                      ? "در حال انجام..."
                      : "در انتظار"}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="
            bg-blue-50
            border border-blue-200
            rounded-[14px]
            p-4
            text-right
          "
        >
          <div className="flex items-center gap-2 mb-2 text-[#0088FF] font-semibold text-sm">
            <span>💡</span>
            <span>می‌دونستی؟</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{tip}</p>
        </motion.div>

        {/* Cancel Button */}
        <motion.button
          initial={shouldAnimate ? { opacity: 0 } : false}
          animate={shouldAnimate ? { opacity: 1 } : false}
          transition={{ delay: 0.5, duration: 0.4 }}
          onClick={onCancel}
          className="
            mt-8
            px-6 py-3
            text-gray-500
            hover:text-gray-700
            flex items-center gap-2
            mx-auto
            transition-colors
          "
        >
          <X className="w-4 h-4" />
          <span>انصراف</span>
        </motion.button>
      </div>
    </div>
  );
}
