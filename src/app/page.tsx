// Re-render at most once an hour so the GitHub activity data stays fresh
export const revalidate = 3600

import { BottomDock } from "@/components/BottomDock"
import { HomePreview } from "@/components/sections/HomePreview"
import { WorkSection } from "@/components/sections/WorkSection"
import { CodeActivitySection } from "@/components/sections/CodeActivitySection"
import { FeaturedProjects } from "@/components/sections/FeaturedProjects"
import { ContactCTA } from "@/components/sections/ContactCTA"
import { Reveal } from "@/components/ui/Reveal"
import { getSiteSettings, getExperiences } from "@/lib/data"

export default async function Home() {
  const [site, experiences] = await Promise.all([
    getSiteSettings(),
    getExperiences(),
  ])
  return (
    <main className="min-h-screen selection:bg-(--color-text-primary) selection:text-(--color-surface)">

      <div className="mx-auto max-w-5xl px-6 md:px-12 pb-32">
        <HomePreview site={site} />
        <Reveal><WorkSection experiences={experiences} /></Reveal>
        <Reveal><CodeActivitySection /></Reveal>
        <FeaturedProjects />
        <Reveal><ContactCTA /></Reveal>
      </div>

      <BottomDock logo={site.logo} name={site.name} />
    </main>
  )
}
