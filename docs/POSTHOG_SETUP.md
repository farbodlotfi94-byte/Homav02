# PostHog Analytics Integration Guide

This guide explains how PostHog analytics is integrated into the HOMA application and how to set it up.

## Overview

PostHog is a comprehensive product analytics platform that provides:

- **Event Tracking**: Automatic tracking of all user actions via existing `trackKPI()` calls
- **Session Replay**: Visual playback of user sessions to debug issues
- **Feature Flags**: A/B testing and gradual feature rollouts
- **User Analytics**: Track user journeys and conversion funnels
- **Privacy-First**: GDPR compliant, localStorage-based (no cookies by default)

## Quick Start

### 1. Create PostHog Account

1. Go to https://app.posthog.com/signup
2. Create a free account (1M events/month included)
3. Create a new project or use the default project
4. Copy your Project API Key (starts with `phc_`)

### 2. Configure Environment Variables

Add these variables to your `.env` file:

```bash
# PostHog Analytics (Optional - leave empty to disable)
VITE_PUBLIC_POSTHOG_KEY=phc_your_api_key_here
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Important**: If `VITE_PUBLIC_POSTHOG_KEY` is empty or not set, PostHog will be automatically disabled and all tracking calls will be no-ops.

### 3. Verify Installation

1. Start the development server: `npm run dev`
2. Open browser console
3. Look for: `[PostHog] Initialized successfully`
4. If you see `[PostHog] Disabled - No API key provided`, add your API key to `.env`

### 4. Test Event Tracking

1. Navigate through the app (select product, upload image, etc.)
2. Open PostHog dashboard: https://app.posthog.com
3. Go to "Activity" or "Events" tab
4. You should see events appearing in real-time

## Architecture

### File Structure

```
src/
├── config/
│   └── posthog.ts          # PostHog configuration and options
├── services/
│   └── posthog.ts          # PostHog service (singleton)
├── utils/
│   └── analytics.ts        # Analytics adapter (in-memory + PostHog)
└── main.tsx               # PostHog initialization
```

### Integration Flow

```
User Action
    ↓
trackKPI() in App.tsx
    ↓
trackAnalytics() in analytics.ts
    ↓
analytics.track() → posthogService.track()
    ↓
PostHog Dashboard
```

### Key Features

#### 1. Zero Breaking Changes

All existing `trackKPI()` calls automatically send events to PostHog:

```typescript
// This works exactly the same, but now also sends to PostHog
trackKPI('upload_start', {
  productId: product.id,
  fileSize: file.size,
});
```

#### 2. User Identification

Users are automatically identified when they log in:

```typescript
// In handleAuthSuccess()
identifyUser({
  id: authData.user.id,
  phone: authData.user.phone_number,
  name: authData.user.name,
  created_at: authData.user.created_at,
});
```

#### 3. Automatic Pageview Tracking

Pageviews are tracked when the route changes:

```typescript
// In App.tsx
useEffect(() => {
  capturePageview(location.pathname + location.search);
}, [location]);
```

#### 4. Session Reset on Logout

User identity is reset when they log out:

```typescript
// In handleLogout()
resetUser();
```

## Available Analytics Functions

Import from `src/utils/analytics.ts`:

```typescript
import {
  trackEvent,           // Track custom events
  identifyUser,         // Identify logged-in user
  resetUser,           // Reset user on logout
  capturePageview,     // Track pageviews
  getFeatureFlag,      // Get feature flag value
  isFeatureEnabled,    // Check if feature is enabled
} from './utils/analytics';
```

### Examples

```typescript
// Track custom event
trackEvent('button_clicked', {
  button_name: 'share',
  product_id: product.id
});

// Identify user
identifyUser({
  id: '123',
  phone: '09123456789',
  name: 'علی رضایی',
});

// Check feature flag
if (isFeatureEnabled('new-upload-flow')) {
  // Show new upload UI
}

// Get feature flag value (for multivariate tests)
const variant = getFeatureFlag('upload-button-color'); // 'blue' | 'green' | 'red'
```

## PostHog Dashboard

### Viewing Events

1. Go to https://app.posthog.com
2. Navigate to **Activity** or **Events**
3. Filter by event name (e.g., `upload_start`, `user_authenticated`)
4. View event properties and metadata

### Session Replay

1. Navigate to **Recordings**
2. Click on any session to watch playback
3. Use filters to find specific issues (e.g., failed uploads)
4. All input fields are masked for privacy

### Feature Flags

1. Navigate to **Feature Flags**
2. Click **New Feature Flag**
3. Set rollout percentage (0-100%)
4. Use in code with `isFeatureEnabled('flag-name')`

### Funnels & Insights

1. Navigate to **Insights**
2. Create funnels (e.g., product_select → upload_start → upload_success)
3. Track conversion rates
4. Identify drop-off points

## Privacy & GDPR Compliance

### Current Configuration

- **Storage**: localStorage (no cookies by default)
- **Input Masking**: All input fields masked in session replays
- **Respect DNT**: Honors Do Not Track browser setting
- **Opt-out**: Users can opt-out via browser settings

### Sensitive Data Sanitization

Passwords, emails, and phone numbers are automatically removed:

```typescript
// In posthog.ts config
sanitize_properties: (properties: any) => {
  const { password, email, phone, ...safe } = properties;
  return safe;
}
```

### Disable PostHog

To completely disable PostHog:

1. Remove or comment out `VITE_PUBLIC_POSTHOG_KEY` from `.env`
2. All PostHog calls become no-ops
3. In-memory analytics still works

## Advanced Features

### Session Recording Control

```typescript
import { posthogService } from './services/posthog';

// Start recording manually
posthogService.startRecording();

// Stop recording
posthogService.stopRecording();
```

### Debug Mode

Enable in development:

```typescript
// In browser console
posthog.debug(true);
```

Or programmatically:

```typescript
import { posthogService } from './services/posthog';
posthogService.debug(true);
```

### Custom User Properties

```typescript
import { posthogService } from './services/posthog';

posthogService.setPersonProperties({
  plan: 'premium',
  signup_date: '2024-01-15',
  preferred_language: 'fa',
});
```

## Troubleshooting

### Events Not Appearing

1. Check browser console for `[PostHog] Initialized successfully`
2. Verify API key in `.env` starts with `phc_`
3. Check network tab for requests to `app.posthog.com`
4. Ensure ad blockers aren't blocking PostHog

### Session Replays Not Recording

1. Check PostHog project settings
2. Verify `disable_session_recording: false` in config
3. Session replays have a sampling rate (check dashboard)

### Feature Flags Not Working

1. Feature flags require PostHog to load completely
2. Use `posthog.onFeatureFlags()` callback for flag-dependent logic
3. Check flag is enabled in PostHog dashboard

## Performance

### Bundle Size Impact

- **posthog-js**: ~52 KB (gzipped)
- **Session replay**: Lazy loaded (~40 KB)
- **Total impact**: <100 KB

### Network Usage

- Events are batched (multiple events per request)
- Typical event size: 1-5 KB
- Session replay: 50-200 KB per session

### Page Load Impact

- PostHog initializes asynchronously
- Minimal impact on Time to Interactive (<50ms)
- Session replay starts after page load

## Cost & Limits

### Free Tier (No Credit Card Required)

- **Events**: 1M events/month
- **Session Recordings**: 5,000 recordings/month
- **Data Retention**: 1 year
- **Feature Flags**: Unlimited

### Monitoring Usage

1. Go to https://app.posthog.com/organization/billing
2. View current usage
3. Set usage alerts
4. Upgrade if needed

## Migration Path

### Phase 1: Dual Tracking (Current)

✅ Events sent to both in-memory analytics AND PostHog
✅ No breaking changes
✅ Easy rollback

### Phase 2: PostHog Primary (Future)

- Migrate to PostHog as primary analytics
- Remove in-memory tracking
- Use PostHog API for admin dashboard

### Phase 3: Advanced Features (Future)

- Add consent banner for GDPR
- Enable experiments (A/B tests)
- Set up custom dashboards
- Integrate with backend analytics

## Support & Resources

- **PostHog Docs**: https://posthog.com/docs
- **React Integration**: https://posthog.com/docs/libraries/react
- **API Reference**: https://posthog.com/docs/api
- **Community Slack**: https://posthog.com/slack

## Example Events in HOMA

Common events tracked:

```typescript
// Product selection
trackKPI('product_selected', { productId, productName });

// Upload flow
trackKPI('upload_start', { productId, fileSize });
trackKPI('precheck_pass', { productId });
trackKPI('upload_success', { productId, processingTime });

// Visualization
trackKPI('view_result', { productId });
trackKPI('click_purchase', { productId });

// User actions
trackKPI('user_authenticated', { userId, phone });
trackKPI('user_logout', { productId });
```

All these events appear in PostHog with full metadata and user context.
