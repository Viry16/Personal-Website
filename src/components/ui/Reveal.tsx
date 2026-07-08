"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in seconds (e.g. index * 0.08 for a list) */
  delay?: number;
  /** Vertical travel distance in px */
  y?: number;
  className?: string;
}

/**
 * Site-wide scroll-reveal primitive. Fades + slides its children in the first
 * time they enter the viewport. Used across sections for one consistent
 * motion language (see Framer Motion / `motion` package).
 */
export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
