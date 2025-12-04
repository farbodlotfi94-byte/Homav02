/**
 * Sentry Error Boundary Component
 *
 * Catches React component errors and reports them to Sentry.
 * Shows a user-friendly fallback UI when errors occur.
 */
import * as Sentry from '@sentry/react';
import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Fallback UI shown when a React error is caught
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          خطایی رخ داده است
        </h2>

        <p className="text-gray-600 mb-4">
          متاسفانه مشکلی در برنامه پیش آمده است. لطفا دوباره تلاش کنید.
        </p>

        {import.meta.env.DEV && (
          <details className="mb-4 text-left bg-gray-100 p-3 rounded text-sm">
            <summary className="cursor-pointer text-gray-700">
              Error Details (Dev Only)
            </summary>
            <pre className="mt-2 text-red-600 whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تلاش مجدد
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            بارگذاری مجدد صفحه
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * App Error Boundary wrapper
 * Wraps the entire app to catch any unhandled React errors
 */
export const AppErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} resetError={resetError} />
      )}
      onError={(error, componentStack) => {
        console.error('[App] Uncaught React error:', error);
        console.error('[App] Component stack:', componentStack);
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

/**
 * HOC to wrap individual components with error boundary
 */
export const withSentryErrorBoundary = Sentry.withErrorBoundary;

export default AppErrorBoundary;
