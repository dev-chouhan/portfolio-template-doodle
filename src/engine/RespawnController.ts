import { Vector2 } from "./Vector2";
import type { IPlatform } from "./Platform";
import { PhysicsConfig as C } from "./PhysicsConfig";
import type { DoodleSnapshot } from "./DoodleBody";
import { DoodleBody } from "./DoodleBody";

/**
 * Single Responsibility (SRP): Manages respawn conditions and calculates target spawn positions.
 * OOP Design Pattern: Strategy pattern for section-relative spawn location resolution.
 */
export class RespawnController {
  private fallTimer = 0;
  /** Timeout threshold in seconds before initiating an off-screen respawn */
  private readonly FALL_TIMEOUT = 1.5;

  /**
   * Checks whether Doodle has met the criteria for a respawn trigger.
   * Navigation Flow:
   * 1. Check screen viewport bottom boundary overflow
   * 2. Track continuous airborne falling duration
   * 3. Return boolean status decision
   * 
   * @param doodle Current Doodle physical snapshot
   * @param scrollY Current page vertical scroll position
   * @param viewportH Current window inner height
   * @returns boolean True if respawn is required
   */
  shouldRespawn(doodle: DoodleSnapshot, scrollY: number, viewportH: number): boolean {
    const screenY = doodle.pos.y - scrollY;
    
    // Step 1: Check if character has fallen significantly below visible viewport
    if (screenY > viewportH + C.DOODLE_H * 3) {
      return true;
    }
    
    // Step 2: Track continuous falling without landing on platforms
    if (!doodle.onGround && doodle.vel.y > 0) {
      this.fallTimer += 1 / 60; // Approximate frame tick delta
      if (this.fallTimer > this.FALL_TIMEOUT) {
        return true;
      }
    } else {
      this.fallTimer = 0;
    }
    
    return false;
  }

  /**
   * Calculates the target snapshot to revive Doodle at the previous/current section.
   * Navigation Flow:
   * 1. Determine Section Hierarchy Order from Available Platforms
   * 2. Locate Active / Nearest Section relative to Doodle's current position
   * 3. Filter Target Section Platforms & Select Topmost Spawn Plank
   * 4. Construct & Return Revived Snapshot with Invulnerability Flash
   * 
   * @param platforms Active platforms list
   * @param activeSectionId Currently active section ID (if tracked)
   * @param scrollY Current page vertical scroll position
   * @param viewportH Current window inner height
   * @returns Revived DoodleSnapshot instance
   */
  respawn(
    platforms: IPlatform[],
    activeSectionId: string | null,
    scrollY: number,
    viewportH: number
  ): DoodleSnapshot {
    this.fallTimer = 0;

    // Step 1: Order all known sections vertically by their top-most platform coordinates
    const sectionMap = new Map<string, number>();
    for (const plat of platforms) {
      if (plat.sectionId) {
        const currentTop = sectionMap.get(plat.sectionId);
        if (currentTop === undefined || plat.rect.top < currentTop) {
          sectionMap.set(plat.sectionId, plat.rect.top);
        }
      }
    }

    const orderedSections = Array.from(sectionMap.entries())
      .sort((a, b) => a[1] - b[1])
      .map((entry) => entry[0]);

    // Step 2: Determine target section based on activeSectionId or vertical proximity
    let targetSectionId: string | null = activeSectionId;

    if (!targetSectionId || !orderedSections.includes(targetSectionId)) {
      // Fallback: Find nearest section at or above scroll position
      let bestSection = orderedSections[0] || "hero";
      for (const [secId, topY] of sectionMap.entries()) {
        if (topY <= scrollY + viewportH * 0.5) {
          bestSection = secId;
        }
      }
      targetSectionId = bestSection;
    } else {
      // If fallen, step back to the PREVIOUS section in section hierarchy (or remain at active)
      const currentIndex = orderedSections.indexOf(targetSectionId);
      if (currentIndex > 0) {
        targetSectionId = orderedSections[currentIndex - 1];
      }
    }

    // Step 3: Find topmost platform in target section
    const targetPlanks = platforms
      .filter((p) => p.type === "plank" && p.sectionId === targetSectionId)
      .sort((a, b) => a.rect.top - b.rect.top);

    const targetPlank = targetPlanks[0];
    if (targetPlank) {
      const snap = DoodleBody.create(
        targetPlank.rect.x + targetPlank.rect.w / 2 - C.DOODLE_W / 2,
        targetPlank.rect.top - C.DOODLE_H - 10
      );
      snap.reviveTimer = 1.5; // Flash effect timer
      return snap;
    }

    // Step 4: Fallback to any platform near current scroll view
    const visiblePlanks = platforms
      .filter((p) => p.type === "plank" && p.rect.top >= scrollY)
      .sort((a, b) => a.rect.top - b.rect.top);

    const fallbackPlank = visiblePlanks[0] || platforms.filter((p) => p.type === "plank").sort((a, b) => a.rect.top - b.rect.top)[0];
    if (fallbackPlank) {
      const snap = DoodleBody.create(
        fallbackPlank.rect.x + fallbackPlank.rect.w / 2 - C.DOODLE_W / 2,
        fallbackPlank.rect.top - C.DOODLE_H - 10
      );
      snap.reviveTimer = 1.5;
      return snap;
    }

    // Ultimate fallback spawn
    const snap = DoodleBody.create(40, Math.max(0, scrollY + 50));
    snap.reviveTimer = 1.5;
    return snap;
  }
}
