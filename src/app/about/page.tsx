import { BottomDock } from "@/components/BottomDock"
import { PageHeader } from "@/components/ui/PageHeader"
import { Terminal } from "@/components/sections/Terminal"
import { NowFeed } from "@/components/sections/NowFeed"
import { DevelopmentFeed } from "@/components/sections/DevelopmentFeed"
import Image from "next/image"

// Re-render at most once an hour so the GitHub commit feed stays fresh
export const revalidate = 3600

export default function AboutPage() {
  return (
    <main className="min-h-screen selection:bg-(--color-text-primary) selection:text-(--color-surface)">
      <div className="mx-auto max-w-4xl px-6 md:px-12 pt-16 md:pt-24 pb-32">
        <PageHeader eyebrow="Portfolio" title="About Me" titleFont="font-display" />

        <div className="mb-16 flex flex-col-reverse md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6 text-(--color-text-primary)">
            <p className="text-lg leading-relaxed">
              I&apos;m Excel Viryan — an enthusiastic, curious software developer
              with a foundation in multimedia design and a deep focus on Artificial
              Intelligence. I&apos;m a Sarjana Komputer (S.Kom.) candidate at
              President University in Cikarang, with a 3.87/4.00 GPA.
            </p>
            <p className="text-lg leading-relaxed">
              I enjoy tackling complex challenges through intuitive UI/UX and smart
              automation — building robust backend architectures, bridging them
              with responsive frontends, and integrating Machine Learning, Deep
              Learning, and NLP models. I currently chair PURTC (Robotics &
              Technology Club) and am expanding my full-stack skills toward
              next-generation IoT solutions.
            </p>
          </div>
          <div className="w-full md:w-1/3 shrink-0">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
              <Image 
                src="/assets/image/profile_image/excel.webp" 
                alt="Excel Viryan" 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="font-display text-sm font-medium text-(--color-text-primary) mb-6">Interactive Terminal</h3>
          <Terminal />
        </div>

        <div className="mb-16">
          <DevelopmentFeed />
        </div>

        <NowFeed />
      </div>

      <BottomDock />
    </main>
  )
}
