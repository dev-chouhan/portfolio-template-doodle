import { create } from "zustand";
import type { DoodleSnapshot, InputState } from "./DoodleBody";
import { DoodleBody } from "./DoodleBody";
import { PlankPlatform } from "./Platform";
import type { IPlatform } from "./Platform";
import { Vector2 } from "./Vector2";
import { AABB } from "./AABB";
import { PhysicsConfig as C } from "./PhysicsConfig";

/**
 * Projectile (bean) physical state representation.
 */
export interface Bean {
  id: number;
  pos: Vector2;
  vel: Vector2;
}

export type ThemeMode = "light" | "dark" | "blueprint";

/**
 * Single Responsibility (SRP): Holds global reactive state for Doodle, platforms, and particles.
 */
export interface GameStoreState {
  doodle: DoodleSnapshot;
  platforms: IPlatform[];
  input: InputState;
  beans: Bean[];
  nextBeanId: number;
  /** Set of section IDs the Doodle has visited or passed through */
  visitedIds: Set<string>;
  /** Currently active section ID based on Doodle position */
  activeSection: string | null;
  normalScrollMode: boolean;
  worldHeight: number;
  theme: ThemeMode;
  fallingPlanks: Array<{
    id: string;
    rect: AABB;
    velY: number;
    angle: number;
    rotSpeed: number;
    opacity: number;
  }>;
  fallingLetters: Array<{
    char: string;
    x: number;
    y: number;
    velX: number;
    velY: number;
    font: string;
    color: string;
    opacity: number;
    angle: number;
    rotSpeed: number;
  }>;
  /** Set of fully destroyed platform IDs (persisted to prevent re-scanning) */
  brokenPlatformIds: Set<string>;
  /** Set of plank IDs converted from normal -> broken by shooting (not yet fallen) */
  crackedPlankIds: Set<string>;
}

/**
 * Actions interface for game store mutations.
 * Interface Segregation (ISP): Consumers bind only to specific actions.
 */
export interface GameStoreActions {
  /** Updates Doodle character physical snapshot */
  setDoodle: (d: DoodleSnapshot) => void;
  /** Sets active platform collection */
  setPlatforms: (p: IPlatform[]) => void;
  /** Merges partial input updates into input state */
  setInput: (partial: Partial<InputState>) => void;
  /** Spawns upward-moving pea projectile from Doodle position */
  shootBean: () => void;
  /** Main physics tick for projectiles, text node destruction, and falling planks */
  updateBeans: (dt: number) => void;
  /** Removes projectile by ID */
  removeBeanById: (id: number) => void;
  /** Marks section ID as visited */
  markVisited: (id: string) => void;
  /** Sets currently active viewport section */
  setActiveSection: (id: string | null) => void;
  /** Updates document world height */
  setWorldHeight: (h: number) => void;
  /** Toggles standard scroll mode vs game camera scroll */
  toggleScrollMode: () => void;
  /** Sets active theme mode */
  setTheme: (t: ThemeMode) => void;
  /** Cycles through available themes (light -> dark -> blueprint -> light) */
  cycleTheme: () => void;
  /** Triggers plank collapse animation and disables collision */
  breakPlank: (id: string) => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("doodle_portfolio_theme") as ThemeMode | null;
    if (saved && ["light", "dark", "blueprint"].includes(saved)) {
      document.documentElement.setAttribute("data-theme", saved);
      return saved;
    }
  }
  return "light";
};

export const useGameStore = create<GameStoreState & GameStoreActions>((set, get) => ({
  doodle: DoodleBody.create(100, 200),
  platforms: [],
  input: { left: false, right: false, jump: false, jumpPressed: false, shoot: false },
  beans: [],
  nextBeanId: 1,
  visitedIds: new Set(),
  activeSection: null,
  normalScrollMode: false,
  worldHeight: 8000,
  theme: getInitialTheme(),

  fallingPlanks: [],
  fallingLetters: [],
  brokenPlatformIds: new Set(),
  crackedPlankIds: new Set(),

  setDoodle: (d) => set({ doodle: d }),
  setPlatforms: (p) => set({ platforms: p }),
  setInput: (partial) =>
    set((s) => ({ input: { ...s.input, ...partial } })),
  setTheme: (t) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("doodle_portfolio_theme", t);
      document.documentElement.setAttribute("data-theme", t);
    }
    set({ theme: t });
  },
  cycleTheme: () => {
    const current = get().theme;
    const next: ThemeMode = current === "light" ? "dark" : current === "dark" ? "blueprint" : "light";
    if (typeof window !== "undefined") {
      localStorage.setItem("doodle_portfolio_theme", next);
      document.documentElement.setAttribute("data-theme", next);
    }
    set({ theme: next });
  },

  /**
   * Spawns an upward projectile from Doodle's center coordinate.
   * Navigation Flow:
   * 1. Calculate projectile launch coordinates
   * 2. Construct projectile instance with upward velocity vector
   * 3. Set shoot animation timer and update store state
   */
  shootBean: () => {
    const state = get();
    const doodle = state.doodle;
    const beanX = doodle.pos.x + C.DOODLE_W / 2 - C.BEAN_SIZE / 2;
    const beanY = doodle.pos.y;

    const newBean: Bean = {
      id: state.nextBeanId,
      pos: new Vector2(beanX, beanY),
      vel: new Vector2(0, -C.BEAN_SPEED),
    };

    set({
      doodle: {
        ...doodle,
        shootTimer: 0.25,
      },
      beans: [...state.beans, newBean],
      nextBeanId: state.nextBeanId + 1,
    });
  },

  /**
   * Main simulation tick for active projectiles and visual particles.
   * Navigation Flow:
   * 1. Iterate Active Beans & Calculate Trajectories
   * 2. Perform Platform Collision & Top Surface Crossing Detection
   * 3. Handle Normal -> Broken Conversion & Broken Plank Pop-up Collapse
   * 4. Perform Text Node Character Damage & Falling Letter Particle Creation
   * 5. Animate & Age Falling Planks / Letters
   * 6. Update Reactive Game Store State
   */
  updateBeans: (dt: number) => {
    const state = get();
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;

    const updatedBeans: Bean[] = [];
    let platforms = [...state.platforms];
    let platformsChanged = false;
    const newFallingPlanks = [...state.fallingPlanks];
    const newFallingLetters = [...state.fallingLetters];

    const newBrokenPlatformIds = new Set(state.brokenPlatformIds);
    const newCrackedPlankIds = new Set(state.crackedPlankIds);

    // ----------------------------------------------------
    // Flow Step 1: Process Each Active Projectile Trajectory
    // ----------------------------------------------------
    for (const bean of state.beans) {
      const nextY = bean.pos.y + bean.vel.y * dt;
      let hit = false;

      // ----------------------------------------------------
      // Flow Step 2: Check Collision with Platforms & Text Nodes
      // ----------------------------------------------------
      for (let i = 0; i < platforms.length; i++) {
        const plat = platforms[i];
        if (plat.isDisabled) continue;

        const isWithinX = bean.pos.x >= plat.rect.left && bean.pos.x <= plat.rect.right;
        const crossedY = bean.pos.y >= plat.rect.top && nextY <= plat.rect.top;

        if (isWithinX && crossedY) {
          hit = true;

          // ----------------------------------------------------
          // Flow Step 3: Handle Plank Collisions
          // ----------------------------------------------------
          if (plat.type === "plank") {
            const plank = plat as PlankPlatform;

            if (plank.isBroken) {
              // Broken plank shot -> pop-up falling animation
              newFallingPlanks.push({
                id: plank.id,
                rect: plank.rect,
                velY: -180,
                angle: 0,
                rotSpeed: (Math.random() - 0.5) * 10,
                opacity: 1.0,
              });

              platforms.splice(i, 1);
              newBrokenPlatformIds.add(plank.id);
              newCrackedPlankIds.delete(plank.id);
              platformsChanged = true;
              i--;
            } else {
              // Convert normal -> broken plank (stays in place, cracks appear)
              platforms[i] = new PlankPlatform(plank.id, plank.rect, plank.sectionId, true);
              newCrackedPlankIds.add(plank.id);
              platformsChanged = true;
            }
          } 
          // ----------------------------------------------------
          // Flow Step 4: Handle DOM Text Node Character Damage
          // ----------------------------------------------------
          else if (plat.type === "text") {
            const el = document.querySelector(`[data-platform-id="${plat.id}"]`);
            if (el) {
              let targetNode: Node | null = null;
              const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
              let n: Node | null;
              while ((n = walk.nextNode())) {
                if (n.textContent && n.textContent.trim().length > 0) {
                  targetNode = n;
                  break;
                }
              }

              if (targetNode) {
                const text = targetNode.nodeValue || "";
                if (text.trim().length > 0) {
                  const beanCenterX = bean.pos.x + C.BEAN_SIZE / 2;
                  const relX = beanCenterX - plat.rect.x;
                  const pct = Math.max(0, Math.min(1, relX / plat.rect.w));
                  const charIndex = Math.floor(pct * text.length);
                  const char = text[charIndex];

                  if (char && char !== " ") {
                    const newText = text.substring(0, charIndex) + " " + text.substring(charIndex + 1);
                    targetNode.nodeValue = newText;

                    if (newText.trim().length === 0) {
                      plat.isDisabled = true;
                      newBrokenPlatformIds.add(plat.id);
                    }

                    const style = window.getComputedStyle(el);
                    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                    const color = style.color;

                    newFallingLetters.push({
                      char,
                      x: bean.pos.x,
                      y: bean.pos.y,
                      velX: (Math.random() - 0.5) * 150,
                      velY: -200,
                      font,
                      color,
                      opacity: 1.0,
                      angle: 0,
                      rotSpeed: (Math.random() - 0.5) * 6,
                    });
                  }
                }
              }
            }
          }
          break;
        }
      }

      if (!hit) {
        updatedBeans.push({
          ...bean,
          pos: new Vector2(bean.pos.x, nextY),
        });
      }
    }

    // ----------------------------------------------------
    // Flow Step 5: Update Falling Planks & Letters Particles
    // ----------------------------------------------------
    const updatedFallingPlanks = newFallingPlanks
      .map((fp) => ({
        ...fp,
        rect: fp.rect.withY(fp.rect.y + fp.velY * dt),
        velY: fp.velY + 1200 * dt,
        angle: fp.angle + fp.rotSpeed * dt,
        opacity: Math.max(0, fp.opacity - dt * 0.7),
      }))
      .filter((fp) => fp.opacity > 0 && fp.rect.y < scrollY + viewportH + 100);

    const updatedFallingLetters = newFallingLetters
      .map((fl) => ({
        ...fl,
        x: fl.x + fl.velX * dt,
        y: fl.y + fl.velY * dt,
        velY: fl.velY + 1000 * dt,
        angle: fl.angle + fl.rotSpeed * dt,
        opacity: Math.max(0, fl.opacity - dt * 0.7),
      }))
      .filter((fl) => fl.opacity > 0 && fl.y < scrollY + viewportH + 100);

    // ----------------------------------------------------
    // Flow Step 6: Commit Updated State Snapshot
    // ----------------------------------------------------
    set({
      beans: updatedBeans,
      fallingPlanks: updatedFallingPlanks,
      fallingLetters: updatedFallingLetters,
      brokenPlatformIds: newBrokenPlatformIds,
      crackedPlankIds: newCrackedPlankIds,
      ...(platformsChanged ? { platforms } : {}),
    });
  },

  removeBeanById: (id) =>
    set((s) => ({ beans: s.beans.filter((b) => b.id !== id) })),

  markVisited: (id) =>
    set((s) => {
      if (s.visitedIds.has(id)) return s;
      const next = new Set(s.visitedIds);
      next.add(id);
      return { visitedIds: next };
    }),

  setActiveSection: (id) => set({ activeSection: id }),
  setWorldHeight: (h) => set({ worldHeight: h }),
  toggleScrollMode: () =>
    set((s) => ({ normalScrollMode: !s.normalScrollMode })),

  /**
   * Triggers a plank collapse animation and removes it from collision space.
   * Navigation Flow:
   * 1. Find target platform instance
   * 2. Spawn downward-falling plank animation
   * 3. Add to brokenPlatformIds set so scanner ignores it in future scans
   * 4. Remove platform from active collision platforms array
   */
  breakPlank: (id: string) => {
    set((s) => {
      const plank = s.platforms.find((p) => p.id === id);
      if (!plank) return s;

      const newFallingPlanks = [
        ...s.fallingPlanks,
        {
          id: plank.id,
          rect: plank.rect,
          velY: 120, // Initial downward collapse velocity
          angle: 0,
          rotSpeed: (Math.random() - 0.5) * 6,
          opacity: 1.0,
        },
      ];

      const nextBroken = new Set(s.brokenPlatformIds);
      nextBroken.add(id);

      return {
        platforms: s.platforms.filter((p) => p.id !== id),
        fallingPlanks: newFallingPlanks,
        brokenPlatformIds: nextBroken,
      };
    });
  },
}));
