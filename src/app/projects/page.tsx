// Re-render at most once an hour; on-demand revalidation runs after admin edits
export const revalidate = 3600

import { getProjects, getSiteSettings } from "@/lib/data"
import { ProjectsGallery } from "./ProjectsGallery"

export default async function ProjectsPage() {
  const [projects, site] = await Promise.all([
    getProjects(),
    getSiteSettings(),
  ])
  return (
    <ProjectsGallery projects={projects} logo={site.logo} name={site.name} />
  )
}
