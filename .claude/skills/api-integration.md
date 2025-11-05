# API Integration Skill

You are helping with backend API integration in the HOMA application.

## Context

The app uses a custom API service layer with timeout handling, retry logic, and Persian error messages.

**API Base URL**: Configured via `VITE_API_BASE_URL` (default: https://104.234.46.187:8888)

## Your Task

When working with API integration:

1. **Understanding the API Client**
   - Review `src/services/api.ts` for the API client implementation
   - Check `src/config/api.ts` for endpoint configurations
   - Timeouts: 5 min standard, 10 min for image processing

2. **Adding New API Calls**
   - Use `apiGet<ResponseType>()` for GET requests
   - Use `apiPost<ResponseType>()` for POST requests
   - Use `apiPostWithTimeout<ResponseType>()` for long-running operations
   - Define TypeScript interfaces for request/response in `src/types/`
   - Add endpoint to `src/config/api.ts` ENDPOINTS object
   - Handle errors with Persian user messages

3. **Product ID System**
   - Frontend uses `prod_X` format in URLs
   - Backend uses UUID `unique_link` for API calls
   - Use `src/utils/productLoader.ts` for ID conversion
   - Never expose backend UUIDs to users

4. **Key Endpoints**
   ```
   GET /api/products - Fetch all products
   GET /api/products/{unique_link} - Fetch specific product
   POST /api/products/{unique_link}/process - Process image (FormData)
   GET /api/products/images/{object_path} - Serve images
   GET /health - Health check
   ```

5. **Error Handling Pattern**
   - Catch fetch errors
   - Provide Persian error messages for users
   - Log English debug info to console with `[API]` prefix
   - Implement retry logic for transient failures (up to 2 retries)
   - Use exponential backoff between retries

6. **Testing API Changes**
   - Test with browser DevTools Network tab
   - Check timeout handling (simulate slow network)
   - Verify error recovery paths
   - Test with invalid/missing productId

## Key Files
- `src/services/api.ts` - API client implementation
- `src/services/adminService.ts` - Admin-specific API calls
- `src/config/api.ts` - API configuration
- `src/utils/productLoader.ts` - Product loading with ID mapping
- `src/utils/aiImageProcessor.ts` - Image processing API calls
- `src/types/product.ts` - API response types
- `src/types/admin.ts` - Admin API types

## Conventions
- All API functions are async/await
- Response types defined in TypeScript interfaces
- Persian error messages for user-facing errors
- English console logs with component prefix
- FormData for file uploads
- Abort controllers for timeout handling