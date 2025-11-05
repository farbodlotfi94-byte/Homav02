# Image Processing & AI Integration Skill

You are helping with image processing and AI integration in the HOMA application.

## Context

HOMA processes user-uploaded room photos with AI to visualize furniture products in their space. The backend uses AI models (Gemini, Groq) for image generation.

## Your Task

When working with image processing:

1. **Understanding the Flow**
   - User uploads photo → PhotoUpload component
   - Quality validation → FilePrecheck component
   - Upload with progress → StagedUpload component
   - API call to `/api/products/{unique_link}/process`
   - Background processing while showing progress
   - Display result → ProductVisualization component

2. **Image Upload Pipeline**
   - File selection: PhotoUpload.tsx handles file picker + camera
   - Validation: FilePrecheck.tsx checks quality/size
   - EXIF stripping: `stripExif()` removes metadata
   - FormData encoding: Multipart upload to backend
   - Progress tracking: 3-stage progress indicator

3. **AI Processing**
   - Main function: `processImageWithAI()` in `src/utils/aiImageProcessor.ts`
   - Timeout: 10 minutes (configured via VITE_API_IMAGE_PROCESSING_TIMEOUT)
   - FormData structure:
     ```typescript
     formData.append('product_id', productUniqueLink)
     formData.append('customer_image', file)
     formData.append('session_id', sessionId)
     ```
   - Response: `{ customer_image_path, processed_image_path }`

4. **Background Processing Pattern**
   - Start API call immediately when file selected
   - Store promise in state: `apiProcessingPromise`
   - Show upload stages to user while processing
   - Await promise after staged upload completes
   - Handle timeout/errors gracefully

5. **Image Serving**
   - Images served from MinIO via API proxy
   - URL format: `/api/products/images/{object_path}`
   - Thumbnail vs full image paths
   - Lazy loading for performance

6. **Error Handling**
   - Network timeouts → Retry or show recovery
   - Invalid file format → Show error message
   - File too large (>10MB) → Reject with message
   - Processing failure → Offer retry or fallback
   - All errors in Persian for users

7. **Quality Checks**
   - File size: Max 10MB
   - File types: JPEG, PNG, WebP
   - Image dimensions: Check reasonable size
   - Blur detection: Warn if too blurry (optional)
   - Lighting: Check for proper exposure (optional)

8. **Testing Image Processing**
   - Test with various image formats
   - Test with large files (>10MB)
   - Test timeout scenarios (simulate slow backend)
   - Test error recovery paths
   - Test with/without internet connection

## Key Files
- `src/utils/aiImageProcessor.ts` - AI processing orchestration
- `src/utils/stripExif.ts` - EXIF metadata removal
- `src/components/PhotoUpload.tsx` - File selection UI
- `src/components/FilePrecheck.tsx` - Quality validation
- `src/components/StagedUpload.tsx` - Upload progress
- `src/components/ProductVisualization.tsx` - Result display
- `src/services/api.ts` - API client with timeout handling

## Image Processing Best Practices
- Always strip EXIF data before upload (privacy)
- Show progress indicators for long operations
- Handle timeouts gracefully (10+ minutes for AI)
- Validate file type and size on client side
- Compress images if too large (optional)
- Use AbortController for cancellation support
- Log processing steps for debugging

## Conventions
- Image paths relative to API base URL
- Timeout errors trigger retry option
- Persian error messages for users
- Console logs with `[AI Processing]` prefix
- FormData for multipart uploads
- Background promises for concurrent processing