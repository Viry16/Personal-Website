import Image from "next/image"
import type { Experience } from "@/lib/experiences"

export function WorkSection({ experiences }: { experiences: Experience[] }) {
  return (
    <section id="work" className="py-16 md:py-24 border-t border-(--color-border)">
      <div className="w-full">
        <h2 className="mb-12 flex items-center gap-3 font-display text-3xl font-bold text-(--color-text-primary)">
          Experience
        </h2>

        <div className="space-y-10">
          {experiences.map((exp, i) => {
            const monogram = exp.company
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase()

            return (
              <div
                key={exp.id ?? i}
                className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between w-full"
              >
                {/* Left: logo placeholder + details */}
                <div className="flex gap-4 flex-1 md:pr-12">
                  {exp.logo ? (
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
                      <Image
                        src={exp.logo}
                        alt={`${exp.company} logo`}
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
                    <h3 className="text-base font-semibold text-(--color-text-primary)">
                      {exp.role}
                    </h3>
                    <h4 className="text-sm text-(--color-text-secondary)">
                      {exp.company}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                      {exp.description}
                    </p>
                  </div>
                </div>

                {/* Right: date */}
                <span className="shrink-0 pl-16 font-mono text-xs text-(--color-text-muted) md:pl-4 md:ml-auto md:text-right">
                  {exp.date}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
