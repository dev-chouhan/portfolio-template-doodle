/**
 * Single Responsibility Principle (SRP): Centralized physics configuration constants.
 */
export const PhysicsConfig = {
  /** Vertical acceleration constant (px/s^2) */
  GRAVITY: 1400,
  /** Initial jump impulse velocity (px/s) */
  JUMP_VEL: -580,
  /** Secondary mid-air jump impulse velocity (px/s) */
  DOUBLE_JUMP_VEL: -500,
  /** Horizontal walking movement speed (equivalent to ~4px per frame at 60fps) */
  MOVE_SPEED: 240,
  /** Horizontal velocity damping coefficient when grounded */
  GROUND_FRICTION: 0.85,
  /** Horizontal velocity damping coefficient when airborne */
  AIR_FRICTION: 0.96,
  /** Terminal velocity fall limit (px/s) */
  MAX_FALL_SPEED: 700,
  /** Doodle bounding width (px) */
  DOODLE_W: 40,
  /** Doodle bounding height (px) */
  DOODLE_H: 40,
  /** Standard background plank width (px) */
  PLANK_W: 75,
  /** Standard background plank height (px) */
  PLANK_H: 12,
  /** Viewport boundary movement ratio */
  MAX_X_PERCENT: 1.0,
  /** Upward projectile movement speed (px/s) */
  BEAN_SPEED: 700,
  /** Projectile radius (px) */
  BEAN_SIZE: 5,
  /** Hold duration for broken planks before collapse (configurable via NEXT_PUBLIC_PLANK_BROKEN_TIMER) */
  PLANK_HOLD_TIME: process.env.NEXT_PUBLIC_PLANK_BROKEN_TIMER
    ? parseFloat(process.env.NEXT_PUBLIC_PLANK_BROKEN_TIMER)
    : 2.0,
} as const;
