# UI Component Development Skill

You are helping create or modify UI components for the HOMA Persian/Farsi application.

## Context

HOMA uses React + TypeScript with Tailwind CSS, Radix UI, and shadcn/ui components. All UI text is in Persian with RTL support.

## Your Task

When working with UI components:

1. **Component Structure**
   - Use functional components with TypeScript
   - Define Props interface inline or export it
   - Use `src/components/ui/` for reusable UI primitives
   - Use Framer Motion for animations with `AnimatePresence`

2. **Persian/RTL Support**
   - All user-facing text in Persian (فارسی)
   - Use RTL-aware Tailwind classes (e.g., `mr-4` → `ms-4`, `text-left` → `text-start`)
   - Font family: Vazirmatn (defined in index.css)
   - Direction handled by Tailwind CSS (`dir="rtl"`)

3. **Styling Guidelines**
   - Tailwind utility classes (v4)
   - Use `clsx()` or `cn()` for conditional classes
   - Responsive design: mobile-first approach
   - Color palette: Check existing components or use BrandColors debug tool (Shift+Ctrl+B)
   - Spacing: Consistent with existing components

4. **Using Radix UI + shadcn/ui**
   - Reusable components in `src/components/ui/`
   - Import from `@/components/ui/` path alias
   - Available: button, card, dialog, dropdown, form, input, modal, select, tabs, toast, etc.
   - 60+ pre-built components ready to use

5. **Animation Patterns**
   - Use Framer Motion for entrance/exit animations
   - Wrap in `<AnimatePresence>` for exit animations
   - Common patterns: fadeIn, slideIn, scale transitions
   - Keep animations subtle and fast (200-300ms)

6. **Event Handlers**
   - Name with `handle` prefix (e.g., `handleClick`, `handleSubmit`)
   - Type event parameters properly (React.MouseEvent, React.ChangeEvent)
   - Call parent handlers passed via props

7. **Icons**
   - Use `lucide-react` icon library
   - Import as needed: `import { IconName } from 'lucide-react'`
   - Consistent sizing (usually w-5 h-5 or w-6 h-6)

8. **Forms**
   - Use `react-hook-form` for complex forms
   - Validation with type-safe schemas
   - Persian error messages
   - Accessible labels and ARIA attributes

## Key Files
- `src/components/ui/` - Reusable UI components (60+ components)
- `src/components/` - Feature-specific components
- `src/index.css` - Tailwind config + Persian fonts
- `src/styles/` - Global styles and animations

## Example Component Pattern

```tsx
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface MyComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const handleClick = () => {
    // Logic here
    onAction()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 p-6"
    >
      <h2 className="text-2xl font-bold text-start">{title}</h2>
      <Button onClick={handleClick}>
        انجام عملیات
      </Button>
    </motion.div>
  )
}
```

## Conventions
- Component file names: PascalCase.tsx
- Props interface: ComponentNameProps
- Export component as named export
- Persian text for all user-facing content
- Console logs in English with `[ComponentName]` prefix
- Accessibility: Proper ARIA labels, keyboard navigation