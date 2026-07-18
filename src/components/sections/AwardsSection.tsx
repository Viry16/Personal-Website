"use client"

import { useState } from "react"
import Image from "next/image"
import type { Award } from "@/lib/awards"
import { AwardModal } from "@/components/ui/AwardModal"

export function AwardsSection({ awards }: { awards: Award[] }) {
  const [selectedAward, setSelectedAward] = useState<Award | null>(null)

  if (!awards || awards.length === 0) return null

  return (
    <div className="mb-16">
      <h3 className="font-display text-sm font-medium text-(--color-text-primary) mb-6">Awards & Certificates</h3>
      <div className="space-y-4">
        {awards.map((award, i) => {
          const monogram = award.issuer
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase()

          return (
            <div
              key={award.id ?? i}
              onClick={() => setSelectedAward(award)}
              className="group flex flex-col gap-3 md:flex-row md:items-start md:justify-between w-full cursor-pointer rounded-2xl p-4 -mx-4 transition-colors hover:bg-(--color-surface)"
            >
              {/* Left: logo placeholder + details */}
              <div className="flex gap-4 flex-1 md:pr-12">
                {award.logo ? (
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
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
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-surface) font-mono text-sm font-semibold text-(--color-text-muted)"
                  >
                    {monogram}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-semibold text-(--color-text-primary) transition-colors group-hover:text-(--color-signal)">
                    {award.title}
                  </h4>
                  <h5 className="text-sm text-(--color-text-secondary)">
                    {award.issuer}
                  </h5>
                  {award.description && (
                    <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary) line-clamp-2">
                      {award.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: date */}
              <span className="shrink-0 font-mono text-xs text-(--color-text-muted) md:ml-auto md:text-right md:mt-1">
                {award.date}
              </span>
            </div>
          )
        })}
      </div>

      <AwardModal
        award={selectedAward}
        onClose={() => setSelectedAward(null)}
      />
    </div>
  )
}
