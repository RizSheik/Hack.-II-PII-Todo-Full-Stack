/**
 * Central export file for animation configurations
 *
 * Import animations like:
 * import { taskListVariants, SPRING_CONFIG } from '@/lib/animations';
 */

// Constants
export {
  ANIMATION_DURATION,
  SPRING_CONFIG,
  SPRING_GENTLE,
  SPRING_BOUNCY,
  EASE_OUT,
  EASE_IN_OUT,
  STAGGER_DELAY,
  INITIAL_DELAY,
  SCALE,
  DISTANCE,
} from './constants';

// Types
export type {
  AnimationVariant,
  ContainerVariant,
  ItemVariant,
  ReducedMotionVariant,
} from './types';

// Variants
export {
  taskListVariants,
  modalVariants,
  tabVariants,
  interactionVariants,
  emptyStateVariants,
  skeletonVariants,
  reducedMotionVariants,
} from './variants';

// Utilities
export {
  createReducedMotionVariant,
  isGPUAccelerated,
  isValidDuration,
} from './utils';

// Hooks
export { useAnimationVariant } from './hooks';
