/**
 * Immutable 2D vector class following the Value Object pattern.
 * Single Responsibility Principle (SRP): 2D coordinate space points and direction vectors.
 */
export class Vector2 {
  /**
   * Constructs an immutable 2D vector.
   * @param x Horizontal coordinate
   * @param y Vertical coordinate
   */
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {}

  /** Adds another vector immutably */
  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  /** Scales vector by a scalar multiplier immutably */
  scale(s: number): Vector2 {
    return new Vector2(this.x * s, this.y * s);
  }

  /** Immutably updates X component */
  withX(x: number): Vector2 {
    return new Vector2(x, this.y);
  }

  /** Immutably updates Y component */
  withY(y: number): Vector2 {
    return new Vector2(this.x, y);
  }

  /** Clamps X coordinate between minimum and maximum bounds */
  clampX(min: number, max: number): Vector2 {
    return new Vector2(Math.max(min, Math.min(max, this.x)), this.y);
  }

  /** Clamps Y coordinate between minimum and maximum bounds */
  clampY(min: number, max: number): Vector2 {
    return new Vector2(this.x, Math.max(min, Math.min(max, this.y)));
  }

  /** Pre-allocated Zero Origin Vector */
  static readonly ZERO = new Vector2(0, 0);
}
