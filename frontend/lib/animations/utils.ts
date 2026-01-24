import { Variants } from 'framer-motion';
import { ANIMATION_DURATION } from './constants';

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
