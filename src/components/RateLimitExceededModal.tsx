/**
 * Rate Limit Exceeded Modal
 * Shown when user hits 429 error (5 uploads per hour exceeded)
 * Displays countdown timer in Persian until reset
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { rateLimitService } from '../services/rateLimitService';

interface RateLimitExceededModalProps {
  open: boolean;
  onClose: () => void;
  resetAt: number; // Unix timestamp
}

export function RateLimitExceededModal({
  open,
  onClose,
  resetAt,
}: RateLimitExceededModalProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Update countdown every second
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = resetAt - now;

      if (remaining <= 0) {
        setTimeLeft('اکنون می‌توانید دوباره تلاش کنید!');
        setCanRetry(true);
        clearInterval(interval);
      } else {
        setTimeLeft(rateLimitService.calculateResetTime(resetAt));
        setCanRetry(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [open, resetAt]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="text-7xl mb-4">⏱️</div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            محدودیت روزانه به پایان رسید
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            شما امروز 5 بار از سیستم استفاده کرده‌اید
          </p>

          {/* Countdown Box */}
          <div className="bg-gray-100 rounded-xl p-6 mb-6">
            <div className="text-sm text-gray-600 mb-2">بازنشانی در</div>
            <div
              className={`text-3xl font-bold ${canRetry ? 'text-green-600' : 'text-gray-900'}`}
            >
              {timeLeft}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {canRetry ? (
              <button
                onClick={onClose}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                امتحان دوباره
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                بازگشت به محصولات
              </button>
            )}
          </div>

          {/* Info Text */}
          <p className="text-xs text-gray-500 mt-6">
            برای استفاده بیشتر، لطفاً کمی صبر کنید یا دوباره مراجعه فرمایید
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
