# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HOMA is a Persian/Farsi furniture visualization web application built with React, TypeScript, and Vite. Users can select products, upload photos of their space, and see AI-generated visualizations of how furniture products look in their environment.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Docker deployment
docker-compose up -d --build
```

## Architecture Overview

### Application Flow (Step-Based State Machine)

The app follows a multi-step flow controlled by `currentStep` state in `src/App.tsx`:

1. **loading** → Initial product fetch
2. **product-selection** → User selects from available products (no URL params)
3. **product-landing** → Product-aware landing page with CTA (via URL with `?productId=`)
4. **product-fallback** → Error state when product is unavailable
5. **upload** → User uploads/captures photo
6. **precheck** → Quality validation of uploaded image
7. **staged-upload** → 3-stage upload progress indicator
8. **confirmation** → Success state with HOMA branding
9. **visualization** → Display AI-processed result with product placement
10. **feedback** → Feedback survey between action and execution
11. **error** → Error recovery flow

### Backend API Integration

- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable (default: `https://104.234.46.187:8888`)
- **Configuration**: `src/config/api.ts`
- **API Client**: `src/services/api.ts` with timeout handling and retry logic
- **Image Processing**: `src/utils/aiImageProcessor.ts` handles AI backend calls

**Key API Endpoints:**
- `GET /api/products` - Fetch all products
- `GET /api/products/{unique_link}` - Fetch specific product
- `POST /api/products/{unique_link}/process` - Process image with AI (multipart/form-data)
- `GET /api/products/images/{object_path}` - Serve images from MinIO

**Product ID System:**
- **Frontend**: Uses `productId` format like `prod_18` in URLs for compatibility
- **Backend**: Uses UUID `unique_link` for all API calls
- **Mapping**: `src/utils/productLoader.ts` handles conversion between formats

### Image Processing Flow

1. User uploads image → `PhotoUpload` component
2. Quality validation → `FilePrecheck` component
3. Upload with progress → `StagedUpload` component
4. API call to `/api/products/{unique_link}/process` with FormData
5. Backend returns `customer_image_path` and `processed_image_path`
6. Display visualization → `ProductVisualization` component

**Timeout Configuration:**
- Standard API calls: 5 minutes (`VITE_API_TIMEOUT`)
- Image processing: 10 minutes (`VITE_API_IMAGE_PROCESSING_TIMEOUT`)
- Retry mechanism: Up to 2 retries with exponential backoff

### State Management Patterns

- All state is managed in `src/App.tsx` using React hooks
- Component props for data flow (no Redux/Context)
- Analytics tracking via `trackKPI()` function for business metrics
- Session tracking with unique `sessionId` per user session

### Key Components

**Main Flow:**
- `ProductSelection` - Grid of available products (when no URL params)
- `ProductAwareLanding` - Product landing page with upload CTA
- `PhotoUpload` - File picker and camera integration
- `ProductVisualization` - Display AI-processed result with actions
- `FeedbackSurvey` - Collect user feedback before actions

**Admin:**
- `AdminDashboard` - Admin panel (accessible via /admin URL)
- `components/admin/` - Admin-specific components (products, analytics, Gemini prompt, Groq prompt)

**UI Library:**
- `components/ui/` - Radix UI + shadcn/ui reusable components
- Tailwind CSS with Persian typography (IRANSans font family)

## Environment Variables

Required in `.env` or build args:

```bash
VITE_API_BASE_URL=https://api.myhoma.ir
VITE_API_TIMEOUT=300000
VITE_API_IMAGE_PROCESSING_TIMEOUT=600000
```

## Docker Deployment

**Multi-stage Dockerfile:**
- **Builder stage**: Node 18 Alpine, npm build with env vars
- **Production stage**: Nginx Alpine serving static files

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
- Framer Motion for animations with `AnimatePresence`
- Event handlers prefixed with `handle` (e.g., `handleStartUpload`)

### Display Field Convention
- When both a raw backend field and a user-facing display variant exist (e.g., `category` and `category_display`):
  - Always render the `*_display` value in the UI (e.g., show `category_display`).
  - Always use the raw field for programmatic operations (API calls, filters, comparisons), e.g., send `category` in queries and filters.
- Apply this convention consistently across the project for any similar pairs: `name`/`name_display`, `brand`/`brand_display`, etc.

### Error Handling
- API errors handled with Persian user messages
- Console logging for debugging with `[ComponentName]` prefixes
- Retry logic for transient network failures
- Graceful fallbacks when AI processing fails

## Important Files to Check

When working on specific features:

- **Product loading**: `src/utils/productLoader.ts`, `src/App.tsx:105-172`
- **Image upload**: `src/components/PhotoUpload.tsx`, `src/components/StagedUpload.tsx`
- **AI processing**: `src/utils/aiImageProcessor.ts`, `src/services/api.ts`
- **Admin features**: `src/components/AdminDashboard.tsx`, `src/components/admin/*`
- **API configuration**: `src/config/api.ts`
- **Type definitions**: `src/types/product.ts`, `src/types/admin.ts`
- **Font configuration**: `src/styles/fonts.css`, `src/assets/fonts/vazirmatn/`

## Testing and Debugging

### Browser Console Debug Logs
The app includes extensive console logging with prefixes:
- `[App]` - Main app flow
- `[KPI]` - Analytics events
- `[API]` - API requests/responses
- `[AI Processing]` - Image processing
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
- `upload_process` - Image processing records
- MinIO for object storage (images)

## Performance Considerations

- Images served from MinIO object storage via API proxy
- Vite build optimizations enabled (SWC compiler)
- Lazy loading not currently implemented (all routes in main bundle)
- Production build output to `build/` directory
- Nginx serves static files with caching headers
- Vazirmatn font loaded locally (not from CDN) for improved performance
- Font file: Variable font supports all weights (100-900) in single WOFF2 file (~111 KB)
- Font-display: swap for optimal Largest Contentful Paint (LCP)

## Seller Dashboard Integration Notes (2025-11-25)

- When integrating `src/integrations/seller-dashboard`, remember to import its bundled Tailwind CSS (`src/integrations/seller-dashboard/index.css`) inside `SellerDashboardApp.tsx`. Without this import the host app’s globals override typography, spacing, and color tokens, resulting in mismatched UI.
- Vendor files copied from the seller repo referenced packages with inline version suffixes (e.g. `@radix-ui/react-slot@1.1.2`, `sonner@2.0.3`). Vite/Vitest cannot resolve those specifiers. Strip the `@<version>` suffix everywhere so imports match the dependencies declared in `package.json`.
- The Vitest environment needs a constructable `ResizeObserver` mock because Recharts’ `ResponsiveContainer` instantiates it. Provide a class-based mock in `src/test/setup.ts` to keep seller dashboard smoke tests passing.