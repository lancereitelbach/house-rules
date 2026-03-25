import type { Variants, Transition } from 'framer-motion';

// Core spring configuration - Zen aesthetic (slow, deliberate)
export const springConfig: Transition = {
  type: 'spring',
  damping: 25,
  stiffness: 200,
};

// Screen transitions
export const screenFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const screenSlideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Card animations
export const cardAppear: Variants = {
  initial: { opacity: 0, y: -20, rotateZ: -2 },
  animate: { opacity: 1, y: 0, rotateZ: 0 },
};

export const cardHover = {
  y: -4,
  transition: springConfig,
};

export const cardSelected = {
  y: -8,
  transition: springConfig,
};

// Deal sequence - staggered card appearance
export const dealSequence = (index: number): Transition => ({
  ...springConfig,
  delay: index * 0.06, // 60ms stagger per card
});

// Modal/overlay animations
export const modalAppear: Variants = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Button interactions
export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// Confetti/particle animations
export const confettiFall = (
  swayAmplitude: number,
  rotation: number,
  duration: number
) => ({
  initial: { y: -50, opacity: 0, rotateZ: 0 },
  animate: {
    y: window.innerHeight + 50,
    x: [0, swayAmplitude, -swayAmplitude, 0],
    opacity: [0, 1, 1, 1, 0.6, 0],
    rotateZ: rotation,
  },
  transition: {
    duration,
    ease: 'linear',
    opacity: {
      times: [0, 0.1, 0.3, 0.7, 0.9, 1],
    },
    x: {
      duration: duration * 0.7,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
});

// Stagger children - for list animations
export const staggerChildren = (delayChildren: number = 0.1): Transition => ({
  staggerChildren: delayChildren,
} as Transition);

// Medal/icon rotation entrance
export const medalEntrance: Variants = {
  initial: { opacity: 0, scale: 0.5, rotateZ: -20 },
  animate: { opacity: 1, scale: 1, rotateZ: 0 },
};

// Stats card entrance - return just the transition object
export const statsCardEntrance = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { ...springConfig, delay },
});
