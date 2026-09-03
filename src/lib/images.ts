// Server-only helpers for storing/serving uploaded files (project images, the
// site logo, the CV PDF) in Postgres. Import from Server Actions / Route
// Handlers only — never from Client Components (it pulls in the DB driver).
import { eq } from "drizzle-orm"
import { getDb } from "./db"
import { images } from "./db/schema"

/** Max accepted sizes. Keep the largest in sync with next.config `bodySizeLimit`. */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB
export const MAX_DOC_BYTES = 6 * 1024 * 1024 // 6 MB

// SVG is intentionally excluded: browsers execute <script> tags inside SVGs
// served with Content-Type: image/svg+xml, which creates a stored-XSS vector.
const IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
])
const DOC_MIME = new Set(["application/pdf"])

/** URL shape the app uses for DB-stored uploads. */
const MANAGED_RE = /^\/api\/images\/(\d+)$/

/**
 * Validates and stores an uploaded file, returning an internal reference path
 * (`/api/images/{id}`). Images are served directly via that route; the resume
 * PDF is served through the dedicated `/api/resume` endpoint. Throws on
 * invalid input.
 */
async function saveUpload(
  file: File,
  allowed: Set<string>,
  maxBytes: number,
  kind: string
): Promise<string> {
  const db = getDb()
  if (!db) throw new Error("Database is not configured.")
  if (!allowed.has(file.type)) {
    throw new Error(`Unsupported ${kind} type (${file.type || "unknown"}).`)
  }
  if (file.size === 0) throw new Error("The uploaded file is empty.")
  if (file.size > maxBytes) {
    throw new Error(
      `${kind} is too large (max ${Math.round(maxBytes / 1024 / 1024)} MB).`
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const [row] = await db
    .insert(images)
    .values({ data: buffer, mime: file.type, size: buffer.length })
    .returning({ id: images.id })

  return `/api/images/${row.id}`
}

export function saveUploadedImage(file: File): Promise<string> {
  return saveUpload(file, IMAGE_MIME, MAX_IMAGE_BYTES, "image")
}

export function saveUploadedDocument(file: File): Promise<string> {
  return saveUpload(file, DOC_MIME, MAX_DOC_BYTES, "PDF")
}

/**
 * Deletes a DB-stored upload by its `/api/images/{id}` URL. No-ops for external
 * URLs or local `/assets` paths. Best-effort — swallows errors so it never
 * breaks the surrounding mutation.
 */
export async function deleteManagedUpload(url: string | null | undefined) {
  if (!url) return
  const match = MANAGED_RE.exec(url)
  if (!match) return
  const db = getDb()
  if (!db) return
  try {
    await db.delete(images).where(eq(images.id, Number(match[1])))
  } catch (err) {
    console.error("[images] failed to delete orphaned upload:", err)
  }
}
