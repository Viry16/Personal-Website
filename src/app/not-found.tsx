"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Home, ArrowLeft, Search } from "lucide-react"

/* ---------- floating particle ---------- */
function Particle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-(--color-signal)"
      style={{ left: x, top: y, width: size, height: size }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        scale: [0, 1.2, 0],
        y: [0, -60, -120],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

/* ---------- page ---------- */
export default function NotFound() {
  const particles = [
    { delay: 0, x: "15%", y: "70%", size: 4 },
    { delay: 0.8, x: "80%", y: "65%", size: 3 },
    { delay: 1.5, x: "35%", y: "80%", size: 5 },
    { delay: 2.2, x: "65%", y: "75%", size: 3 },
    { delay: 0.4, x: "50%", y: "85%", size: 4 },
    { delay: 1.1, x: "25%", y: "60%", size: 3 },
    { delay: 2.8, x: "75%", y: "55%", size: 4 },
    { delay: 1.8, x: "90%", y: "72%", size: 3 },
  ]

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 selection:bg-(--color-text-primary) selection:text-(--color-surface)">
      {/* ── floating particles ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </div>

      {/* ── glowing orb backdrop ── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute h-[420px] w-[420px] rounded-full opacity-20 blur-[100px] md:h-[600px] md:w-[600px]"
        style={{
          background:
            "radial-gradient(circle, var(--color-signal) 0%, var(--color-highlight) 50%, transparent 80%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── big 404 ── */}
      <motion.div
        className="relative select-none"
        initial={{ opacity: 0, scale: 0.7, filter: "blur(20px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="font-display text-[8rem] leading-none font-black tracking-tighter sm:text-[12rem] md:text-[16rem]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-text-muted) 50%, var(--color-signal) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </h1>

        {/* glitch / scan-line overlay */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-transparent via-(--color-signal)/5 to-transparent"
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          style={{ mixBlendMode: "overlay" }}
        />
      </motion.div>

      {/* ── copy ── */}
      <motion.div
        className="relative z-10 mt-2 flex flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-display text-lg font-semibold tracking-tight text-(--color-text-primary) sm:text-xl md:text-2xl">
          Page not found
        </p>
        <p className="max-w-md text-sm leading-relaxed text-(--color-text-secondary) md:text-base">
          The page you're looking for doesn't exist or has been moved.
          <br className="hidden sm:block" />
          Let's get you back on track.
        </p>
      </motion.div>

      {/* ── action buttons ── */}
      <motion.div
        className="relative z-10 mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* primary */}
        <Link
          href="/"
          id="not-found-home"
          className="group flex items-center gap-2.5 rounded-full bg-(--color-text-primary) px-6 py-3 text-sm font-semibold text-(--color-bg) shadow-lg shadow-black/15 transition-all duration-300 hover:shadow-xl hover:shadow-black/25 hover:-translate-y-0.5 active:scale-95"
        >
          <Home className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          Back to Home
        </Link>

        {/* secondary */}
        <button
          type="button"
          id="not-found-back"
          onClick={() => history.back()}
          className="group flex items-center gap-2.5 rounded-full border border-(--color-border) bg-(--color-surface)/60 px-6 py-3 text-sm font-semibold text-(--color-text-primary) backdrop-blur-sm transition-all duration-300 hover:bg-(--color-surface) hover:-translate-y-0.5 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Go Back
        </button>
      </motion.div>

      {/* ── decorative bottom hint ── */}
      <motion.div
        className="relative z-10 mt-16 flex items-center gap-2 text-xs text-(--color-text-muted)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        <Search className="h-3.5 w-3.5" />
        <span>
          Try navigating from the{" "}
          <Link
            href="/"
            className="underline decoration-(--color-signal)/40 underline-offset-2 transition-colors duration-200 hover:text-(--color-signal) hover:decoration-(--color-signal)"
          >
            homepage
          </Link>
        </span>
      </motion.div>
    </main>
  )
}
