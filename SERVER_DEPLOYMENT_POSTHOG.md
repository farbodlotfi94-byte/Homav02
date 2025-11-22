# PostHog Production Deployment Fix

## Problem
PostHog works in development but fails in production with:
```
[PostHog.js] No `apiKey` or `client` were provided to `PostHogProvider`
[PostHog.js] PostHog was initialized without a token
```

## Root Cause
Environment variables (`VITE_PUBLIC_POSTHOG_KEY` and `VITE_PUBLIC_POSTHOG_HOST`) are not being passed to the Docker build process.

## Solution

### Step 1: Update Server Environment Variables

You need to set these environment variables on your server **BEFORE** building the Docker image.

#### Option A: Using Dokploy Dashboard

1. Go to your Dokploy dashboard
2. Select your `homav-frontend` project
3. Navigate to **Settings** → **Environment Variables**
4. Add these variables:

```
VITE_PUBLIC_POSTHOG_KEY=phc_5ie0tXqbc7I6IFfLeuhZg7FA6fMnyEu1SoaylZktoRp
VITE_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
```

5. Save and **Redeploy** your application

#### Option B: Using .env File on Server

If deploying manually with Docker Compose, create a `.env` file on your server:

```bash
# SSH into your server
ssh user@your-server

# Navigate to project directory
cd /path/to/Homav02

# Create/edit .env file
nano .env
```

Add these lines:
```bash
# API Configuration
VITE_API_BASE_URL=https://api.myhoma.ir
VITE_API_TIMEOUT=300000
VITE_API_IMAGE_PROCESSING_TIMEOUT=600000

# PostHog Configuration
VITE_PUBLIC_POSTHOG_KEY=phc_5ie0tXqbc7I6IFfLeuhZg7FA6fMnyEu1SoaylZktoRp
VITE_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
```

Save the file (Ctrl+X, Y, Enter)

### Step 2: Rebuild and Redeploy

#### Option A: Via Dokploy
1. Click **Redeploy** button in Dokploy dashboard
2. Monitor build logs to verify environment variables are passed

#### Option B: Manual Docker Compose
```bash
# Stop current container
docker-compose down

# Rebuild with new environment variables
docker-compose up -d --build

# Check logs
docker-compose logs -f homav-app
```

### Step 3: Verify Deployment

1. **Check build logs** for PostHog variables:
   ```
   VITE_PUBLIC_POSTHOG_KEY=phc_5ie...
   VITE_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
   ```

2. **Open your production site** in browser

3. **Check browser console** for:
   ```
   [PostHog] Initialized successfully
   ```
   
   Instead of:
   ```
   [PostHog.js] PostHog was initialized without a token
   ```

4. **Navigate your app** and trigger events

5. **Check PostHog dashboard**:
   - Go to https://eu.posthog.com
   - Your Project → Events → Live Events
   - You should see events within 30-60 seconds

## Files Modified

The following files have been updated to support PostHog in production:

1. **Dockerfile** (lines 14-18):
   ```dockerfile
   # PostHog environment variables
   ARG VITE_PUBLIC_POSTHOG_KEY
   ARG VITE_PUBLIC_POSTHOG_HOST
   ENV VITE_PUBLIC_POSTHOG_KEY=${VITE_PUBLIC_POSTHOG_KEY}
   ENV VITE_PUBLIC_POSTHOG_HOST=${VITE_PUBLIC_POSTHOG_HOST}
   ```

2. **docker-compose.yml** (lines 12-13):
   ```yaml
   args:
     - VITE_PUBLIC_POSTHOG_KEY=${VITE_PUBLIC_POSTHOG_KEY}
     - VITE_PUBLIC_POSTHOG_HOST=${VITE_PUBLIC_POSTHOG_HOST:-https://eu.posthog.com}
   ```

3. **DEPLOYMENT.md**:
   - Added PostHog environment variables to deployment guide

## Important Notes

### Why Environment Variables are Needed at Build Time

Vite bundles environment variables **at build time**, not runtime. This means:
- ✅ Variables must be available during `npm run build`
- ✅ Variables are baked into the JavaScript bundle
- ❌ You cannot change them after build without rebuilding

### Variable Naming Convention

- **VITE_** prefix: Required for Vite to include the variable in the bundle
- **PUBLIC_** infix: Indicates these are safe to expose in client-side code
- **POSTHOG_KEY** and **POSTHOG_HOST**: PostHog configuration

### Security Note

The PostHog API key (`phc_...`) is **safe to expose** in client-side code. It's designed to be public and only allows:
- ✅ Sending events to your PostHog project
- ❌ Cannot access or modify your PostHog data
- ❌ Cannot access other projects

## Troubleshooting

### Still seeing "no token" error?

1. **Check environment variables are set on server:**
   ```bash
   echo $VITE_PUBLIC_POSTHOG_KEY
   ```
   
2. **Verify build logs include variables:**
   ```bash
   docker-compose logs homav-app | grep POSTHOG
   ```

3. **Rebuild from scratch:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### PostHog events not appearing in dashboard?

1. **Check correct region:** Use https://eu.posthog.com (not app.posthog.com)
2. **Wait 60 seconds:** Events are batched
3. **Check browser console:** Look for network errors
4. **Verify API key:** Ensure it matches your PostHog project

### Network errors in production?

This is normal for Iran-based servers due to network restrictions:
- ✅ Core event tracking still works
- ⚠️ Some features may load slower (session replay, feature flags)
- ✅ Events are queued and sent when connection is available

## Next Steps

After deploying:
1. Monitor PostHog dashboard for incoming events
2. Set up custom events for key user actions
3. Configure feature flags if needed
4. Review session recordings (may require VPN in Iran)

## Support

- PostHog configuration: `src/config/posthog.ts`
- Docker configuration: `Dockerfile` and `docker-compose.yml`
- Full documentation: `docs/POSTHOG_FIXES.md`
