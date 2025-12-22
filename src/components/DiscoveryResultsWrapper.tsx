/**
 * DiscoveryResultsWrapper Component
 *
 * Wrapper for DiscoveryResults that handles URL-based session loading.
 * Enables session persistence across page refreshes and sharing.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { DiscoveryResults } from './DiscoveryResults';
import { fetchDiscoverySession } from '../utils/discoveryProcessor';
import type { DiscoveryResult, ProductRecommendation } from '../types/discovery';

interface DiscoveryResultsWrapperProps {
  cachedResult: DiscoveryResult | null;
  onRetry: () => void;
  onBackToShops: () => void;
  onProductClick: (product: ProductRecommendation) => void;
  onShare: () => void;
  onSave: () => void;
  onResultLoaded: (result: DiscoveryResult) => void;
}

export function DiscoveryResultsWrapper({
  cachedResult,
  onRetry,
  onBackToShops,
  onProductClick,
  onShare,
  onSave,
  onResultLoaded,
}: DiscoveryResultsWrapperProps) {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<DiscoveryResult | null>(cachedResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have cached result, use it
    if (cachedResult) {
      setResult(cachedResult);
      setError(null);
      // Update URL to include sessionId if not present
      if (sessionId !== cachedResult.sessionId) {
        navigate(`/discovery/results/${cachedResult.sessionId}`, { replace: true });
      }
      return;
    }

    // If no cached result but have sessionId in URL, fetch from backend
    if (sessionId && !cachedResult) {
      setLoading(true);
      setError(null);

      fetchDiscoverySession(sessionId)
        .then((response) => {
          if (response.success && response.result) {
            setResult(response.result);
            onResultLoaded(response.result);
          } else {
            setError(response.error || 'جلسه یافت نشد');
          }
        })
        .catch((err) => {
          console.error('[DiscoveryResultsWrapper] Fetch error:', err);
          setError('خطا در بارگذاری نتایج');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [sessionId, cachedResult, navigate, onResultLoaded]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-6"
        >
          <div className="animate-spin w-10 h-10 border-3 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">در حال بارگذاری نتایج...</p>
        </motion.div>
      </div>
    );
  }

  // Error or no result state
  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-6"
        >
          <div className="text-4xl mb-4">😕</div>
          <p className="text-gray-600 mb-4">{error || 'نتیجه‌ای موجود نیست'}</p>
          <button
            onClick={() => navigate('/discovery')}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            شروع مجدد
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <DiscoveryResults
      result={result}
      onRetry={onRetry}
      onBackToShops={onBackToShops}
      onProductClick={onProductClick}
      onShare={onShare}
      onSave={onSave}
    />
  );
}
