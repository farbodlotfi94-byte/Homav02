// /home/amirhossein/Desktop/projects/Homav02/src/config/posthog.ts
export const POSTHOG_CONFIG = {
    API_KEY: import.meta.env.VITE_PUBLIC_POSTHOG_KEY || '', // set VITE_POSTHOG_KEY in .env
    OPTIONS: {
        // Use local proxy in dev to bypass network restrictions, direct in production
        api_host: import.meta.env.DEV
            ? (import.meta.env.VITE_PUBLIC_POSTHOG_HOST || '/posthog')
            : (import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com'),
        defaults: '2025-05-24', // ensure default feature flags date
        autocapture: false, // Disabled to prevent CORS issues with external scripts
        capture_pageview: false, // Manual pageview tracking via analytics.ts
        capture_pageleave: true,
        session_recording: {
            maskAllInputs: true,
            maskTextSelector: '*',
        },
        disable_external_dependency_loading: true, // Prevent loading external scripts (exception-autocapture.js, config.js)
        advanced_disable_decide: false, // Keep feature flags enabled
        debug: import.meta.env.DEV,
        persistence: 'localStorage+cookie',
        cross_subdomain_cookie: false,
        secure_cookie: true,
        loaded: (_posthog: any) => {
            console.log('[PostHog] Loaded callback triggered');
        },
    },
};

// debug: runtime visibility check
console.log(
    '[PostHog DEBUG] KEY=', import.meta.env.VITE_PUBLIC_POSTHOG_KEY,
    'HOST=', import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    'DEV=', import.meta.env.DEV
);

export const isPostHogEnabled = (): boolean => {
    // disable in dev unless explicitly enabled via env
    if (!POSTHOG_CONFIG.API_KEY) return false;
    if (import.meta.env.DEV) {
        // only enable in dev if you want noisy local events
        return import.meta.env.VITE_ENABLE_POSTHOG_IN_DEV === 'true';
    }
    return true;
};
