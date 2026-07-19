"use client";

import React from "react";
import SectionHighlight from "@/components/game/SectionHighlight";

/**
 * Single Responsibility Principle (SRP): Renders Contact section with interactive form inputs & static planks.
 */
export default function Contact() {
  return (
    <SectionHighlight sectionId="contact">
      <section className="relative min-h-[80vh] py-24" data-section="contact">
        {/* ----------------------------------------------------
            Navigation Flow Step 1: Render Static Pre-Placed Planks in Left 20% Zone
           ---------------------------------------------------- */}
        <div className="absolute left-0 top-0 w-[20%] h-full pointer-events-none" aria-hidden>
          <div data-plank data-plank-id="contact-p1" data-section="contact" className="absolute top-[5%] -left-5 w-22 h-3" />
          <div data-plank data-plank-id="contact-p2" data-section="contact" className="absolute top-[13%] left-[20%] w-18 h-3" />
          <div data-plank data-plank-id="contact-p3" data-section="contact" className="absolute top-[21%] left-[5%] w-24 h-3" />
          <div data-plank data-plank-id="contact-p4" data-section="contact" className="absolute top-[29%] -left-6 w-20 h-3" />
          <div data-plank data-plank-id="contact-p5" data-section="contact" className="absolute top-[37%] left-[28%] w-16 h-3" />
          <div data-plank data-plank-id="contact-p6" data-section="contact" className="absolute top-[45%] left-[10%] w-22 h-3" />
          <div data-plank data-plank-id="contact-p7" data-section="contact" className="absolute top-[53%] -left-4 w-24 h-3" />
          <div data-plank data-plank-id="contact-p8" data-section="contact" className="absolute top-[61%] left-[22%] w-18 h-3" />
          <div data-plank data-plank-id="contact-p9" data-section="contact" className="absolute top-[69%] left-[8%] w-20 h-3" />
          <div data-plank data-plank-id="contact-p10" data-section="contact" className="absolute top-[77%] -left-7 w-22 h-3" />
          <div data-plank data-plank-id="contact-p11" data-section="contact" className="absolute top-[85%] left-[30%] w-16 h-3" />
          <div data-plank data-plank-id="contact-p12" data-section="contact" className="absolute top-[93%] left-[12%] w-24 h-3" />
        </div>

        {/* ----------------------------------------------------
            Navigation Flow Step 2: Render Interactive Contact Form
           ---------------------------------------------------- */}
        <div className="ml-[22%] pr-8 md:pr-16 max-w-xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Get In Touch
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Let&apos;s build something amazing together.
          </p>

          <div className="space-y-4 max-w-sm">
            <div>
              <label className="text-sm font-mono text-gray-500 block mb-1">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-green-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-mono text-gray-500 block mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-green-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-mono text-gray-500 block mb-1">Message</label>
              <textarea
                rows={3}
                placeholder="Your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-green-500 focus:outline-none text-sm resize-none"
              />
            </div>
            <button className="w-full py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors text-sm">
              Send Message
            </button>
          </div>

          <p className="mt-10 text-sm text-gray-400">
            Made with love and a tiny doodle friend
          </p>
        </div>
      </section>
    </SectionHighlight>
  );
}
