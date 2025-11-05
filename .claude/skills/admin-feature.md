# Admin Dashboard Development Skill

You are helping develop features for the HOMA admin dashboard.

## Context

The admin interface (`/admin` route) provides product management, analytics, and AI prompt configuration.

**Admin Dashboard Structure:**
- 4 tabs: Products | Gemini Prompt | Groq Prompt | Analytics
- Login-based authentication
- Full CRUD for products
- Real-time analytics charts

## Your Task

When working with admin features:

1. **Understanding Admin Architecture**
   - Main dashboard: `src/components/AdminDashboard.tsx`
   - Tab components: `src/components/admin/`
   - API service: `src/services/adminService.ts`
   - Types: `src/types/admin.ts`

2. **Admin Components**
   - **ProductsTab.tsx** - Product CRUD with pagination/filtering
   - **ProductForm.tsx** - Create/edit product form
   - **GeminiPromptTab.tsx** - Manage Gemini AI prompts
   - **GroqPromptTab.tsx** - Manage Groq AI prompts
   - **AnalyticsTab.tsx** - Analytics dashboard with charts
   - **LoginForm.tsx** - Authentication

3. **Adding New Admin Features**
   - Create component in `src/components/admin/`
   - Add API methods to `src/services/adminService.ts`
   - Define types in `src/types/admin.ts`
   - Add tab/route to AdminDashboard.tsx if needed
   - Use toast notifications for user feedback (from `sonner`)

4. **Admin API Patterns**
   ```typescript
   // In adminService.ts
   export async function newAdminOperation(data: DataType) {
     return apiPost<ResponseType>('/api/admin/endpoint', data)
   }
   ```

5. **Forms and Validation**
   - Use `react-hook-form` for complex forms
   - Client-side validation before API calls
   - Show loading states during submissions
   - Persian success/error messages via toast

6. **Data Tables**
   - Pagination (20 items per page)
   - Sorting by columns
   - Search/filter functionality
   - Actions column (edit, delete, view)

7. **Charts and Analytics**
   - Use `recharts` library for visualizations
   - Common chart types: Line, Bar, Pie, Area
   - Responsive sizing
   - Tooltip with formatted data

8. **Authentication**
   - Check `isAuthenticated` state
   - Redirect to login if not authenticated
   - Store auth token in localStorage
   - Logout functionality clears state

## Key Files
- `src/components/AdminDashboard.tsx` - Main dashboard
- `src/components/admin/` - Admin components directory
- `src/services/adminService.ts` - Admin API calls
- `src/types/admin.ts` - Admin type definitions

## Admin API Endpoints

```
Auth:
POST /api/admin/login - Authenticate admin
POST /api/admin/logout - Logout

Products:
GET /api/products - List all products
GET /api/products/{unique_link} - Get product details
POST /api/products - Create product (multipart/form-data)
PUT /api/products/{unique_link} - Update product
DELETE /api/products/{unique_link} - Delete product

Prompts:
GET /api/prompts/gemini - Get Gemini prompt
PUT /api/prompts/gemini - Update Gemini prompt
GET /api/prompts/groq - Get Groq prompt
PUT /api/prompts/groq - Update Groq prompt

Analytics:
GET /api/analytics/summary - Get analytics summary
GET /api/analytics/events - Get event logs
```

## Conventions
- Admin components prefixed with context (e.g., ProductsTab, ProductForm)
- Toast notifications for all user actions
- Confirmation dialogs for destructive actions (delete)
- Loading states during async operations
- Persian text for user-facing messages
- English for debug console logs
- Type-safe API calls with TypeScript interfaces