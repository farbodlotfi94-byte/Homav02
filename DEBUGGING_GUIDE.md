# Debugging Guide - Product Selection Issue

## Problem
The app shows "Product Not Found" instead of the product selection page when visiting `http://localhost:3006` (or similar ports).

## Expected Behavior
1. User visits the app without URL parameters
2. App should show the product selection page with a list of products
3. User selects a product
4. App shows the product landing page

## Actual Behavior
The app shows "Product Not Found" page instead of the product selection page.

## Debugging Steps

### 1. Check Browser Console
Open the browser developer tools (F12) and check the Console tab for these log messages:

```
[App] Initializing...
[App] Current URL: http://localhost:3006
[App] Parsed entry context: null
[App] No product context found, showing product selection
[ProductSelection] Loading products from: http://104.234.46.187:8888/api/products
[ProductSelection] API response: {...}
[ProductSelection] Products loaded: 4
```

### 2. Check Network Tab
Open the Network tab in developer tools and check if the API call to `http://104.234.46.187:8888/api/products` is successful.

Expected response:
```json
{
  "products": [
    {
      "id": 16,
      "shop_id": null,
      "name": "قالی شیراز لوکس",
      "description": "...",
      "category": "فرش و قالی",
      "is_predefined": 1,
      "image_path": "products/Qali-shiraz-2.webp",
      "unique_link": "f5547bc7-1a87-436b-a658-c40831a8d619",
      "created_at": "2025-10-23T08:19:31"
    },
    ...
  ]
}
```

### 3. Check for CORS Issues
If you see a CORS error in the console, the backend needs to allow requests from your frontend origin.

### 4. Test API Directly
Run these commands to test the API:

```bash
# Test health endpoint
curl http://104.234.46.187:8888/health

# Test products endpoint
curl http://104.234.46.187:8888/api/products

# Test individual product
curl http://104.234.46.187:8888/api/products/f5547bc7-1a87-436b-a658-c40831a8d619
```

### 5. Clear Browser Cache
Sometimes the browser cache can cause issues. Try:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Open in incognito/private mode

### 6. Check URL Parameters
Make sure you're visiting the app without any URL parameters. The URL should be exactly:
```
http://localhost:3005
```

NOT:
```
http://localhost:3005?productId=something
```

## Code Changes Made

### Files Modified:
1. `src/utils/productLoader.ts` - Added `fetchProductByUniqueLink()` function and debugging logs
2. `src/App.tsx` - Updated product selection handler to use `fetchProductByUniqueLink()`
3. `src/components/ProductSelection.tsx` - Added debugging logs

### Key Functions:
- `fetchProductByUniqueLink(uniqueLink)` - Fetches product directly by unique_link
- `handleProductSelect(productId, uniqueLink)` - Handler for product selection

## Manual Testing

### Test 1: Visit App Without Parameters
1. Open browser
2. Navigate to `http://localhost:3005`
3. Should see product selection page with 4 products

### Test 2: Select a Product
1. Click on any product
2. Should see loading spinner
3. Should navigate to product landing page
4. Should see product details

### Test 3: Test API from Browser Console
Open browser console and run:
```javascript
fetch('http://104.234.46.187:8888/api/products')
  .then(res => res.json())
  .then(data => console.log('Products:', data))
  .catch(err => console.error('Error:', err));
```

## Common Issues

### Issue 1: "Product Not Found" on Initial Load
**Cause**: URL has `?productId=` parameter
**Solution**: Visit the app without any URL parameters

### Issue 2: CORS Error
**Cause**: Backend doesn't allow requests from frontend origin
**Solution**: Backend needs to add CORS headers for `http://localhost:3005`

### Issue 3: Network Error
**Cause**: Backend is not running or not accessible
**Solution**: Check if backend is running at `http://104.234.46.187:8888`

### Issue 4: Empty Product List
**Cause**: API returns empty products array
**Solution**: Check backend database, should have predefined products

## Next Steps
1. Open browser developer tools
2. Check console logs
3. Check network requests
4. Report any errors you see

