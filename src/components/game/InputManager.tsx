"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/engine/gameStore";

/**
 * Single Responsibility Principle (SRP): Listens for keyboard input events & manages viewport scroll locking.
 * Handles Arrow keys, WASD movement, Space projectile shooting, and scroll interception.
 */
export default function InputManager() {
  const normalScrollMode = useGameStore((s) => s.normalScrollMode);
  const shootCooldownRef = useRef(0);

  // ----------------------------------------------------
  // Navigation Flow Step 1: Bind Keyboard Listeners (KeyDown & KeyUp)
  // ----------------------------------------------------
  useEffect(() => {
    const setInput = useGameStore.getState().setInput;
    const shootBean = useGameStore.getState().shootBean;

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          setInput({ left: true });
          break;
        case "ArrowRight":
        case "d":
        case "D":
          setInput({ right: true });
          break;
        case "ArrowUp":
        case "w":
        case "W":
          setInput({ jump: true, jumpPressed: true });
          break;
        case " ":
          // Spacebar: Shoot pea projectile (cooldown 300ms)
          e.preventDefault();
          if (Date.now() - shootCooldownRef.current > 300) {
            shootBean();
            shootCooldownRef.current = Date.now();
          }
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          setInput({ left: false });
          break;
        case "ArrowRight":
        case "d":
        case "D":
          setInput({ right: false });
          break;
        case "ArrowUp":
        case "w":
        case "W":
          setInput({ jump: false });
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // ----------------------------------------------------
  // Navigation Flow Step 2: Prevent Page Scroll Interceptions during Game Mode
  // ----------------------------------------------------
  useEffect(() => {
    if (normalScrollMode) return;

    const blockWheel = (e: WheelEvent) => e.preventDefault();
    const blockTouch = (e: TouchEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("[data-dpad]") || t.closest("input") || t.closest("textarea")) return;
      if (e.touches.length === 1) e.preventDefault();
    };
    const blockKeys = (e: KeyboardEvent) => {
      const blocked = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (blocked.includes(e.key)) e.preventDefault();
    };

    window.addEventListener("wheel", blockWheel, { passive: false });
    window.addEventListener("touchmove", blockTouch, { passive: false });
    window.addEventListener("keydown", blockKeys, { passive: false });
    document.body.style.overflowX = "hidden";

    return () => {
      window.removeEventListener("wheel", blockWheel);
      window.removeEventListener("touchmove", blockTouch);
      window.removeEventListener("keydown", blockKeys);
      document.body.style.overflowX = "";
    };
  }, [normalScrollMode]);

  return null;
}
