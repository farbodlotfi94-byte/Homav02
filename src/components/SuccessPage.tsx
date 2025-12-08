import { Button } from "./ui/button";
import { motion } from "motion/react";
import { CheckCircle, Sparkles } from "lucide-react";

interface SuccessPageProps {
  fileName: string;
  onContinue: () => void;
}

export function SuccessPage({ fileName, onContinue }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto px-6 py-6"
        >
          {/* Success Circle */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full aspect-square rounded-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center mb-6 relative"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3,
                type: "spring",
                stiffness: 200
              }}
              className="relative"
            >
              <CheckCircle className="w-32 h-32 text-green-500" strokeWidth={1.5} />
              
              {/* Sparkle decoration */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.5,
                  type: "spring",
                  stiffness: 200
                }}
                className="absolute -top-2 -left-2"
              >
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-gray-900 mb-3">عکس دریافت شد!</h1>
            <p className="text-gray-600 leading-relaxed mb-4">
              فایل شما با موفقیت بارگذاری شد. هوش مصنوعی ما در حال آماده‌سازی تبدیل‌های شگفت‌انگیز است. این معمولاً چند ثانیه طول می‌کشد.
            </p>
            
            {/* File name */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-gray-900 truncate">{fileName}</p>
            </div>
          </motion.div>

          {/* Processing Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-900 rounded-full"
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
              <p className="text-gray-700">هوش مصنوعی در حال پردازش...</p>
            </div>
            <p className="text-gray-600">لطفاً صبر کنید</p>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              onClick={onContinue}
              className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors"
            >
              مشاهده نتایج
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}