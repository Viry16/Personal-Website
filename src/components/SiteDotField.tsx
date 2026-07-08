"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import DotField from "@/components/ui/DotField";

const emptySubscribe = () => () => {};

/**
 * Theme-aware wrapper for the global DotField background.
 *
 * The cursor glow and dot palette swap between light and dark so the glow
 * never looks tacky on a white background. Until mounted we fall back to the
 * dark palette (matches the server render), avoiding a hydration mismatch.
 */
export function SiteDotField() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isLight = mounted && resolvedTheme === "light";

  return (
    <DotField
      dotSpacing={26}
      dotRadius={1.2}
      // Dot gradient: vivid green→lime on dark; deeper, calmer green→teal on light
      gradientFrom={isLight ? "rgba(22, 163, 74, 0.30)" : "rgba(0, 255, 72, 0.32)"}
      gradientTo={isLight ? "rgba(13, 148, 136, 0.22)" : "rgba(212, 255, 0, 0.22)"}
      // Cursor glow: bright green halo on dark; soft, low-alpha green on light
      // so it reads as a gentle tint instead of a garish smear.
      glowColor={isLight ? "rgba(21, 128, 61, 0.20)" : "rgba(0, 255, 72, 0.55)"}
      // Special-dot core: deep green on light, luminous mint on dark
      accentColor={isLight ? "rgba(21, 128, 61, 0.85)" : "rgba(134, 255, 150, 0.9)"}
    />
  );
}
