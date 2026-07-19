"use client";

import React, { useRef, useEffect } from "react";
import { useGameStore } from "@/engine/gameStore";
import { DoodleBody } from "@/engine/DoodleBody";
import { DoodleRenderer } from "@/engine/DoodleRenderer";
import { PlankRenderer } from "@/engine/PlankRenderer";
import { CameraController } from "@/engine/CameraController";
import { RespawnController } from "@/engine/RespawnController";
import { PhysicsConfig as C } from "@/engine/PhysicsConfig";

/**
 * Single Responsibility (SRP): Main Canvas View Component. 
 * Orchestrates the animation loop tick, physics updates, camera scrolling, and canvas rendering.
 */
export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTimeRef = useRef(0);
  const rafRef = useRef(0);
  const doodleRenderer = useRef(new DoodleRenderer());
  const plankRenderer = useRef(new PlankRenderer());
  const camera = useRef(new CameraController());
  const respawn = useRef(new RespawnController());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /**
     * Main Animation Frame Loop
     * Navigation Flow:
     * 1. Calculate Delta Time (dt) & Resize Canvas Viewport
     * 2. Check Respawn Trigger Condition vs Physics Tick Update
     * 3. Synchronize Visited Section Markers & DOM Text Highlighting
     * 4. Update Game Camera Target Scroll Position
     * 5. Update Projectiles & Visual Particle States
     * 6. Render Planks, Particle Effects, Bullets, & Doodle Character
     */
    const loop = (time: number) => {
      // ----------------------------------------------------
      // Flow Step 1: Calculate Delta Time & Canvas Dimensions
      // ----------------------------------------------------
      if (!lastTimeRef.current) lastTimeRef.current = time;
      let dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      if (dt > 0.05) dt = 0.05;

      const store = useGameStore.getState();
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      if (store.normalScrollMode) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const maxX = window.innerWidth;

      // ----------------------------------------------------
      // Flow Step 2: Handle Respawn Check or Physics Tick
      // ----------------------------------------------------
      if (respawn.current.shouldRespawn(store.doodle, window.scrollY, window.innerHeight)) {
        store.setDoodle(respawn.current.respawn(store.platforms, store.activeSection, window.scrollY, window.innerHeight));
      } else {
        const prevDoodle = store.doodle;
        const newDoodle = DoodleBody.update(prevDoodle, store.input, store.platforms, dt, maxX, store.worldHeight);
        store.setDoodle(newDoodle);

        // Break old held plank if Doodle left it or timer expired
        if (prevDoodle.heldPlankId && prevDoodle.heldPlankId !== newDoodle.heldPlankId) {
          store.breakPlank(prevDoodle.heldPlankId);
        }

        if (store.input.jumpPressed) store.setInput({ jumpPressed: false });

        // ----------------------------------------------------
        // Flow Step 3: Update Section Markers & Text Classes
        // ----------------------------------------------------
        document.querySelectorAll(".doodle-active-text").forEach((el) => {
          el.classList.remove("doodle-active-text");
        });

        if (newDoodle.standingPlatformId) {
          const plat = store.platforms.find((p) => p.id === newDoodle.standingPlatformId);
          if (plat?.sectionId) {
            store.markVisited(plat.sectionId);
            store.setActiveSection(plat.sectionId);
          }
          if (newDoodle.standingPlatformId.startsWith("text-")) {
            const activeTextEl = document.querySelector(`[data-platform-id="${newDoodle.standingPlatformId}"]`);
            if (activeTextEl) {
              activeTextEl.classList.add("doodle-active-text");
            }
          }
        }

        // ----------------------------------------------------
        // Flow Step 4: Camera Target Update
        // ----------------------------------------------------
        camera.current.update(
          newDoodle.pos.y,
          newDoodle.pos.y + C.DOODLE_H,
          newDoodle.onGround,
          window.innerHeight,
          Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
        );
      }

      // ----------------------------------------------------
      // Flow Step 5: Update Projectiles & Visual Particles
      // ----------------------------------------------------
      store.updateBeans(dt);
      const scrollY = window.scrollY;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ----------------------------------------------------
      // Flow Step 6: Render Scene Layers (Planks, Particles, Bullets, Doodle)
      // ----------------------------------------------------
      plankRenderer.current.draw(ctx, store.platforms, scrollY, window.innerHeight, store.doodle.heldPlankId, store.doodle.heldTimer);

      // Render Falling Planks
      for (const fp of store.fallingPlanks) {
        plankRenderer.current.drawFallingPlank(ctx, fp, scrollY);
      }

      // Render Falling Letters
      for (const fl of store.fallingLetters) {
        ctx.save();
        ctx.globalAlpha = fl.opacity;
        ctx.font = fl.font;
        ctx.fillStyle = fl.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.translate(fl.x, fl.y - scrollY);
        ctx.rotate(fl.angle);
        ctx.fillText(fl.char, 0, 0);
        ctx.restore();
      }

      // Render Bullets
      for (const bean of useGameStore.getState().beans) {
        ctx.fillStyle = "#8BC34A";
        ctx.strokeStyle = "#558B2F";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bean.pos.x, bean.pos.y - scrollY, C.BEAN_SIZE, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Render Doodle Character
      doodleRenderer.current.draw(ctx, useGameStore.getState().doodle, scrollY);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ width: "100vw", height: "100vh", zIndex: 100 }}
    />
  );
}
