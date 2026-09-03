// Serves the site's single resume PDF. Looks up the current resume reference
// in site_settings, loads the blob from the images table, and serves it with
// proper PDF headers. Single endpoint — no dynamic [id] needed.
import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { siteSettings, images } from "@/lib/db/schema"

/** Extracts the numeric image ID from a managed upload URL. */
const MANAGED_RE = /^\/api\/images\/(\d+)$/

export async function GET() {
  const db = getDb()
  if (!db) return new Response("Not found", { status: 404 })

  // Find the current resume path from site settings.
  const rows = await db
    .select({ resume: siteSettings.resume })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1)
  const resumeUrl = rows[0]?.resume
  if (!resumeUrl) return new Response("Not found", { status: 404 })

  // If the resume is an external URL, redirect to it.
  const match = MANAGED_RE.exec(resumeUrl)
  if (!match) {
    return Response.redirect(resumeUrl, 302)
  }

  // Load the blob from the images table.
  const imgRows = await db
    .select()
    .from(images)
    .where(eq(images.id, Number(match[1])))
    .limit(1)
  const doc = imgRows[0]
  if (!doc) return new Response("Not found", { status: 404 })

  const body = Buffer.from(doc.data)
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(body.length),
      "Content-Disposition": "inline; filename=\"resume.pdf\"",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  })
}
