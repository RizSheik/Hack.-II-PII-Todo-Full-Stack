/**
 * Animation timing constants
 * All durations in seconds, must be between 0.3-0.6s per spec requirements
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
