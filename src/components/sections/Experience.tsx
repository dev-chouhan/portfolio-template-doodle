"use client";

import React from "react";
import SectionHighlight from "@/components/game/SectionHighlight";

/**
 * Single Responsibility Principle (SRP): Renders Experience portfolio section with career timeline & static planks.
 */
export default function Experience() {
  return (
    <SectionHighlight sectionId="experience">
      <section className="relative min-h-screen py-24 bg-green-50/30" data-section="experience">
        {/* ----------------------------------------------------
            Navigation Flow Step 1: Render Static Pre-Placed Planks in Left 20% Zone
           ---------------------------------------------------- */}
        <div className="absolute left-0 top-0 w-[20%] h-full pointer-events-none" aria-hidden>
          <div data-plank data-plank-id="exp-p1" data-section="experience" className="absolute top-[3%] left-[10%] w-20 h-3" />
          <div data-plank data-plank-id="exp-p2" data-section="experience" className="absolute top-[10%] -left-6 w-24 h-3" />
          <div data-plank data-plank-id="exp-p3" data-section="experience" className="absolute top-[17%] left-[28%] w-16 h-3" />
          <div data-plank data-plank-id="exp-p4" data-section="experience" className="absolute top-[24%] left-[5%] w-22 h-3" />
          <div data-plank data-plank-id="exp-p5" data-section="experience" className="absolute top-[31%] -left-4 w-20 h-3" />
          <div data-plank data-plank-id="exp-p6" data-section="experience" className="absolute top-[38%] left-[20%] w-18 h-3" />
          <div data-plank data-plank-id="exp-p7" data-section="experience" className="absolute top-[45%] left-[8%] w-24 h-3" />
          <div data-plank data-plank-id="exp-p8" data-section="experience" className="absolute top-[52%] -left-7 w-22 h-3" />
          <div data-plank data-plank-id="exp-p9" data-section="experience" className="absolute top-[59%] left-[32%] w-16 h-3" />
          <div data-plank data-plank-id="exp-p10" data-section="experience" className="absolute top-[66%] left-[12%] w-20 h-3" />
          <div data-plank data-plank-id="exp-p11" data-section="experience" className="absolute top-[73%] -left-5 w-24 h-3" />
          <div data-plank data-plank-id="exp-p12" data-section="experience" className="absolute top-[80%] left-[22%] w-18 h-3" />
          <div data-plank data-plank-id="exp-p13" data-section="experience" className="absolute top-[87%] left-[5%] w-22 h-3" />
          <div data-plank data-plank-id="exp-p14" data-section="experience" className="absolute top-[94%] -left-4 w-20 h-3" />
        </div>

        {/* ----------------------------------------------------
            Navigation Flow Step 2: Render Career Timeline Entries
           ---------------------------------------------------- */}
        <div className="ml-[22%] pr-8 md:pr-16 max-w-3xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-10">
            Experience
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Senior Developer</h3>
              <p className="text-sm font-mono text-green-600">Creative Studio • 2022-Present</p>
              <p className="text-gray-600 mt-2">Leading frontend for interactive projects.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900">Full-Stack Developer</h3>
              <p className="text-sm font-mono text-green-600">Tech Startup • 2020-2022</p>
              <p className="text-gray-600 mt-2">Built scalable apps with TypeScript and Node.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900">Junior Developer</h3>
              <p className="text-sm font-mono text-green-600">Digital Agency • 2018-2020</p>
              <p className="text-gray-600 mt-2">Crafted responsive websites for clients.</p>
            </div>
          </div>
        </div>
      </section>
    </SectionHighlight>
  );
}
