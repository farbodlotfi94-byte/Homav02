import { Button } from "./ui/button";
import { motion } from "motion/react";
import { Download, Share2, RotateCcw, Palette, ShoppingBag, ChevronLeft } from "lucide-react";

interface VisualizationPreviewProps {
  fileName: string;
  onSave: () => void;
  onShare: () => void;
  onTryAnother: () => void;
  onStyleQuiz: () => void;
  onShopMatches: () => void;
}

export function VisualizationPreview({
  fileName,
  onSave,
  onShare,
  onTryAnother,
  onStyleQuiz,
  onShopMatches
}: VisualizationPreviewProps) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h3 className="text-gray-900">نتیجه</h3>
          <button 
            onClick={onShare}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <Share2 className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Preview Image */}
        <div className="px-6 pb-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full aspect-square rounded-3xl bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 mb-4 relative overflow-hidden"
          >
            {/* Placeholder for actual image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-gray-700">تصویر تبدیل‌شده شما</p>
                <p className="text-gray-500 mt-1">{fileName}</p>
              </div>
            </div>
            
            {/* Quality badge */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
              <p className="text-gray-900">کیفیت HD</p>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-gray-900 mb-2">تبدیل کامل شد! 🎉</h2>
            <p className="text-gray-600 leading-relaxed">
              هوش مصنوعی ما تصویر شما را تحلیل و بهینه‌سازی کرد. حالا می‌توانید آن را ذخیره، به اشتراک بگذارید یا سبک‌های دیگر را امتحان کنید.
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <Button
              onClick={onSave}
              className="h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              ذخیره
            </Button>
            
            <Button
              onClick={onShare}
              variant="outline"
              className="h-14 border-gray-300 text-gray-900 hover:bg-gray-50 rounded-2xl flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              اشتراک
            </Button>
          </motion.div>

          {/* Additional Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-3"
          >
            <button
              onClick={onTryAnother}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                  <RotateCcw className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-right">
                  <h4 className="text-gray-900">عکس دیگری امتحان کنید</h4>
                  <p className="text-gray-500">بارگذاری تصویر جدید</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={onStyleQuiz}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl transition-colors border border-purple-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-purple-200">
                  <Palette className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-right">
                  <h4 className="text-gray-900">آزمون سبک طراحی</h4>
                  <p className="text-gray-500">سبک خود را کشف کنید</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-purple-400" />
            </button>

            <button
              onClick={onShopMatches}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 rounded-2xl transition-colors border border-orange-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-orange-200">
                  <ShoppingBag className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-right">
                  <h4 className="text-gray-900">خرید محصولات مشابه</h4>
                  <p className="text-gray-500">پیشنهادات ویژه</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-orange-400" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}