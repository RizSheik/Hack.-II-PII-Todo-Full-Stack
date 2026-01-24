# Data Model: Animation Configurations

**Feature**: 1-ui-animations
**Date**: 2026-01-25
**Purpose**: Define animation variant types, configurations, and constants for Framer Motion integration

---

## Overview

This document defines the data structures and configurations for all animations in the TaskFlow frontend. Since this is a frontend-only feature with no database persistence, the "data model" consists of TypeScript types, animation variants, and configuration constants.

---

## Core Type Definitions

### Animation Variant Structure

```typescript
import { Variants, Transition } from 'framer-motion';

/**
 * Standard animation variant with initial, animate, and optional exit states
 */
export type AnimationVariant = {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit?: Record<string, any>;
  transition?: Transition;
};

/**
 * Container variant for staggered children animations
 */
export type ContainerVariant = {
  hidden: {
    opacity: number;
  };
  visible: {
    opacity: number;
    transition: {
      staggerChildren: number;
      delayChildren?: number;
    };
  };
};

/**
 * Item variant for use within staggered containers
 */
export type ItemVariant = {
  hidden: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  visible: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
    transition: Transition;
  };
  exit?: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
    transition: Transition;
  };
};

/**
 * Reduced motion variant (simplified, fast animations)
 */
export type ReducedMotionVariant = {
  hidden: { opacity: number };
  visible: {
    opacity: number;
    transition: {
      duration: number; // <0.1s
      type: 'tween';
    };
  };
};
```

---

## Animation Constants

### Timing Constants

```typescript
/**
 * Standard animation durations (in seconds)
 * All values must be between 0.3-0.6s per spec requirements
 */
export const ANIMATION_DURATION = {
  /** Fast animations (0.3s) - for quick feedback */
  fast: 0.3,

  /** Normal animations (0.4s) - default for most transitions */
  normal: 0.4,

  /** Slow animations (0.6s) - for emphasis or complex movements */
  slow: 0.6,

  /** Reduced motion (0.05s) - for accessibility */
  reduced: 0.05,
} as const;

/**
 * Spring physics configuration for bouncy, natural animations
 */
export const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
};

/**
 * Gentle spring for subtle movements
 */
export const SPRING_GENTLE = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 30,
};

/**
 * Bouncy spring for playful interactions
 */
export const SPRING_BOUNCY = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 20,
};

/**
 * Ease out configuration for smooth deceleration
 */
export const EASE_OUT = {
  type: 'tween' as const,
  ease: 'easeOut',
  duration: ANIMATION_DURATION.normal,
};

/**
 * Ease in-out for symmetrical animations
 */
export const EASE_IN_OUT = {
  type: 'tween' as const,
  ease: 'easeInOut',
  duration: ANIMATION_DURATION.normal,
};
```

### Stagger Configuration

```typescript
/**
 * Stagger delays for sequential animations (in seconds)
 */
export const STAGGER_DELAY = {
  /** Fast stagger (0.05s) - for many items */
  fast: 0.05,

  /** List stagger (0.08s) - for task lists */
  list: 0.08,

  /** Card stagger (0.12s) - for larger elements */
  cards: 0.12,
} as const;

/**
 * Initial delay before stagger begins (in seconds)
 */
export const INITIAL_DELAY = {
  none: 0,
  short: 0.1,
  medium: 0.2,
} as const;
```

### Scale Values

```typescript
/**
 * Scale values for size animations
 */
export const SCALE = {
  /** Slightly smaller (95%) - for entrance animations */
  down: 0.95,

  /** Normal size (100%) */
  normal: 1,

  /** Slightly larger (102%) - for subtle hover */
  upSubtle: 1.02,

  /** Medium larger (105%) - for emphasis */
  upMedium: 1.05,

  /** Large (108%) - for strong feedback */
  upLarge: 1.08,

  /** Pressed (98%) - for tap feedback */
  pressed: 0.98,
} as const;
```

### Distance Values

```typescript
/**
 * Translation distances for slide animations (in pixels)
 */
export const DISTANCE = {
  /** Small movement (10px) */
  small: 10,

  /** Medium movement (20px) */
  medium: 20,

  /** Large movement (40px) */
  large: 40,

  /** Extra large (100px) - for exit animations */
  xlarge: 100,
} as const;
```

---

## Animation Variant Definitions

### 1. Task List Animations

```typescript
import { Variants } from 'framer-motion';

/**
 * Task list container with staggered children
 */
export const taskListVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: STAGGER_DELAY.list,
        delayChildren: INITIAL_DELAY.short,
      },
    },
  },

  /**
   * Individual task item
   * Entrance: slide up + fade
   * Exit: slide right + fade
   */
  item: {
    hidden: {
      opacity: 0,
      y: DISTANCE.medium,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: SPRING_CONFIG,
    },
    exit: {
      opacity: 0,
      x: DISTANCE.xlarge,
      transition: {
        duration: ANIMATION_DURATION.fast,
        ease: 'easeIn',
      },
    },
  },

  /**
   * New task entrance (from bottom)
   */
  newItem: {
    hidden: {
      opacity: 0,
      y: DISTANCE.large,
      scale: SCALE.down,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: SCALE.normal,
      transition: SPRING_BOUNCY,
    },
  },

  /**
   * Checkbox completion animation
   */
  checkbox: {
    unchecked: {
      scale: SCALE.normal,
    },
    checked: {
      scale: [SCALE.normal, SCALE.upLarge, SCALE.normal],
      transition: {
        duration: ANIMATION_DURATION.fast,
        times: [0, 0.5, 1],
      },
    },
  },
} satisfies Record<string, Variants>;
```

### 2. Modal Animations

```typescript
/**
 * Modal dialog animations
 */
export const modalVariants = {
  /**
   * Backdrop fade
   */
  backdrop: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: ANIMATION_DURATION.fast,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: ANIMATION_DURATION.fast,
      },
    },
  },

  /**
   * Dialog scale + spring bounce
   */
  dialog: {
    hidden: {
      opacity: 0,
      scale: SCALE.down,
      y: DISTANCE.medium,
    },
    visible: {
      opacity: 1,
      scale: SCALE.normal,
      y: 0,
      transition: SPRING_CONFIG,
    },
    exit: {
      opacity: 0,
      scale: SCALE.down,
      transition: {
        duration: ANIMATION_DURATION.fast,
      },
    },
  },
} satisfies Record<string, Variants>;
```

### 3. Tab Navigation Animations

```typescript
/**
 * Tab navigation animations
 */
export const tabVariants = {
  /**
   * Active tab indicator (uses layout animation)
   * No variants needed - use layout prop on motion element
   */
  indicator: {
    // Layout animation handles this automatically
  },

  /**
   * Tab content crossfade
   */
  content: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: ANIMATION_DURATION.normal,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: ANIMATION_DURATION.fast,
      },
    },
  },
} satisfies Record<string, Variants>;
```

### 4. Navigation & Interactive Elements

```typescript
/**
 * Hover and tap animations for interactive elements
 */
export const interactionVariants = {
  /**
   * Subtle hover scale for buttons/links
   */
  hoverSubtle: {
    scale: SCALE.upSubtle,
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },

  /**
   * Medium hover scale for emphasis
   */
  hoverMedium: {
    scale: SCALE.upMedium,
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },

  /**
   * Tap feedback (scale down)
   */
  tap: {
    scale: SCALE.pressed,
    transition: {
      duration: 0.1,
    },
  },
};
```

### 5. Empty State Animations

```typescript
/**
 * Empty state animations
 */
export const emptyStateVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: STAGGER_DELAY.cards,
        delayChildren: INITIAL_DELAY.medium,
      },
    },
  },

  item: {
    hidden: {
      opacity: 0,
      y: DISTANCE.medium,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: SPRING_GENTLE,
    },
  },
} satisfies Record<string, Variants>;
```

### 6. Loading Skeleton Animations

```typescript
/**
 * Loading skeleton pulse animation
 */
export const skeletonVariants = {
  pulse: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
```

---

## Reduced Motion Variants

### Simplified Variants for Accessibility

```typescript
/**
 * Generate reduced motion variant from standard variant
 */
export function createReducedMotionVariant(
  standardVariant: Variants
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: ANIMATION_DURATION.reduced,
        type: 'tween',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: ANIMATION_DURATION.reduced,
        type: 'tween',
      },
    },
  };
}

/**
 * Reduced motion variants for all animation categories
 */
export const reducedMotionVariants = {
  taskList: createReducedMotionVariant(taskListVariants.item),
  modal: createReducedMotionVariant(modalVariants.dialog),
  tab: createReducedMotionVariant(tabVariants.content),
  emptyState: createReducedMotionVariant(emptyStateVariants.item),
};
```

---

## Animation State Machine

### Task Item States

```typescript
/**
 * State machine for task item animations
 */
export type TaskItemState =
  | 'entering'    // Initial entrance animation
  | 'idle'        // Resting state
  | 'completing'  // Checkbox animation in progress
  | 'completed'   // Completed state
  | 'exiting';    // Delete animation in progress

/**
 * State transitions for task items
 */
export const taskItemTransitions = {
  entering: ['idle'],
  idle: ['completing', 'exiting'],
  completing: ['completed'],
  completed: ['exiting'],
  exiting: [], // Terminal state
} as const;
```

### Modal States

```typescript
/**
 * State machine for modal animations
 */
export type ModalState =
  | 'closed'   // Not visible
  | 'opening'  // Entrance animation
  | 'open'     // Fully visible
  | 'closing'; // Exit animation

/**
 * State transitions for modals
 */
export const modalTransitions = {
  closed: ['opening'],
  opening: ['open'],
  open: ['closing'],
  closing: ['closed'],
} as const;
```

---

## File Organization

### Directory Structure

```
frontend/src/lib/animations/
├── constants.ts          # All timing, easing, scale, distance constants
├── variants.ts           # All animation variant definitions
├── hooks.ts              # Custom animation hooks
├── utils.ts              # Helper functions (createReducedMotionVariant, etc.)
└── types.ts              # TypeScript type definitions
```

### Import Pattern

```typescript
// In components
import { taskListVariants } from '@/lib/animations/variants';
import { ANIMATION_DURATION, SPRING_CONFIG } from '@/lib/animations/constants';
import { useAnimationVariant } from '@/lib/animations/hooks';
```

---

## Validation Rules

### Animation Constraints

All animations must satisfy these constraints:

1. **Duration**: 0.3s ≤ duration ≤ 0.6s (except reduced motion: ≤0.1s)
2. **Properties**: Only transform (translate, scale, rotate) and opacity
3. **Timing**: Spring or easeOut only
4. **Performance**: Must maintain 60fps
5. **Layout**: Zero Cumulative Layout Shift (CLS = 0)

### Type Safety

```typescript
/**
 * Type guard to ensure animation uses only GPU-accelerated properties
 */
export function isGPUAccelerated(
  variant: Record<string, any>
): boolean {
  const allowedProps = ['opacity', 'x', 'y', 'scale', 'rotate', 'transition'];
  const props = Object.keys(variant);
  return props.every(prop => allowedProps.includes(prop));
}

/**
 * Type guard to ensure duration is within spec limits
 */
export function isValidDuration(duration: number): boolean {
  return duration >= 0.3 && duration <= 0.6;
}
```

---

## Summary

This data model defines:
- ✅ 6 animation variant categories (task list, modal, tab, navigation, empty state, loading)
- ✅ Type-safe constants for timing, easing, scale, and distance
- ✅ Reduced motion variants for accessibility
- ✅ State machines for complex animations
- ✅ Validation rules for spec compliance
- ✅ Organized file structure for maintainability

**Ready for Implementation**: All animation configurations are defined and ready to be implemented in `frontend/src/lib/animations/`.
