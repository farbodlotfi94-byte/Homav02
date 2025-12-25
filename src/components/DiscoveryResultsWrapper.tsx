/**
 * DiscoverySessionPage Component (formerly DiscoveryResultsWrapper)
 *
 * Unified page component for discovery sessions.
 * Handles ALL session states based on backend status:
 * - questions_ready → shows questionnaire
 * - analyzing/generating/matching → shows processing view with polling
 * - ready → shows results
 * - error → shows error with retry
 *
 * Enables session persistence across page refreshes and sharing.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { DiscoveryResults } from './DiscoveryResults';
import { DiscoveryQuestionnaire } from './discovery';
import { DiscoveryProcessing, type ProcessingStep } from './DiscoveryProcessing';
import { fetchDiscoverySession, submitDiscoveryAnswers } from '../utils/discoveryProcessor';
import type { DiscoveryResult, DiscoveryResultWithQuestions, ProductRecommendation, DiscoveryQuestionsPayload, DiscoveryAnswers } from '../types/discovery';

// Session states for UI rendering
type SessionState = 'loading' | 'questions' | 'processing' | 'results' | 'error';

// Map backend status to processing step
function mapStatusToProcessingStep(status: string): ProcessingStep {
  switch (status) {
    case 'pending':
      return 'upload';
    case 'analyzing':
      return 'analysis';
    case 'questions_ready':
      return 'questions';
    case 'generating':
      return 'generation';
    case 'matching':
      return 'matching';
    default:
      return 'analysis';
  }
}

interface DiscoverySessionPageProps {
  cachedResult: DiscoveryResult | null;
  onRetry: () => void;
  onBackToShops: () => void;
  onProductClick: (product: ProductRecommendation) => void;
  onShare: () => void;
  onSave: () => void;
  onResultLoaded: (result: DiscoveryResult) => void;
  onQuestionsReady?: (questions: DiscoveryQuestionsPayload, sessionId: string) => void;
  onAnswersSubmit?: (sessionId: string, answers: DiscoveryAnswers) => void;
}

// Keep old export name for backwards compatibility
export { DiscoverySessionPage as DiscoveryResultsWrapper };

// Also export with descriptive name
export { DiscoverySessionPage };

function DiscoverySessionPage({
  cachedResult,
  onRetry,
  onBackToShops,
  onProductClick,
  onShare,
  onSave,
  onResultLoaded,
  onQuestionsReady,
}: DiscoverySessionPageProps) {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  // UI state
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [result, setResult] = useState<DiscoveryResult | null>(cachedResult);
  const [error, setError] = useState<string | null>(null);
  const [questionsData, setQuestionsData] = useState<DiscoveryQuestionsPayload | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('analysis');
  const [backendStatus, setBackendStatus] = useState<string>('');

  // Refs to prevent infinite loops
  const fetchedSessionIdRef = useRef<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const onResultLoadedRef = useRef(onResultLoaded);
  const onQuestionsReadyRef = useRef(onQuestionsReady);

  // Keep refs updated
  useEffect(() => {
    onResultLoadedRef.current = onResultLoaded;
    onQuestionsReadyRef.current = onQuestionsReady;
  });

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Fetch session and handle state
  const fetchSession = useCallback(async (sid: string) => {
    try {
      const response = await fetchDiscoverySession(sid);

      if (!response.success) {
        setError(response.error || 'جلسه یافت نشد');
        setSessionState('error');
        return;
      }

      if (!response.result) {
        setError('نتیجه‌ای موجود نیست');
        setSessionState('error');
        return;
      }

      // Check session status from result
      const status = response.result.status || '';
      setBackendStatus(status);
      console.log('[DiscoverySessionPage] Session status:', status);

      // Handle questions_ready state
      if (response.waitingForAnswers && (response.result as DiscoveryResultWithQuestions).discoveryQuestions) {
        const questionsResult = response.result as DiscoveryResultWithQuestions;
        console.log('[DiscoverySessionPage] Questions ready:', {
          sessionId: questionsResult.sessionId,
          questionCount: questionsResult.discoveryQuestions?.questions?.length || 0,
        });
        setQuestionsData(questionsResult.discoveryQuestions!);
        setSessionState('questions');
        onQuestionsReadyRef.current?.(questionsResult.discoveryQuestions!, questionsResult.sessionId);
        // Stop polling if running
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        return;
      }

      // Handle ready state
      if (status === 'ready') {
        setResult(response.result);
        setSessionState('results');
        onResultLoadedRef.current(response.result);
        // Stop polling if running
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        return;
      }

      // Handle failed state
      if (status === 'failed') {
        setError('پردازش با خطا مواجه شد');
        setSessionState('error');
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        return;
      }

      // Handle processing states (pending, analyzing, generating, matching)
      setProcessingStep(mapStatusToProcessingStep(status));
      setSessionState('processing');

      // Start polling if not already
      if (!pollingRef.current) {
        console.log('[DiscoverySessionPage] Starting polling for session:', sid);
        pollingRef.current = setInterval(() => {
          fetchSession(sid);
        }, 3000); // Poll every 3 seconds
      }
    } catch (err) {
      console.error('[DiscoverySessionPage] Fetch error:', err);
      setError('خطا در بارگذاری');
      setSessionState('error');
    }
  }, []);

  // Initial fetch on mount or sessionId change
  useEffect(() => {
    // If we have cached result, use it
    if (cachedResult) {
      setResult(cachedResult);
      setSessionState('results');
      setError(null);
      setQuestionsData(null);
      fetchedSessionIdRef.current = null;
      // Update URL if needed
      if (sessionId !== cachedResult.sessionId) {
        navigate(`/discovery/${cachedResult.sessionId}`, { replace: true });
      }
      return;
    }

    // Fetch session if we have a sessionId and haven't fetched it yet
    if (sessionId && fetchedSessionIdRef.current !== sessionId) {
      fetchedSessionIdRef.current = sessionId;
      setSessionState('loading');
      fetchSession(sessionId);
    }
  }, [sessionId, cachedResult, navigate, fetchSession]);

  // Handle questionnaire submission
  const handleAnswersSubmit = useCallback(async (answers: DiscoveryAnswers) => {
    if (!sessionId) return;

    console.log('[DiscoverySessionPage] Submitting answers for session:', sessionId);
    setSessionState('processing');
    setProcessingStep('generation'); // After answers, we go to generation step

    try {
      const response = await submitDiscoveryAnswers(sessionId, answers);

      if (!response.success) {
        // Handle submission error
        console.error('[DiscoverySessionPage] Answer submit failed:', response.error);
        if (response.requiresLogin) {
          setError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید');
        } else {
          setError(response.error || 'خطا در ارسال پاسخ‌ها');
        }
        setSessionState('error');
        return;
      }

      // Answers submitted successfully, start polling for results
      console.log('[DiscoverySessionPage] Answers submitted, status:', response.status);
      fetchedSessionIdRef.current = null; // Allow re-fetch
      fetchSession(sessionId);
    } catch (err) {
      console.error('[DiscoverySessionPage] Answer submit error:', err);
      setError('خطا در ارسال پاسخ‌ها');
      setSessionState('error');
    }
  }, [sessionId, fetchSession]);

  // Loading state
  if (sessionState === 'loading') {
    return (
      <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-6"
        >
          <div className="animate-spin w-10 h-10 border-3 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">در حال بارگذاری...</p>
        </motion.div>
      </div>
    );
  }

  // Processing state - show processing UI with polling
  if (sessionState === 'processing') {
    return (
      <DiscoveryProcessing
        currentStep={processingStep}
        onCancel={() => {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          navigate('/discovery');
        }}
      />
    );
  }

  // Questions state - show questionnaire
  if (sessionState === 'questions' && questionsData) {
    return (
      <div className="min-h-screen bg-[#FAF7F4]" dir="rtl">
        <DiscoveryQuestionnaire
          questionsPayload={questionsData}
          onSubmit={handleAnswersSubmit}
          onCancel={() => navigate('/discovery')}
        />
      </div>
    );
  }

  // Error state
  if (sessionState === 'error' || error) {
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

  // Results state
  if (sessionState === 'results' && result) {
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

  // Fallback loading
  return (
    <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center" dir="rtl">
      <div className="animate-spin w-10 h-10 border-3 border-gray-300 border-t-gray-900 rounded-full" />
    </div>
  );
}
