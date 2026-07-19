"use client";

import React from "react";
import SectionHighlight from "@/components/game/SectionHighlight";
import { useGameStore } from "@/engine/gameStore";

/** Project item metadata definition */
const projects = [
  { id: "proj-1", title: "Interactive Portfolio", desc: "Platformer navigation", tech: "Next.js • Canvas" },
  { id: "proj-2", title: "AI Art Generator", desc: "ML-powered creativity", tech: "Python • React" },
  { id: "proj-3", title: "Music Visualizer", desc: "Real-time graphics", tech: "WebGL • Audio" },
  { id: "proj-4", title: "Task Manager", desc: "Collaborative app", tech: "React • Node" },
];

/**
 * Component for individual project items.
 * Single Responsibility Principle (SRP): Renders project metadata and handles mouse hover interaction.
 */
function ProjectItem({ project }: { project: typeof projects[0] }) {
  const visited = useGameStore((s) => s.visitedIds.has(project.id));
  const active = useGameStore((s) => s.activeSection === project.id);
  const markVisited = useGameStore((s) => s.markVisited);
  const setActive = useGameStore((s) => s.setActiveSection);

  return (
    <div
      data-section={project.id}
      className={`py-4 transition-all duration-300 ${
        active ? "translate-x-2" : visited ? "opacity-60" : ""
      }`}
      onMouseEnter={() => { markVisited(project.id); setActive(project.id); }}
      onMouseLeave={() => setActive(null)}
    >
      <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
      <p className="text-gray-600 text-sm">{project.desc}</p>
      <p className="text-xs font-mono text-green-600 mt-1">{project.tech}</p>
    </div>
  );
}

/**
 * Single Responsibility Principle (SRP): Renders Projects section with project items & static planks.
 */
export default function Projects() {
  return (
    <SectionHighlight sectionId="projects">
      <section className="relative min-h-screen py-24" data-section="projects">
        {/* ----------------------------------------------------
            Navigation Flow Step 1: Render Static Pre-Placed Planks in Left 20% Zone
           ---------------------------------------------------- */}
        <div className="absolute left-0 top-0 w-[20%] h-full pointer-events-none" aria-hidden>
          <div data-plank data-plank-id="proj-p1" data-section="projects" className="absolute top-[4%] -left-5 w-22 h-3" />
          <div data-plank data-plank-id="proj-p2" data-section="projects" className="absolute top-[11%] left-[18%] w-18 h-3" />
          <div data-plank data-plank-id="proj-p3" data-section="proj-1" className="absolute top-[18%] left-[5%] w-24 h-3" />
          <div data-plank data-plank-id="proj-p4" data-section="proj-1" className="absolute top-[25%] -left-6 w-20 h-3" />
          <div data-plank data-plank-id="proj-p5" data-section="proj-2" className="absolute top-[32%] left-[28%] w-16 h-3" />
          <div data-plank data-plank-id="proj-p6" data-section="proj-2" className="absolute top-[39%] left-[10%] w-22 h-3" />
          <div data-plank data-plank-id="proj-p7" data-section="proj-3" className="absolute top-[46%] -left-4 w-24 h-3" />
          <div data-plank data-plank-id="proj-p8" data-section="proj-3" className="absolute top-[53%] left-[22%] w-18 h-3" />
          <div data-plank data-plank-id="proj-p9" data-section="proj-4" className="absolute top-[60%] left-[8%] w-20 h-3" />
          <div data-plank data-plank-id="proj-p10" data-section="proj-4" className="absolute top-[67%] -left-7 w-22 h-3" />
          <div data-plank data-plank-id="proj-p11" data-section="projects" className="absolute top-[74%] left-[30%] w-16 h-3" />
          <div data-plank data-plank-id="proj-p12" data-section="projects" className="absolute top-[81%] left-[12%] w-24 h-3" />
          <div data-plank data-plank-id="proj-p13" data-section="projects" className="absolute top-[88%] -left-5 w-20 h-3" />
          <div data-plank data-plank-id="proj-p14" data-section="projects" className="absolute top-[95%] left-[20%] w-18 h-3" />
        </div>

        {/* ----------------------------------------------------
            Navigation Flow Step 2: Render Project Cards List
           ---------------------------------------------------- */}
        <div className="ml-[22%] pr-8 md:pr-16 max-w-2xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-10">
            Projects
          </h2>
          <div className="space-y-2">
            {projects.map((p) => (
              <ProjectItem key={p.id} project={p} />
            ))}
          </div>
        </div>
      </section>
    </SectionHighlight>
  );
}
