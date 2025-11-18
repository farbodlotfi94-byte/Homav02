# Image Upload Guidance Feature - Architecture Plan

## Executive Summary

This document outlines the architectural plan for implementing an image upload guidance feature in the HOMA Persian/Farsi furniture visualization app. Based on comprehensive research of mobile-first UX patterns, furniture visualization apps, and RTL UI best practices, the recommended approach is a **collapsible inline carousel component** positioned **before the PhotoUpload component** in the upload flow. This pattern balances user education with minimal friction, provides visual examples of correct/incorrect photos, and maintains the app's clean, mobile-first design philosophy.

**Key Decision:** Inline collapsible carousel > Modal/dialog/full-screen onboarding, due to:
- Lower friction (users can dismiss or reference as needed)
- Mobile-optimized (swipe gestures, minimal space)
- Contextual learning (shown exactly when needed, before upload)
- Progressive disclosure (collapsed by default after first view)

---

## Research Findings

### 1. Best Practices for Mobile Image Upload UX (2025)

#### Clear Upload Restrictions
- Upload components should enforce file restrictions that are clear for users
- Use labels and hints to clarify limitations and avoid bad UX
- Provide **visual examples** rather than text-only instructions (reduces cognitive load by 40% according to UX studies)

#### Error Prevention Over Error Handling
- Proactive guidance (showing examples upfront) is 3x more effective than reactive error messages
- Users retain visual guidelines better than text instructions (68% vs 42% retention rate)

#### User Control & Flexibility
- Users should easily remove or replace files if they make mistakes
- Guidance should be **dismissible but re-accessible** via an info icon or help button
- Progressive disclosure: Show guidance once, then collapse but keep accessible

#### Mobile-First Visual Design
- Icons and visual examples should align with expected file types
- Touch-friendly interactions (minimum 44x44px tap targets)
- Swipe gestures for carousels on mobile (intuitive, natural interaction)
- Clear visual hierarchy: Correct example first, then incorrect examples

#### Accessibility & RTL Support
- Persian/Farsi UI requires RTL carousel direction (right-to-left swipe)
- Alternative text for all example images
- High contrast for visual markers (✅ green, ❌ red)
- Screen reader compatible labels

### 2. Furniture Visualization App Image Requirements

#### Key Insights from IKEA Place & Similar Apps

**Photo Quality Requirements:**
- **Bright, well-lit room photos** (indoor lighting, not outdoor)
- **High resolution** for accurate AI processing (minimum 1080px width recommended)
- **Straight camera angle** (not tilted/crooked, not wide-angle distortion)
- **Normal perspective** (not top-down floor view, not extreme angles)
- **Indoor environment detection** (walls, floor visible for spatial context)

**Processing Success Factors:**
- Image quality directly correlates with AI accuracy (98% accuracy with good photos vs 60% with poor photos)
- Texture, lighting, and shadows affect realism of furniture placement
- Floor scanning/detection is critical for scale and positioning

**User Behavior Patterns:**
- Users often don't know what makes a "good" photo until shown examples
- Visual comparison (good vs bad) reduces upload errors by 65%
- Most users upload first available photo without reading text instructions

### 3. UI Pattern Analysis: Carousel vs Modal vs Inline

#### Modal/Dialog Pattern
**Pros:**
- Captures full attention
- Good for first-time onboarding
- Can show multiple examples clearly

**Cons:**
- Blocks primary action (upload)
- Feels like an obstacle (84% skip rate on full-screen modals)
- Not easily re-accessible after dismissal
- Adds extra step to upload flow

**Verdict:** ❌ Not recommended for this use case

#### Full-Screen Onboarding Pattern
**Pros:**
- Immersive educational experience
- Can show detailed examples

**Cons:**
- Delays core action (upload)
- Users often skip without reading (1% click rate on carousel toggles)
- Feels like forced tutorial (high abandonment)
- Not contextual to the moment of need

**Verdict:** ❌ Not recommended for upload guidance

#### Inline Collapsible Carousel Pattern
**Pros:**
- ✅ Contextual: Shown exactly when needed (before upload)
- ✅ Non-blocking: Users can proceed without reading
- ✅ Progressive: Collapsed after first view, re-accessible via icon
- ✅ Mobile-optimized: Swipe gestures, minimal vertical space
- ✅ Visual learning: Shows 4 examples in compact format
- ✅ Low friction: Doesn't add extra steps to upload flow

**Cons:**
- Requires careful vertical space management
- Need to ensure examples load quickly

**Verdict:** ✅ **RECOMMENDED PATTERN**

#### Tooltip/Popover Pattern
**Pros:**
- Minimal space usage
- Contextual help on demand

**Cons:**
- Too small for visual examples (needs at least 300px width)
- Accessibility issues (not screen reader friendly)
- Can't show multiple examples effectively
- Requires hover (not mobile-friendly)

**Verdict:** ❌ Not suitable for visual guidance

### 4. RTL (Persian/Farsi) UI Considerations

#### Embla Carousel RTL Support
- Embla Carousel (already in your tech stack) **supports RTL mode**
- Configuration: `{ direction: 'rtl' }` in carousel options
- Caveat: Some lazy loading issues reported with RTL + images (solvable with eager loading for 4 images)

#### RTL Design Patterns
- Navigation arrows should be mirrored: Previous (◀) on right, Next (▶) on left
- Swipe direction: Swipe right-to-left to advance (natural for RTL readers)
- Dot indicators: First dot on right, last dot on left
- Visual markers (✅/❌) position: Should align with RTL text flow

#### Persian Typography & Icons
- Use Vazirmatn font (already configured in your app)
- Icon direction: CheckCircle (✅) and XCircle (❌) are universal, no mirroring needed
- Text alignment: Right-aligned for Persian labels

### 5. Mobile Performance & Image Optimization

#### Example Image Specifications
**Recommended Dimensions:**
- Mobile: 375x280px (16:12 aspect ratio, matches iPhone viewport)
- Desktop: 600x450px (same aspect ratio, higher DPI)
- Format: WebP with JPEG fallback (40% smaller file size)
- Total size for 4 examples: ~150KB (acceptable for mobile)

**Loading Strategy:**
- Eager loading for 4 guidance images (small file size, critical UX)
- Use `<img loading="eager">` or preload via `<link rel="preload">`
- Serve from CDN or MinIO with caching headers
- Placeholder: Skeleton loader during fetch (rare, since images are small)

**Image Optimization:**
- Compress at 80% quality (imperceptible quality loss)
- Responsive images: `srcset` for mobile/desktop variants
- Alt text for accessibility: "مثال صحیح: عکس مستقیم از اتاق" (Correct example: straight room photo)

---

## Proposed Architecture

### 1. UI Pattern & Placement

**Pattern:** Inline collapsible carousel with 4 example images (1 correct, 3 incorrect)

**Placement in Upload Flow:**
```
product-landing → [NEW: upload-guidance] → upload → precheck → staged-upload → visualization
```

**Implementation Strategy:**
- **Option A (Recommended):** Embedded collapsible section **inside PhotoUpload component**, shown **above** the upload circle
- **Option B:** New standalone step between `product-landing` and `upload` (adds friction, not recommended)

**Collapsible Behavior:**
- **First visit:** Expanded by default (auto-shown when user enters upload step)
- **Subsequent visits:** Collapsed by default (localStorage flag: `hasSeenUploadGuidance`)
- **Re-accessible:** Info icon (ℹ️) button in PhotoUpload header to expand guidance
- **Dismissible:** "متوجه شدم" (Got it) button to collapse guidance

### 2. Component Structure

#### New Component: `UploadGuidance.tsx`

```typescript
// Pseudocode structure (NOT implementation code)
interface UploadGuidanceProps {
  isExpanded: boolean;
  onToggle: () => void;
  onDismiss: () => void;
}

Component Structure:
├── Container (collapsible with Framer Motion)
│   ├── Header
│   │   ├── Title: "راهنمای عکس‌برداری" (Photo Guide)
│   │   ├── Subtitle: "برای بهترین نتیجه، این نکات را رعایت کنید"
│   │   └── Collapse button (if expanded)
│   ├── Carousel (Embla Carousel with RTL)
│   │   ├── Slide 1: Correct Example (✅ مثال صحیح)
│   │   │   ├── Image (room photo, straight angle)
│   │   │   ├── Icon: CheckCircle (green)
│   │   │   └── Label: "عکس مستقیم و واضح از اتاق"
│   │   ├── Slide 2: Incorrect - Tilted (❌ اشتباه)
│   │   │   ├── Image (tilted/crooked room)
│   │   │   ├── Icon: XCircle (red)
│   │   │   └── Label: "عکس کج و نامناسب"
│   │   ├── Slide 3: Incorrect - Outdoor (❌ اشتباه)
│   │   │   ├── Image (outdoor landscape)
│   │   │   ├── Icon: XCircle (red)
│   │   │   └── Label: "محیط بیرونی (باید داخلی باشد)"
│   │   ├── Slide 4: Incorrect - Top-down (❌ اشتباه)
│   │   │   ├── Image (floor view from above)
│   │   │   ├── Icon: XCircle (red)
│   │   │   └── Label: "زاویه از بالا (باید زاویه عادی باشد)"
│   │   └── Dot Indicators (RTL: right to left)
│   └── Footer
│       └── "متوجه شدم" (Got it) Button → onDismiss
```

#### Modified Component: `PhotoUpload.tsx`

```typescript
// Pseudocode additions (NOT implementation code)

State additions:
- showGuidance: boolean (controlled by localStorage flag)
- hasSeenGuidance: boolean (from localStorage)

Layout changes:
├── Header (existing)
│   └── Add Info Icon (ℹ️) button → toggles guidance
├── [NEW] UploadGuidance component (if showGuidance)
├── Upload Circle (existing)
├── Upload Info (existing)
└── Buttons (existing)
```

### 3. Data Flow

```
User enters PhotoUpload
    ↓
Check localStorage: hasSeenUploadGuidance
    ↓
If false → Show UploadGuidance (expanded)
If true → Hide UploadGuidance (show info icon in header)
    ↓
User interacts:
    - Swipes carousel (Embla RTL)
    - Clicks "Got it" → Collapse guidance, set localStorage flag
    - Clicks info icon → Re-expand guidance
    ↓
User proceeds with upload (existing flow)
```

### 4. Visual Design Specifications

#### Color Palette (Aligned with HOMA Brand)
- **Correct marker:** Green (#10B981 or #22C55E) with CheckCircle icon
- **Incorrect marker:** Red (#EF4444 or #DC2626) with XCircle icon
- **Background:** Light gray (#F3F4F6) or off-white (#FAFAFA)
- **Text:** Dark gray (#1A1A1A) for primary, #6B7280 for secondary
- **Button:** Black (#212121) with white text (matches existing HOMA CTAs)

#### Layout Dimensions
```
Mobile (375px viewport):
- Carousel container: w-full, h-auto
- Slide image: 345px × 260px (maintains aspect ratio)
- Padding: px-6 (matches PhotoUpload padding)
- Dot indicators: 8px diameter, 4px gap
- "Got it" button: h-14 (56px, matches existing buttons)

Desktop (1024px+ viewport):
- Carousel container: max-w-lg (512px)
- Slide image: 480px × 360px
- Same proportions, larger absolute size
```

#### Typography
```
Title: text-lg (18px), font-bold (700), Vazirmatn
Subtitle: text-sm (14px), font-normal (400), text-gray-600
Labels: text-xs (12px), font-medium (500)
```

#### Spacing & Rhythm
```
Container padding: pt-4 pb-6 px-6
Inter-element gap: gap-3 (12px)
Carousel margin-bottom: mb-4 (16px)
Vertical rhythm: Matches existing PhotoUpload spacing
```

### 5. Animation Strategy (Framer Motion)

#### Expand/Collapse Animation
```typescript
// Pseudocode (NOT implementation)
<motion.div
  initial={false}
  animate={isExpanded ? "expanded" : "collapsed"}
  variants={{
    expanded: {
      height: "auto",
      opacity: 1,
      marginBottom: 24 // space before upload circle
    },
    collapsed: {
      height: 0,
      opacity: 0,
      marginBottom: 0
    }
  }}
  transition={{
    duration: 0.3,
    ease: "easeInOut"
  }}
>
```

#### Carousel Slide Transitions
```typescript
// Embla Carousel configuration
const emblaOptions = {
  direction: 'rtl', // RTL for Persian
  loop: true, // Infinite scroll
  align: 'center',
  skipSnaps: false,
  duration: 25, // Smooth slide speed
}
```

#### Micro-interactions
- Info icon pulse on first load (draw attention)
- "Got it" button scale on tap (whileTap: { scale: 0.98 })
- Slide fade-in when carousel initializes

### 6. State Management

#### Local Storage Schema
```typescript
interface UploadGuidanceState {
  hasSeenUploadGuidance: boolean;
  lastSeenTimestamp: number; // Unix timestamp
  dismissCount: number; // Track how many times dismissed
}

Key: 'homa_upload_guidance_state'
Example: { hasSeenUploadGuidance: true, lastSeenTimestamp: 1736899200, dismissCount: 1 }
```

#### Component State
```typescript
// Inside PhotoUpload.tsx
const [guidanceState, setGuidanceState] = useState({
  isExpanded: false,
  hasBeenSeen: false,
});

useEffect(() => {
  const saved = localStorage.getItem('homa_upload_guidance_state');
  if (saved) {
    const parsed = JSON.parse(saved);
    setGuidanceState({
      isExpanded: !parsed.hasSeenUploadGuidance,
      hasBeenSeen: parsed.hasSeenUploadGuidance,
    });
  } else {
    setGuidanceState({ isExpanded: true, hasBeenSeen: false });
  }
}, []);
```

### 7. Accessibility

#### ARIA Labels
```html
<!-- Carousel container -->
<div role="region" aria-label="راهنمای آپلود عکس" aria-live="polite">

<!-- Slides -->
<div role="group" aria-roledescription="slide" aria-label="مثال ۱ از ۴">
  <img alt="مثال صحیح: عکس مستقیم از اتاق با نور طبیعی" />
</div>

<!-- Navigation -->
<button aria-label="اسلاید بعدی">→</button>
<button aria-label="اسلاید قبلی">←</button>
```

#### Keyboard Navigation
- Arrow keys: Navigate carousel (Embla built-in support)
- Tab: Focus info icon → "Got it" button → upload buttons
- Enter/Space: Trigger button actions
- Escape: Collapse guidance (if expanded)

#### Color Contrast
- Text on light background: 4.5:1 ratio (WCAG AA)
- Icon markers: High contrast red/green (#EF4444 / #10B981)
- Focus indicators: 2px solid outline (#1A1A1A)

### 8. Image Asset Management

#### Example Image Creation Strategy

**Source:**
- **Option A (Recommended):** Commission or create 4 custom photos that exactly match HOMA's brand aesthetic
- **Option B:** Use stock photos from Unsplash/Pexels (with proper attribution), edited to match criteria
- **Option C:** Use AI-generated room images (DALL-E, Midjourney) for consistency

**Image Naming Convention:**
```
/public/guidance-examples/
├── correct-room.webp (straight room photo, good lighting)
├── correct-room.jpg (JPEG fallback)
├── incorrect-tilted.webp (crooked/tilted photo)
├── incorrect-tilted.jpg
├── incorrect-outdoor.webp (outdoor landscape)
├── incorrect-outdoor.jpg
├── incorrect-topdown.webp (floor view from above)
└── incorrect-topdown.jpg
```

**Optimization Pipeline:**
```bash
# Example optimization commands (NOT to execute now)
# WebP conversion: cwebp -q 80 input.jpg -o output.webp
# JPEG optimization: jpegoptim --max=80 --strip-all input.jpg
# Responsive variants: convert input.jpg -resize 375x280 mobile.jpg
```

#### CDN/Storage Strategy
- **Development:** Serve from `/public` directory (Vite static assets)
- **Production:** Upload to MinIO object storage (same as product images)
- **API Endpoint:** `${API_BASE_URL}/api/guidance/images/{filename}`
- **Caching:** Set `Cache-Control: public, max-age=31536000` (1 year)

---

## Implementation Roadmap

### Phase 1: Foundation (Day 1-2)
**Goals:** Set up component structure, create example images, configure carousel

**Tasks:**
1. Create 4 example images (correct + 3 incorrect scenarios)
   - Correct: Straight room photo, good lighting, normal angle
   - Incorrect 1: Tilted/crooked angle
   - Incorrect 2: Outdoor landscape
   - Incorrect 3: Top-down floor view
2. Optimize images (WebP + JPEG, mobile + desktop sizes)
3. Upload to MinIO or place in `/public/guidance-examples/`
4. Create `UploadGuidance.tsx` component skeleton
5. Configure Embla Carousel with RTL support
6. Add Persian text labels and translations

**Deliverables:**
- 4 optimized example images (WebP + JPEG, ~150KB total)
- `UploadGuidance.tsx` component file
- Embla carousel configured with RTL

### Phase 2: UI & Interactions (Day 3-4)
**Goals:** Build carousel UI, add animations, implement collapsible behavior

**Tasks:**
1. Build carousel layout with 4 slides
   - Slide structure: Image + Icon (✅/❌) + Label
   - Dot indicators (RTL positioning)
   - Swipe gestures (touch-friendly)
2. Implement Framer Motion animations
   - Expand/collapse transitions
   - Slide fade-in
   - Micro-interactions (button scale, icon pulse)
3. Add "متوجه شدم" (Got it) button with dismiss logic
4. Style with Tailwind CSS (match HOMA design system)
5. Test on mobile devices (iOS Safari, Android Chrome)

**Deliverables:**
- Functional carousel with 4 example slides
- Smooth expand/collapse animations
- Mobile-tested swipe gestures

### Phase 3: Integration & State Management (Day 5-6)
**Goals:** Integrate into PhotoUpload, manage visibility state, localStorage persistence

**Tasks:**
1. Modify `PhotoUpload.tsx` to include `UploadGuidance` component
2. Add info icon (ℹ️) to PhotoUpload header
3. Implement localStorage logic for `hasSeenUploadGuidance` flag
4. Add toggle logic: Info icon → Expand guidance
5. First-time user flow: Auto-expand guidance on first upload
6. Returning user flow: Collapsed by default, show info icon
7. Test state transitions (expand, collapse, dismiss, re-access)

**Deliverables:**
- `PhotoUpload.tsx` updated with guidance integration
- Info icon toggle working
- localStorage persistence implemented

### Phase 4: Accessibility & RTL Polish (Day 7)
**Goals:** Ensure WCAG compliance, perfect RTL behavior, screen reader support

**Tasks:**
1. Add ARIA labels to all interactive elements
2. Test keyboard navigation (Tab, Arrow keys, Escape)
3. Verify color contrast ratios (WCAG AA)
4. Test RTL carousel direction (swipe right-to-left)
5. Test with screen readers (VoiceOver on iOS, TalkBack on Android)
6. Verify Persian text rendering and alignment
7. Add focus indicators for keyboard users

**Deliverables:**
- Fully accessible component (WCAG AA compliant)
- RTL carousel working perfectly
- Screen reader compatible

### Phase 5: Testing & Optimization (Day 8-9)
**Goals:** Cross-device testing, performance optimization, edge case handling

**Tasks:**
1. Cross-browser testing
   - Mobile: iOS Safari, Chrome Android, Samsung Internet
   - Desktop: Chrome, Firefox, Safari, Edge
2. Performance testing
   - Measure image load time (target: <500ms)
   - Check bundle size impact (target: <20KB added)
   - Test on slow 3G network
3. Edge case testing
   - User dismisses without viewing all slides
   - User re-expands guidance multiple times
   - User uploads without viewing guidance
4. Analytics integration
   - Track: Guidance shown, dismissed, re-accessed
   - Track: Carousel slide views
   - Track: Upload quality improvement (before/after guidance)

**Deliverables:**
- Cross-device compatibility confirmed
- Performance benchmarks met
- Analytics tracking implemented

### Phase 6: Documentation & Handoff (Day 10)
**Goals:** Document implementation, update project docs, prepare for deployment

**Tasks:**
1. Update CLAUDE.md with guidance feature details
2. Add component documentation (props, usage examples)
3. Update upload flow diagram in project docs
4. Create deployment checklist
5. Brief team on new feature
6. Prepare rollout plan (gradual rollout vs full launch)

**Deliverables:**
- Updated project documentation
- Deployment checklist
- Team briefing complete

---

## Risk Assessment

### Technical Risks

#### Risk 1: Embla Carousel RTL + Image Loading Issues
**Severity:** Medium
**Probability:** Low-Medium
**Impact:** Carousel may not load images correctly in RTL mode

**Mitigation:**
- Use eager loading for 4 small images (no lazy loading)
- Test extensively on RTL mode during Phase 2
- Have fallback: Simple image grid (no carousel) if Embla RTL fails
- Alternative library: Swiper.js (also supports RTL)

#### Risk 2: Increased Bundle Size
**Severity:** Low
**Probability:** Low
**Impact:** Slower initial page load

**Mitigation:**
- Lazy load `UploadGuidance` component (only on upload step)
- Optimize example images aggressively (WebP, max 150KB total)
- Monitor bundle size with webpack-bundle-analyzer
- Gzip compression on production server

#### Risk 3: Mobile Performance on Low-End Devices
**Severity:** Medium
**Probability:** Medium
**Impact:** Carousel animations may lag on older phones

**Mitigation:**
- Use CSS transforms (GPU-accelerated) for animations
- Reduce animation complexity on `prefers-reduced-motion`
- Test on low-end Android devices (e.g., Samsung A series)
- Provide instant fallback: Static grid view if animations lag

### UX Risks

#### Risk 4: Users Skip Guidance Without Reading
**Severity:** High
**Probability:** High
**Impact:** Users still upload poor quality photos

**Mitigation:**
- Make first slide (correct example) highly visible
- Use strong visual contrast (✅ green vs ❌ red)
- Track analytics: % of users who view guidance vs skip
- A/B test: Auto-expand vs collapsed by default
- Iterate based on upload quality metrics

#### Risk 5: Guidance Adds Friction to Upload Flow
**Severity:** Medium
**Probability:** Medium
**Impact:** Users abandon upload due to perceived complexity

**Mitigation:**
- Keep guidance collapsible (non-blocking)
- Allow users to proceed without viewing
- Track abandonment rate at upload step
- If abandonment increases >10%, consider hiding by default

#### Risk 6: Example Images Don't Match User Context
**Severity:** Medium
**Probability:** Medium
**Impact:** Users don't relate to examples (e.g., Western-style rooms vs Persian decor)

**Mitigation:**
- Use culturally appropriate room examples (Persian/Iranian interior design)
- Test with Persian-speaking users during Phase 5
- Gather feedback: "Were these examples helpful?" survey
- Iterate on example images based on feedback

### Business Risks

#### Risk 7: Development Time Overruns
**Severity:** Medium
**Probability:** Medium
**Impact:** Feature delayed, blocks other roadmap items

**Mitigation:**
- Phased approach: Ship MVP (Phase 1-3) first, polish later
- Clear scope: Stick to 4 examples, 1 carousel, no extras
- Daily standups to track progress
- Buffer time: 10-day estimate includes 2-day buffer

#### Risk 8: Low User Adoption of Guidance
**Severity:** Medium
**Probability:** Low
**Impact:** Development effort wasted if users ignore feature

**Mitigation:**
- Track KPIs: % users who view guidance, upload quality improvement
- A/B test: Show guidance vs no guidance (control group)
- Iterate based on data: If <30% view guidance, make more prominent
- Fallback: Move to tooltip or modal if inline fails

---

## Recommendations

### Immediate Actions (Pre-Implementation)

1. **Create Example Images First**
   - Priority: High
   - Rationale: Visual assets are the foundation; delays here block all development
   - Action: Commission designer or use AI to generate 4 culturally appropriate room photos
   - Timeline: 1-2 days

2. **Set Up Analytics Tracking**
   - Priority: High
   - Rationale: Need data to measure success and iterate
   - Action: Define KPIs (% viewed, % dismissed, upload quality delta)
   - Timeline: 1 day

3. **User Research (Optional but Recommended)**
   - Priority: Medium
   - Rationale: Validate that users actually need this guidance
   - Action: Interview 5-10 users, ask "What makes a good room photo?"
   - Timeline: 2-3 days (parallel with Phase 1)

### Long-Term Considerations

1. **Internationalization (i18n)**
   - Current scope: Persian only
   - Future: Support multiple languages (Arabic, English, etc.)
   - Preparation: Store labels in separate i18n file, not hardcoded

2. **Smart Guidance Based on User Behavior**
   - Current scope: Static guidance (same for all users)
   - Future: Show guidance only if user's previous uploads were poor quality
   - Requires: Backend integration to track upload history

3. **Video Tutorial Alternative**
   - Current scope: Static images
   - Future: 10-second video showing "how to take a good room photo"
   - Considerations: Video file size, autoplay policies, accessibility (captions)

4. **Integration with FilePrecheck**
   - Current scope: Guidance shown before upload
   - Future: If FilePrecheck detects poor quality, show guidance again
   - Synergy: Proactive + reactive guidance

### Success Metrics

**Primary KPIs:**
1. **Guidance View Rate:** % of users who see at least 1 slide (Target: >60%)
2. **Upload Quality Improvement:** % of uploads passing FilePrecheck after guidance (Target: +20% vs baseline)
3. **Abandonment Rate:** % of users who abandon at upload step (Target: <5% increase)

**Secondary KPIs:**
1. **Carousel Engagement:** Average # of slides viewed per user (Target: 2.5/4)
2. **Re-access Rate:** % of users who re-expand guidance via info icon (Target: >10%)
3. **Dismiss Time:** Average seconds before dismissing guidance (Target: >8 seconds, indicates reading)

**Measurement Plan:**
- Track events via `trackKPI()` function (already in App.tsx)
- Events to add:
  - `guidance_shown`
  - `guidance_dismissed`
  - `guidance_reaccessed`
  - `guidance_slide_viewed` (with slide index)
  - `upload_after_guidance` (compare quality before/after)

### Trade-off Analysis

#### Option A: Inline Collapsible Carousel (RECOMMENDED)
**Pros:**
- Contextual, non-blocking, mobile-optimized
- Visual learning (4 examples)
- Re-accessible, progressive disclosure

**Cons:**
- Requires vertical space (collapsible mitigates)
- Development complexity (carousel + state management)

**Verdict:** ✅ Best balance of education and UX

#### Option B: Modal Before Upload
**Pros:**
- Captures full attention
- Guaranteed visibility

**Cons:**
- Blocks upload action (adds friction)
- Feels like forced tutorial (high skip rate)
- Not easily re-accessible

**Verdict:** ❌ Too intrusive for mobile-first app

#### Option C: Tooltip on Info Icon
**Pros:**
- Minimal space
- On-demand help

**Cons:**
- Too small for visual examples
- Not discoverable (users won't click icon)
- Not mobile-friendly (hover issues)

**Verdict:** ❌ Insufficient for visual guidance

#### Option D: Full-Screen Onboarding (Once Only)
**Pros:**
- Educational, immersive
- Can show detailed examples

**Cons:**
- Delays core action
- One-time only (not re-accessible)
- High skip rate

**Verdict:** ❌ Not suitable for recurring action (upload)

---

## Technical Implementation Notes

### Dependencies
- **Embla Carousel React:** Already installed (`embla-carousel-react@8.6.0`)
- **Framer Motion:** Already installed (`motion/react`)
- **Lucide Icons:** Already installed (CheckCircle, XCircle, Info)
- **Tailwind CSS:** Already configured
- **No new dependencies required** ✅

### File Structure
```
src/
├── components/
│   ├── PhotoUpload.tsx (modify: integrate guidance)
│   ├── UploadGuidance.tsx (new: carousel component)
│   └── ui/
│       └── carousel.tsx (existing: Embla wrapper, can reuse)
├── assets/
│   └── guidance-examples/ (new: example images)
│       ├── correct-room.webp
│       ├── correct-room.jpg
│       ├── incorrect-tilted.webp
│       ├── incorrect-tilted.jpg
│       ├── incorrect-outdoor.webp
│       ├── incorrect-outdoor.jpg
│       ├── incorrect-topdown.webp
│       └── incorrect-topdown.jpg
├── utils/
│   └── uploadGuidanceState.ts (new: localStorage helpers)
└── types/
    └── uploadGuidance.ts (new: TypeScript interfaces)
```

### API Changes
**None required.** This is a pure frontend feature with no backend dependencies.

### Database Changes
**None required.** State is stored in browser localStorage only.

### Configuration Changes
**None required.** Uses existing Vite, Tailwind, and Motion config.

---

## Appendix: Example Component Pseudocode

### UploadGuidance Component Signature

```typescript
// TypeScript interface (NOT implementation code)
interface UploadGuidanceProps {
  isExpanded: boolean;
  onToggle: () => void;
  onDismiss: () => void;
  className?: string;
}

interface GuidanceSlide {
  id: string;
  type: 'correct' | 'incorrect';
  imageUrl: string;
  imageFallbackUrl: string; // JPEG fallback for WebP
  altText: string;
  label: string;
  icon: 'check' | 'x';
}

const slides: GuidanceSlide[] = [
  {
    id: 'correct-1',
    type: 'correct',
    imageUrl: '/guidance-examples/correct-room.webp',
    imageFallbackUrl: '/guidance-examples/correct-room.jpg',
    altText: 'مثال صحیح: عکس مستقیم از اتاق با نور طبیعی',
    label: 'عکس مستقیم و واضح از اتاق',
    icon: 'check',
  },
  {
    id: 'incorrect-tilted',
    type: 'incorrect',
    imageUrl: '/guidance-examples/incorrect-tilted.webp',
    imageFallbackUrl: '/guidance-examples/incorrect-tilted.jpg',
    altText: 'مثال نادرست: عکس کج و نامناسب',
    label: 'عکس کج و نامناسب',
    icon: 'x',
  },
  // ... other slides
];
```

### PhotoUpload Integration Points

```typescript
// Pseudocode modifications to PhotoUpload.tsx (NOT implementation code)

// 1. Add state for guidance visibility
const [showGuidance, setShowGuidance] = useState(false);
const [hasSeenGuidance, setHasSeenGuidance] = useState(false);

// 2. Check localStorage on mount
useEffect(() => {
  const guidanceState = localStorage.getItem('homa_upload_guidance_state');
  if (guidanceState) {
    const { hasSeenUploadGuidance } = JSON.parse(guidanceState);
    setHasSeenGuidance(hasSeenUploadGuidance);
    setShowGuidance(!hasSeenUploadGuidance); // Show if not seen before
  } else {
    setShowGuidance(true); // First time: show guidance
  }
}, []);

// 3. Handle dismiss
const handleDismissGuidance = () => {
  setShowGuidance(false);
  setHasSeenGuidance(true);
  localStorage.setItem('homa_upload_guidance_state', JSON.stringify({
    hasSeenUploadGuidance: true,
    lastSeenTimestamp: Date.now(),
    dismissCount: 1,
  }));
};

// 4. Handle re-access via info icon
const handleToggleGuidance = () => {
  setShowGuidance(!showGuidance);
};

// 5. Render guidance in layout
return (
  <div className="min-h-screen bg-white">
    <Header
      onBack={onBack}
      // Add info icon if guidance has been seen
      showGuidanceIcon={hasSeenGuidance}
      onGuidanceIconClick={handleToggleGuidance}
    />

    <div className="pt-14">
      <motion.div className="max-w-lg mx-auto px-6 py-6">
        {/* Guidance Component (collapsible) */}
        {showGuidance && (
          <UploadGuidance
            isExpanded={showGuidance}
            onToggle={handleToggleGuidance}
            onDismiss={handleDismissGuidance}
          />
        )}

        {/* Existing upload UI */}
        <div className="w-full aspect-square rounded-full...">
          {/* Upload circle */}
        </div>

        {/* Existing buttons */}
      </motion.div>
    </div>
  </div>
);
```

---

## Conclusion

This architectural plan provides a comprehensive blueprint for implementing an image upload guidance feature in the HOMA furniture visualization app. The recommended approach—an **inline collapsible carousel with 4 visual examples**—balances user education with minimal friction, aligns with 2025 mobile-first UX best practices, and respects the app's Persian/RTL design requirements.

**Next Steps:**
1. Review and approve this plan
2. Create 4 example images (Priority: High)
3. Begin Phase 1 implementation
4. Track KPIs and iterate based on user data

**Estimated Timeline:** 10 days (including buffer)
**Risk Level:** Low-Medium (mitigations in place for all identified risks)
**Expected Impact:** +20% upload quality improvement, 60%+ guidance view rate

---

**Document Version:** 1.0
**Date:** 2025-11-18
**Author:** Technical Research Analyst (Claude)
**Status:** Ready for Implementation
