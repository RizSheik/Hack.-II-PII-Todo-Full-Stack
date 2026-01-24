import { Variants } from 'framer-motion';
import {
  ANIMATION_DURATION,
  SPRING_CONFIG,
  SPRING_GENTLE,
  SPRING_BOUNCY,
  STAGGER_DELAY,
  INITIAL_DELAY,
  SCALE,
  DISTANCE,
} from './constants';

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

/**
 * Reduced motion variants for all animation categories
 */
export const reducedMotionVariants = {
  taskList: {
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
  },
  modal: {
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
  },
  tab: {
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
  },
  emptyState: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: ANIMATION_DURATION.reduced,
        type: 'tween',
      },
    },
  },
} satisfies Record<string, Variants>;
