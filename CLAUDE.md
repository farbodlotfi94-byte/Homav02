# CLAUDE.md - HOMA Frontend

> **Persian/Farsi RTL furniture visualization app** - Users upload room photos, AI shows products in their space.

---

## 1. Critical Rules

### MUST Follow
1. **All UI text in Persian** - Error messages, labels, buttons, placeholders
2. **RTL layout** - Use `text-right`, `flex-row-reverse`, right-aligned content by default
3. **Use shadcn/ui components** from `src/components/ui/` - Never recreate existing components
4. **Use Lucide icons** - Import from `lucide-react`, no other icon libraries
5. **Use `cn()` utility** - Import from `./ui/utils` for className merging
6. **Use Motion for animations** - Import from `motion/react`, not `framer-motion`
7. **Persian number formatting** - Use `toLocaleString('fa-IR')` for numbers and prices
8. **Read files before editing** - Understand existing patterns first

### NEVER Do
- Create new UI components when shadcn/ui has one (check `src/components/ui/`)
- Use `framer-motion` import (use `motion/react` instead)
- Hardcode colors - Use CSS variables (`bg-primary`, `text-muted-foreground`)
- Skip animation preference check - Use `useAnimationPreference()` hook
- Use LTR patterns - This is an RTL app (Persian/Farsi)
- Add English user-facing text
- Use `px` values when spacing tokens exist (`p-4`, `gap-6`, etc.)
- Create inline styles when Tailwind classes exist

### Route vs State Decision

| Need URL Route When... | Use State When... |
|------------------------|-------------------|
| SEO matters | Transient/processing |
| Shareable link needed | Modal/overlay |
| Bookmarkable | Ephemeral state |
| Direct navigation | Contextual to page |

```
User asks for "new page" → Create route
User asks for "modal/popup" → Use state
User asks for "loading indicator" → Use state
```

---

## 2. UI & Design System

### Design Philosophy
- **Apple-inspired** - Clean, spacious, subtle animations
- **Modern & polished** - Not generic or flat
- **Mobile-first** - Responsive with `sm:`, `md:`, `lg:` breakpoints
- **Accessibility** - Focus rings, proper contrast, semantic HTML

### Color Palette (from `src/styles/globals.css`)

Design tokens use **OKLCH color space** for perceptual uniformity.

```css
/* Primary Colors */
--primary: oklch(0.62 0.19 250)     /* Blue - buttons, links */
--accent: oklch(0.53 0.22 27)       /* HOMA Red #E31E24 */
--accent-light: oklch(0.93 0.04 70) /* Beige/cream #F5E6D3 */

/* Semantic Colors */
--background: oklch(0.97 0.00 0)    /* #F2F2F7 - App background */
--card: oklch(1.00 0.00 0)          /* #FFFFFF - Card backgrounds */
--muted: oklch(0.55 0.00 0 / 0.12)  /* Gray transparent */
--destructive: oklch(0.60 0.24 25)  /* #FF383C - Error red */

/* Seller Portal Theme */
--seller-primary: #EEFF41           /* Yellow accent for seller dashboard */
```

**Tailwind Configuration:** `src/styles/globals.css` contains the `@theme inline` block that maps CSS variables to Tailwind utilities.

**Usage:**
```tsx
// DO - Use semantic classes
<div className="bg-background text-foreground">
<button className="bg-primary text-primary-foreground">
<p className="text-muted-foreground">

// DON'T - Hardcode colors
<div style={{ background: '#F2F2F7' }}>
```

### Typography

| Level | Class | Use For |
|-------|-------|---------|
| H1 | `text-2xl sm:text-3xl lg:text-4xl font-bold` | Page titles |
| H2 | `text-xl lg:text-2xl font-bold` | Section headers |
| H3 | `text-lg font-semibold` | Card titles |
| Body | `text-base` | Paragraphs |
| Caption | `text-sm text-muted-foreground` | Helper text |

**Font**: Vazirmatn (Persian) - Already loaded globally via `src/styles/fonts.css`

### Border Radius Tokens

```tsx
rounded-2xl      // 16px - Cards, modals (--radius-card: 20px)
rounded-full     // Pill buttons (--radius-button: 100px)
rounded-lg       // 8px - Inputs, smaller elements
```

### Shadows

```tsx
shadow-xl shadow-gray-900/10    // Subtle elevation
shadow-2xl shadow-gray-900/10   // Card elevation
shadow-lg                        // Standard elevation
```

### Icons (Lucide React)

```tsx
import { Upload, ChevronDown, Clock, X, Check } from "lucide-react";

// Size patterns
<Icon className="w-4 h-4" />   // Small (buttons)
<Icon className="w-5 h-5" />   // Default
<Icon className="w-6 h-6" />   // Large
```

**Common icons used**: `Upload`, `ChevronDown`, `ChevronRight`, `Clock`, `X`, `Check`, `Menu`, `ArrowRight`, `Camera`, `Image`

### Custom Utilities (from `globals.css`)

```tsx
// Glass effects
className="glass"       // Yellow-tinted glass
className="glass-dark"  // Dark glass
className="glass-light" // Light glass

// Typography shortcuts
className="text-h1"     // Responsive H1 size
className="text-h2"     // Responsive H2 size
className="text-h3"     // Responsive H3 size
className="text-caption" // Small caption text

// Custom colors (all available as Tailwind classes)
className="bg-accent"           // HOMA Red
className="bg-accent-light"     // Beige/cream
className="text-feedback-good"  // Dark green
className="bg-old-flax"         // Yellow-green
className="text-jet-black"      // Near black

// Custom radius
className="rounded-button"  // Pill shape (100px)
className="rounded-input"   // Input radius (12px)

// Custom shadows
className="shadow-elevation-sm"  // Large soft shadow
className="shadow-elevation-md"  // Medium elevation
className="shadow-elevation-lg"  // Large elevation

// Helpers
className="scrollbar-hide"  // Hide scrollbar
className="rtl"             // Force RTL
className="ltr"             // Force LTR
```

### shadcn/ui Components Available

**Layout**: `Card`, `Separator`, `ScrollArea`, `Sheet`, `Dialog`, `Drawer`
**Forms**: `Button`, `Input`, `Select`, `Checkbox`, `Switch`, `RadioGroup`, `Form`, `Label`
**Feedback**: `Alert`, `AlertDialog`, `Progress`, `Skeleton`, `Badge`
**Navigation**: `Tabs`, `Accordion`, `Breadcrumb`, `NavigationMenu`
**Overlay**: `Dialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu`
**Data**: `Table`, `Calendar`, `Carousel`
**Custom**: `OTPInput`, `PhoneInput`, `CountdownTimer`, `RichTextEditor`

**Import pattern:**
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
```

### Animation Patterns

**Using Motion (Framer Motion):**
```tsx
import { motion, AnimatePresence } from "motion/react";
import { useAnimationPreference } from "../hooks/useAnimationPreference";

function MyComponent() {
  const shouldAnimate = useAnimationPreference();

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
      transition={shouldAnimate ? { duration: 0.5, ease: "easeOut" } : undefined}
    >
      Content
    </motion.div>
  );
}
```

**AnimatePresence for exit animations:**
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      Expandable content
    </motion.div>
  )}
</AnimatePresence>
```

**CSS Animation Classes** (from `animations.css`):
```tsx
className="animate-slide-in-bottom"  // Entrance from bottom
className="animate-scale-in"         // Scale entrance
className="animate-spin"             // Loading spinner
className="animate-bounce"           // Attention getter
className="hover-scale"              // Hover scale effect
```

### Component Creation Checklist

When creating a new component:

- [ ] Check if shadcn/ui has it in `src/components/ui/`
- [ ] Import `cn` from `./ui/utils` for classNames
- [ ] Use CSS variables for colors (`bg-primary`, not `bg-blue-500`)
- [ ] Add RTL support (`text-right`, `flex-row-reverse` where needed)
- [ ] Use `useAnimationPreference()` for animations
- [ ] All user-facing text in Persian
- [ ] Responsive classes (`sm:`, `md:`, `lg:`)
- [ ] Focus states for accessibility
- [ ] TypeScript interface for props

### Example Component Pattern

```tsx
import { motion } from "motion/react";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useAnimationPreference } from "@/hooks/useAnimationPreference";

interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
  className?: string;
}

export function ProductCard({ product, onSelect, className }: ProductCardProps) {
  const shouldAnimate = useAnimationPreference();

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : false}
      animate={shouldAnimate ? { opacity: 1, scale: 1 } : false}
      transition={shouldAnimate ? { duration: 0.3 } : undefined}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-right">{product.name}</h3>
          <p className="text-muted-foreground text-sm text-right">
            {product.price.toLocaleString('fa-IR')} تومان
          </p>
          <Button
            onClick={() => onSelect(product.id)}
            className="w-full mt-4"
          >
            <Upload className="w-4 h-4 ml-2" />
            امتحان کن
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

---

## 3. Quick Reference

### Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build → build/
npm test         # Vitest watch mode
npm run test:run # Run tests once
```

### File Locations

| Need to... | Look in... |
|------------|------------|
| Add UI component | `src/components/ui/` |
| Edit main flow | `src/App.tsx` |
| Add product type | `src/types/product.ts` |
| Edit API calls | `src/services/api.ts` |
| Add auth logic | `src/services/userAuthService.ts` |
| Add analytics | `src/utils/analytics.ts` |
| Edit design tokens | `src/styles/globals.css` |
| Add animation | `src/styles/animations.css` |
| Tailwind config | `src/styles/globals.css` (`@theme inline` block) |
| CSS entry point | `src/index.css` |

### Common Code Templates

**Toast notification:**
```tsx
import { toast } from "sonner";
toast.success("عملیات موفق");
toast.error("خطایی رخ داد");
```

**API call pattern:**
```tsx
import { apiClient } from "@/services/api";

const response = await apiClient.get('/api/products/');
if (response.success) {
  setProducts(response.data);
} else {
  toast.error(response.message || "خطا در دریافت محصولات");
}
```

**Persian number formatting:**
```tsx
const price = 1500000;
const formatted = price.toLocaleString('fa-IR'); // "۱٬۵۰۰٬۰۰۰"
```

**Conditional animation:**
```tsx
const shouldAnimate = useAnimationPreference();
<motion.div
  initial={shouldAnimate ? { opacity: 0 } : false}
  animate={shouldAnimate ? { opacity: 1 } : false}
/>
```

---

## 4. Architecture Overview

### Application Flow

```
[Shop Selection] → [Product Selection] → [Product Landing] → [Upload] → [Processing] → [Visualization]
       /                 /:shop              /:shop/product/:id         (state)        (state)
```

**Routes** (in `App.tsx`):
- `/` - Shop selection grid
- `/:shopName` - Product listing for shop
- `/:shopName/product/:uniqueLink` - Product detail
- `/discovery` - AI product discovery
- `/discovery/results` - Discovery results
- `/seller` - Seller dashboard
- `/admin` - Admin panel
- `/about-us` - About page

### State Machine Steps

| Step | Type | Purpose |
|------|------|---------|
| `loading` | State | Initial fetch |
| `shop-selection` | Route | Pick shop |
| `product-selection` | Route | Pick product |
| `product-landing` | Route | Product CTA |
| `product-fallback` | State | Error display |
| `user-auth` | State | OTP modal |
| `upload` | State | Photo upload |
| `precheck` | State | Quality check |
| `staged-upload` | State | Upload progress |
| `confirmation` | State | Success message |
| `visualization` | State | Show result |
| `feedback` | State | Survey modal |
| `error` | State | Error recovery |

### API Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| List shops | GET | `/api/shops/list/` |
| List products | GET | `/api/products/?shop=` |
| Get product | GET | `/api/products/{unique_link}/` |
| Process image | POST | `/api/products/{unique_link}/process/` |
| Send OTP | POST | `/api/users/otp/phone-verify/send/` |
| Verify OTP | POST | `/api/users/otp/phone-verify/verify/` |
| Login | POST | `/api/users/login/` |
| Register | POST | `/api/users/register/` |

### Key Services

- `userAuthService.ts` - User auth with JWT tokens
- `sellerAuthService.ts` - Seller auth with JWT tokens
- `api.ts` - HTTP client with retry logic
- `posthog.ts` - Analytics tracking
- `aiImageProcessor.ts` - Image processing calls

---

## 5. Conventions

### Display Field Pattern
Backend returns both raw and display fields:
```tsx
// Render display value in UI
<span>{product.category_display}</span>

// Use raw value for logic
if (product.category === 'rug') { ... }
```

### Event Handler Naming
```tsx
const handleUploadStart = () => { ... }
const handleProductSelect = (id: string) => { ... }
const handleBack = () => { ... }
```

### Console Logging
```tsx
console.log('[ComponentName] action description', data);
// Example: console.log('[ProductSelection] fetching products', { shopId });
```

### Type Locations
- `src/types/product.ts` - Product, ProductVariant
- `src/types/auth.ts` - User, AuthData
- `src/types/shop.ts` - Shop
- `src/types/discovery.ts` - Discovery flow types
- `src/types/seller-api.ts` - Seller API responses

---

## 6. Environment & Deployment

### Environment Variables

```bash
VITE_API_BASE_URL=https://api.myhoma.ir
VITE_API_TIMEOUT=300000
VITE_API_IMAGE_PROCESSING_TIMEOUT=600000
VITE_PUBLIC_POSTHOG_KEY=
VITE_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

### Debug Tools
- `/admin` - Admin dashboard
- `Shift+Ctrl+B` - Brand colors guide
- `window.testProductSelection()` - Test helper
- Console prefixes: `[App]`, `[API]`, `[KPI]`, `[UserAuth]`

### Seller Dashboard Notes
- Isolated CSS in `src/integrations/seller-dashboard/index.css`
- Vendored packages with version aliases in `vite.config.ts`
- Yellow accent theme (`--seller-primary: #EEFF41`)

---

## Quick Answers

**Q: Where do I add a new shadcn component?**
A: `src/components/ui/` - Or check if it already exists there

**Q: How do I make text Persian?**
A: Just write in Persian, font is already configured

**Q: How do I format currency?**
A: `price.toLocaleString('fa-IR') + ' تومان'`

**Q: How do I add an animation?**
A: Use `motion/react` with `useAnimationPreference()` hook

**Q: Route or state for my feature?**
A: Shareable/SEO = Route. Transient/modal = State.

**Q: How do I show a toast?**
A: `import { toast } from "sonner"` then `toast.success("پیام")`
