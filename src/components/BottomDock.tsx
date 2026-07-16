"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { Home, FolderCode, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { SITE } from "@/lib/site"

import { ThemeToggle } from "@/components/ThemeToggle"

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/projects", icon: FolderCode, label: "Projects" },
  { href: "/about", icon: User, label: "About" },
]

export function BottomDock({
  logo = SITE.logo,
  name = SITE.name,
}: {
  logo?: string
  name?: string
} = {}) {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-50">
      {/* Springy rise from below the viewport edge on first load */}
      <motion.nav
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.5 }}
        className="flex items-center gap-1 md:gap-2 rounded-full border border-(--color-border) bg-(--color-surface)/80 px-2 py-2 md:px-4 md:py-2 shadow-xl shadow-black/10 backdrop-blur-xl transition-colors duration-300"
        aria-label="Main Navigation"
      >
        {/* Brand logo — dark chip so the light logo mark stays visible in both themes */}
        <Link
          href="/"
          aria-label={`${name} — Home`}
          className="mr-1 flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden transition-transform duration-300"
        >
          {/* unoptimized: the logo may be a DB-served upload (/api/images/…) of
              any format (incl. SVG); skip the optimizer so it always renders.
              priority: it's flagged as the LCP element, so load it eagerly.
              Both dimensions are pinned in CSS to keep the SVG's aspect ratio
              from being reported as distorted. */}
          <Image
            src={logo}
            alt=""
            width={22}
            height={22}
            priority
            unoptimized
            style={{ width: 22, height: 22 }}
            className="translate-y-[1.3px] translate-x-[0.8px]"
          />
        </Link>

        <div className="w-px h-7 md:h-8 bg-(--color-border) mx-0.5 md:mx-1" />

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center rounded-full p-2.5 md:p-3 transition-all duration-300 ease-out",
                isActive
                  ? "text-(--color-text-primary) bg-(--color-border)"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-border)/50 hover:-translate-y-1"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Tooltip */}
              <div className="absolute -top-10 scale-95 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 pointer-events-none">
                <div className="rounded-md bg-(--color-surface) px-2 py-1 text-xs font-medium text-(--color-text-primary) shadow-xl border border-(--color-border)">
                  {item.label}
                </div>
              </div>

              {/* Icon */}
              <item.icon
                className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Link>
          )
        })}
        <div className="w-px h-7 md:h-8 bg-(--color-border) mx-0.5 md:mx-1" />
        <ThemeToggle />
      </motion.nav>
    </div>
  )
}
