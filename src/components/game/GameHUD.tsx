"use client";

import React, { useState, useEffect } from "react";
import { useGameStore } from "@/engine/gameStore";

/**
 * Single Responsibility Principle (SRP): Heads-Up Display (HUD) overlay component.
 * Renders control instructions banner and game/scroll mode toggle buttons.
 */
export default function GameHUD() {
  const normalScrollMode = useGameStore((s) => s.normalScrollMode);
  const toggle = useGameStore((s) => s.toggleScrollMode);
  const [showHint, setShowHint] = useState(true);

  // ----------------------------------------------------
  // Navigation Flow: Auto-dismiss instruction hint banner after 6 seconds
  // ----------------------------------------------------
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* ----------------------------------------------------
          Navigation Flow Step 1: Render Control Hint Overlay
         ---------------------------------------------------- */}
      {showHint && !normalScrollMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-green-100 border-2 border-green-400 rounded-xl px-5 py-3 shadow-lg">
          <p className="text-xs font-mono text-green-800 text-center">
            🎮{" "}
            <kbd className="px-1.5 py-0.5 bg-green-200 rounded text-[10px] font-bold">←</kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-green-200 rounded text-[10px] font-bold">→</kbd>{" "}
            move &nbsp;
            <kbd className="px-1.5 py-0.5 bg-green-200 rounded text-[10px] font-bold">↑</kbd>{" "}
            jump &nbsp;
            <kbd className="px-1.5 py-0.5 bg-green-200 rounded text-[10px] font-bold">Space</kbd>{" "}
            shoot
          </p>
        </div>
      )}

      {/* ----------------------------------------------------
          Navigation Flow Step 2: Render Scroll/Play Mode Toggle Button
         ---------------------------------------------------- */}
      <button
        onClick={toggle}
        className="fixed top-4 right-4 z-[200] bg-green-100 border-2 border-green-400 rounded-lg px-3 py-1.5 text-[11px] font-mono text-green-800 hover:bg-green-200 transition-colors shadow-sm cursor-pointer"
      >
        {normalScrollMode ? "🎮 Play Mode" : "📜 Scroll Mode"}
      </button>

      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:border-2 focus:border-green-600"
      >
        Skip game navigation
      </a>
    </>
  );
}
