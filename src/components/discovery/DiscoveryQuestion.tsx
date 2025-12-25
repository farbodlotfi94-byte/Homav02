/**
 * DiscoveryQuestion Component
 *
 * Visual, interactive question component for the Home Interior Preference Survey.
 * Supports: image cards, sliders, boolean toggles, and text options.
 * Features earth tone colors, elegant typography, and RTL support.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useAnimationPreference } from "../../hooks/useAnimationPreference";
import type { DiscoveryQuestion as DiscoveryQuestionType, QuestionAnswer } from "../../types/discovery";

// Earth tone color palette
const colors = {
  terracotta: "#C97C5D",
  sage: "#8A9A5B",
  warmGrey: "#A69F98",
  cream: "#F5F0E8",
  darkText: "#2D2A26",
  lightText: "#6B6560",
  cardBg: "#FFFFFF",
  selectedBorder: "#C97C5D",
  hoverBg: "#FAF7F4",
};

interface DiscoveryQuestionProps {
  question: DiscoveryQuestionType;
  value: QuestionAnswer | undefined;
  onChange: (questionId: string, value: QuestionAnswer) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoBack: boolean;
  isLast: boolean;
}

export function DiscoveryQuestion({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  canGoBack,
  isLast,
}: DiscoveryQuestionProps) {
  const shouldAnimate = useAnimationPreference();
  const [sliderValue, setSliderValue] = useState<number>(
    question.sliderConfig?.defaultValue ?? 50
  );

  // Check if current question has a valid answer
  const hasAnswer = (): boolean => {
    if (value === undefined) return false;
    if (question.type === "multi_select") {
      return (value as string[]).length > 0;
    }
    return true;
  };

  // Handle option selection (auto-advance for single select)
  const handleOptionSelect = (optionValue: string) => {
    onChange(question.id, optionValue);
    // Auto-advance after short delay for single select
    if (question.type === "single_select" || question.type === "image_select") {
      setTimeout(() => onNext(), 400);
    }
  };

  // Handle multi-select toggle
  const handleMultiSelect = (optionValue: string) => {
    const currentValues = (value as string[]) || [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue];
    onChange(question.id, newValues);
  };

  // Handle boolean selection
  const handleBooleanSelect = (selected: boolean) => {
    onChange(question.id, selected);
    setTimeout(() => onNext(), 400);
  };

  // Handle slider change
  const handleSliderChange = (newValue: number) => {
    setSliderValue(newValue);
    onChange(question.id, newValue);
  };

  // Render image-based cards (for image_select and options with images)
  const renderImageCards = () => {
    const options = question.options || [];
    const hasImages = options.some((opt) => opt.imageUrl);

    if (!hasImages) {
      return renderTextOptions();
    }

    return (
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        {options.map((option, index) => {
          const isSelected = value === option.value;
          return (
            <motion.button
              key={option.value}
              initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleOptionSelect(option.value)}
              className={`
                relative group overflow-hidden rounded-2xl
                aspect-[4/3] bg-white
                shadow-md hover:shadow-xl
                transition-all duration-300
                ${isSelected
                  ? "ring-3 ring-[#C97C5D] shadow-lg scale-[1.02]"
                  : "hover:scale-[1.01]"
                }
              `}
            >
              {/* Image */}
              {option.imageUrl && (
                <img
                  src={option.imageUrl}
                  alt={option.label}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Selected checkmark */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#C97C5D] flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Label */}
              <div className="absolute bottom-0 inset-x-0 p-4 text-right">
                <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">
                  {option.label}
                </h3>
                {option.description && (
                  <p className="text-white/80 text-sm drop-shadow">
                    {option.description}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  // Render text-based options (elegant cards without images)
  const renderTextOptions = () => {
    const options = question.options || [];
    const isSingleSelect = question.type === "single_select";
    const selectedValues = isSingleSelect ? [value] : ((value as string[]) || []);

    return (
      <div className="space-y-3 max-w-xs sm:max-w-sm md:max-w-xl mx-auto px-2 sm:px-0">
        {options.map((option, index) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <motion.button
              key={option.value}
              initial={shouldAnimate ? { opacity: 0, x: -20 } : false}
              animate={shouldAnimate ? { opacity: 1, x: 0 } : false}
              transition={{ delay: index * 0.08 }}
              onClick={() =>
                isSingleSelect
                  ? handleOptionSelect(option.value)
                  : handleMultiSelect(option.value)
              }
              className={`
                w-full p-4 sm:p-5 rounded-2xl text-right
                transition-all duration-300
                flex items-center gap-3 sm:gap-4
                ${isSelected
                  ? "bg-[#C97C5D] text-white shadow-lg"
                  : "bg-white text-[#2D2A26] hover:bg-[#FAF7F4] shadow-sm hover:shadow-md"
                }
              `}
            >
              {/* Selection indicator */}
              <div
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                  transition-colors
                  ${isSelected
                    ? "border-white bg-white"
                    : "border-[#A69F98]"
                  }
                `}
              >
                {isSelected && (
                  <Check className="w-4 h-4 text-[#C97C5D]" />
                )}
              </div>

              {/* Icon and text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 justify-end">
                  {option.icon && (
                    <span className="text-xl">{option.icon}</span>
                  )}
                  <span className="font-semibold text-base">
                    {option.label}
                  </span>
                </div>
                {option.description && (
                  <p className={`text-sm mt-1 ${isSelected ? "text-white/80" : "text-[#6B6560]"}`}>
                    {option.description}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  // Render slider input
  const renderSlider = () => {
    const config = question.sliderConfig;
    if (!config) return null;

    const percentage = ((sliderValue - config.min) / (config.max - config.min)) * 100;

    return (
      <motion.div
        initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
        className="max-w-xl mx-auto px-4"
      >
        {/* Slider value display */}
        <div className="text-center mb-8">
          <span className="text-6xl font-light text-[#C97C5D]">
            {sliderValue}
          </span>
        </div>

        {/* Custom slider */}
        <div className="relative">
          {/* Track background */}
          <div className="h-3 bg-[#E8E4DF] rounded-full overflow-hidden">
            {/* Filled track */}
            <motion.div
              className="h-full bg-gradient-to-r from-[#C97C5D] to-[#8A9A5B] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Slider input */}
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={sliderValue}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          />

          {/* Thumb indicator */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-lg border-3 border-[#C97C5D] pointer-events-none"
            style={{ left: `calc(${percentage}% - 14px)` }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-4 text-sm text-[#6B6560]">
          <span>{config.maxLabel}</span>
          <span>{config.minLabel}</span>
        </div>
      </motion.div>
    );
  };

  // Render boolean buttons (Yes/No with visual style)
  const renderBoolean = () => {
    return (
      <motion.div
        initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
        className="flex gap-4 max-w-md mx-auto"
      >
        <button
          onClick={() => handleBooleanSelect(true)}
          className={`
            flex-1 py-6 px-8 rounded-2xl font-bold text-lg
            transition-all duration-300
            ${value === true
              ? "bg-[#8A9A5B] text-white shadow-lg scale-105"
              : "bg-white text-[#2D2A26] hover:bg-[#FAF7F4] shadow-md"
            }
          `}
        >
          <span className="flex items-center justify-center gap-3">
            {value === true && <Check className="w-6 h-6" />}
            بله
          </span>
        </button>
        <button
          onClick={() => handleBooleanSelect(false)}
          className={`
            flex-1 py-6 px-8 rounded-2xl font-bold text-lg
            transition-all duration-300
            ${value === false
              ? "bg-[#C97C5D] text-white shadow-lg scale-105"
              : "bg-white text-[#2D2A26] hover:bg-[#FAF7F4] shadow-md"
            }
          `}
        >
          <span className="flex items-center justify-center gap-3">
            {value === false && <Check className="w-6 h-6" />}
            خیر
          </span>
        </button>
      </motion.div>
    );
  };

  // Render appropriate input based on question type
  const renderInput = () => {
    switch (question.type) {
      case "image_select":
        return renderImageCards();
      case "single_select":
        return question.options?.some((o) => o.imageUrl)
          ? renderImageCards()
          : renderTextOptions();
      case "multi_select":
        return renderTextOptions();
      case "slider":
        return renderSlider();
      case "boolean":
        return renderBoolean();
      default:
        return renderTextOptions();
    }
  };

  // Get category label and icon
  const getCategoryInfo = () => {
    switch (question.category) {
      case "layout":
        return { label: "چیدمان و فضا", icon: "📐" };
      case "color":
        return { label: "رنگ و بافت", icon: "🎨" };
      case "style":
        return { label: "سبک مبلمان", icon: "🛋️" };
      case "budget":
        return { label: "بودجه", icon: "💰" };
      default:
        return { label: "", icon: "" };
    }
  };

  const categoryInfo = getCategoryInfo();

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0 } : false}
      animate={shouldAnimate ? { opacity: 1 } : false}
      exit={shouldAnimate ? { opacity: 0 } : undefined}
      className="min-h-[calc(100vh-200px)] flex flex-col justify-center px-4 sm:px-6 py-6 sm:py-8"
      dir="rtl"
    >
      {/* Category badge */}
      {categoryInfo.label && (
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: -10 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
          className="text-center mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F0E8] text-[#6B6560] text-sm">
            <span>{categoryInfo.icon}</span>
            <span>{categoryInfo.label}</span>
          </span>
        </motion.div>
      )}

      {/* Question text - Serif heading for elegance */}
      <motion.div
        initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
        transition={{ delay: 0.1 }}
        className="text-center mb-4"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2D2A26] leading-relaxed">
          {question.question}
        </h2>
        {question.subtitle && (
          <p className="text-[#6B6560] mt-3 text-base">
            {question.subtitle}
          </p>
        )}
      </motion.div>

      {/* Reason/hint */}
      {question.reason && (
        <motion.p
          initial={shouldAnimate ? { opacity: 0 } : false}
          animate={shouldAnimate ? { opacity: 1 } : false}
          transition={{ delay: 0.2 }}
          className="text-center text-[#8A9A5B] text-sm mb-8 max-w-lg mx-auto"
        >
          💡 {question.reason}
        </motion.p>
      )}

      {/* Input area */}
      <div className="flex-1 flex items-center">
        <div className="w-full">
          {renderInput()}
        </div>
      </div>

      {/* Navigation buttons for multi-select and slider */}
      {(question.type === "multi_select" || question.type === "slider") && (
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          {canGoBack && (
            <button
              onClick={onPrevious}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-[#6B6560] hover:bg-[#F5F0E8] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
              <span>قبلی</span>
            </button>
          )}
          <button
            onClick={onNext}
            disabled={!hasAnswer()}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{
              backgroundColor: hasAnswer() ? '#C97C5D' : '#E8E4DF',
              color: hasAnswer() ? '#FFFFFF' : '#A69F98',
              cursor: hasAnswer() ? 'pointer' : 'not-allowed',
            }}
          >
            <span>{isLast ? "دریافت پیشنهادات" : "بعدی"}</span>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
