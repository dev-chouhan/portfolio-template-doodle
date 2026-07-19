"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useGameStore } from "@/engine/gameStore";

/**
 * Single Responsibility Principle (SRP): On-screen D-pad controller component for mobile/touch devices.
 * Renders virtual touch buttons for left/right movement, jump, and projectile shooting.
 */
export default function TouchControls() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const normalScrollMode = useGameStore((s) => s.normalScrollMode);

  // ----------------------------------------------------
  // Navigation Flow Step 1: Detect Touch Capabilities
  // ----------------------------------------------------
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const setInput = useGameStore((s) => s.setInput);
  const shootBean = useGameStore((s) => s.shootBean);

  // ----------------------------------------------------
  // Navigation Flow Step 2: Define Touch Action Handlers
  // ----------------------------------------------------
  const startMove = useCallback(
    (key: "left" | "right") => () => setInput({ [key]: true }),
    [setInput]
  );
  const endMove = useCallback(
    (key: "left" | "right") => () => setInput({ [key]: false }),
    [setInput]
  );

  const startJump = useCallback(() => {
    setInput({ jump: true, jumpPressed: true });
  }, [setInput]);

  const endJump = useCallback(() => {
    setInput({ jump: false });
  }, [setInput]);

  const handleShoot = useCallback(() => {
    shootBean();
  }, [shootBean]);

  if (!isTouchDevice || normalScrollMode) return null;

  const btnClass =
    "w-14 h-14 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center text-xl text-green-700 active:bg-green-200 select-none shadow-md";

  return (
    // ----------------------------------------------------
    // Navigation Flow Step 3: Render Virtual D-Pad Touch Controls
    // ----------------------------------------------------
    <div className="fixed bottom-6 left-0 right-0 z-[200] flex justify-between px-4 pointer-events-none">
      {/* Left/Right Directional Buttons */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          data-dpad
          className={btnClass}
          onTouchStart={startMove("left")}
          onTouchEnd={endMove("left")}
          onTouchCancel={endMove("left")}
          aria-label="Move left"
        >
          ◀
        </button>
        <button
          data-dpad
          className={btnClass}
          onTouchStart={startMove("right")}
          onTouchEnd={endMove("right")}
          onTouchCancel={endMove("right")}
          aria-label="Move right"
        >
          ▶
        </button>
      </div>

      {/* Action Buttons: Shoot & Jump */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          data-dpad
          className={`${btnClass} bg-yellow-100 border-yellow-400 text-yellow-700`}
          onTouchStart={handleShoot}
          aria-label="Shoot"
        >
          •
        </button>
        <button
          data-dpad
          className={btnClass}
          onTouchStart={startJump}
          onTouchEnd={endJump}
          onTouchCancel={endJump}
          aria-label="Jump"
        >
          ▲
        </button>
      </div>
    </div>
  );
}
