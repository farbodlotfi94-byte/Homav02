# Upload Guidance Feature - Implementation Complete ✅

**Date:** 2025-11-18
**Status:** Ready for image assets

---

## What Was Implemented

### 1. UploadGuidance Component (`src/components/UploadGuidance.tsx`)

A new carousel component that shows users 4 example images (1 correct, 3 incorrect) to teach them what makes a good room photo for furniture visualization.

**Features:**
- ✅ Embla carousel with RTL support for Persian users
- ✅ 4 swipeable slides with visual indicators (✅/❌)
- ✅ **FORCED VIEWING**: Users must view all 4 slides before uploading
- ✅ Disabled "Got it" button until all slides are viewed
- ✅ Progress indicator showing slides viewed (e.g., "2 از 4")
- ✅ Dot navigation for quick slide access
- ✅ Smooth animations with Framer Motion
- ✅ Persian text labels and RTL layout

**TODO Comments:**
- Comprehensive instructions for removing forced viewing after 2-4 weeks
- Located at top of file (lines 1-16)

---

### 2. PhotoUpload Component Updates (`src/components/PhotoUpload.tsx`)

Modified to integrate the guidance component and disable upload buttons until guidance is viewed.

**Changes:**
- ✅ Added `UploadGuidance` import and integration
- ✅ Added `hasViewedGuidance` state tracking
- ✅ Disabled both upload buttons until guidance dismissed
- ✅ Visual feedback for disabled state (grayed out, cursor-not-allowed)
- ✅ Handler for dismissing guidance

**TODO Comments:**
- Instructions for removing forced behavior after 2-4 weeks
- Located at top of file (lines 1-15)
- Inline comments on all temporary code

---

### 3. Image Asset Structure

**Directory created:** `public/guidance-examples/`

**Required images:** (⚠️ **NOT YET PROVIDED** - see below)
1. `correct-room.webp` - Straight, well-lit indoor room
2. `incorrect-tilted.webp` - Tilted/crooked camera angle
3. `incorrect-outdoor.webp` - Outdoor environment (wrong)
4. `incorrect-topdown.webp` - Top-down floor view (wrong)

**Documentation created:** `public/guidance-examples/README.md`
- Detailed specifications for each image
- Dimensions: 375×280px (mobile), 600×450px (desktop)
- Format: WebP, optimized at 80% quality
- Target size: ~40KB per image (~150KB total)
- Style guidance: Persian/Iranian interior design

---

## What You Need To Do

### ⚠️ **CRITICAL: Add Image Assets**

The feature is **fully implemented** but **images are missing**. The carousel will show broken images until you add them.

**Action required:**

1. **Create or download 4 images** matching the criteria in `public/guidance-examples/README.md`

2. **Place images in:** `public/guidance-examples/`
   - `correct-room.webp`
   - `incorrect-tilted.webp`
   - `incorrect-outdoor.webp`
   - `incorrect-topdown.webp`

3. **Quick options:**
   - **AI generation:** Use DALL-E, Midjourney, or Stable Diffusion
   - **Stock photos:** Download from Unsplash or Pexels
   - **Take your own:** Use your phone to photograph a room (4 variations)

4. **Optimize images:**
   - Use [Squoosh.app](https://squoosh.app) to convert to WebP
   - Compress at 80% quality
   - Resize to 375×280px for mobile

---

## Testing

### Build Test: ✅ PASSED

```bash
npm run build
# ✓ built in 7.21s (no errors)
```

### What to test locally:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to upload step:**
   - Select a product
   - Click "شروع کنید" (Start)
   - You should see the guidance carousel

3. **Test forced viewing:**
   - Upload buttons should be disabled (grayed out)
   - Swipe through all 4 slides (or use dot navigation)
   - "متوجه شدم" button should be disabled until all slides viewed
   - After viewing all slides, button becomes enabled
   - Click "متوجه شدم" to dismiss guidance
   - Upload buttons should now be enabled

4. **Test RTL carousel:**
   - Swipe **right-to-left** to advance slides (Persian RTL)
   - Dot indicators should show progress right-to-left

5. **Test mobile:**
   - Open in Chrome DevTools mobile view
   - Test touch swipe gestures
   - Verify images load quickly

---

## File Changes Summary

### New Files:
- ✅ `src/components/UploadGuidance.tsx` (220 lines)
- ✅ `public/guidance-examples/README.md` (documentation)
- ✅ `UPLOAD_GUIDANCE_IMPLEMENTATION.md` (this file)

### Modified Files:
- ✅ `src/components/PhotoUpload.tsx`
  - Added TODO comments (lines 1-15)
  - Added `UploadGuidance` import
  - Added forced viewing logic
  - Modified upload buttons with disabled state

### Directories Created:
- ✅ `public/guidance-examples/` (empty, awaiting images)

---

## Removing Forced Viewing (After 2-4 Weeks)

When you're ready to make guidance optional (recommended after 2-4 weeks of user education):

### Step 1: Search for TODOs
```bash
grep -r "TODO: REMOVE" src/components/
```

### Step 2: Files to modify
1. `src/components/UploadGuidance.tsx`
   - Remove `viewedSlides` state tracking
   - Remove `hasViewedAll` logic
   - Always enable "Got it" button
   - Remove progress indicator

2. `src/components/PhotoUpload.tsx`
   - Remove `hasViewedGuidance` state
   - Add `localStorage` check for returning users
   - Add info icon (ℹ️) to header for re-accessing guidance
   - Make guidance collapsible (auto-hide for returning users)
   - Always enable upload buttons

### Step 3: Test changes
- Ensure guidance shows only on first visit
- Ensure upload buttons are always enabled
- Ensure info icon toggles guidance visibility

**Estimated time:** 30 minutes to 1 hour

**Detailed instructions:** See `.claude/docs/tech-researcher-planner-plan.md` (Phase 2)

---

## Architecture Details

### Component Hierarchy:
```
PhotoUpload
├── Header
├── UploadGuidance (conditional: !hasViewedGuidance)
│   ├── Carousel (Embla with RTL)
│   │   ├── CarouselContent
│   │   │   └── CarouselItem (×4 slides)
│   │   └── Dot Indicators
│   └── "Got it" Button (disabled until all viewed)
├── Upload Circle (drag-and-drop)
└── Upload Buttons (disabled until guidance dismissed)
    ├── "انتخاب فایل" (file picker)
    └── "گرفتن عکس" (camera, mobile only)
```

### State Management:
```typescript
// PhotoUpload.tsx
const [hasViewedGuidance, setHasViewedGuidance] = useState(false);

// UploadGuidance.tsx
const [viewedSlides, setViewedSlides] = useState<Set<number>>(new Set([0]));
const [currentSlide, setCurrentSlide] = useState(0);
const hasViewedAll = viewedSlides.size === slides.length;
```

### Data Flow:
```
User enters upload step
  → UploadGuidance shown (expanded)
  → Upload buttons disabled
  → User swipes through slides
    → viewedSlides set updated
    → Progress indicator updated
  → User views all 4 slides
    → hasViewedAll becomes true
    → "Got it" button enabled
  → User clicks "Got it"
    → onDismiss() called
    → hasViewedGuidance set to true
    → UploadGuidance hidden
    → Upload buttons enabled
  → User can now upload photo
```

---

## Success Metrics (Recommended)

After deploying, track these KPIs to measure success:

1. **Guidance View Rate:** % of users who view at least 1 slide
   - Target: >95% (since it's forced)

2. **Completion Rate:** % of users who view all 4 slides
   - Target: >90% (forced viewing ensures this)

3. **Upload Quality Improvement:** % of uploads passing FilePrecheck
   - Baseline: Measure before guidance
   - Target: +20% improvement after guidance

4. **Time to Dismiss:** Average seconds before clicking "Got it"
   - Target: >8 seconds (indicates reading)

5. **Abandonment Rate:** % of users who leave at upload step
   - Monitor for increase (if >10% increase, consider making optional sooner)

---

## Known Limitations

1. **Missing images:** Carousel will show broken images until you add assets
2. **No localStorage yet:** Guidance shows every time (by design for Phase 1)
3. **No info icon yet:** Can't re-access guidance after dismissing (Phase 2 feature)
4. **Forced viewing:** Users can't skip (intentional for initial rollout)

---

## Next Steps

### Immediate (Required):
1. ✅ **Add 4 example images** to `public/guidance-examples/`
2. ✅ **Test locally** with `npm run dev`
3. ✅ **Verify mobile** - swipe gestures, image loading
4. ✅ **Deploy to staging** for team review

### Short-term (1-2 weeks):
1. Monitor user behavior and upload quality metrics
2. Gather feedback from users
3. A/B test if needed (forced vs optional guidance)

### Long-term (2-4 weeks):
1. Remove forced viewing behavior (follow TODO instructions)
2. Add localStorage for returning users
3. Add info icon toggle for re-accessing guidance
4. Consider video tutorial as alternative

---

## Questions or Issues?

- **Architecture plan:** `.claude/docs/tech-researcher-planner-plan.md`
- **TODO comments:** Search for "TODO: REMOVE" in codebase
- **Image specs:** `public/guidance-examples/README.md`

**Status:** ✅ Implementation complete, awaiting image assets

---

**Implementation by:** Claude Code
**Approved plan:** 2025-11-18
**Completion date:** 2025-11-18
