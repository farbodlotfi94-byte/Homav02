# PostHog Quick Fix Guide

## Problem
PostHog is initialized but events are not showing in dashboard.

## Root Cause
1. Wrong API region (US instead of EU)
2. Network blocking in Iran
3. External scripts being blocked by CORS

## Solution (3 Steps)

### Step 1: Update Your .env File

Add these lines to `/home/amirhossein/Desktop/projects/Homav02/.env`:

```bash
VITE_PUBLIC_POSTHOG_KEY=phc_5ie0tXqbc7I6IFfLeuhZg7FA6fMnyEu1SoaylZktoRp
VITE_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
VITE_ENABLE_POSTHOG_IN_DEV=true
```

### Step 2: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 3: Verify

1. Open browser console
2. Look for: `[PostHog] Initialized successfully`
3. Navigate around your app
4. Check PostHog dashboard at: https://eu.posthog.com
5. Go to: Your Project → Events → Live Events

## What Was Fixed in Code

✅ Changed API host from US to EU (`src/config/posthog.ts`)
✅ Added reverse proxy for dev mode (`vite.config.ts`)
✅ Disabled external script loading
✅ Disabled autocapture to prevent CORS errors

## Files Modified

- `src/config/posthog.ts` - Updated PostHog configuration
- `vite.config.ts` - Added proxy for `/posthog` path
- `docs/POSTHOG_FIXES.md` - Full documentation

## Need More Help?

Read the full guide: `docs/POSTHOG_FIXES.md`
