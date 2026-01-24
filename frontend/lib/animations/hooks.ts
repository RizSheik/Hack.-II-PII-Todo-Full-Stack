'use client';

import { useReducedMotion } from 'framer-motion';
import { Variants } from 'framer-motion';
import { createReducedMotionVariant } from './utils';

/**
 * Returns appropriate animation variant based on user's motion preferences
 *
 * @param standardVariant - The full animation variant to use normally
 * @returns Simplified variant if reduced motion is preferred, otherwise standard variant
 *
 * @example
 * ```tsx
 * const variants = useAnimationVariant(taskListVariants.item);
 * return <motion.div variants={variants}>Content</motion.div>
 * ```
 */
export function useAnimationVariant(standardVariant: Variants): Variants {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return createReducedMotionVariant(standardVariant);
  }

  return standardVariant;
}
