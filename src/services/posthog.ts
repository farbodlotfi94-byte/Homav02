/**
 * PostHog Analytics Service
 * Integration with PostHog for advanced analytics, session replay, and feature flags
 */

import posthog from 'posthog-js';
import { POSTHOG_CONFIG, isPostHogEnabled } from '../config/posthog';
import type { User } from '../types/auth';

class PostHogService {
  private initialized = false;
  private enabled = false;

  /**
   * Initialize PostHog
   */
  init() {
    if (this.initialized) {
      console.log('[PostHog] Already initialized');
      return;
    }

    if (!isPostHogEnabled()) {
      console.log('[PostHog] Disabled - No API key provided');
      this.enabled = false;
      return;
    }

    try {
      posthog.init(
        POSTHOG_CONFIG.API_KEY,
        {
          ...POSTHOG_CONFIG.OPTIONS,
          defaults: '2025-05-24',
        }
      );
      this.initialized = true;
      this.enabled = true;
      console.log('[PostHog] Initialized successfully', {
        host: POSTHOG_CONFIG.OPTIONS.api_host,
        environment: import.meta.env.MODE,
        note: 'Network errors from PostHog CDN are expected in Iran and can be safely ignored',
      });
    } catch (error) {
      console.error('[PostHog] Initialization failed:', error);
      this.enabled = false;
    }
  }

  /**
   * Track an event
   */
  track(event: string, properties?: Record<string, any>) {
    if (!this.enabled) {
      console.log('[PostHog] Track skipped - not enabled:', event);
      return;
    }

    try {
      posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: import.meta.env.MODE,
      });
      console.log('[PostHog] Event captured:', event);
    } catch (error) {
      console.error('[PostHog] Track error:', error);
    }
  }

  /**
   * Identify a user
   */
  identify(user: User) {
    if (!this.enabled) return;

    try {
      posthog.identify(user.id, {
        phone: user.phone,
        name: user.name,
        created_at: user.created_at,
      });
      console.log('[PostHog] User identified:', user.id);
    } catch (error) {
      console.error('[PostHog] Identify error:', error);
    }
  }

  /**
   * Reset user identity (on logout)
   */
  reset() {
    if (!this.enabled) return;

    try {
      posthog.reset();
      console.log('[PostHog] User reset');
    } catch (error) {
      console.error('[PostHog] Reset error:', error);
    }
  }

  /**
   * Track a page view
   */
  capturePageview(path?: string) {
    if (!this.enabled) return;

    try {
      posthog.capture('$pageview', {
        $current_url: path || window.location.href,
      });
    } catch (error) {
      console.error('[PostHog] Pageview error:', error);
    }
  }

  /**
   * Set user properties
   */
  setPersonProperties(properties: Record<string, any>) {
    if (!this.enabled) return;

    try {
      posthog.setPersonProperties(properties);
    } catch (error) {
      console.error('[PostHog] Set person properties error:', error);
    }
  }

  /**
   * Get feature flag value
   */
  getFeatureFlag(flag: string): boolean | string | undefined {
    if (!this.enabled) return undefined;

    try {
      return posthog.getFeatureFlag(flag);
    } catch (error) {
      console.error('[PostHog] Get feature flag error:', error);
      return undefined;
    }
  }

  /**
   * Check if feature flag is enabled
   */
  isFeatureEnabled(flag: string): boolean {
    if (!this.enabled) return false;

    try {
      return posthog.isFeatureEnabled(flag) || false;
    } catch (error) {
      console.error('[PostHog] Is feature enabled error:', error);
      return false;
    }
  }

  /**
   * Start session recording manually
   */
  startRecording() {
    if (!this.enabled) return;

    try {
      posthog.startSessionRecording();
      console.log('[PostHog] Session recording started');
    } catch (error) {
      console.error('[PostHog] Start recording error:', error);
    }
  }

  /**
   * Stop session recording manually
   */
  stopRecording() {
    if (!this.enabled) return;

    try {
      posthog.stopSessionRecording();
      console.log('[PostHog] Stop recording error:', error);
    } catch (error) {
      console.error('[PostHog] Stop recording error:', error);
    }
  }

  /**
   * Get distinct ID
   */
  getDistinctId(): string | undefined {
    if (!this.enabled) return undefined;

    try {
      return posthog.get_distinct_id();
    } catch (error) {
      console.error('[PostHog] Get distinct ID error:', error);
      return undefined;
    }
  }

  /**
   * Check if PostHog is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable debug mode
   */
  debug(enabled: boolean = true) {
    if (!this.enabled) return;

    try {
      if (enabled) {
        posthog.debug();
      }
    } catch (error) {
      console.error('[PostHog] Debug error:', error);
    }
  }

  /**
   * Get PostHog instance (for advanced usage)
   */
  getInstance() {
    if (!this.enabled) return null;
    return posthog;
  }
}

// Singleton instance
export const posthogService = new PostHogService();

// Note: Initialize explicitly in main.tsx to control initialization timing
