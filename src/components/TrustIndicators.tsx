import { Shield, Users, Zap, Lock } from "lucide-react";
import { motion } from "motion/react";

const trustItems = [
  { icon: Shield, label: "امن و خصوصی", value: "100%" },
  { icon: Users, label: "کاربران راضی", value: "+10K" },
  { icon: Zap, label: "پردازش سریع", value: "<5s" },
  { icon: Lock, label: "داده محافظت‌شده", value: "256-bit" }
];

export function TrustIndicators() {
  return (
    <div className="grid grid-cols-2 gap-3 px-6 py-4">
      {trustItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="flex items-center gap-2 bg-gray-50 rounded-2xl p-3 border border-gray-100"
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100">
            <item.icon className="w-4 h-4 text-gray-700" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900">{item.value}</p>
            <p className="text-gray-500 truncate">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
