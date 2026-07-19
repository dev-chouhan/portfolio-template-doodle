import { AABB } from "./AABB";

/** Platform type discriminator */
export type PlatformType = "plank" | "text";

/**
 * Interface representing a collidable platform surface in the game world.
 * Open/Closed Principle (OCP): Polymorphic interface for all platform variations.
 */
export interface IPlatform {
  /** Unique platform ID */
  readonly id: string;
  /** Bounding box rectangle */
  readonly rect: AABB;
  /** Platform type discriminator */
  readonly type: PlatformType;
  /** Associated HTML section ID (if tied to DOM section) */
  readonly sectionId?: string;
  /** Flag indicating if platform has cracks/broken status */
  isBroken?: boolean;
  /** Flag indicating if platform collision is disabled */
  isDisabled?: boolean;
}

/**
 * Procedural or static background plank platform implementation.
 */
export class PlankPlatform implements IPlatform {
  public readonly type = "plank" as const;
  constructor(
    public readonly id: string,
    public readonly rect: AABB,
    public readonly sectionId?: string,
    public isBroken: boolean = false,
    public isDisabled: boolean = false
  ) {}
}

/**
 * DOM text node or form input text platform implementation.
 */
export class TextPlatform implements IPlatform {
  public readonly type = "text" as const;
  constructor(
    public readonly id: string,
    public readonly rect: AABB,
    public readonly sectionId?: string,
    public isBroken: boolean = false,
    public isDisabled: boolean = false
  ) {}
}
