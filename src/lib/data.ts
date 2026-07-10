// Server-only data access layer. Import this from Server Components, Server
// Actions, and Route Handlers — never from Client Components (it pulls in the
// Postgres driver). Every function degrades gracefully to the static seed data
// so the site renders even before a database is configured.
import { asc, desc, eq } from "drizzle-orm"
import { getDb } from "./db"
import { projects as projectsTable, siteSettings, type ProjectRow } from "./db/schema"
import { PROJECTS, type Project, type ProjectType, type ProjectStatus } from "./projects"
import { SITE, type SiteSettings } from "./site"

function rowToProject(r: ProjectRow): Project {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle ?? undefined,
    description: r.description,
    highlights: r.highlights,
    tags: r.tags,
    image: r.image,
    type: r.type as ProjectType,
    period: r.period,
    role: r.role,
    status: r.status as ProjectStatus,
    website: r.website ?? undefined,
    source: r.source ?? undefined,
    featured: r.featured,
    sortOrder: r.sortOrder,
  }
}

/** All projects, ordered by `sortOrder` then newest first. */
export async function getProjects(): Promise<Project[]> {
  const db = getDb()
  if (!db) return PROJECTS
  try {
    const rows = await db
      .select()
      .from(projectsTable)
      .orderBy(asc(projectsTable.sortOrder), desc(projectsTable.createdAt))
    return rows.length ? rows.map(rowToProject) : PROJECTS
  } catch (err) {
    console.error("[data] getProjects fell back to seed data:", err)
    return PROJECTS
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.featured)
}

export async function getProjectById(id: number): Promise<Project | null> {
  const db = getDb()
  if (!db) return null
  try {
    const rows = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1)
    return rows[0] ? rowToProject(rows[0]) : null
  } catch (err) {
    console.error("[data] getProjectById failed:", err)
    return null
  }
}

/** Editable site identity/links, falling back to the static `SITE` defaults. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getDb()
  if (!db) return SITE
  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1)
    const row = rows[0]
    if (!row) return SITE
    return {
      name: row.name,
      title: row.title,
      description: row.description,
      email: row.email,
      githubUsername: row.githubUsername,
      github: row.github,
      linkedin: row.linkedin,
      instagram: row.instagram,
      resume: row.resume,
      logo: row.logo,
    }
  } catch (err) {
    console.error("[data] getSiteSettings fell back to seed data:", err)
    return SITE
  }
}
