"use client";

import React from "react";
import GameCanvas from "@/components/game/GameCanvas";
import PlatformScanner from "@/components/game/PlatformScanner";
import InputManager from "@/components/game/InputManager";
import TouchControls from "@/components/game/TouchControls";
import GameHUD from "@/components/game/GameHUD";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";

/**
 * Main Application Home Page Component.
 * Single Responsibility Principle (SRP): Assembles the game canvas layer, invisible background managers, HTML portfolio sections, and UI overlays.
 */
export default function HomePage() {
  return (
    <>
      {/* ----------------------------------------------------
          Navigation Flow Step 1: Render 2D Game Canvas Background Layer
         ---------------------------------------------------- */}
      <GameCanvas />

      {/* ----------------------------------------------------
          Navigation Flow Step 2: Initialize Background Managers (DOM Scanner & Keyboard Controls)
         ---------------------------------------------------- */}
      <PlatformScanner />
      <InputManager />

      {/* ----------------------------------------------------
          Navigation Flow Step 3: Render HTML Section Content Layer
         ---------------------------------------------------- */}
      <main id="main-content" className="relative" style={{ zIndex: 10 }}>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>

      {/* ----------------------------------------------------
          Navigation Flow Step 4: Render Topmost Touch Controls & HUD Overlays
         ---------------------------------------------------- */}
      <TouchControls />
      <GameHUD />
    </>
  );
}
