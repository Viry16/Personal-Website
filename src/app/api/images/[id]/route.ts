// Serves an uploaded image stored in Postgres. Each image id is immutable
// (replacing a project image inserts a new row with a new id), so responses are
// cached aggressively — after the first request browsers and any CDN serve it
// without touching the database again.
import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { images } from "@/lib/db/schema"

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) {
    return new Response("Not found", { status: 404 })
  }

  const db = getDb()
  if (!db) return new Response("Not found", { status: 404 })

  const rows = await db
    .select()
    .from(images)
    .where(eq(images.id, numId))
    .limit(1)
  const img = rows[0]
  if (!img) return new Response("Not found", { status: 404 })

  const body = Buffer.from(img.data)
  return new Response(body, {
    headers: {
      "Content-Type": img.mime,
      "Content-Length": String(body.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
