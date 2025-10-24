import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const beforeAfterExamples = [
  {
    id: 1,
    label: "اتاق خواب مدرن",
    before: "🏠",
    after: "✨"
  },
  {
    id: 2,
    label: "طراحی داخلی",
    before: "📦",
    after: "🎨"
  },
  {
    id: 3,
    label: "تبدیل سریع",
    before: "⏱️",
    after: "⚡"
  }
];

export function BeforeAfterStrip() {
  return (
    <div className="py-8 border-t border-gray-200">
      <div className="px-6">
        <p className="text-gray-600 text-start mb-6">نمونه تبدیل‌ها</p>
        
        <div className="grid grid-cols-3 gap-4">
          {beforeAfterExamples.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{example.before}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="text-2xl">{example.after}</span>
              </div>
              <p className="text-gray-500">{example.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}