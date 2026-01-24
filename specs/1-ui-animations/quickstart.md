# Quickstart Guide: Advanced UI Animations

**Feature**: 1-ui-animations
**Date**: 2026-01-25
**Purpose**: Setup instructions, development workflow, and testing guide for implementing Framer Motion animations

---

## Prerequisites

Before starting implementation, ensure:

- ✅ Next.js 16+ with App Router is installed
- ✅ Node.js 18+ and npm/yarn/pnpm available
- ✅ TypeScript configured in the project
- ✅ Tailwind CSS is set up
- ✅ Shadcn/UI components are installed

---

## Setup Instructions

### 1. Install Framer Motion

```bash
# Navigate to frontend directory
cd frontend

# Install Framer Motion
npm install framer-motion

# Verify installation
npm list framer-motion
# Should show: framer-motion@11.x.x (or latest)
```

### 2. Create Animation Configuration Files

Create the animation library structure:

```bash
# Create animations directory
mkdir -p src/lib/animations

# Create configuration files
touch src/lib/animations/constants.ts
touch src/lib/animations/variants.ts
touch src/lib/animations/hooks.ts
touch src/lib/animations/utils.ts
touch src/lib/animations/types.ts
touch src/lib/animations/index.ts
```

### 3. Implement Core Animation Files

Copy the configurations from `specs/1-ui-animations/data-model.md` into the respective files:

**src/lib/animations/constants.ts**:
- Copy all timing constants (ANIMATION_DURATION, SPRING_CONFIG, etc.)
- Copy stagger delays and scale values

**src/lib/animations/variants.ts**:
- Copy all animation variant definitions
- Import constants from constants.ts

**src/lib/animations/hooks.ts**:
- Implement useAnimationVariant hook (see Development Workflow section)

**src/lib/animations/index.ts**:
```typescript
// Central export file for easy imports
export * from './constants';
export * from './variants';
export * from './hooks';
export * from './utils';
export * from './types';
```

### 4. Verify Next.js Compatibility

Check that your Next.js version supports 'use client' directive:

```bash
# Check Next.js version
npm list next
# Should be 13.0.0 or higher for App Router support
```

### 5. Test Basic Animation

Create a test component to verify setup:

**src/components/test-animation.tsx**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { SPRING_CONFIG } from '@/lib/animations';

export function TestAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_CONFIG}
      className="p-4 bg-purple-100 rounded"
    >
      ✅ Framer Motion is working!
    </motion.div>
  );
}
```

Add to a page and verify the animation plays on load.

---

## Development Workflow

### Step-by-Step Process for Adding Animations

#### 1. Identify Component to Animate

Determine which component needs animation:
- Task list items
- Modal dialogs
- Tab navigation
- Navigation elements
- Empty states
- Loading skeletons

#### 2. Add 'use client' Directive

If the component is a Server Component, convert it to a Client Component:

```typescript
'use client'; // Add at the very top of the file

import { motion } from 'framer-motion';
// ... rest of imports
```

#### 3. Import Animation Variants

```typescript
import { taskListVariants, SPRING_CONFIG } from '@/lib/animations';
```

#### 4. Wrap Component with Motion Primitive

Replace standard HTML elements with motion equivalents:

```typescript
// Before
<ul className="task-list">
  {tasks.map(task => (
    <li key={task.id}>{task.title}</li>
  ))}
</ul>

// After
<motion.ul
  variants={taskListVariants.container}
  initial="hidden"
  animate="visible"
  className="task-list"
>
  <AnimatePresence mode="popLayout">
    {tasks.map(task => (
      <motion.li
        key={task.id}
        variants={taskListVariants.item}
        exit="exit"
      >
        {task.title}
      </motion.li>
    ))}
  </AnimatePresence>
</motion.ul>
```

#### 5. Apply Animation Variants

Use the appropriate variants from your animation library:

```typescript
// For staggered lists
<motion.ul variants={taskListVariants.container}>
  {/* children will stagger automatically */}
</motion.ul>

// For modals
<motion.div variants={modalVariants.dialog}>
  {/* modal content */}
</motion.div>

// For hover effects
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
  Click me
</motion.button>
```

#### 6. Add AnimatePresence for Exit Animations

Wrap lists or conditional elements with AnimatePresence:

```typescript
import { AnimatePresence } from 'framer-motion';

<AnimatePresence mode="popLayout">
  {tasks.map(task => (
    <motion.li key={task.id} exit="exit">
      {task.title}
    </motion.li>
  ))}
</AnimatePresence>
```

**Important**: Always provide a unique `key` prop for AnimatePresence to track elements.

#### 7. Implement Reduced Motion Support

Use the custom hook to respect user preferences:

```typescript
import { useAnimationVariant } from '@/lib/animations/hooks';

export function AnimatedComponent() {
  const variants = useAnimationVariant(taskListVariants.item);

  return (
    <motion.div variants={variants}>
      Content
    </motion.div>
  );
}
```

**Custom Hook Implementation** (src/lib/animations/hooks.ts):
```typescript
'use client';

import { useReducedMotion } from 'framer-motion';
import { Variants } from 'framer-motion';
import { createReducedMotionVariant } from './utils';

/**
 * Returns appropriate animation variant based on user's motion preferences
 */
export function useAnimationVariant(standardVariant: Variants): Variants {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return createReducedMotionVariant(standardVariant);
  }

  return standardVariant;
}
```

#### 8. Test Performance

Open Chrome DevTools and verify:
- Performance tab: No frame drops (green bars only)
- Layers tab: Elements are composited
- No layout shifts in Lighthouse

#### 9. Verify Reduced Motion

Test accessibility:
1. Open DevTools > Rendering
2. Enable "Emulate CSS media feature prefers-reduced-motion"
3. Verify animations are simplified or disabled

---

## Testing Checklist

### Functional Testing

- [ ] **Task List Entrance**: Tasks stagger in on page load
- [ ] **New Task Animation**: New task slides up from bottom with scale
- [ ] **Complete Task**: Checkbox scales and color transitions
- [ ] **Delete Task**: Task fades out and slides right, list reflows smoothly
- [ ] **Modal Open**: Backdrop fades, dialog scales with spring bounce
- [ ] **Modal Close**: Reverse animation plays smoothly
- [ ] **Tab Switch**: Active indicator slides, content crossfades
- [ ] **Navigation Hover**: Elements scale subtly on hover
- [ ] **Empty State**: Elements stagger in when no tasks
- [ ] **Loading Skeleton**: Pulses gently during data fetch

### Performance Testing

#### Chrome DevTools Performance Tab

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record (⚫)
4. Perform animations (add task, delete task, open modal)
5. Stop recording
6. Analyze results:

**What to look for**:
- ✅ Green bars in timeline (60fps)
- ❌ Yellow/red bars indicate frame drops
- ✅ Scripting time <16ms per frame
- ✅ Rendering time <16ms per frame

**Common Issues**:
- Layout thrashing: Check if you're animating width/height instead of scale
- Paint storms: Verify you're using transform/opacity only
- Long tasks: Break up JavaScript work or use requestIdleCallback

#### Chrome DevTools Layers Tab

1. Open DevTools > More tools > Layers
2. Trigger an animation
3. Verify animated elements are on their own compositing layer

**What to look for**:
- ✅ Animated elements show "Compositing Reasons: will-change: transform"
- ✅ Elements are promoted to their own layer
- ❌ Too many layers (>50) can hurt performance

#### Lighthouse Performance Audit

1. Open DevTools > Lighthouse
2. Select "Performance" category
3. Run audit
4. Check metrics:

**Target Metrics**:
- ✅ Cumulative Layout Shift (CLS): 0
- ✅ First Contentful Paint (FCP): <1.8s
- ✅ Largest Contentful Paint (LCP): <2.5s
- ✅ Total Blocking Time (TBT): <200ms

### Accessibility Testing

#### Reduced Motion Testing

**Method 1: Browser DevTools**
1. Chrome: DevTools > Rendering > Emulate CSS media feature prefers-reduced-motion
2. Firefox: about:config > ui.prefersReducedMotion = 1
3. Safari: System Preferences > Accessibility > Display > Reduce motion

**Method 2: Operating System**
- macOS: System Preferences > Accessibility > Display > Reduce motion
- Windows: Settings > Ease of Access > Display > Show animations
- Linux: Varies by desktop environment

**Verification**:
- [ ] Complex animations are disabled or simplified
- [ ] Animations complete in <0.1s
- [ ] No functionality is lost
- [ ] App remains usable and understandable

#### Keyboard Navigation

- [ ] Tab key navigates through interactive elements
- [ ] Animations don't interfere with focus management
- [ ] Modal animations don't trap focus
- [ ] Enter/Space keys trigger animations correctly

#### Screen Reader Testing

- [ ] VoiceOver (macOS): Animations don't delay announcements
- [ ] NVDA (Windows): Content changes are announced
- [ ] Animations don't cause unexpected focus changes

### Cross-Browser Testing

Test on target browsers:

- [ ] **Chrome/Edge 90+**: Full animation support
- [ ] **Firefox 88+**: Full animation support
- [ ] **Safari 14+**: Full animation support, check spring physics
- [ ] **Mobile Safari**: Touch interactions work correctly
- [ ] **Mobile Chrome**: Performance acceptable on mid-range devices

### Mobile Testing

- [ ] **Touch Interactions**: whileTap animations work
- [ ] **Performance**: 60fps on mid-range devices (test on real device)
- [ ] **Viewport**: Animations work at all screen sizes
- [ ] **Orientation**: Animations work in portrait and landscape

---

## Performance Profiling Guide

### Measuring Frame Rate

**Using Chrome DevTools**:

```javascript
// Add to component for debugging
useEffect(() => {
  let frameCount = 0;
  let lastTime = performance.now();

  function measureFPS() {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime >= lastTime + 1000) {
      console.log(`FPS: ${frameCount}`);
      frameCount = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(measureFPS);
  }

  measureFPS();
}, []);
```

**Target**: 60 FPS consistently during animations

### Measuring Bundle Size Impact

```bash
# Before adding Framer Motion
npm run build
# Note the bundle size

# After adding Framer Motion
npm run build
# Compare the difference

# Target: <50KB gzipped increase
```

### Measuring Animation Duration

```typescript
// Add to variants for debugging
const debugVariants = {
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      onComplete: () => console.log('Animation complete'),
    },
  },
};
```

### Measuring Layout Shift

Use Lighthouse CLS metric or:

```javascript
// Monitor layout shifts
let cls = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      cls += entry.value;
      console.log('CLS:', cls);
    }
  }
}).observe({ type: 'layout-shift', buffered: true });
```

**Target**: CLS = 0 (no layout shift during animations)

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Animations are janky (frame drops)

**Diagnosis**:
- Check Performance tab for yellow/red bars
- Verify you're using transform/opacity only

**Solution**:
```typescript
// ❌ BAD: Animates layout properties
<motion.div animate={{ width: 200, height: 100 }} />

// ✅ GOOD: Uses transform
<motion.div animate={{ scale: 1.2 }} />
```

#### Issue: AnimatePresence not working

**Diagnosis**:
- Missing unique `key` prop
- AnimatePresence not wrapping the list
- Parent component not using motion primitive

**Solution**:
```typescript
// ✅ Correct usage
<AnimatePresence mode="popLayout">
  {items.map(item => (
    <motion.div key={item.id} exit="exit">
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

#### Issue: Hydration mismatch errors

**Diagnosis**:
- Server renders without animations, client adds them
- Missing 'use client' directive

**Solution**:
```typescript
'use client'; // Add at top of file

// Or suppress hydration warning (use sparingly)
<motion.div suppressHydrationWarning>
  Content
</motion.div>
```

#### Issue: Animations conflict with Tailwind transitions

**Diagnosis**:
- Both Framer Motion and Tailwind trying to animate same property

**Solution**:
```typescript
// Remove Tailwind transition classes
// ❌ BAD
<motion.button className="transition-all hover:scale-105">

// ✅ GOOD
<motion.button whileHover={{ scale: 1.05 }}>
```

#### Issue: Reduced motion not working

**Diagnosis**:
- useReducedMotion hook not implemented
- Variants not checking reduced motion preference

**Solution**:
```typescript
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();
const variants = shouldReduceMotion ? reducedVariants : standardVariants;
```

---

## Quick Reference

### Essential Imports

```typescript
'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { taskListVariants, modalVariants } from '@/lib/animations';
```

### Common Patterns

**Staggered List**:
```typescript
<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

**Modal with AnimatePresence**:
```typescript
<AnimatePresence>
  {isOpen && (
    <motion.div variants={modalVariants.dialog} initial="hidden" animate="visible" exit="exit">
      Modal content
    </motion.div>
  )}
</AnimatePresence>
```

**Hover/Tap Interactions**:
```typescript
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
  Click me
</motion.button>
```

**Layout Animation**:
```typescript
<motion.div layout>
  Content that changes size/position
</motion.div>
```

---

## Next Steps

After completing setup and testing:

1. ✅ Verify all checklist items pass
2. ✅ Measure performance metrics
3. ✅ Test accessibility features
4. ⏭️ Run `/sp.tasks` to generate implementation tasks
5. ⏭️ Begin implementation following task priorities

---

## Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Web Vitals (CLS, LCP, FID)](https://web.dev/vitals/)
- [WCAG Motion Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

---

**Setup Complete**: You're ready to implement animations following the development workflow above.
