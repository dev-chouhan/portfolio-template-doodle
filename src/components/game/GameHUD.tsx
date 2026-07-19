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
  const theme = useGameStore((s) => s.theme);
  const cycleTheme = useGameStore((s) => s.cycleTheme);
  const [showHint, setShowHint] = useState(true);

  // ----------------------------------------------------
  // Navigation Flow: Auto-dismiss instruction hint banner after 6 seconds
  // ----------------------------------------------------
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const getThemeLabel = () => {
    switch (theme) {
      case "dark":
        return "🌙 Night";
      case "blueprint":
        return "📐 Blueprint";
      case "light":
      default:
        return "☀️ Classic";
    }
  };

  return (
    <>
      {/* ----------------------------------------------------
          Navigation Flow Step 1: Render Control Hint Overlay
         ---------------------------------------------------- */}
      {showHint && !normalScrollMode && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] rounded-xl px-5 py-3 shadow-lg border-2 transition-colors duration-300"
          style={{
            backgroundColor: "var(--hud-bg)",
            borderColor: "var(--hud-border)",
            color: "var(--hud-text)",
          }}
        >
          <p className="text-xs font-mono text-center">
            🎮{" "}
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-bold opacity-80 border" style={{ borderColor: "var(--hud-border)" }}>←</kbd>{" "}
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-bold opacity-80 border" style={{ borderColor: "var(--hud-border)" }}>→</kbd>{" "}
            move &nbsp;
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-bold opacity-80 border" style={{ borderColor: "var(--hud-border)" }}>↑</kbd>{" "}
            jump &nbsp;
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-bold opacity-80 border" style={{ borderColor: "var(--hud-border)" }}>Space</kbd>{" "}
            shoot
          </p>
        </div>
      )}

      {/* ----------------------------------------------------
          Navigation Flow Step 2: Render Top Right Action Buttons (Theme Toggle & Mode Toggle)
         ---------------------------------------------------- */}
      <div className="fixed top-4 right-4 z-[200] flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={cycleTheme}
          aria-label="Toggle visual theme"
          className="rounded-lg px-3 py-1.5 text-[11px] font-mono border-2 shadow-sm cursor-pointer transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: "var(--hud-bg)",
            borderColor: "var(--hud-border)",
            color: "var(--hud-text)",
          }}
          title="Click to cycle themes (Classic / Night / Blueprint)"
        >
          {getThemeLabel()}
        </button>

        {/* Scroll / Play Mode Toggle Button */}
        <button
          onClick={toggle}
          className="rounded-lg px-3 py-1.5 text-[11px] font-mono border-2 shadow-sm cursor-pointer transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: "var(--hud-bg)",
            borderColor: "var(--hud-border)",
            color: "var(--hud-text)",
          }}
        >
          {normalScrollMode ? "🎮 Play Mode" : "📜 Scroll Mode"}
        </button>
      </div>

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
