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
