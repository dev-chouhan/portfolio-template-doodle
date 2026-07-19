"use client";

import React from "react";
import SectionHighlight from "@/components/game/SectionHighlight";

/**
 * Single Responsibility Principle (SRP): Renders Hero portfolio section with pre-placed static planks.
 */
export default function Hero() {
  return (
    <SectionHighlight sectionId="hero">
      <section className="relative min-h-screen flex items-center py-20" data-section="hero">
        {/* ----------------------------------------------------
            Navigation Flow Step 1: Render Static Pre-Placed Planks in Left 20% Zone
           ---------------------------------------------------- */}
        <div className="absolute left-0 top-0 w-[20%] h-full pointer-events-none" aria-hidden>
          <div data-plank data-plank-id="hero-p1" data-section="hero" className="absolute top-[5%] -left-6 w-24 h-3" />
          <div data-plank data-plank-id="hero-p2" data-section="hero" className="absolute top-[12%] left-[20%] w-20 h-3" />
          <div data-plank data-plank-id="hero-p3" data-section="hero" className="absolute top-[19%] -left-4 w-22 h-3" />
          <div data-plank data-plank-id="hero-p4" data-section="hero" className="absolute top-[26%] left-[30%] w-18 h-3" />
          <div data-plank data-plank-id="hero-p5" data-section="hero" className="absolute top-[33%] left-[10%] w-20 h-3" />
          <div data-plank data-plank-id="hero-p6" data-section="hero" className="absolute top-[40%] -left-8 w-26 h-3" />
          <div data-plank data-plank-id="hero-p7" data-section="hero" className="absolute top-[47%] left-[25%] w-18 h-3" />
          <div data-plank data-plank-id="hero-p8" data-section="hero" className="absolute top-[54%] left-[5%] w-22 h-3" />
          <div data-plank data-plank-id="hero-p9" data-section="hero" className="absolute top-[61%] -left-5 w-24 h-3" />
          <div data-plank data-plank-id="hero-p10" data-section="hero" className="absolute top-[68%] left-[35%] w-16 h-3" />
          <div data-plank data-plank-id="hero-p11" data-section="hero" className="absolute top-[75%] left-[15%] w-20 h-3" />
          <div data-plank data-plank-id="hero-p12" data-section="hero" className="absolute top-[82%] -left-6 w-22 h-3" />
          <div data-plank data-plank-id="hero-p13" data-section="hero" className="absolute top-[89%] left-[20%] w-18 h-3" />
          <div data-plank data-plank-id="hero-p14" data-section="hero" className="absolute top-[96%] left-[5%] w-24 h-3" />
        </div>

        {/* ----------------------------------------------------
            Navigation Flow Step 2: Render Hero Headline Content
           ---------------------------------------------------- */}
        <div className="ml-[22%] pr-8 md:pr-16 max-w-3xl">
          <p className="text-sm font-mono text-gray-400 mb-4 tracking-widest uppercase">
            Welcome to my portfolio
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 mb-6">
            Hi, I&apos;m Alex
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">
            Creative Developer
          </h2>
          <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
            I build playful, interactive web experiences.
          </p>
          <p className="text-base text-gray-500 mt-4 max-w-md">
            Use arrow keys to move, up to jump, space to shoot!
          </p>
        </div>
      </section>
    </SectionHighlight>
  );
}
