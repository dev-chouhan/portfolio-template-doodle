import { Vector2 } from "./Vector2";
import { AABB } from "./AABB";
import { PhysicsConfig as C } from "./PhysicsConfig";
import type { IPlatform } from "./Platform";

/** Facing direction of the character */
export type Facing = "left" | "right";

/** Animation state of the character */
export type DoodleAnim = "idle" | "walk" | "jump" | "fall";

/**
 * Immutable snapshot representing the character's physical state at a given frame.
 * Single Responsibility (SRP): Holds state representation only.
 */
export interface DoodleSnapshot {
  pos: Vector2;
  vel: Vector2;
  onGround: boolean;
  facing: Facing;
  anim: DoodleAnim;
  animFrame: number;
  animTimer: number;
  standingPlatformId: string | null;
  /** Double jump remaining counter */
  jumpsRemaining: number;
  /** Stationary time counter for camera centering */
  stationaryTime: number;
  shootTimer: number;
  reviveTimer: number;
  heldPlankId: string | null;
  heldTimer: number;
}

/** Input state interface passed into the physics engine */
export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean;
  shoot: boolean;
}

/**
 * Main physics engine and body calculations for Doodle.
 * Single Responsibility (SRP): Pure physical simulation and collision resolution.
 * Open/Closed (OCP): State updates are returned immutably.
 */
export class DoodleBody {
  /**
   * Factory method to create a new Doodle snapshot at a spawn position.
   * @param x Initial horizontal spawn coordinate
   * @param y Initial vertical spawn coordinate
   * @returns Fresh DoodleSnapshot instance
   */
  static create(x: number, y: number): DoodleSnapshot {
    return {
      pos: new Vector2(x, y),
      vel: Vector2.ZERO,
      onGround: false,
      facing: "right",
      anim: "fall",
      animFrame: 0,
      animTimer: 0,
      standingPlatformId: null,
      jumpsRemaining: 2,
      stationaryTime: 0,
      shootTimer: 0,
      reviveTimer: 0,
      heldPlankId: null,
      heldTimer: 0,
    };
  }

  /**
   * Calculates the Axis-Aligned Bounding Box (AABB) of the Doodle character.
   * @param s Current Doodle snapshot
   * @returns AABB instance representing bounding box
   */
  static bounds(s: DoodleSnapshot): AABB {
    return new AABB(s.pos.x, s.pos.y, C.DOODLE_W, C.DOODLE_H);
  }

  /**
   * Pure state updater function for the physics simulation tick.
   * Navigation Flow:
   * 1. Update Broken Plank Timer & Collapse Fall Check
   * 2. Calculate Horizontal Velocity & Facing
   * 3. Handle Jump / Double Jump Mechanics
   * 4. Apply Gravity & Terminal Velocity Clamping
   * 5. Calculate New Position & Boundary Constraints
   * 6. Perform Platform Collision & Grounding Check
   * 7. Apply Collapse Fall Overrides (if standing on expired broken plank)
   * 8. Determine Animation State & Return New Immutable Snapshot
   * 
   * @param prev Previous snapshot
   * @param input Current input state
   * @param platforms Active platforms list
   * @param dt Delta time in seconds
   * @param maxX Maximum viewport width boundary
   * @param worldHeight Total document world height
   * @returns Updated DoodleSnapshot
   */
  static update(
    prev: DoodleSnapshot,
    input: InputState,
    platforms: IPlatform[],
    dt: number,
    maxX: number,
    worldHeight: number
  ): DoodleSnapshot {
    // ----------------------------------------------------
    // Flow Step 1: Broken Plank Holding & Collapse Timer Update
    // ----------------------------------------------------
    let heldPlankId = prev.heldPlankId ?? null;
    let heldTimer = prev.heldTimer ?? 0;
    let forceCollapseFall = false;

    if (heldPlankId !== null) {
      heldTimer -= dt;
      if (heldTimer <= 0) {
        // If Doodle is STILL standing on this broken plank when timer expires,
        // force both the plank and Doodle to fall together!
        if (prev.standingPlatformId === heldPlankId) {
          forceCollapseFall = true;
        }
        heldPlankId = null;
        heldTimer = 0;
      }
    }

    let velX = prev.vel.x;
    let velY = prev.vel.y;
    let facing = prev.facing;
    let jumpsRemaining = prev.jumpsRemaining;
    const shootTimer = Math.max(0, prev.shootTimer - dt);
    const reviveTimer = Math.max(0, prev.reviveTimer - dt);

    const prevBottom = prev.pos.y + C.DOODLE_H;

    // ----------------------------------------------------
    // Flow Step 2: Horizontal Movement & Facing Logic
    // ----------------------------------------------------
    if (input.left) {
      velX = -C.MOVE_SPEED;
      facing = "left";
    } else if (input.right) {
      velX = C.MOVE_SPEED;
      facing = "right";
    } else {
      velX *= prev.onGround ? C.GROUND_FRICTION : C.AIR_FRICTION;
      if (Math.abs(velX) < 3) velX = 0;
    }

    // ----------------------------------------------------
    // Flow Step 3: Jump & Double Jump Input Handling
    // ----------------------------------------------------
    if (input.jumpPressed && jumpsRemaining > 0) {
      if (prev.onGround) {
        velY = C.JUMP_VEL;
        jumpsRemaining = 1;
      } else {
        velY = C.DOUBLE_JUMP_VEL;
        jumpsRemaining = jumpsRemaining - 1;
      }
    }

    // ----------------------------------------------------
    // Flow Step 4: Gravity Application & Fall Speed Clamp
    // ----------------------------------------------------
    velY += C.GRAVITY * dt;
    if (velY > C.MAX_FALL_SPEED) velY = C.MAX_FALL_SPEED;

    // ----------------------------------------------------
    // Flow Step 5: Position Integration & World Bounds
    // ----------------------------------------------------
    let posX = prev.pos.x + velX * dt;
    let posY = prev.pos.y + velY * dt;

    if (posX < 0) posX = 0;
    if (posX > maxX - C.DOODLE_W) posX = maxX - C.DOODLE_W;

    // ----------------------------------------------------
    // Flow Step 6: Platform Collision Detection & Grounding
    // ----------------------------------------------------
    let onGround = false;
    let standingPlatformId: string | null = null;
    const doodleBox = new AABB(posX, posY, C.DOODLE_W, C.DOODLE_H);

    if (velY >= 0 && !forceCollapseFall) {
      for (const plat of platforms) {
        if (!plat.isDisabled && doodleBox.landsOn(plat.rect, prevBottom)) {
          posY = plat.rect.top - C.DOODLE_H;
          velY = 0;
          onGround = true;
          standingPlatformId = plat.id;
          jumpsRemaining = 2; // Reset double jump on ground landing

          // Trigger broken plank holding timer upon landing
          if (plat.type === "plank" && plat.isBroken) {
            if (heldPlankId !== plat.id) {
              heldPlankId = plat.id;
              heldTimer = C.PLANK_HOLD_TIME;
            }
          }
          break;
        }
      }
    }

    // ----------------------------------------------------
    // Flow Step 7: Collapse Fall Override Handling
    // ----------------------------------------------------
    if (forceCollapseFall) {
      onGround = false;
      velY = Math.max(velY, 200); // Impart downward velocity alongside collapsing plank
      standingPlatformId = null;
    }

    // World Floor Protection
    if (posY + C.DOODLE_H > worldHeight) {
      posY = worldHeight - C.DOODLE_H;
      velY = 0;
      onGround = true;
      jumpsRemaining = 2;
    }

    // ----------------------------------------------------
    // Flow Step 8: Animation State & Snapshot Assembly
    // ----------------------------------------------------
    let anim: DoodleAnim;
    if (!onGround && velY < 0) anim = "jump";
    else if (!onGround) anim = "fall";
    else if (Math.abs(velX) > 10) anim = "walk";
    else anim = "idle";

    let animFrame = prev.animFrame;
    let animTimer = prev.animTimer + dt;
    if (anim === "walk") {
      if (animTimer > 0.1) {
        animFrame = (animFrame + 1) % 4;
        animTimer = 0;
      }
    } else {
      animFrame = 0;
      animTimer = 0;
    }

    const isStationary = onGround && Math.abs(velX) < 5 && Math.abs(velY) < 5;
    const stationaryTime = isStationary ? prev.stationaryTime + dt : 0;

    return {
      pos: new Vector2(posX, posY),
      vel: new Vector2(velX, velY),
      onGround,
      facing,
      anim,
      animFrame,
      animTimer,
      standingPlatformId,
      jumpsRemaining,
      stationaryTime,
      shootTimer,
      reviveTimer,
      heldPlankId,
      heldTimer,
    };
  }
}
