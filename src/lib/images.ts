// Server-only helpers for storing/serving uploaded images in Postgres.
// Import from Server Actions / Route Handlers only — never from Client
// Components (it pulls in the DB driver).
import { eq } from "drizzle-orm"
import { getDb } from "./db"
import { images } from "./db/schema"

/** Max accepted upload size. Keep in sync with next.config `bodySizeLimit`. */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
])

/** URL shape the app uses for DB-stored images. */
const MANAGED_RE = /^\/api\/images\/(\d+)$/

/**
 * Validates and stores an uploaded file, returning the public path
 * (`/api/images/{id}`) to save in `projects.image`. Throws on invalid input.
 */
export async function saveUploadedImage(file: File): Promise<string> {
  const db = getDb()
  if (!db) throw new Error("Database is not configured.")
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Unsupported image type (use PNG, JPEG, WebP, GIF or AVIF).")
  }
  if (file.size === 0) throw new Error("The uploaded file is empty.")
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large (max 4 MB).")
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const [row] = await db
    .insert(images)
    .values({ data: buffer, mime: file.type, size: buffer.length })
    .returning({ id: images.id })

  return `/api/images/${row.id}`
}

/**
 * Deletes a DB-stored image by its `/api/images/{id}` URL. No-ops for external
 * URLs or local `/assets` paths. Best-effort — swallows errors so it never
 * breaks the surrounding mutation.
 */
export async function deleteManagedImage(url: string | null | undefined) {
  if (!url) return
  const match = MANAGED_RE.exec(url)
  if (!match) return
  const db = getDb()
  if (!db) return
  try {
    await db.delete(images).where(eq(images.id, Number(match[1])))
  } catch (err) {
    console.error("[images] failed to delete orphaned image:", err)
  }
}
