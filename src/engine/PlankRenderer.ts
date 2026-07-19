import type { IPlatform } from "./Platform";

/**
 * Single Responsibility (SRP): Handles Canvas rendering of static, broken, and falling plank platforms.
 */
export class PlankRenderer {
  /**
   * Main render loop method for all active platforms within the viewport bounds.
   * Navigation Flow:
   * 1. Filter Platforms by Viewport Culling Bounds
   * 2. Delegate Rendering for Plank Platform Types
   * 
   * @param ctx Canvas 2D rendering context
   * @param platforms List of active platforms
   * @param scrollY Current page vertical scroll position
   * @param viewportH Window inner height
   * @param heldPlankId ID of plank Doodle is currently standing on
   * @param heldTimer Remaining hold time before collapse
   */
  draw(
    ctx: CanvasRenderingContext2D,
    platforms: IPlatform[],
    scrollY: number,
    viewportH: number,
    heldPlankId?: string | null,
    heldTimer?: number,
    theme: string = "light"
  ): void {
    for (const plat of platforms) {
      const screenY = plat.rect.top - scrollY;
      // Step 1: Perform frustum culling outside screen view
      if (screenY > viewportH + 50 || screenY < -50) continue;
      
      // Step 2: Draw platform if type is plank
      if (plat.type === "plank") {
        this.drawPlank(ctx, plat, scrollY, heldPlankId, heldTimer, theme);
      }
    }
  }

  /**
   * Renders an individual plank platform with rounded corners, shake feedback, and crack overlays.
   * Navigation Flow:
   * 1. Calculate Screen Coordinates & Apply Shake Displacement
   * 2. Configure Fill & Stroke Styles (Theme-adapted green/cyan body, crack lines)
   * 3. Draw Rounded Rectangle Body Path
   * 4. Overlay Crack Lines (if broken) or Top Highlight (if normal)
   */
  private drawPlank(
    ctx: CanvasRenderingContext2D,
    plat: IPlatform,
    scrollY: number,
    heldPlankId?: string | null,
    heldTimer?: number,
    theme: string = "light"
  ): void {
    let x = plat.rect.x;
    let y = plat.rect.top - scrollY;
    const w = plat.rect.w;
    const h = plat.rect.h;

    // Step 1: Apply warning shake displacement if Doodle is currently on expiring broken plank
    if (plat.id === heldPlankId && heldTimer && heldTimer > 0) {
      const intensity = Math.max(1.5, (2.0 - heldTimer) * 3);
      x += (Math.random() - 0.5) * intensity;
      y += (Math.random() - 0.5) * intensity;
    }

    ctx.save();
    ctx.globalAlpha = 1.0;

    const isBroken = plat.isBroken || false;

    // Step 2: Configure theme-aware platform colors
    let fillColor = "#8BC34A";
    let strokeColor = "#33691E";
    let highlightColor = "#C5E1A5";
    let crackColor = "#5D4037";

    if (theme === "dark") {
      fillColor = "#4ADE80";
      strokeColor = "#14532D";
      highlightColor = "#86EFAC";
      crackColor = "#0F172A";
    } else if (theme === "blueprint") {
      fillColor = "#38BDF8";
      strokeColor = "#0369A1";
      highlightColor = "#BAE6FD";
      crackColor = "#0F2B5C";
    }

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;

    // Step 3: Draw rounded rectangle path
    const r = 4;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Step 4: Overlay cracks for broken planks or highlight for normal planks
    if (isBroken) {
      ctx.strokeStyle = crackColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w / 2 - 4, y + h / 3);
      ctx.lineTo(x + w / 2 + 4, y + 2 * h / 3);
      ctx.lineTo(x + w / 2, y + h);
      ctx.stroke();
    } else {
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 2);
      ctx.lineTo(x + w - 4, y + 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Renders a falling plank particle during collapse or shoot destruction.
   * Navigation Flow:
   * 1. Transform Canvas Coordinates & Apply Rotation Angle
   * 2. Render Falling Broken Plank Texture
   * 
   * @param ctx Canvas 2D rendering context
   * @param fp Falling plank state object
   * @param scrollY Current page vertical scroll position
   */
  drawFallingPlank(ctx: CanvasRenderingContext2D, fp: any, scrollY: number): void {
    const x = fp.rect.x;
    const y = fp.rect.top - scrollY;
    const w = fp.rect.w;
    const h = fp.rect.h;

    ctx.save();
    ctx.globalAlpha = fp.opacity;
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(fp.angle);

    const rx = -w / 2;
    const ry = -h / 2;

    ctx.fillStyle = "#A1887F";
    ctx.strokeStyle = "#5D4037";
    ctx.lineWidth = 2.0;

    const r = 4;
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + w - r, ry);
    ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + r);
    ctx.lineTo(rx + w, ry + h - r);
    ctx.quadraticCurveTo(rx + w, ry + h, rx + w - r, ry + h);
    ctx.lineTo(rx + r, ry + h);
    ctx.quadraticCurveTo(rx, ry + h, rx, ry + h - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rx + w / 2, ry);
    ctx.lineTo(rx + w / 2 - 4, ry + h / 3);
    ctx.lineTo(rx + w / 2 + 4, ry + 2 * h / 3);
    ctx.lineTo(rx + w / 2, ry + h);
    ctx.stroke();

    ctx.restore();
  }
}
