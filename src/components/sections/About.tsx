"use client";

import React from "react";
import SectionHighlight from "@/components/game/SectionHighlight";

/**
 * Single Responsibility Principle (SRP): Renders About portfolio section with bio details & static planks.
 */
export default function About() {
  return (
    <SectionHighlight sectionId="about">
      <section className="relative min-h-screen py-24" data-section="about">
        {/* ----------------------------------------------------
            Navigation Flow Step 1: Render Static Pre-Placed Planks in Left 20% Zone
           ---------------------------------------------------- */}
        <div className="absolute left-0 top-0 w-[20%] h-full pointer-events-none" aria-hidden>
          <div data-plank data-plank-id="about-p1" data-section="about" className="absolute top-[4%] left-[15%] w-20 h-3" />
          <div data-plank data-plank-id="about-p2" data-section="about" className="absolute top-[11%] -left-5 w-24 h-3" />
          <div data-plank data-plank-id="about-p3" data-section="about" className="absolute top-[18%] left-[25%] w-18 h-3" />
          <div data-plank data-plank-id="about-p4" data-section="about" className="absolute top-[25%] left-[5%] w-22 h-3" />
          <div data-plank data-plank-id="about-p5" data-section="about" className="absolute top-[32%] -left-8 w-26 h-3" />
          <div data-plank data-plank-id="about-p6" data-section="about" className="absolute top-[39%] left-[30%] w-16 h-3" />
          <div data-plank data-plank-id="about-p7" data-section="about" className="absolute top-[46%] left-[10%] w-20 h-3" />
          <div data-plank data-plank-id="about-p8" data-section="about" className="absolute top-[53%] -left-4 w-22 h-3" />
          <div data-plank data-plank-id="about-p9" data-section="about" className="absolute top-[60%] left-[20%] w-18 h-3" />
          <div data-plank data-plank-id="about-p10" data-section="about" className="absolute top-[67%] left-[5%] w-24 h-3" />
          <div data-plank data-plank-id="about-p11" data-section="about" className="absolute top-[74%] -left-6 w-22 h-3" />
          <div data-plank data-plank-id="about-p12" data-section="about" className="absolute top-[81%] left-[35%] w-16 h-3" />
          <div data-plank data-plank-id="about-p13" data-section="about" className="absolute top-[88%] left-[15%] w-20 h-3" />
          <div data-plank data-plank-id="about-p14" data-section="about" className="absolute top-[95%] -left-5 w-24 h-3" />
        </div>

        {/* ----------------------------------------------------
            Navigation Flow Step 2: Render Bio & Background Details
           ---------------------------------------------------- */}
        <div className="ml-[22%] pr-8 md:pr-16 max-w-3xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            About Me
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Full-stack developer passionate about creative coding.
          </p>
          <p className="text-base text-gray-500 leading-relaxed mb-6">
            I blend art with technology to build unique experiences.
          </p>
          <p className="text-base text-gray-500 leading-relaxed">
            When not coding, I sketch characters and explore games.
          </p>
          
          <div className="mt-10 grid grid-cols-2 gap-6 max-w-md">
            <div>
              <p className="text-sm font-mono text-gray-400">Location</p>
              <p className="text-gray-700">San Francisco</p>
            </div>
            <div>
              <p className="text-sm font-mono text-gray-400">Experience</p>
              <p className="text-gray-700">6+ Years</p>
            </div>
          </div>
        </div>
      </section>
    </SectionHighlight>
  );
}
