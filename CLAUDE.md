# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HOMA is a Persian/Farsi furniture visualization web application built with React, TypeScript, and Vite. The application has three main user flows:

1. **User Flow**: Customers browse shops, select products, authenticate via OTP, upload photos of their space, and see AI-generated visualizations of furniture in their environment
2. **Seller Flow**: Shop owners manage products, track analytics, and configure their storefronts via a dedicated dashboard at `/seller`
3. **Admin Flow**: System administrators manage prompts and view analytics at `/admin`

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production (output: build/)
npm run build

# Run tests (watch mode)
npm test

# Run tests once
npm run test:run

# Run tests with UI dashboard
npm run test:ui

# Docker deployment
docker-compose up -d --build
```

## Architecture Overview

### Application Flow (Step-Based State Machine)

The app follows a multi-step flow controlled by `currentStep` state in `src/App.tsx`:

1. **loading** → Initial shop/product data fetch
2. **shop-selection** → User selects from available shops (root view)
3. **product-selection** → User selects from products within a shop
4. **product-landing** → Product-aware landing page with CTA
5. **product-fallback** → Error state when product is unavailable/inactive
6. **user-auth** → OTP-based user authentication (login/register)
7. **upload** → User uploads/captures photo
8. **precheck** → Quality validation of uploaded image
9. **staged-upload** → 3-stage upload progress indicator
10. **confirmation** → Success state with HOMA branding
11. **visualization** → Display AI-processed result with product placement
12. **feedback** → Feedback survey between action and execution
13. **error** → Error recovery flow

### URL Routing Structure

```
/                                    → Shop selection (root)
/:shopName                           → Product listing for a shop
/:shopName/product/:uniqueLink       → Product detail page
/seller                              → Seller dashboard (lazy-loaded)
/admin                               → Admin dashboard (lazy-loaded)
/about-us                            → About page (SEO)
```

**URL Conventions:**
- Uses shop display name (not username) for user-friendly URLs
- Backend UUID `unique_link` for product identification
- Path parsing with `parseShopAndProductFromPath()` utility in `productLoader.ts`

### Backend API Integration

- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Configuration**: `src/config/api.ts`
- **API Client**: `src/services/api.ts` with timeout handling and retry logic
- **Image Processing**: `src/utils/aiImageProcessor.ts` handles AI backend calls

**Key API Endpoints:**
- `GET /api/shops/list/` - Fetch all shops
- `GET /api/products/` - Fetch all products (supports `?shop=` filter)
- `GET /api/products/{unique_link}/` - Fetch specific product
- `POST /api/products/{unique_link}/process/` - Process image with AI (multipart/form-data)
- `GET /api/products/images/{object_path}` - Serve images from MinIO
- `POST /api/products/vote/` - Submit user feedback

**User Auth Endpoints:**
- `POST /api/users/otp/phone-verify/send/` - Send OTP
- `POST /api/users/otp/phone-verify/verify/` - Verify OTP
- `POST /api/users/register/` - Register new user
- `POST /api/users/login/` - Login with phone + password
- `POST /api/users/token/refresh/` - Refresh access token
- `POST /api/users/logout/` - Logout user

### Image Processing Flow

1. User uploads image → `PhotoUpload` component
2. Quality validation → `FilePrecheck` component
3. Background API processing starts immediately
4. Upload with progress → `StagedUpload` component
5. API call to `/api/products/{unique_link}/process/` with FormData
6. Backend returns `customer_image_path` and `processed_image_path`
7. Display visualization → `ProductVisualization` component

**Timeout Configuration:**
- Standard API calls: 5 minutes (`VITE_API_TIMEOUT`)
- Image processing: 10 minutes (`VITE_API_IMAGE_PROCESSING_TIMEOUT`)
- Retry mechanism: Up to 2 retries with exponential backoff

**Rate Limiting:**
- 5 requests/hour per user for image processing
- Rate limit state persisted in localStorage via `rateLimitStorage.ts`

### State Management Patterns

- All state is managed in `src/App.tsx` using React hooks
- Component props for data flow (no Redux/Context)
- Analytics tracking via `trackKPI()` function for business metrics
- Session tracking with unique `sessionId` per user session
- User authentication state: `user`, `isAuthenticated`

### Key Components

**Main User Flow:**
- `ShopSelection` - Grid of available shops (root view)
- `ProductSelection` - Grid of available products with search/filtering
- `ProductAwareLanding` - Product landing page with upload CTA
- `OTPLogin` - Multi-step OTP authentication modal
- `PhotoUpload` - File picker and camera integration
- `FilePrecheck` - Image quality validation
- `StagedUpload` - 3-stage progress indicator
- `ProductVisualization` - Display AI-processed result with actions
- `FeedbackSurvey` - Collect user feedback (lazy-loaded)
- `ErrorRecovery` - Error recovery UI

**Seller Dashboard** (`/seller` route, located in `src/integrations/seller-dashboard/`):
- `SellerLogin` - Multi-step OTP-based authentication (phone verification → password setup)
- `SellerDashboard` - Overview with analytics and product stats
- `ProductsPage` - Product management (CRUD operations)
- `SettingsPage` - Shop profile and configuration
- Uses `sellerAuthService.ts` for authentication with automatic token refresh
- Includes comprehensive UI components in `src/integrations/seller-dashboard/components/ui/`

**Admin Panel** (accessible via `/admin` URL):
- `AdminDashboard` - Admin control center (lazy-loaded)
- `components/admin/` - Admin-specific components (products, analytics, Gemini prompt, Groq prompt)

**Shared UI Library:**
- `components/ui/` - Radix UI + shadcn/ui reusable components
- Tailwind CSS with Persian typography (Vazirmatn font)

## User Authentication

The app uses **OTP-based authentication** for end users:

### Authentication Flow
1. **Phone Entry**: User enters Iranian phone number (09XX, +989XX, 989XX formats)
2. **OTP Verification**: 6-digit OTP sent via SMS, auto-fill supported via WebOTP API
3. **Registration/Login**: New users set password, existing users login directly
4. **Token Storage**: JWT tokens stored in localStorage

**Key Service**: `src/services/userAuthService.ts`
- Stores tokens in localStorage (keys: `homa_user_access_token`, `homa_user_refresh_token`, `homa_user_data`)
- No clock-based auto-refresh (refreshes only on 401 response)
- Provides methods: `login()`, `register()`, `logout()`, `refreshToken()`, `checkAuth()`

**Key Utilities:**
- `phoneValidator.ts` - Phone normalization & validation
- `normalizeDigits.ts` - Persian to English digit conversion
- `otpValidator.ts` - OTP format validation
- `otpRateLimitStorage.ts` - OTP attempt limiting

## Environment Variables

Required in `.env` or build args:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.myhoma.ir
VITE_API_TIMEOUT=300000
VITE_API_IMAGE_PROCESSING_TIMEOUT=600000

# Analytics (PostHog)
VITE_PUBLIC_POSTHOG_KEY=
VITE_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
VITE_ENABLE_POSTHOG_IN_DEV=true
```

## Analytics & Error Tracking

**PostHog** (`src/services/posthog.ts`):
- Product analytics and user tracking
- Initialized in `main.tsx` before app render
- Configurable via environment variables

**Sentry** (`src/config/sentry.ts`):
- Error tracking and performance monitoring
- `AppErrorBoundary` component wraps the entire app
- Initialized in `main.tsx` before app render

## Docker Deployment

**Multi-stage Dockerfile:**
- **Builder stage**: Node 18 Alpine, npm build with env vars
- **Production stage**: Nginx Alpine serving static files
- Non-root user (nodejs:1001) for security

**Docker Compose:**
- Port mapping: `3000:80`
- Network: `homav-network`
- Health checks enabled
- Environment variables passed as build args

**Deployment with Dokploy:**
See `DEPLOYMENT.md` for detailed Dokploy deployment instructions.

## Code Conventions

### TypeScript Strict Mode
- All components and utilities are strongly typed
- Product types defined in `src/types/product.ts`
- User auth types in `src/types/auth.ts`
- Shop types in `src/types/shop.ts`
- Backend API types separate from frontend types

### Persian/Farsi Language
- All UI text is in Persian (RTL support with Tailwind)
- Font: Vazirmatn (loaded locally from `src/assets/fonts/vazirmatn/fonts/webfonts/Vazirmatn[wght].woff2`)
- Font declarations in `src/styles/fonts.css` with @font-face
- Error messages in Persian for user-facing errors
- Console logs can be in English or Persian

### Component Patterns
- Functional components with hooks
- Props interfaces defined inline or exported
- Motion (Framer Motion) for animations with `AnimatePresence`
- Event handlers prefixed with `handle` (e.g., `handleStartUpload`)
- Lazy loading for modals and admin components

### Display Field Convention
- When both a raw backend field and a user-facing display variant exist (e.g., `category` and `category_display`):
  - Always render the `*_display` value in the UI (e.g., show `category_display`).
  - Always use the raw field for programmatic operations (API calls, filters, comparisons).
- Apply this convention consistently across the project for any similar pairs: `name`/`name_display`, `brand`/`brand_display`, etc.

### Error Handling
- API errors handled with Persian user messages
- Console logging for debugging with `[ComponentName]` prefixes
- Retry logic for transient network failures
- Graceful fallbacks when AI processing fails
- Sentry integration for error tracking

## Seller Dashboard Architecture

### Authentication Flow
The seller dashboard uses **OTP-based authentication** with automatic token refresh:

1. **Login**: Phone + password → access/refresh tokens stored in localStorage
2. **Registration**: Send OTP → Verify OTP → Create account with username/password
3. **Password Reset**: Send OTP → Verify OTP → Set new password
4. **Token Refresh**: Automatic refresh using `sellerAuthService.refreshToken()` when access token expires

**Key Service**: `src/services/sellerAuthService.ts` manages all authentication logic
- Stores tokens in localStorage (keys: `homa_shop_access_token`, `homa_shop_refresh_token`)
- Provides methods: `login()`, `register()`, `resetPassword()`, `refreshToken()`, `logout()`
- Returns `ShopAuthData` interface with user and token info

### Seller API Integration
- **Base endpoint**: Same as main API (configured via `VITE_API_BASE_URL`)
- **Endpoints**: All prefixed with `/api/shops/` (e.g., `/api/shops/login/`, `/api/shops/otp/phone-verify/send/`)
- **Service**: `src/services/sellerApiService.ts` handles product CRUD and dashboard data
- **Type definitions**: `src/types/seller-api.ts` contains backend response shapes

### Styling Notes
- Seller dashboard has **isolated Tailwind CSS** in `src/integrations/seller-dashboard/index.css`
- Must be imported in `SellerDashboardApp.tsx` to override parent app's global styles
- Component imports use vendored libraries with version aliases (configured in `vite.config.ts`)

## Important Files to Check

When working on specific features:

- **User flow - Shop/Product loading**: `src/utils/productLoader.ts`, `src/App.tsx`
- **User flow - Authentication**: `src/services/userAuthService.ts`, `src/components/OTPLogin.tsx`
- **User flow - Image upload**: `src/components/PhotoUpload.tsx`, `src/components/StagedUpload.tsx`
- **User flow - AI processing**: `src/utils/aiImageProcessor.ts`, `src/services/api.ts`
- **Seller flow - Authentication**: `src/services/sellerAuthService.ts`
- **Seller flow - Dashboard**: `src/integrations/seller-dashboard/SellerDashboardApp.tsx`
- **Seller flow - API calls**: `src/services/sellerApiService.ts`
- **Admin features**: `src/components/AdminDashboard.tsx`, `src/components/admin/*`
- **API configuration**: `src/config/api.ts`
- **Analytics**: `src/services/posthog.ts`, `src/utils/analytics.ts`
- **Type definitions**: `src/types/product.ts`, `src/types/auth.ts`, `src/types/shop.ts`, `src/types/seller-api.ts`
- **Font configuration**: `src/styles/fonts.css`, `src/assets/fonts/vazirmatn/`

## Testing and Debugging

### Browser Console Debug Logs
The app includes extensive console logging with prefixes:
- `[App]` - Main app flow and state changes
- `[KPI]` - Analytics events
- `[API]` - API requests/responses
- `[AI Processing]` - Image processing
- `[UserAuth]` - User authentication
- `[fetchProduct]`, `[ProductSelection]` - Product loading

### Debug Tools
- **Admin Dashboard**: Navigate to `/admin` URL path
- **Brand Colors Guide**: Shift+Ctrl+B
- **Test helpers**: `src/utils/testHelpers.ts` adds `window.testProductSelection()`
- **Mock URL**: `src/utils/mockUrl.ts` adds `window.updateProductId()`

### Common Issues
See `DEBUGGING_GUIDE.md` for troubleshooting product selection and API connectivity issues.

## Admin Panel Access

Navigate to `/admin` URL path to access the admin dashboard. Features include:
- Product management (CRUD operations)
- Analytics dashboard with charts
- Gemini prompt management for image generation
- Groq prompt management for prompt enhancement
- Login form (check `src/components/admin/LoginForm.tsx` for credentials)
- Four tabs: Products | Gemini Prompt | Groq Prompt | Analytics

## Database Integration

Backend uses PostgreSQL with these key tables:
- `products` - Product catalog (id, name, unique_link, image_path, etc.)
- `shops` - Shop information
- `users` - User accounts (phone, password, etc.)
- `upload_process` - Image processing records
- MinIO for object storage (images)

## Performance Considerations

- Images served from MinIO object storage via API proxy
- Vite build optimizations enabled (SWC compiler)
- Lazy loading for: FeedbackSurvey, AdminDashboard, SellerDashboard, BrandColors
- Production build output to `build/` directory
- Nginx serves static files with caching headers
- Vazirmatn font loaded locally (not from CDN) for improved performance
- Font file: Variable font supports all weights (100-900) in single WOFF2 file (~111 KB)
- Font-display: swap for optimal Largest Contentful Paint (LCP)
- Manual chunk splitting in Vite (vendor-react, vendor-motion, vendor-radix, vendor-ui)
- Gzip + Brotli compression enabled

## Seller Dashboard Integration Notes

### Stylesheet & CSS Isolation
- Import bundled Tailwind CSS (`src/integrations/seller-dashboard/index.css`) inside `SellerDashboardApp.tsx`
- Without this import, the parent app's `globals.css` overrides typography, spacing, and color tokens, resulting in broken UI
- The seller dashboard CSS is isolated and self-contained; don't remove or rely on parent styles

### Vendor Package Aliases
- Seller dashboard components reference packages with inline version suffixes (e.g. `@radix-ui/react-slot@1.1.2`, `sonner@2.0.3`)
- Vite and Vitest cannot resolve these specifiers; they must match `package.json` dependencies
- **Resolution**: Vite's `resolve.alias` config in `vite.config.ts` strips version suffixes at build time
- When adding new seller dashboard dependencies, ensure they're added to `package.json` AND the alias list

### Testing with Vitest
- Recharts' `ResponsiveContainer` instantiates `ResizeObserver` during render
- Vitest jsdom environment doesn't provide a native `ResizeObserver`
- Solution: Provide a class-based `ResizeObserver` mock in `src/test/setup.ts`
- Without this mock, seller dashboard component tests fail during rendering phase

### Routing & Access
- Seller dashboard accessible at `/seller` route via routing in `src/App.tsx`
- ProtectedRoute wrapper handles authentication checks
- Redirect to login if no valid access token or refresh fails
