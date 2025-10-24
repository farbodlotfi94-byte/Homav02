import { motion } from "motion/react";
import { Header } from "./Header";

interface AIProcessingStatusProps {
  stage: "uploading" | "analyzing" | "placing" | "complete";
  progress: number;
  productName?: string;
}

export function AIProcessingStatus({ stage, progress, productName }: AIProcessingStatusProps) {
  const getStageText = () => {
    switch (stage) {
      case "uploading":
        return "در حال آپلود تصویر...";
      case "analyzing":
        return "در حال تحلیل فضای شما...";
      case "placing":
        return `در حال قرار دادن ${productName || "محصول"}...`;
      case "complete":
        return "تکمیل شد!";
      default:
        return "در حال پردازش...";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton={false} />
      
      <div className="pt-14 flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md w-full">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stage Text */}
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground mb-4"
          >
            {getStageText()}
          </motion.p>

          {/* Loading Dots */}
          {stage !== "complete" && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Success Checkmark */}
          {stage === "complete" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}