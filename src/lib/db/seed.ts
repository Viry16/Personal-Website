// Seeds the database from the static data in src/lib. Run with `npm run db:seed`
// (after `npm run db:push`). Idempotent: it upserts site settings and only
// inserts projects when the table is empty.
import { loadEnvConfig } from "@next/env"

// Load .env.local / .env before anything reads process.env.
loadEnvConfig(process.cwd())

import { getDb } from "./index"
import { projects, siteSettings } from "./schema"
import { PROJECTS } from "../projects"
import { SITE } from "../site"

async function main() {
  const db = getDb()
  if (!db) {
    console.error("DATABASE_URL is not set. Add it to .env.local and retry.")
    process.exit(1)
  }

  // 1. Site settings (single row, id = 1).
  await db
    .insert(siteSettings)
    .values({ id: 1, ...SITE })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: { ...SITE, updatedAt: new Date() },
    })
  console.log("✓ Seeded site settings")

  // 2. Projects — only if the table is empty, so re-seeding never duplicates.
  const existing = await db.select({ id: projects.id }).from(projects)
  if (existing.length > 0) {
    console.log(`• Skipped projects (${existing.length} already present)`)
  } else {
    await db.insert(projects).values(
      PROJECTS.map((p, i) => ({
        title: p.title,
        subtitle: p.subtitle ?? null,
        description: p.description,
        highlights: p.highlights,
        tags: p.tags,
        image: p.image,
        type: p.type,
        period: p.period,
        role: p.role,
        status: p.status,
        website: p.website ?? null,
        source: p.source ?? null,
        featured: p.featured ?? false,
        sortOrder: i,
      }))
    )
    console.log(`✓ Seeded ${PROJECTS.length} projects`)
  }

  console.log("Done.")
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
