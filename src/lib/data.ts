// Server-only data access layer. Import this from Server Components, Server
// Actions, and Route Handlers — never from Client Components (it pulls in the
// Postgres driver). Every function degrades gracefully to the static seed data
// so the site renders even before a database is configured.
import { cache } from "react"
import { asc, desc, eq } from "drizzle-orm"
import { getDb, reportDbQueryOutcome } from "./db"
import {
  projects as projectsTable,
  siteSettings,
  experiences as experiencesTable,
  nowItems as nowItemsTable,
  type ProjectRow,
  type SiteSettingsRow,
  type ExperienceRow,
  type NowItemRow,
} from "./db/schema"
import { PROJECTS, type Project, type ProjectType, type ProjectStatus } from "./projects"
import { SITE, type SiteSettings } from "./site"
import { EXPERIENCES, type Experience } from "./experiences"
import { NOW_ITEMS, type NowItem } from "./now-items"

/** Hard ceiling for any single DB round-trip before we fall back to seed data. */
const QUERY_TIMEOUT_MS = 8000

/**
 * Run a DB query under a hard time budget, returning `fallback` if it rejects
 * or exceeds `QUERY_TIMEOUT_MS`. The query promise is `.catch`-guarded up front
 * so a rejection that arrives *after* the timeout already fired can never
 * surface as an `unhandledRejection` — which would otherwise spam the dev logs
 * and crash the Node process in production.
 *
 * This keeps the site responsive when the database is slow, paused, or
 * unreachable: callers get `fallback` within `QUERY_TIMEOUT_MS` instead of
 * hanging on the driver/pooler (Supabase's transaction pooler honors a
 * server-side `statement_timeout` only intermittently, so we can't rely on it).
 *
 * Exported so non-`data.ts` DB call sites (e.g. the admin panel) can share the
 * same hard time budget instead of hanging for minutes on a cold connection.
 */
export async function withDbTimeout<T>(
  run: PromiseLike<T>,
  fallback: T,
  label: string,
): Promise<T> {
  const guarded = Promise.resolve(run).catch((err: unknown) => {
    console.error(`[data] ${label} failed, using fallback:`, err)
    return fallback
  })
  let timer: ReturnType<typeof setTimeout> | undefined
  let timedOut = false
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      timedOut = true
      console.warn(
        `[data] ${label} timed out after ${QUERY_TIMEOUT_MS}ms, using fallback`,
      )
      resolve(fallback)
    }, QUERY_TIMEOUT_MS)
  })
  try {
    return await Promise.race([guarded, timeout])
  } finally {
    if (timer) clearTimeout(timer)
    // Feed the pool watchdog: repeated budget misses mean the pool is likely
    // wedged with abandoned queries, and the client gets rebuilt (see db/index).
    reportDbQueryOutcome(timedOut)
  }
}

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

/**
 * All projects, ordered by `sortOrder` then newest first.
 *
 * Wrapped in React `cache()` so multiple callers within a single render (e.g.
 * `WorkSection` + `FeaturedProjects` on the home page) share ONE DB round-trip
 * instead of each firing — and each paying the timeout — independently.
 */
export const getProjects = cache(async (): Promise<Project[]> => {
  const db = getDb()
  if (!db) return PROJECTS
  const rows = await withDbTimeout(
    db
      .select()
      .from(projectsTable)
      .orderBy(asc(projectsTable.sortOrder), desc(projectsTable.createdAt)),
    [] as ProjectRow[],
    "getProjects",
  )
  return rows.length ? rows.map(rowToProject) : PROJECTS
})

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.featured)
}

export async function getProjectById(id: number): Promise<Project | null> {
  const db = getDb()
  if (!db) return null
  const rows = await withDbTimeout(
    db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1),
    [] as ProjectRow[],
    "getProjectById",
  )
  return rows[0] ? rowToProject(rows[0]) : null
}

/**
 * Editable site identity/links, falling back to the static `SITE` defaults.
 *
 * `cache()`-wrapped: the root layout's `generateMetadata`, the page body, and
 * sections like `ContactCTA` all read settings, so without dedup a single home
 * render fired this query 3× (and timed out 3×) against one cold connection.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const db = getDb()
  if (!db) return SITE
  const rows = await withDbTimeout(
    db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1),
    [] as SiteSettingsRow[],
    "getSiteSettings",
  )
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
    aboutBio: row.aboutBio || SITE.aboutBio,
    aboutImage: row.aboutImage || SITE.aboutImage,
    heroTagline: row.heroTagline || SITE.heroTagline,
    terminalUsername: row.terminalUsername || SITE.terminalUsername,
    terminalRole: row.terminalRole || SITE.terminalRole,
    terminalSkills: row.terminalSkills.length ? row.terminalSkills : SITE.terminalSkills,
  }
})

// ── Experiences ──────────────────────────────────────────────────────────────

function rowToExperience(r: ExperienceRow): Experience {
  return {
    id: r.id,
    role: r.role,
    company: r.company,
    date: r.date,
    logo: r.logo,
    description: r.description,
    sortOrder: r.sortOrder,
  }
}

export const getExperiences = cache(async (): Promise<Experience[]> => {
  const db = getDb()
  if (!db) return EXPERIENCES
  const rows = await withDbTimeout(
    db
      .select()
      .from(experiencesTable)
      .orderBy(asc(experiencesTable.sortOrder), desc(experiencesTable.createdAt)),
    [] as ExperienceRow[],
    "getExperiences",
  )
  return rows.length ? rows.map(rowToExperience) : EXPERIENCES
})

export async function getExperienceById(id: number): Promise<Experience | null> {
  const db = getDb()
  if (!db) return null
  const rows = await withDbTimeout(
    db.select().from(experiencesTable).where(eq(experiencesTable.id, id)).limit(1),
    [] as ExperienceRow[],
    "getExperienceById",
  )
  return rows[0] ? rowToExperience(rows[0]) : null
}

// ── Now Items ────────────────────────────────────────────────────────────────

function rowToNowItem(r: NowItemRow): NowItem {
  return {
    id: r.id,
    icon: r.icon,
    label: r.label,
    value: r.value,
    sortOrder: r.sortOrder,
  }
}

export const getNowItems = cache(async (): Promise<NowItem[]> => {
  const db = getDb()
  if (!db) return NOW_ITEMS
  const rows = await withDbTimeout(
    db
      .select()
      .from(nowItemsTable)
      .orderBy(asc(nowItemsTable.sortOrder), desc(nowItemsTable.createdAt)),
    [] as NowItemRow[],
    "getNowItems",
  )
  return rows.length ? rows.map(rowToNowItem) : NOW_ITEMS
})
