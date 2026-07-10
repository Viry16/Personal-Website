import { getFeaturedProjects } from "@/lib/data"
import { FeaturedProjectsGallery } from "./FeaturedProjectsGallery"

// Async Server Component: fetches from the DB (falls back to seed data) and
// hands the list to the interactive client gallery.
export async function FeaturedProjects() {
  const projects = await getFeaturedProjects()
  return <FeaturedProjectsGallery projects={projects} />
}
