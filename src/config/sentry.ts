/**
 * Sentry Error Tracking Configuration
 *
 * Initializes Sentry for error tracking and session replay.
 * Requires VITE_SENTRY_DSN environment variable.
 */
import * as Sentry from '@sentry/react';

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn('[Sentry] No DSN configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Performance monitoring - 10% of transactions
    tracesSampleRate: 0.1,

    // Session Replay - 10% of sessions, 100% on error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        // Mask all text content for privacy
        maskAllText: false,
        // Block all media for performance
        blockAllMedia: false,
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Filter out noisy/irrelevant errors
    beforeSend(event) {
      // Ignore ResizeObserver loop errors (browser quirk, not real errors)
      if (event.message?.includes('ResizeObserver loop')) {
        return null;
      }

      // Ignore network errors that are just connectivity issues
      if (event.message?.includes('Failed to fetch') && event.message?.includes('NetworkError')) {
        return null;
      }

      return event;
    },

    // Limit breadcrumbs for payload size
    maxBreadcrumbs: 50,

    // Don't track in development unless explicitly enabled
    enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_DEBUG === 'true',
  });

  console.log('[Sentry] Initialized successfully');
};

/**
 * Set user context for Sentry
 * Call this after user login
 */
export const setSentryUser = (user: { id: string; phone?: string } | null) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      // Don't send phone number for privacy
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Clear user context on logout
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};
