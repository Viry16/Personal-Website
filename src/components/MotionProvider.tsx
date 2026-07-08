"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Global Framer Motion config: `reducedMotion="user"` automatically disables
 * transform/layout animations for visitors with `prefers-reduced-motion`,
 * while opacity animations still run — accessible without extra code at
 * every call site.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
