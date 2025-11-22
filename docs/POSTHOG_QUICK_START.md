# PostHog Quick Start - 5 Minutes ⚡

## 1. Get API Key (2 min)
1. Go to: https://app.posthog.com/signup
2. Sign up (free, no credit card)
3. Copy API key (starts with `phc_`)

## 2. Add to .env (1 min)
```bash
VITE_PUBLIC_POSTHOG_KEY=phc_paste_your_key_here
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## 3. Restart Server (1 min)
```bash
npm run dev
```

## 4. Verify (1 min)
Open browser console, look for:
```
[PostHog] Initialized successfully
```

## 5. Test Events
1. Click around the app
2. Go to: https://app.posthog.com
3. Click "Activity" - see events in real-time! 🎉

## What You Get

✅ **Every user action tracked automatically**
- Product selections
- Image uploads
- Purchase clicks
- User logins
- And 100+ more events

✅ **Session Replay**
- Watch user sessions
- Debug upload failures
- See exactly what users do

✅ **Feature Flags**
- A/B test new features
- Gradual rollouts
- No code deployments

✅ **User Analytics**
- Track user journeys
- Conversion funnels
- Retention analysis

## Zero Code Changes Required!

All your existing `trackKPI()` calls automatically send to PostHog.

```typescript
// This already works - no changes needed!
trackKPI('upload_start', { productId, fileSize });
```

## Free Tier Includes

- 1M events/month
- 5K session replays/month
- Unlimited feature flags
- 1 year data retention

## Need Help?

- Full Guide: `docs/POSTHOG_SETUP.md`
- Implementation Details: `docs/POSTHOG_IMPLEMENTATION_SUMMARY.md`
- PostHog Docs: https://posthog.com/docs

---

**That's it! You're done.** 🚀

Your app is now tracking events, users, and sessions automatically.
