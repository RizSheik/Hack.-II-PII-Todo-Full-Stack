# Research: Advanced UI Animations with Framer Motion

**Feature**: 1-ui-animations
**Date**: 2026-01-25
**Purpose**: Research best practices for integrating Framer Motion into Next.js TaskFlow frontend

---

## 1. Framer Motion + Next.js App Router Integration

### Decision
Use Framer Motion with 'use client' directive on animated components. Leverage Next.js App Router's client component boundaries to isolate animation logic while keeping server components for data fetching.

### Rationale
- Framer Motion requires browser APIs (DOM, requestAnimationFrame) unavailable during SSR
- Next.js App Router defaults to Server Components, requiring explicit 'use client' for interactive components
- Client components can import and use Server Components, enabling optimal code splitting
- This approach maintains Next.js performance benefits while adding animations where needed

### Alternatives Considered
1. **Make entire app client-side**: Rejected - loses SSR benefits, increases bundle size
2. **Use CSS-only animations**: Rejected - insufficient control for complex interactions, no AnimatePresence
3. **Dynamic imports for animations**: Considered but adds complexity; 'use client' is cleaner

### Implementation Notes
- Add 'use client' directive at top of files using motion components
- Keep layout and page components as Server Components when possible
- Animated components (tasks, modals, tabs) will be client components
- Use dynamic imports only for heavy animation utilities if bundle size becomes an issue

### Code Pattern
```typescript
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { taskVariants } from '@/lib/animations/variants';

export function TaskList({ tasks }) {
  return (
    <motion.ul variants={taskVariants.container} initial="hidden" animate="visible">
      <AnimatePresence mode="popLayout">
        {tasks.map(task => (
          <motion.li key={task.id} variants={taskVariants.item} exit="exit">
            {task.title}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
```

---

## 2. Performance Optimization

### Decision
Use GPU-accelerated properties exclusively (transform, opacity) and implement layout animations via Framer Motion's layout prop for smooth reflows.

### Rationale
- Transform and opacity trigger compositing, not layout/paint (60fps achievable)
- Properties like width, height, top, left trigger layout recalculation (causes jank)
- Framer Motion's layout prop uses FLIP technique for performant layout animations
- AnimatePresence with mode="popLayout" prevents layout shift during exit animations

### GPU-Accelerated Properties (USE THESE)
- `transform: translate()` - for position changes
- `transform: scale()` - for size changes
- `transform: rotate()` - for rotation
- `opacity` - for fade effects

### Layout-Triggering Properties (AVOID THESE)
- `width`, `height` - use scale() instead
- `top`, `left`, `right`, `bottom` - use translate() instead
- `margin`, `padding` - restructure to avoid animating these
- `border-width` - use scale or opacity instead

### Profiling Tools
1. **Chrome DevTools Performance Tab**
   - Record animation sequence
   - Look for yellow/red bars (frame drops)
   - Check "Rendering" tab for paint flashing

2. **Chrome DevTools Layers Tab**
   - Verify elements are on their own compositing layer
   - Check for "will-change: transform" or "transform: translateZ(0)"

3. **React DevTools Profiler**
   - Measure component render time during animations
   - Identify unnecessary re-renders

### Performance Checklist
- [ ] All animations use transform/opacity only
- [ ] No layout-triggering properties animated
- [ ] AnimatePresence mode="popLayout" for lists
- [ ] useReducedMotion hook implemented
- [ ] Animations tested on low-end devices
- [ ] Bundle size increase measured (<50KB target)

### Code Pattern
```typescript
// ✅ GOOD: GPU-accelerated
const goodVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ❌ BAD: Triggers layout
const badVariants = {
  hidden: { opacity: 0, top: '20px' },
  visible: { opacity: 1, top: '0px' },
};
```

---

## 3. Reduced Motion Accessibility

### Decision
Use Framer Motion's `useReducedMotion()` hook to detect user preferences and provide simplified animation variants that complete in <0.1s or disable animations entirely.

### Rationale
- Users with vestibular disorders can experience motion sickness from animations
- prefers-reduced-motion is a standard media query supported by all modern browsers
- Framer Motion provides built-in hook for easy detection
- Accessibility is a constitutional requirement and success criterion

### Hook Usage Pattern
```typescript
'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

export function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.05 } },
      }
    : {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 25 }
        },
      };

  return (
    <motion.div variants={variants} initial="hidden" animate="visible">
      Content
    </motion.div>
  );
}
```

### Simplified Animation Guidelines
When reduced motion is enabled:
- **Disable**: Complex movements (slide, scale, rotate combinations)
- **Simplify**: Use opacity-only fades with duration <0.1s
- **Keep**: Instant state changes (no animation)
- **Preserve**: Functionality must work identically

### Testing Strategy
1. **Browser DevTools**:
   - Chrome: DevTools > Rendering > Emulate CSS media feature prefers-reduced-motion
   - Firefox: about:config > ui.prefersReducedMotion = 1
   - Safari: System Preferences > Accessibility > Display > Reduce motion

2. **Manual Testing**:
   - Enable reduced motion in OS settings
   - Verify all animations are simplified or disabled
   - Confirm no functionality is lost

3. **Automated Testing**:
   - Mock useReducedMotion hook in tests
   - Verify correct variant selection

---

## 4. Animation Variant Organization

### Decision
Centralize all animation variants in `lib/animations/variants.ts` organized by component category, with shared constants in `lib/animations/constants.ts`.

### Rationale
- Single source of truth for all animation configurations
- Easy to maintain consistency across components
- Enables reusability and reduces duplication
- Simplifies updates to timing or easing functions
- Follows DRY principle and separation of concerns

### Variant Organization Pattern

**File Structure**:
```
lib/animations/
├── constants.ts    # Timing, easing, stagger values
├── variants.ts     # All animation variant definitions
└── hooks.ts        # Custom animation hooks
```

**constants.ts**:
```typescript
export const ANIMATION_DURATION = {
  fast: 0.3,
  normal: 0.4,
  slow: 0.6,
  reduced: 0.05, // For reduced motion
} as const;

export const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
};

export const EASE_OUT = {
  type: 'tween' as const,
  ease: 'easeOut',
};

export const STAGGER_DELAY = {
  list: 0.08,
  cards: 0.12,
  fast: 0.05,
} as const;
```

**variants.ts**:
```typescript
import { Variants } from 'framer-motion';
import { ANIMATION_DURATION, SPRING_CONFIG, STAGGER_DELAY } from './constants';

// Task list animations
export const taskListVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: STAGGER_DELAY.list,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: SPRING_CONFIG,
    },
    exit: {
      opacity: 0,
      x: 100,
      transition: { duration: ANIMATION_DURATION.fast },
    },
  },
} satisfies Record<string, Variants>;

// Modal animations
export const modalVariants = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  dialog: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: SPRING_CONFIG,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: ANIMATION_DURATION.fast },
    },
  },
} satisfies Record<string, Variants>;

// Tab animations
export const tabVariants = {
  indicator: {
    // Uses layout animation (no variants needed)
  },
  content: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: ANIMATION_DURATION.normal },
    },
    exit: {
      opacity: 0,
      transition: { duration: ANIMATION_DURATION.fast },
    },
  },
} satisfies Record<string, Variants>;
```

### Reusability Strategy
- Use TypeScript `satisfies` for type safety
- Export variants as const objects
- Import only needed variants in components
- Compose complex animations from simple variants
- Use spread operator to extend base variants

---

## 5. Shadcn/UI Integration

### Decision
Wrap Shadcn/UI components with Framer Motion's motion primitives using the `motion()` function or by wrapping the component JSX directly.

### Rationale
- Shadcn/UI components are unstyled and don't include animations by default
- Components are copied into the project, so we can modify them directly
- Wrapping with motion primitives preserves all Shadcn functionality
- No conflicts with Tailwind since we're using transform/opacity (not Tailwind transitions)

### Integration Approach

**Option 1: Wrap Component JSX** (Recommended for simple cases)
```typescript
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function AnimatedButton({ children, ...props }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
      <Button {...props}>{children}</Button>
    </motion.div>
  );
}
```

**Option 2: Create Motion Component** (For reusable animated versions)
```typescript
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

const MotionButton = motion(Button);

export const AnimatedButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Button>
>(({ children, ...props }, ref) => {
  return (
    <MotionButton
      ref={ref}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </MotionButton>
  );
});

AnimatedButton.displayName = 'AnimatedButton';
```

**Option 3: Modify Shadcn Component Directly** (For components used everywhere)
```typescript
// In components/ui/button.tsx
'use client';

import { motion } from 'framer-motion';
// ... existing imports

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      />
    );
  }
);
```

### Conflict Resolution

**Tailwind Transition Conflicts**:
- Audit existing components for `transition-*` classes
- Remove Tailwind transitions where Framer Motion is used
- Framer Motion takes precedence over CSS transitions

**Example Conflict Fix**:
```typescript
// ❌ BEFORE: Tailwind transition conflicts with Framer Motion
<Button className="transition-all hover:scale-105">Click</Button>

// ✅ AFTER: Remove Tailwind transition, use Framer Motion
<motion.div whileHover={{ scale: 1.05 }}>
  <Button>Click</Button>
</motion.div>
```

### Component Wrapping Pattern

For task cards, modals, and other complex components:
1. Identify the root element to animate
2. Add 'use client' directive if not present
3. Import motion and variants
4. Wrap root element with motion primitive
5. Apply variants and AnimatePresence if needed
6. Test that all Shadcn functionality still works

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Next.js Integration** | Use 'use client' on animated components | Framer Motion requires browser APIs |
| **Performance** | GPU-accelerated properties only (transform, opacity) | Maintains 60fps, avoids layout thrashing |
| **Accessibility** | useReducedMotion hook with simplified variants | Respects user preferences, prevents motion sickness |
| **Organization** | Centralized variants in lib/animations/ | Single source of truth, easy maintenance |
| **Shadcn/UI** | Wrap components with motion primitives | Preserves functionality, adds animations |

---

## Implementation Readiness

All research is complete. Key findings:
- ✅ Framer Motion integration pattern defined
- ✅ Performance optimization strategy established
- ✅ Accessibility implementation approach confirmed
- ✅ Variant organization structure designed
- ✅ Shadcn/UI integration method selected

**Ready for Phase 1**: Design artifacts (data-model.md, quickstart.md) can now be created with confidence.
