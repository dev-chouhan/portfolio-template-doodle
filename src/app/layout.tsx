import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fredoka } from "next/font/google";
import "./globals.css";

/** Primary Fredoka font configuration for playful Doodle Jump aesthetics */
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

/** Application Metadata for SEO & Browser Title */
export const metadata: Metadata = {
  title: "Doodle Portfolio — Jump Through My Work",
  description: "A playful portfolio inspired by Doodle Jump. Navigate by controlling a cute doodle character!",
};

/**
 * Root Layout Component.
 * Single Responsibility Principle (SRP): Renders global HTML structure, fonts, and CSS styling import.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fredoka.variable} font-sans antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
