/**
 * RoomAnalysisSummary Component
 *
 * Displays AI-analyzed room information with earth tone styling.
 * Shows detected room type, size, furniture, and observations.
 */

import { motion } from "motion/react";
import { Home, Ruler, Sofa, Eye, Lightbulb, Sparkles } from "lucide-react";
import { useAnimationPreference } from "../../hooks/useAnimationPreference";
import type { RoomAnalysisSummary as RoomAnalysisSummaryType } from "../../types/discovery";

interface RoomAnalysisSummaryProps {
  analysis: RoomAnalysisSummaryType;
}

// Earth tone colors
const colors = {
  terracotta: "#C97C5D",
  sage: "#8A9A5B",
  warmGrey: "#A69F98",
  cream: "#F5F0E8",
  darkText: "#2D2A26",
  lightText: "#6B6560",
};

// Room size labels in Persian
const ROOM_SIZE_LABELS: Record<string, string> = {
  small: "کوچک",
  medium: "متوسط",
  large: "بزرگ",
};

export function RoomAnalysisSummary({ analysis }: RoomAnalysisSummaryProps) {
  const shouldAnimate = useAnimationPreference();

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4DF] text-right"
      dir="rtl"
    >
      {/* Header with room type and size */}
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#E8E4DF]">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C97C5D] to-[#8A9A5B] flex items-center justify-center shadow-sm">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[#2D2A26] text-lg">
            تحلیل هوش مصنوعی
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-[#F5F0E8] text-[#C97C5D] rounded-full text-sm font-semibold">
              {analysis.room_type}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-[#F5F0E8] text-[#6B6560] rounded-full text-xs">
              <Ruler className="w-3 h-3" />
              {ROOM_SIZE_LABELS[analysis.room_size] || analysis.room_size}
            </span>
          </div>
        </div>
      </div>

      {/* Detected furniture */}
      {analysis.detected_furniture && analysis.detected_furniture.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-[#6B6560] mb-2">
            <Sofa className="w-4 h-4 text-[#C97C5D]" />
            <span className="font-medium">مبلمان موجود:</span>
          </div>
          <div className="flex flex-wrap gap-2 mr-6">
            {analysis.detected_furniture.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-[#FAF7F4] rounded-lg text-sm text-[#2D2A26] border border-[#E8E4DF]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detected accessories */}
      {analysis.detected_accessories && analysis.detected_accessories.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-[#6B6560] mb-2">
            <Eye className="w-4 h-4 text-[#8A9A5B]" />
            <span className="font-medium">اکسسوری‌ها:</span>
          </div>
          <div className="flex flex-wrap gap-2 mr-6">
            {analysis.detected_accessories.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-[#8A9A5B]/10 rounded-lg text-sm text-[#8A9A5B] border border-[#8A9A5B]/20"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key accessory notes */}
      {analysis.key_accessory_notes && (
        <div className="mb-4 mr-6">
          <p className="text-sm text-[#6B6560] leading-relaxed">
            {analysis.key_accessory_notes}
          </p>
        </div>
      )}

      {/* Architectural features */}
      {analysis.architectural_features && analysis.architectural_features.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-[#6B6560] mb-2">
            <Home className="w-4 h-4 text-[#A69F98]" />
            <span className="font-medium">ویژگی‌های معماری:</span>
          </div>
          <div className="flex flex-wrap gap-2 mr-6">
            {analysis.architectural_features.map((feature, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-[#A69F98]/10 rounded-lg text-sm text-[#6B6560] border border-[#A69F98]/20"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Functional observations */}
      {analysis.functional_observations && (
        <div className="mt-5 p-4 bg-gradient-to-r from-[#C97C5D]/10 to-[#8A9A5B]/10 rounded-xl border border-[#C97C5D]/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#C97C5D] shrink-0 mt-0.5" />
            <p className="text-sm text-[#2D2A26] leading-relaxed">
              {analysis.functional_observations}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
