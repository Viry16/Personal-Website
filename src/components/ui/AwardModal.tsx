"use client"

import { useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import type { Award } from "@/lib/awards"

interface AwardModalProps {
  award: Award | null
  onClose: () => void
}

export function AwardModal({ award, onClose }: AwardModalProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!award) return
    document.body.classList.add("modal-open")
    window.addEventListener("keydown", handleKey)
    return () => {
      document.body.classList.remove("modal-open")
      window.removeEventListener("keydown", handleKey)
    }
  }, [award, handleKey])

  const monogram = award?.issuer
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  return (
    <AnimatePresence>
      {award && (
        <motion.div
          key="award-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-12 md:py-20"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="pointer-events-none fixed inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            key="award-modal-panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-2xl rounded-3xl border border-(--color-border) bg-(--color-surface) shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Certificate image hero */}
            {award.image && (
              <div className="relative w-full overflow-hidden rounded-t-3xl bg-(--color-bg)">
                <Image
                  src={award.image}
                  alt={`${award.title} certificate`}
                  width={800}
                  height={600}
                  sizes="(min-width: 768px) 640px, 100vw"
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            )}

            {/* Content body */}
            <div className="p-6 md:p-8">
              {/* Issuer row */}
              <div className="flex items-center gap-3 mb-4">
                {award.logo ? (
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
                    <Image
                      src={award.logo}
                      alt={`${award.issuer} logo`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-surface) font-mono text-sm font-bold text-(--color-text-muted)"
                  >
                    {monogram}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-(--color-text-secondary)">
                    {award.issuer}
                  </p>
                  <p className="font-mono text-xs text-(--color-text-muted)">
                    {award.date}
                  </p>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-(--color-text-primary)">
                {award.title}
              </h2>

              {/* Description */}
              <p className="mt-4 text-sm leading-relaxed text-(--color-text-secondary)">
                {award.description}
              </p>

              {/* Action link */}
              {award.url && (
                <div className="mt-6">
                  <a
                    href={award.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-(--color-text-primary) px-6 py-2.5 text-sm font-medium text-(--color-bg) transition-opacity hover:opacity-80"
                  >
                    View Credential
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
