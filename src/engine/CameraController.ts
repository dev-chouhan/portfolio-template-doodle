import { PhysicsConfig as C } from "./PhysicsConfig";

/**
 * Camera system: manages smooth page scrolling and viewport dead-zone tracking.
 * Single Responsibility Principle (SRP): Camera target computation and linear interpolation (LERP) scrolling.
 */
export class CameraController {
  private targetScroll = 0;
  private isScrolling = false;
  private lastScrollDir: "up" | "down" | "none" = "none";
  private scrollCooldown = 0;

  /**
   * Main camera tick function called on every frame tick.
   * Navigation Flow:
   * 1. Calculate Viewport Comfort Triggers (15% Top & 85% Bottom dead-zone margin)
   * 2. Check Viewport Boundary Overflow Triggers
   * 3. Apply Smooth Ground Centering when Standing on Platforms
   * 4. Clamp Scroll Coordinates & Perform LERP Interpolation
   * 
   * @param doodleY Character top coordinate
   * @param doodleBottom Character bottom coordinate
   * @param onGround Character ground state status
   * @param viewportH Window inner height
   * @param docHeight Total document scroll height
   */
  update(
    doodleY: number,
    doodleBottom: number,
    onGround: boolean,
    viewportH: number,
    docHeight: number
  ): void {
    const currentScroll = window.scrollY;
    const maxScroll = Math.max(0, docHeight - viewportH);

    // ----------------------------------------------------
    // Flow Step 1: Compute Screen Relative Position & Dead-Zone Margins
    // ----------------------------------------------------
    const doodleScreenY = doodleY - currentScroll;
    const doodleScreenBottom = doodleBottom - currentScroll;

    const topTrigger = viewportH * 0.15;
    const bottomTrigger = viewportH * 0.85;

    let needsScroll = false;
    let newTarget = this.targetScroll;

    // ----------------------------------------------------
    // Flow Step 2: Check Viewport Boundary Overflow Triggers
    // ----------------------------------------------------
    if (doodleScreenY < topTrigger) {
      // Scroll up: Position Doodle at 30% from the viewport top
      newTarget = doodleY - viewportH * 0.3;
      needsScroll = true;
    } else if (doodleScreenBottom > bottomTrigger) {
      // Scroll down: Position Doodle at 70% from the viewport top
      newTarget = doodleY - viewportH * 0.7;
      needsScroll = true;
    }
    // ----------------------------------------------------
    // Flow Step 3: Apply Smooth Ground Centering
    // ----------------------------------------------------
    else if (onGround) {
      const centerTarget = doodleY - viewportH * 0.5 + (doodleBottom - doodleY) / 2;
      if (Math.abs(centerTarget - currentScroll) > 30) {
        newTarget = centerTarget;
        needsScroll = true;
      }
    }

    // ----------------------------------------------------
    // Flow Step 4: Clamp Target Scroll & Perform LERP Interpolation
    // ----------------------------------------------------
    if (needsScroll) {
      this.targetScroll = Math.max(0, Math.min(newTarget, maxScroll));
      this.isScrolling = true;
    }

    if (this.isScrolling) {
      const diff = this.targetScroll - currentScroll;
      if (Math.abs(diff) < 1) {
        this.isScrolling = false;
      } else {
        const lerpSpeed = 0.05; // Smooth LERP speed coefficient
        const newScroll = currentScroll + diff * lerpSpeed;
        window.scrollTo(0, newScroll);
      }
    }
  }
}
