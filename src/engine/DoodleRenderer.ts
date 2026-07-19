import type { DoodleSnapshot } from "./DoodleBody";
import { PhysicsConfig as C } from "./PhysicsConfig";

/**
 * Single Responsibility Principle (SRP): Canvas rendering of the Doodle character.
 */
export class DoodleRenderer {
  /**
   * Main render function for Doodle character with state-dependent animations.
   * Navigation Flow:
   * 1. Revive Flash Invulnerability Check
   * 2. Apply Shake Displacement (if on expiring broken plank)
   * 3. Transform Canvas Origin & Facing Flip Matrix
   * 4. Render Body, Snout & Mouth (Upward when shooting, Side when idle)
   * 5. Render Eyes, Pupils, Shine & Nose
   * 6. Render Animated Legs & Feet
   * 
   * @param ctx Canvas 2D rendering context
   * @param doodle Current Doodle physical snapshot
   * @param scrollY Current page vertical scroll position
   */
  draw(ctx: CanvasRenderingContext2D, doodle: DoodleSnapshot, scrollY: number): void {
    // ----------------------------------------------------
    // Flow Step 1: Revive Invulnerability Blink Check
    // ----------------------------------------------------
    if (doodle.reviveTimer > 0 && Math.floor(doodle.reviveTimer * 15) % 2 === 0) {
      return;
    }

    // ----------------------------------------------------
    // Flow Step 2: Apply Warning Shake Displacement
    // ----------------------------------------------------
    let dx = 0;
    let dy = 0;
    if (doodle.heldPlankId) {
      dx = (Math.random() - 0.5) * 2.5;
      dy = (Math.random() - 0.5) * 2.5;
    }

    // ----------------------------------------------------
    // Flow Step 3: Transform Canvas Coordinates & Facing Matrix
    // ----------------------------------------------------
    const x = doodle.pos.x + C.DOODLE_W / 2 + dx;
    const y = doodle.pos.y - scrollY + C.DOODLE_H / 2 + dy;
    const flip = doodle.facing === "left" ? -1 : 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip, 1);

    const isJump = doodle.anim === "jump";
    const isFall = doodle.anim === "fall";
    const isWalk = doodle.anim === "walk";
    const isShooting = doodle.shootTimer > 0;
    const frame = doodle.animFrame;

    // ----------------------------------------------------
    // Flow Step 4: Render Body Oval, Snout & Mouth
    // ----------------------------------------------------
    ctx.fillStyle = "#8BC34A";
    ctx.strokeStyle = "#558B2F";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 2, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#9CCC65";
    ctx.strokeStyle = "#558B2F";
    ctx.lineWidth = 2;

    if (isShooting) {
      // Snout pointing straight UP for projectile shooting
      ctx.beginPath();
      ctx.ellipse(0, -10, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#558B2F";
      ctx.beginPath();
      ctx.arc(0, -14, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(8, 4, 6, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // ----------------------------------------------------
    // Flow Step 5: Render Eyes, Pupils, Shine & Nose Detail
    // ----------------------------------------------------
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#33691E";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-3, -2, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(7, -2, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000";
    const px = isWalk ? 1 : 0;
    const py = isShooting ? -4 : -1;
    ctx.beginPath();
    ctx.arc(-1 + px, py, 2.5, 0, Math.PI * 2);
    ctx.arc(9 + px, py, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFF";
    const shineY = isShooting ? -6 : -4;
    ctx.beginPath();
    ctx.arc(-3, shineY, 1.5, 0, Math.PI * 2);
    ctx.arc(6, shineY, 1.2, 0, Math.PI * 2);
    ctx.fill();

    if (!isShooting) {
      ctx.fillStyle = "#558B2F";
      ctx.beginPath();
      ctx.arc(12, 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // ----------------------------------------------------
    // Flow Step 6: Render Legs & Feet Animations
    // ----------------------------------------------------
    ctx.fillStyle = "#8BC34A";
    ctx.strokeStyle = "#558B2F";
    ctx.lineWidth = 1.5;

    const legSpread = isJump ? 6 : isFall ? 4 : 5;
    const legY = isJump ? 10 : isFall ? 12 : 14;
    const legSwing = isWalk ? Math.sin(frame * 1.5) * 2 : 0;

    ctx.beginPath();
    ctx.ellipse(-legSpread - legSwing, legY, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(legSpread + legSwing, legY, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#689F38";
    ctx.beginPath();
    ctx.ellipse(-legSpread - legSwing, legY + 5, 5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(legSpread + legSwing, legY + 5, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
