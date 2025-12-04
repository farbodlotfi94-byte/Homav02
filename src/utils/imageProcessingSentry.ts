/**
 * Image Processing Sentry Tracking
 *
 * Specialized error tracking for the image processing flow.
 * Adds breadcrumbs and context for better debugging.
 */
import * as Sentry from '@sentry/react';

export interface ProcessingContext {
  productId: number;
  fileName: string;
  fileSize: number;
  sessionId?: string;
  uniqueLink?: string;
}

export interface ProcessingSuccessContext {
  processingTime: number;
  imageId: number;
  imagePath: string;
}

export interface ProcessingErrorContext {
  step: string;
  productId?: number;
  fileName?: string;
  fileSize?: number;
  processingTime?: number;
  retryCount?: number;
  errorMessage?: string;
}

/**
 * Image Processing Sentry Scope
 *
 * Provides methods to track the image processing flow in Sentry.
 */
export const ImageProcessingScope = {
  /**
   * Track image processing start
   * Call at the beginning of processImageWithAI()
   */
  startProcessing: (context: ProcessingContext) => {
    Sentry.addBreadcrumb({
      category: 'image-processing',
      message: 'Started image processing',
      level: 'info',
      data: {
        productId: context.productId,
        fileName: context.fileName,
        fileSize: context.fileSize,
        sessionId: context.sessionId,
      },
    });

    // Set context for all subsequent errors in this flow
    Sentry.setContext('image_processing', {
      ...context,
      startedAt: new Date().toISOString(),
    });

    // Set tags for filtering
    Sentry.setTag('flow', 'image_processing');
    Sentry.setTag('product_id', String(context.productId));
  },

  /**
   * Track a processing step
   * Call at each major step in the processing pipeline
   */
  trackStep: (step: string, data?: Record<string, unknown>) => {
    Sentry.addBreadcrumb({
      category: 'image-processing',
      message: step,
      level: 'info',
      data: data || {},
    });
  },

  /**
   * Track processing success
   * Call when processing completes successfully
   */
  trackSuccess: (context: ProcessingSuccessContext) => {
    Sentry.addBreadcrumb({
      category: 'image-processing',
      message: 'Processing completed successfully',
      level: 'info',
      data: {
        processingTimeMs: context.processingTime,
        imageId: context.imageId,
        imagePath: context.imagePath,
      },
    });

    // Clear the processing context
    Sentry.setContext('image_processing', null);
    Sentry.setTag('flow', '');
    Sentry.setTag('product_id', '');
  },

  /**
   * Track processing error
   * Call when an error occurs during processing
   */
  trackError: (error: Error, context: ProcessingErrorContext) => {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'image_processing');
      scope.setTag('processing_step', context.step);
      scope.setLevel('error');

      scope.setContext('image_processing_error', {
        step: context.step,
        productId: context.productId,
        fileName: context.fileName,
        fileSize: context.fileSize,
        processingTimeMs: context.processingTime,
        retryCount: context.retryCount,
        errorMessage: context.errorMessage || error.message,
      });

      // Add fingerprint for better grouping
      scope.setFingerprint(['image-processing', context.step, error.name]);

      Sentry.captureException(error);
    });

    // Clear the processing context after error
    Sentry.setContext('image_processing', null);
    Sentry.setTag('flow', '');
    Sentry.setTag('product_id', '');
  },

  /**
   * Track rate limit (429) error
   * Call when the API returns a rate limit response
   */
  trackRateLimit: (retryAfter: number, message: string) => {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'rate_limit');
      scope.setLevel('warning');

      scope.setContext('rate_limit', {
        retryAfter,
        message,
        occurredAt: new Date().toISOString(),
      });

      Sentry.captureMessage('Image processing rate limited', 'warning');
    });
  },

  /**
   * Track API error (non-rate-limit)
   * Call when the API returns an error response
   */
  trackApiError: (
    status: number,
    message: string,
    context?: Record<string, unknown>
  ) => {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'api_error');
      scope.setTag('http_status', String(status));
      scope.setLevel(status >= 500 ? 'error' : 'warning');

      scope.setContext('api_error', {
        status,
        message,
        ...context,
      });

      Sentry.captureMessage(`Image processing API error: ${status}`, status >= 500 ? 'error' : 'warning');
    });
  },

  /**
   * Track authentication error
   * Call when token refresh fails or auth is required
   */
  trackAuthError: (message: string) => {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'auth_error');
      scope.setLevel('warning');

      Sentry.captureMessage(`Image processing auth error: ${message}`, 'warning');
    });
  },

  /**
   * Track network/timeout error
   * Call when there's a network failure or timeout
   */
  trackNetworkError: (error: Error, timeoutMs?: number) => {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'network_error');
      scope.setLevel('error');

      scope.setContext('network_error', {
        errorName: error.name,
        errorMessage: error.message,
        timeoutMs,
        isTimeout: error.name === 'AbortError',
      });

      Sentry.captureException(error);
    });
  },
};

export default ImageProcessingScope;
