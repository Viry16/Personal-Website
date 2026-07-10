"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { projects } from "@/lib/db/schema"
import { verifySession } from "@/lib/auth/session"
import { saveUploadedImage, deleteManagedImage } from "@/lib/images"

export type ProjectFormState = {
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
}

const ProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  // Textareas: one item per line.
  highlights: z.string().optional(),
  tags: z.string().optional(),
  // Optional here: an uploaded file (handled separately) can supply the image.
  image: z.string().optional(),
  type: z.enum(["Software", "Hardware"]),
  period: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["Live", "In Progress", "Archived"]),
  website: z.string().optional(),
  source: z.string().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
})

function parseForm(formData: FormData) {
  return ProjectSchema.safeParse({
    title: formData.get("title"),
    subtitle: str(formData.get("subtitle")),
    description: formData.get("description"),
    highlights: str(formData.get("highlights")),
    tags: str(formData.get("tags")),
    image: formData.get("image"),
    type: formData.get("type"),
    period: str(formData.get("period")),
    role: str(formData.get("role")),
    status: formData.get("status"),
    website: str(formData.get("website")),
    source: str(formData.get("source")),
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    sortOrder: str(formData.get("sortOrder")),
  })
}

/** Normalizes empty form values to `undefined` so `.optional()` applies. */
function str(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === "string" ? v.trim() : ""
  return s.length ? s : undefined
}

/** Splits a textarea into a trimmed, non-empty list (one item per line). */
function toList(v: string | undefined): string[] {
  if (!v) return []
  return v
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * Resolves the image to store: an uploaded file wins, otherwise the text field
 * (a local `/assets` path or external URL). Returns an error message if neither
 * is provided or the upload is invalid.
 */
async function resolveImage(
  formData: FormData,
  textImage: string | undefined
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("imageFile")
  if (file instanceof File && file.size > 0) {
    try {
      return { url: await saveUploadedImage(file) }
    } catch (err) {
      return { error: (err as Error).message }
    }
  }
  if (textImage) return { url: textImage }
  return { error: "Upload an image or provide a path/URL." }
}

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  if (!(await verifySession())) return { error: "Unauthorized." }
  const db = getDb()
  if (!db) return { error: "Database is not configured (DATABASE_URL missing)." }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  const img = await resolveImage(formData, d.image)
  if (!img.url) return { fieldErrors: { image: [img.error ?? "Image required."] } }

  try {
    await db.insert(projects).values({
      title: d.title,
      subtitle: d.subtitle ?? null,
      description: d.description,
      highlights: toList(d.highlights),
      tags: toList(d.tags),
      image: img.url,
      type: d.type,
      period: d.period ?? "",
      role: d.role ?? "",
      status: d.status,
      website: d.website ?? null,
      source: d.source ?? null,
      featured: d.featured ?? false,
      sortOrder: d.sortOrder ?? 0,
    })
  } catch (err) {
    return { error: `Failed to create project: ${(err as Error).message}` }
  }

  revalidateProjectViews()
  redirect("/admin")
}

export async function updateProject(
  id: number,
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  if (!(await verifySession())) return { error: "Unauthorized." }
  const db = getDb()
  if (!db) return { error: "Database is not configured (DATABASE_URL missing)." }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  const img = await resolveImage(formData, d.image)
  if (!img.url) return { fieldErrors: { image: [img.error ?? "Image required."] } }

  // Grab the current image so we can clean it up if the new one replaces it.
  const existing = await db
    .select({ image: projects.image })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1)
  const previousImage = existing[0]?.image

  try {
    await db
      .update(projects)
      .set({
        title: d.title,
        subtitle: d.subtitle ?? null,
        description: d.description,
        highlights: toList(d.highlights),
        tags: toList(d.tags),
        image: img.url,
        type: d.type,
        period: d.period ?? "",
        role: d.role ?? "",
        status: d.status,
        website: d.website ?? null,
        source: d.source ?? null,
        featured: d.featured ?? false,
        sortOrder: d.sortOrder ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
  } catch (err) {
    return { error: `Failed to update project: ${(err as Error).message}` }
  }

  // Drop the old DB-stored image if it was swapped out.
  if (previousImage && previousImage !== img.url) {
    await deleteManagedImage(previousImage)
  }

  revalidateProjectViews()
  redirect("/admin")
}

/** Used directly as a `<form action>` — receives FormData with a hidden `id`. */
export async function deleteProject(formData: FormData) {
  if (!(await verifySession())) return
  const db = getDb()
  if (!db) return

  const id = Number(formData.get("id"))
  if (!Number.isFinite(id)) return

  const existing = await db
    .select({ image: projects.image })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1)

  await db.delete(projects).where(eq(projects.id, id))
  await deleteManagedImage(existing[0]?.image)
  revalidateProjectViews()
}

function revalidateProjectViews() {
  revalidatePath("/")
  revalidatePath("/projects")
  revalidatePath("/admin")
}
