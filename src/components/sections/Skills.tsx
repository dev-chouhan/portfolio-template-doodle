"use client";

import React from "react";
import SectionHighlight from "@/components/game/SectionHighlight";
import { useGameStore } from "@/engine/gameStore";

/** Skill category item metadata definition */
const skills = [
  { id: "skill-fe", name: "Frontend", items: "React, Next.js, TypeScript, Canvas" },
  { id: "skill-be", name: "Backend", items: "Node.js, PostgreSQL, Python, APIs" },
  { id: "skill-tools", name: "Tools", items: "Git, Docker, Figma, Testing" },
];

/**
 * Component for individual skill categories.
 * Single Responsibility Principle (SRP): Renders skill metadata and handles mouse hover interaction.
 */
function SkillItem({ skill }: { skill: typeof skills[0] }) {
  const visited = useGameStore((s) => s.visitedIds.has(skill.id));
  const active = useGameStore((s) => s.activeSection === skill.id);
  const markVisited = useGameStore((s) => s.markVisited);
  const setActive = useGameStore((s) => s.setActiveSection);

  return (
    <div
      data-section={skill.id}
      className={`py-3 transition-all duration-300 ${
        active ? "translate-x-2" : visited ? "opacity-60" : ""
      }`}
      onMouseEnter={() => { markVisited(skill.id); setActive(skill.id); }}
      onMouseLeave={() => setActive(null)}
    >
      <h3 className="text-lg font-bold text-gray-900">{skill.name}</h3>
      <p className="text-sm text-gray-600">{skill.items}</p>
    </div>
  );
}

/**
 * Single Responsibility Principle (SRP): Renders Skills section with category items & static planks.
 */
export default function Skills() {
  return (
    <SectionHighlight sectionId="skills">
      <section className="relative min-h-screen py-24 bg-green-50/30" data-section="skills">
        {/* ----------------------------------------------------
            Navigation Flow Step 1: Render Static Pre-Placed Planks in Left 20% Zone
           ---------------------------------------------------- */}
        <div className="absolute left-0 top-0 w-[20%] h-full pointer-events-none" aria-hidden>
          <div data-plank data-plank-id="skill-p1" data-section="skills" className="absolute top-[5%] left-[12%] w-20 h-3" />
          <div data-plank data-plank-id="skill-p2" data-section="skill-fe" className="absolute top-[12%] -left-6 w-24 h-3" />
          <div data-plank data-plank-id="skill-p3" data-section="skill-fe" className="absolute top-[19%] left-[25%] w-16 h-3" />
          <div data-plank data-plank-id="skill-p4" data-section="skills" className="absolute top-[26%] left-[5%] w-22 h-3" />
          <div data-plank data-plank-id="skill-p5" data-section="skill-be" className="absolute top-[33%] -left-4 w-20 h-3" />
          <div data-plank data-plank-id="skill-p6" data-section="skill-be" className="absolute top-[40%] left-[18%] w-18 h-3" />
          <div data-plank data-plank-id="skill-p7" data-section="skills" className="absolute top-[47%] left-[8%] w-24 h-3" />
          <div data-plank data-plank-id="skill-p8" data-section="skill-tools" className="absolute top-[54%] -left-7 w-22 h-3" />
          <div data-plank data-plank-id="skill-p9" data-section="skill-tools" className="absolute top-[61%] left-[30%] w-16 h-3" />
          <div data-plank data-plank-id="skill-p10" data-section="skills" className="absolute top-[68%] left-[10%] w-20 h-3" />
          <div data-plank data-plank-id="skill-p11" data-section="skills" className="absolute top-[75%] -left-5 w-24 h-3" />
          <div data-plank data-plank-id="skill-p12" data-section="skills" className="absolute top-[82%] left-[22%] w-18 h-3" />
          <div data-plank data-plank-id="skill-p13" data-section="skills" className="absolute top-[89%] left-[5%] w-22 h-3" />
          <div data-plank data-plank-id="skill-p14" data-section="skills" className="absolute top-[96%] -left-4 w-20 h-3" />
        </div>

        {/* ----------------------------------------------------
            Navigation Flow Step 2: Render Skills List
           ---------------------------------------------------- */}
        <div className="ml-[22%] pr-8 md:pr-16 max-w-2xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-10">
            Skills
          </h2>
          <div className="space-y-2">
            {skills.map((s) => (
              <SkillItem key={s.id} skill={s} />
            ))}
          </div>
        </div>
      </section>
    </SectionHighlight>
  );
}
