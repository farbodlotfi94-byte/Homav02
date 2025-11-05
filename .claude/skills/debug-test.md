# Debugging & Testing Skill

You are helping debug and test the HOMA application.

## Context

The app includes extensive console logging, debug tools, and test helpers for troubleshooting.

## Your Task

When debugging or testing:

1. **Console Debug Logs**
   The app uses prefixed console logs:
   - `[App]` - Main app flow and state changes
   - `[KPI]` - Analytics event tracking
   - `[API]` - API requests and responses
   - `[AI Processing]` - Image processing steps
   - `[fetchProduct]` - Product loading
   - `[ProductSelection]` - Product selection flow
   - `[ComponentName]` - Component-specific logs

2. **Built-in Debug Tools**
   - **Admin Dashboard**: Navigate to `/admin`
   - **Brand Colors Guide**: Press Shift+Ctrl+B to show design system
   - **Test Product Selection**: `window.testProductSelection()` in console
   - **Mock URL Changes**: `window.updateProductId('prod_X')` in console

3. **Common Debugging Scenarios**

   **Product Not Loading:**
   - Check console for `[fetchProduct]` logs
   - Verify productId format (prod_X)
   - Check API connectivity: `/health` endpoint
   - Verify product exists in backend
   - Check unique_link mapping

   **Image Upload Failing:**
   - Check file size (<10MB)
   - Check file format (JPEG, PNG, WebP)
   - Check console for `[API]` errors
   - Verify timeout settings
   - Check network tab for failed requests

   **Step Flow Issues:**
   - Check console for `[App]` state changes
   - Verify currentStep transitions
   - Check URL parameters (productId, utm_source)
   - Verify product status (active/inactive)

   **API Errors:**
   - Check network tab for status codes
   - Check console for `[API]` error logs
   - Verify CORS configuration
   - Check backend health: `/health` endpoint
   - Verify authentication (admin routes)

4. **Testing Checklist**

   **Product Selection Flow:**
   - [ ] Load app without URL params → Shows product grid
   - [ ] Click product → Navigate to product landing
   - [ ] Direct URL with productId → Shows product landing
   - [ ] Invalid productId → Shows fallback with suggestions

   **Image Upload Flow:**
   - [ ] Select file from device
   - [ ] Capture photo with camera (mobile)
   - [ ] Large file (>10MB) rejected
   - [ ] Invalid format rejected
   - [ ] Upload progress shows 3 stages
   - [ ] Processing completes or shows error

   **Admin Dashboard:**
   - [ ] Login with credentials
   - [ ] View products list
   - [ ] Create new product
   - [ ] Edit existing product
   - [ ] Delete product (with confirmation)
   - [ ] View analytics
   - [ ] Update AI prompts

   **Error Recovery:**
   - [ ] Network error → Show retry option
   - [ ] Timeout → Extend or show recovery
   - [ ] Invalid product → Show fallback
   - [ ] Processing failure → Offer retry

5. **Performance Testing**
   - Check image loading times
   - Monitor API response times
   - Check bundle size (npm run build)
   - Test on slow network (DevTools throttling)
   - Test with large images
   - Check memory usage during processing

6. **Browser DevTools Usage**
   - **Network tab**: Monitor API calls, check status codes
   - **Console**: Review debug logs, check for errors
   - **Application tab**: Check localStorage, session storage
   - **Performance tab**: Profile rendering, check bottlenecks
   - **Lighthouse**: Check performance, accessibility, SEO

7. **Adding Debug Logs**
   ```typescript
   console.log('[ComponentName] Descriptive message:', data)
   console.error('[ComponentName] Error occurred:', error)
   console.warn('[ComponentName] Warning message:', warning)
   ```

8. **Test Helper Functions**
   - Located in `src/utils/testHelpers.ts`
   - Available in browser console via `window` object
   - Use for manual testing during development

## Key Files
- `src/utils/testHelpers.ts` - Test utility functions
- `src/utils/mockUrl.ts` - URL mocking for tests
- `DEBUGGING_GUIDE.md` - Detailed debugging guide
- `CLAUDE.md` - Development documentation

## Debug Commands

```bash
# View application logs
npm run dev

# Build and check for errors
npm run build

# Check Docker container logs
docker-compose logs -f

# Test API connectivity
curl https://104.234.46.187:8888/health

# Check backend response time
curl -w "@time_stats.txt" https://104.234.46.187:8888/api/products
```

## Conventions
- Console logs with component prefix
- English for debug logs, Persian for user messages
- Errors logged with full stack trace
- Network errors include response status
- State changes logged in development mode
- Remove sensitive data from logs (auth tokens, passwords)