// Re-render at most once an hour; on-demand revalidation runs after admin edits
export const revalidate = 3600

import { getProjects } from "@/lib/data"
import { ProjectsGallery } from "./ProjectsGallery"

export default async function ProjectsPage() {
  const projects = await getProjects()
  return <ProjectsGallery projects={projects} />
}
