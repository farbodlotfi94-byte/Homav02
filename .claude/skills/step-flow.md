
# Step Flow Management Skill

You are helping modify the step-based state machine in the HOMA application.

## Context

The application uses a step-based flow managed in `src/App.tsx` with 11 distinct steps:
- loading, product-selection, product-landing, product-fallback, upload, precheck, staged-upload, confirmation, visualization, feedback, error

## Your Task

When working with the step flow:

1. **Understand Current Step Logic**
   - Read `src/App.tsx` lines 35-46 for step type definitions
   - Identify the current step's component rendering logic
   - Check step transition handlers (handleStartUpload, handleImageProcessed, etc.)

2. **Adding New Steps**
   - Add step type to `AppStep` union type
   - Create step component in `src/components/`
   - Add rendering case in App.tsx's main render section
   - Add transition logic/handlers
   - Update analytics tracking with `trackKPI()`

3. **Modifying Step Transitions**
   - Locate the handler function for the transition
   - Ensure proper state updates (product, selectedFile, visualizedImageUrl, etc.)
   - Add error handling for failures
   - Update KPI tracking events

4. **Testing Flow Changes**
   - Check all entry points (direct URL vs product selection)
   - Test forward and backward navigation
   - Verify error states and recovery paths
   - Test with/without productId URL parameter

## Key Files
- `src/App.tsx` - Main state machine (lines 35-984)
- `src/components/` - Step component implementations
- `src/utils/analytics.ts` - KPI tracking

## Conventions
- Step component names match the step name (PascalCase)
- Handlers prefixed with `handle` (e.g., handleConfirmPrecheck)
- All user-facing text in Persian
- Analytics events for each major transition