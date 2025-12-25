/**
 * DiscoveryQuestionnaire Component
 *
 * Full-screen, one-question-at-a-time Home Interior Preference Survey.
 * Features smooth transitions, earth tone colors, and visual interactivity.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, Home, Sparkles } from "lucide-react";
import { useAnimationPreference } from "../../hooks/useAnimationPreference";
import { DiscoveryQuestion } from "./DiscoveryQuestion";
import type {
  DiscoveryQuestionsPayload,
  DiscoveryAnswers,
  QuestionAnswer,
} from "../../types/discovery";

interface DiscoveryQuestionnaireProps {
  questionsPayload: DiscoveryQuestionsPayload;
  onSubmit: (answers: DiscoveryAnswers) => void;
  onCancel: () => void;
}

// Earth tone colors
const colors = {
  background: "#FAF7F4",
  cream: "#F5F0E8",
  terracotta: "#C97C5D",
  sage: "#8A9A5B",
  warmGrey: "#A69F98",
  darkText: "#2D2A26",
  lightText: "#6B6560",
};

export function DiscoveryQuestionnaire({
  questionsPayload,
  onSubmit,
  onCancel,
}: DiscoveryQuestionnaireProps) {
  // Start directly at first question (no intro screen)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<DiscoveryAnswers>({});
  const [direction, setDirection] = useState<1 | -1>(1);
  const shouldAnimate = useAnimationPreference();

  const { questions } = questionsPayload;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // Check if all questions are answered
  const isAllAnswered = useCallback((): boolean => {
    return questions.every((q) => {
      const answer = answers[q.id];
      if (answer === undefined) return false;
      if (q.type === "multi_select") {
        return (answer as string[]).length > 0;
      }
      return true;
    });
  }, [questions, answers]);

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: QuestionAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Navigation
  const goToNext = useCallback(() => {
    setDirection(1);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (isAllAnswered()) {
      onSubmit(answers);
    }
  }, [currentIndex, totalQuestions, isAllAnswered, answers, onSubmit]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      // On first question, cancel goes back to discovery
      onCancel();
    }
  }, [currentIndex, onCancel]);

  // Progress percentage (starts at question 1)
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  // Animation variants for slide transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.background }}
      dir="rtl"
    >
      {/* Header with progress */}
      <motion.header
        initial={shouldAnimate ? { opacity: 0, y: -20 } : false}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-[#E8E4DF]"
      >
        <div className="max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-3 sm:py-4">
          {/* Top row: Close button, Title, Progress text */}
          <div className="flex items-center justify-between mb-3">
            {/* Close/Back button */}
            <button
              onClick={goToPrevious}
              className="w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#6B6560] hover:bg-[#E8E4DF] transition-colors"
            >
              {currentIndex === 0 ? (
                <X className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5 rotate-180" />
              )}
            </button>

            {/* Title with icon */}
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-[#C97C5D]" />
              <span className="font-bold text-[#2D2A26]">
                نظرسنجی سلیقه خانه
              </span>
            </div>

            {/* Progress text */}
            <div className="text-sm text-[#6B6560]">
              <span>
                {currentIndex + 1} از {totalQuestions}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#E8E4DF] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${colors.terracotta}, ${colors.sage})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.header>

      {/* Main content area - Questions shown one at a time */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 overflow-y-auto"
          >
            {currentQuestion && (
              <DiscoveryQuestion
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onChange={handleAnswerChange}
                onNext={goToNext}
                onPrevious={goToPrevious}
                canGoBack={currentIndex > 0}
                isLast={currentIndex === totalQuestions - 1}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer: Submit button on last question when answered */}
      <AnimatePresence>
        {currentIndex === totalQuestions - 1 &&
          answers[questions[currentIndex]?.id] !== undefined && (
            <motion.footer
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="sticky bottom-0 z-20 bg-white border-t border-[#E8E4DF] p-4"
            >
              <div className="max-w-xs sm:max-w-sm md:max-w-2xl mx-auto px-2 sm:px-0">
                <button
                  onClick={() => onSubmit(answers)}
                  className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-full font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3"
                  style={{
                    background: 'linear-gradient(90deg, #C97C5D, #8A9A5B)',
                    color: '#FFFFFF',
                  }}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>دریافت پیشنهادات شخصی‌سازی شده</span>
                </button>
              </div>
            </motion.footer>
          )}
      </AnimatePresence>

      {/* Skip/Cancel buttons when not on last answered question */}
      {!(
        currentIndex === totalQuestions - 1 &&
        answers[questions[currentIndex]?.id] !== undefined
      ) && (
          <div className="sticky bottom-0 z-10 bg-[#FAF7F4] border-t border-[#E8E4DF] p-3 sm:p-4">
            <div className="max-w-xs sm:max-w-sm md:max-w-2xl mx-auto flex items-center justify-between px-2 sm:px-0">
              {/* Skip button for optional questions */}
              <button
                onClick={goToNext}
                className="text-sm text-[#A69F98] hover:text-[#6B6560] transition-colors"
              >
                رد کردن
              </button>

              {/* Cancel button */}
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[#6B6560] hover:bg-[#F5F0E8] transition-colors"
              >
                <X className="w-4 h-4" />
                <span>انصراف</span>
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
