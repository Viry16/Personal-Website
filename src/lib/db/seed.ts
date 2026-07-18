// Seeds the database from the static data in src/lib. Run with `npm run db:seed`
// (after `npm run db:push`). Idempotent: it upserts site settings and only
// inserts projects/experiences/now items when the table is empty.
import { loadEnvConfig } from "@next/env"

// Load .env.local / .env before anything reads process.env.
loadEnvConfig(process.cwd())

import { getDb } from "./index"
import { projects, siteSettings, experiences, nowItems, awards } from "./schema"
import { PROJECTS } from "../projects"
import { SITE } from "../site"
import { EXPERIENCES } from "../experiences"
import { NOW_ITEMS } from "../now-items"
import { AWARDS } from "../awards"

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
  const existingProjects = await db.select({ id: projects.id }).from(projects)
  if (existingProjects.length > 0) {
    console.log(`• Skipped projects (${existingProjects.length} already present)`)
  } else {
    await db.insert(projects).values(
      PROJECTS.map((p, i) => ({
        title: p.title,
        subtitle: p.subtitle ?? null,
        shortDescription: p.shortDescription,
        description: p.description,
        highlights: p.highlights,
        tags: p.tags,
        image: p.image,
        images: p.images ?? [],
        imageFit: p.imageFit ?? "cover",
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

  // 3. Experiences — only if the table is empty.
  const existingExperiences = await db.select({ id: experiences.id }).from(experiences)
  if (existingExperiences.length > 0) {
    console.log(`• Skipped experiences (${existingExperiences.length} already present)`)
  } else {
    await db.insert(experiences).values(
      EXPERIENCES.map((e, i) => ({
        role: e.role,
        company: e.company,
        date: e.date,
        logo: e.logo,
        description: e.description,
        sortOrder: i,
      }))
    )
    console.log(`✓ Seeded ${EXPERIENCES.length} experiences`)
  }

  // 4. Now items — only if the table is empty.
  const existingNowItems = await db.select({ id: nowItems.id }).from(nowItems)
  if (existingNowItems.length > 0) {
    console.log(`• Skipped now items (${existingNowItems.length} already present)`)
  } else {
    await db.insert(nowItems).values(
      NOW_ITEMS.map((n, i) => ({
        icon: n.icon,
        label: n.label,
        value: n.value,
        sortOrder: i,
      }))
    )
    console.log(`✓ Seeded ${NOW_ITEMS.length} now items`)
  }

  // 5. Awards — only if the table is empty.
  const existingAwards = await db.select({ id: awards.id }).from(awards)
  if (existingAwards.length > 0) {
    console.log(`• Skipped awards (${existingAwards.length} already present)`)
  } else {
    await db.insert(awards).values(
      AWARDS.map((a, i) => ({
        title: a.title,
        issuer: a.issuer,
        date: a.date,
        logo: a.logo,
        image: a.image,
        description: a.description,
        url: a.url,
        sortOrder: i,
      }))
    )
    console.log(`✓ Seeded ${AWARDS.length} awards`)
  }

  console.log("Done.")
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
