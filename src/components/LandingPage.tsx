import { Button } from "./ui/button";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { BeforeAfterStrip } from "./BeforeAfterStrip";

interface LandingPageProps {
  onContinue: () => void;
  onShowTerms: () => void;
}

export function LandingPage({ onContinue, onShowTerms }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto px-6 py-6"
        >
          {/* Main Image Circle */}
          <div className="pb-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Heart icon */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
              >
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </motion.button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="pb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-gray-900 mb-3">هوم ویژن</h1>
              
              <div className="flex items-center gap-3 mb-4">
                <p className="text-gray-900">رایگان</p>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white shadow-sm" />
                  <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-white shadow-sm" />
                  <div className="w-6 h-6 rounded-full bg-stone-200 border-2 border-white shadow-sm" />
                </div>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                عکسی از اتاق یا خودتان بارگذاری کنید. هوش مصنوعی پیشرفته ما تبدیل‌های شگفت‌انگیز را در عرض چند ثانیه ایجاد می‌کند. این ابزار با طراحی ساده و مینیمال، یکی از بهترین‌هاست.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-3 mb-6"
            >
              <Button
                onClick={onContinue}
                className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors"
              >
                شروع کنید
              </Button>
              
              <button
                onClick={onShowTerms}
                className="w-full text-gray-500 hover:text-gray-700 transition-colors py-2"
              >
                حریم خصوصی و شرایط استفاده
              </button>
            </motion.div>
          </div>

          {/* Before/After Strip - KPI: Showcase value, reduce bounce */}
          <BeforeAfterStrip />
        </motion.div>
      </div>
    </div>
  );
}