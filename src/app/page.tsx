// Re-render at most once an hour so the GitHub activity data stays fresh
export const revalidate = 3600

import { BottomDock } from "@/components/BottomDock"
import { HomePreview } from "@/components/sections/HomePreview"
import { WorkSection } from "@/components/sections/WorkSection"
import { CodeActivitySection } from "@/components/sections/CodeActivitySection"
import { FeaturedProjects } from "@/components/sections/FeaturedProjects"
import { ContactCTA } from "@/components/sections/ContactCTA"

export default function Home() {
  return (
    <main className="min-h-screen selection:bg-(--color-text-primary) selection:text-(--color-surface)">
      
      <div className="mx-auto max-w-5xl px-6 md:px-12 pb-32">
        <HomePreview />
        <WorkSection />
        <CodeActivitySection />
        <FeaturedProjects />
        <ContactCTA />
      </div>

      <BottomDock />
    </main>
  )
}
