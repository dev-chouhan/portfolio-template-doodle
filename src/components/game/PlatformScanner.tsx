"use client";

import { useEffect, useCallback, useRef } from "react";
import { useGameStore } from "@/engine/gameStore";
import { DoodleBody } from "@/engine/DoodleBody";
import { AABB } from "@/engine/AABB";
import { PlankPlatform, TextPlatform } from "@/engine/Platform";
import type { IPlatform } from "@/engine/Platform";
import { PhysicsConfig as C } from "@/engine/PhysicsConfig";

/**
 * Single Responsibility (SRP): Scans the DOM tree for text nodes, form inputs, static planks, 
 * and procedurally generates background planks avoiding collisions.
 */
export default function PlatformScanner() {
  const setPlatforms = useGameStore((s) => s.setPlatforms);
  const setWorldHeight = useGameStore((s) => s.setWorldHeight);
  const brokenPlatformIds = useGameStore((s) => s.brokenPlatformIds);
  const crackedPlankIds = useGameStore((s) => s.crackedPlankIds);
  const lastScanRef = useRef(0);
  const firstScanDoneRef = useRef(false);
  const sessionSeedRef = useRef(0);
  
  if (sessionSeedRef.current === 0) {
    sessionSeedRef.current = Math.floor(Math.random() * 100000) + 1;
  }

  /**
   * Main scan function that converts DOM nodes and procedural generation into physics platforms.
   * Navigation Flow:
   * 1. Scan DOM Text Nodes using TreeWalker
   * 2. Scan Form Inputs & Textareas
   * 3. Fetch Section Container & Inner Content Bounding Boxes
   * 4. Initialize PRNG Generator & Parse Env Ratios
   * 5. Scan Pre-placed Static Planks
   * 6. Dynamically Generate Background Planks with Overlap Clearance
   * 7. Commit Platforms & Initialize First Spawn Coordinate
   */
  const scan = useCallback(() => {
    const now = Date.now();
    if (now - lastScanRef.current < 200) return;
    lastScanRef.current = now;

    const destroyedIds = useGameStore.getState().brokenPlatformIds;
    const crackedIds = useGameStore.getState().crackedPlankIds;

    const textPlatforms: IPlatform[] = [];
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // ----------------------------------------------------
    // Flow Step 1: Scan DOM Text Nodes using TreeWalker
    // ----------------------------------------------------
    const walker = document.createTreeWalker(
      document.getElementById("main-content") || document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const text = node.textContent?.trim() || "";
          if (text.length < 2) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (parent.closest("[data-plank]")) return NodeFilter.FILTER_REJECT;
          if (parent.closest("script, style, noscript")) return NodeFilter.FILTER_REJECT;
          const style = window.getComputedStyle(parent);
          if (style.display === "none" || style.visibility === "hidden") return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const seenKeys = new Set<string>();
    let textNode: Node | null;

    while ((textNode = walker.nextNode())) {
      const content = textNode.textContent || "";
      const startMatch = content.match(/^\s*/);
      const startOffset = startMatch ? startMatch[0].length : 0;
      const endMatch = content.match(/\s*$/);
      const endOffset = content.length - (endMatch ? endMatch[0].length : 0);

      if (startOffset < endOffset) {
        const range = document.createRange();
        range.setStart(textNode, startOffset);
        range.setEnd(textNode, endOffset);
        const rects = range.getClientRects();

        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i];
          if (rect.width < 10 || rect.height < 6) continue;

          const x = rect.left + scrollX;
          const y = rect.top + scrollY;
          const key = `${Math.round(x)}-${Math.round(y)}-${Math.round(rect.width)}`;

          if (seenKeys.has(key)) continue;
          seenKeys.add(key);

          const parent = textNode.parentElement;
          const sectionId = parent?.closest("[data-section]")?.getAttribute("data-section") || undefined;
          const platformId = `text-${key}`;

          if (destroyedIds.has(platformId)) continue;

          if (parent) {
            parent.setAttribute("data-platform-id", platformId);
          }

          const offset = rect.height * 0.25;
          textPlatforms.push(
            new TextPlatform(platformId, new AABB(x, y + offset, rect.width, 6), sectionId)
          );
        }
      }
    }

    // ----------------------------------------------------
    // Flow Step 2: Scan Visible Form Inputs & Textareas
    // ----------------------------------------------------
    const formInputElements = Array.from(
      document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        "input:not([type='hidden']):not([type='radio']):not([type='checkbox']), textarea"
      )
    );
    for (const inputEl of formInputElements) {
      const rect = inputEl.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 6) continue;

      const x = rect.left + scrollX;
      const y = rect.top + scrollY;
      const key = `input-${Math.round(x)}-${Math.round(y)}-${Math.round(rect.width)}`;

      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const sectionId = inputEl.closest("[data-section]")?.getAttribute("data-section") || undefined;
      const platformId = `text-${key}`;

      if (destroyedIds.has(platformId)) continue;

      inputEl.setAttribute("data-platform-id", platformId);

      textPlatforms.push(
        new TextPlatform(platformId, new AABB(x, y, rect.width, 6), sectionId)
      );
    }

    const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const pageWidth = window.innerWidth;

    // ----------------------------------------------------
    // Flow Step 3: Fetch Section Container Bounding Boxes
    // ----------------------------------------------------
    const sectionElements = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    const sectionsInfo = sectionElements.map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        id: el.dataset.section || "",
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
      };
    });

    const contentContainers = Array.from(document.querySelectorAll<HTMLElement>("[data-section] > div:not([aria-hidden])"));
    const contentBoxes = contentContainers.map((el) => {
      const rect = el.getBoundingClientRect();
      return new AABB(
        rect.left + window.scrollX,
        rect.top + window.scrollY,
        rect.width,
        rect.height
      );
    });

    // ----------------------------------------------------
    // Flow Step 4: Initialize PRNG Generator & Environment Variables
    // ----------------------------------------------------
    const envSeed = process.env.NEXT_PUBLIC_GAME_SEED;
    let seed = envSeed ? parseInt(envSeed, 10) : sessionSeedRef.current;
    const nextRand = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const plankRatiosStr = process.env.NEXT_PUBLIC_PLANK_RATIO || "0.50,0.35,0.15";
    const widthRatiosStr = process.env.NEXT_PUBLIC_WIDTH_RATIO || "0.20,0.40,0.40";
    const brokenPlankRatioStr = process.env.NEXT_PUBLIC_PLANK_BROKEN_RATIO || "0.90,0.10";
    
    const plankRatios = plankRatiosStr.split(",").map(Number);
    const widthRatios = widthRatiosStr.split(",").map(Number);
    const brokenPlankChance = brokenPlankRatioStr.split(",")[1]
      ? parseFloat(brokenPlankRatioStr.split(",")[1])
      : 0.10;

    const p1 = plankRatios[0] || 0.50;
    const p2 = p1 + (plankRatios[1] || 0.35);

    const w1 = widthRatios[0] || 0.20;
    const w2 = w1 + (widthRatios[1] || 0.50);

    // ----------------------------------------------------
    // Flow Step 5: Scan Pre-placed Static Planks in Sections
    // ----------------------------------------------------
    const staticPlankEls = Array.from(document.querySelectorAll<HTMLElement>("[data-plank]"));
    const staticPlanks: IPlatform[] = [];
    for (const el of staticPlankEls) {
      const rect = el.getBoundingClientRect();
      if (rect.width < 5 || rect.height < 2) continue;
      const x = rect.left + scrollX;
      const y = rect.top + scrollY;
      const sectionId = el.getAttribute("data-section") || undefined;
      const plankId = el.getAttribute("data-plank-id") || `static-${Math.round(x)}-${Math.round(y)}`;

      let isBroken = nextRand() < brokenPlankChance;
      if (crackedIds.has(plankId)) isBroken = true;

      if (destroyedIds.has(plankId)) continue;

      staticPlanks.push(
        new PlankPlatform(plankId, new AABB(x, y, rect.width, rect.height), sectionId, isBroken)
      );
    }

    // ----------------------------------------------------
    // Flow Step 6: Procedurally Generate Dynamic Background Planks
    // ----------------------------------------------------
    const generatedPlanks: IPlatform[] = [];
    
    const maxPlanksCount = process.env.NEXT_PUBLIC_PLANK_COUNT
      ? parseInt(process.env.NEXT_PUBLIC_PLANK_COUNT, 10)
      : 25;

    const viewportH = window.innerHeight || 800;
    const stepY = Math.max(20, Math.round(viewportH / maxPlanksCount));

    for (let y = 120; y < docH - 120; y += stepY) {
      const r = nextRand();
      let x = 0;

      if (r < p1) {
        const minX = -C.PLANK_W / 2;
        const maxX = w1 * pageWidth - C.PLANK_W;
        x = minX + nextRand() * (maxX - minX);
      } else if (r < p2) {
        const minX = w1 * pageWidth + 15;
        const maxX = w2 * pageWidth - C.PLANK_W - 15;
        x = minX + nextRand() * (maxX - minX);
      } else {
        const minX = w2 * pageWidth + 15;
        const maxX = pageWidth - C.PLANK_W - 15;
        x = minX + nextRand() * (maxX - minX);
      }

      const maxOffset = stepY * 0.3;
      const finalY = y + (nextRand() * maxOffset - maxOffset / 2);

      const section = sectionsInfo.find((s) => finalY >= s.top && finalY <= s.bottom);
      const sectionId = section?.id;

      const plankAABB = new AABB(x, finalY, C.PLANK_W, C.PLANK_H);

      // Check text overlaps
      let overlaps = false;
      for (const textPlat of textPlatforms) {
        const paddedText = new AABB(
          textPlat.rect.x - 15,
          textPlat.rect.top - 12,
          textPlat.rect.w + 30,
          textPlat.rect.h + 24
        );
        if (plankAABB.overlaps(paddedText)) {
          overlaps = true;
          break;
        }
      }

      // Check static plank overlaps
      if (!overlaps) {
        for (const staticPlat of staticPlanks) {
          const paddedStatic = new AABB(
            staticPlat.rect.x - 15,
            staticPlat.rect.top - 12,
            staticPlat.rect.w + 30,
            staticPlat.rect.h + 24
          );
          if (plankAABB.overlaps(paddedStatic)) {
            overlaps = true;
            break;
          }
        }
      }

      // Check content box overlaps
      if (!overlaps) {
        for (const box of contentBoxes) {
          const paddedBox = new AABB(
            box.x - 15,
            box.y - 12,
            box.w + 30,
            box.h + 24
          );
          if (plankAABB.overlaps(paddedBox)) {
            overlaps = true;
            break;
          }
        }
      }

      if (!overlaps) {
        const dynId = `dyn-plank-${Math.round(finalY)}`;
        let isBroken = nextRand() < brokenPlankChance;
        if (crackedIds.has(dynId)) isBroken = true;
        
        if (destroyedIds.has(dynId)) continue;
        generatedPlanks.push(
          new PlankPlatform(dynId, plankAABB, sectionId, isBroken)
        );
      }
    }

    // ----------------------------------------------------
    // Flow Step 7: Commit Platforms & Spawn Initial Character
    // ----------------------------------------------------
    setWorldHeight(docH);
    const allPlatforms = [...textPlatforms, ...staticPlanks, ...generatedPlanks];
    setPlatforms(allPlatforms);

    const allPlanks = [...staticPlanks, ...generatedPlanks];
    if (!firstScanDoneRef.current && allPlanks.length > 0) {
      firstScanDoneRef.current = true;

      const minY = Math.min(...allPlanks.map((p) => p.rect.top));
      const topmostPlanks = allPlanks.filter((p) => p.rect.top <= minY + 30);
      const topLeft = topmostPlanks.sort((a, b) => a.rect.x - b.rect.x)[0];

      if (topLeft) {
        const spawnX = topLeft.rect.x + topLeft.rect.w / 2 - C.DOODLE_W / 2;
        const spawnY = topLeft.rect.top - C.DOODLE_H - 2;
        useGameStore.getState().setDoodle(DoodleBody.create(spawnX, spawnY));
      }
    }
  }, [setPlatforms, setWorldHeight, brokenPlatformIds, crackedPlankIds]);

  useEffect(() => {
    const t = setTimeout(scan, 400);
    const resizeH = () => setTimeout(scan, 250);
    window.addEventListener("resize", resizeH);
    document.fonts?.ready?.then(() => setTimeout(scan, 150));
    const interval = setInterval(scan, 2500);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
      window.removeEventListener("resize", resizeH);
    };
  }, [scan]);

  return null;
}
