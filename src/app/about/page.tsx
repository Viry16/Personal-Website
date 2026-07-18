import { BottomDock } from "@/components/BottomDock"
import { PageHeader } from "@/components/ui/PageHeader"
import { Terminal } from "@/components/sections/Terminal"
import { AwardsSection } from "@/components/sections/AwardsSection"
import { NowFeed } from "@/components/sections/NowFeed"
import { DevelopmentFeed } from "@/components/sections/DevelopmentFeed"
import { getSiteSettings, getNowItems, getAwards } from "@/lib/data"
import Image from "next/image"

// Re-render at most once an hour so the GitHub commit feed stays fresh
export const revalidate = 3600

export default async function AboutPage() {
  const [site, nowItems, awards] = await Promise.all([
    getSiteSettings(),
    getNowItems(),
    getAwards(),
  ])

  // Split bio into paragraphs on blank lines
  const bioParagraphs = site.aboutBio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <main className="min-h-screen selection:bg-(--color-text-primary) selection:text-(--color-surface)">
      <div className="mx-auto max-w-4xl px-6 md:px-12 pt-16 md:pt-24 pb-32">
        <PageHeader eyebrow="Portfolio" title="About Me" titleFont="font-display" />

        <div className="mb-16 flex flex-col-reverse md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6 text-(--color-text-primary)">
            {bioParagraphs.map((paragraph, i) => (
              <p key={i} className="text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="w-full md:w-1/3 shrink-0">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
              <Image
                src={site.aboutImage}
                alt={site.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <AwardsSection awards={awards} />

        <div className="mb-16">
          <h3 className="font-display text-sm font-medium text-(--color-text-primary) mb-6">Interactive Terminal</h3>
          <Terminal
            username={site.terminalUsername}
            role={site.terminalRole}
            skills={site.terminalSkills}
            name={site.name}
          />
        </div>

        <div className="mb-16">
          <DevelopmentFeed
            githubUsername={site.githubUsername}
            githubUrl={site.github}
          />
        </div>

        <NowFeed items={nowItems} />
      </div>

      <BottomDock logo={site.logo} name={site.name} />
    </main>
  )
}
