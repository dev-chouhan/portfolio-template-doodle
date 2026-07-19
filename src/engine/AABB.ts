/**
 * Axis-Aligned Bounding Box (AABB) — immutable 2D bounding rectangle used for geometric collision detection.
 * Single Responsibility Principle (SRP): Geometric calculations and overlap detection.
 */
export class AABB {
  /**
   * Constructs an immutable AABB box.
   * @param x Left coordinate
   * @param y Top coordinate
   * @param w Width of bounding box
   * @param h Height of bounding box
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly w: number,
    public readonly h: number
  ) {}

  /** Leftmost X boundary coordinate */
  get left(): number { return this.x; }
  /** Rightmost X boundary coordinate */
  get right(): number { return this.x + this.w; }
  /** Topmost Y boundary coordinate */
  get top(): number { return this.y; }
  /** Bottommost Y boundary coordinate */
  get bottom(): number { return this.y + this.h; }
  /** Horizontal center coordinate */
  get centerX(): number { return this.x + this.w / 2; }
  /** Vertical center coordinate */
  get centerY(): number { return this.y + this.h / 2; }

  /**
   * Checks if this bounding box overlaps another bounding box in 2D space.
   * Navigation Flow:
   * 1. Compare horizontal interval collision
   * 2. Compare vertical interval collision
   * @param other Target AABB box to compare against
   * @returns boolean True if bounding boxes overlap
   */
  overlaps(other: AABB): boolean {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }

  /**
   * One-way top platform landing test.
   * Navigation Flow:
   * 1. Check if previous character bottom was above platform top edge
   * 2. Check if current character bottom crossed platform top edge
   * 3. Confirm horizontal overlap within margin tolerance
   * 
   * @param other Target platform AABB box
   * @param prevBottom Character bottom coordinate in previous frame
   * @param tolerance Vertical collision tolerance threshold in pixels (default 6px)
   * @returns boolean True if landing condition is satisfied
   */
  landsOn(other: AABB, prevBottom: number, tolerance = 6): boolean {
    if (prevBottom > other.top + tolerance) return false;
    if (this.bottom < other.top) return false;
    return this.right > other.left + 2 && this.left < other.right - 2;
  }

  /**
   * Immutably creates a new AABB with updated Y position.
   * @param y New vertical top coordinate
   * @returns Fresh AABB instance
   */
  withY(y: number): AABB {
    return new AABB(this.x, y, this.w, this.h);
  }

  /**
   * Factory constructor from DOMRect coordinates.
   * @param rect DOMRect instance from browser layout engine
   * @param scrollX Page horizontal scroll offset
   * @param scrollY Page vertical scroll offset
   * @returns Fresh AABB instance aligned with document page coordinates
   */
  static fromDOMRect(rect: DOMRect, scrollX: number, scrollY: number): AABB {
    return new AABB(
      rect.left + scrollX,
      rect.top + scrollY,
      rect.width,
      rect.height
    );
  }
}
