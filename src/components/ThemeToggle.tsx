"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // true after hydration, false during SSR — avoids a theme-dependent
  // server/client markup mismatch without setState-in-effect
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className={cn("h-11 w-11", className)} />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "group relative flex items-center justify-center rounded-full p-2.5 md:p-3 transition-all duration-300 ease-out text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-border)/50 hover:-translate-y-1",
        className
      )}
      aria-label="Toggle Theme"
    >
      <Sun className="h-5 w-5 transition-transform duration-300 dark:hidden" strokeWidth={2} />
      <Moon className="hidden h-5 w-5 transition-transform duration-300 dark:block" strokeWidth={2} />

      {/* Tooltip */}
      <div className="absolute -top-10 scale-95 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 pointer-events-none">
        <div className="rounded-md bg-(--color-surface) px-2 py-1 text-xs font-medium text-(--color-text-primary) shadow-xl border border-(--color-border) whitespace-nowrap">
          Toggle Theme
        </div>
      </div>
    </button>
  );
}
