"use client";

import React, { type ReactNode } from "react";
import { useGameStore } from "@/engine/gameStore";

/**
 * Props interface for SectionHighlight wrapper component.
 */
interface SectionHighlightProps {
  /** Unique HTML section identifier for DOM scanning */
  sectionId: string;
  /** React child elements */
  children: ReactNode;
  /** Optional Tailwind / CSS class name overrides */
  className?: string;
}

/**
 * Single Responsibility Principle (SRP): Section boundary wrapper component.
 * Attaches data-section attributes for DOM TreeWalker scanning and active section tracking.
 * Open/Closed Principle (OCP): Wraps any arbitrary React node subtree without modifying its implementation.
 */
export default function SectionHighlight({
  sectionId,
  children,
  className = "",
}: SectionHighlightProps) {
  return (
    <div
      data-section={sectionId}
      className={className}
    >
      {children}
    </div>
  );
}
