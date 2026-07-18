"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { projects } from "@/lib/db/schema"
import { verifySession } from "@/lib/auth/session"
import { saveUploadedImage, deleteManagedUpload } from "@/lib/images"

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
  images: z.string().optional(), // JSON encoded array
  type: z.enum(["Software", "Hardware"]),
  period: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["Live", "In Progress", "Archived"]),
  // Only allow http(s) URLs — blocks javascript: and data: schemes
  website: z
    .string()
    .url("Must be a valid URL")
    .refine((u) => /^https?:\/\//i.test(u), "Must start with http:// or https://")
    .optional()
    .or(z.literal("")),
  source: z
    .string()
    .url("Must be a valid URL")
    .refine((u) => /^https?:\/\//i.test(u), "Must start with http:// or https://")
    .optional()
    .or(z.literal("")),
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
    images: formData.get("images"),
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

/**
 * Resolves additional images: uploaded files + text URLs.
 */
async function resolveAdditionalImages(
  formData: FormData,
  textImages: string | undefined
): Promise<{ urls?: string[]; error?: string }> {
  let urls: string[] = []
  
  if (textImages) {
    try {
      urls = JSON.parse(textImages)
      if (!Array.isArray(urls)) urls = []
    } catch (e) {
      urls = []
    }
  }

  const files = formData.getAll("additionalImageFiles")
  for (const file of files) {
    if (file instanceof File && file.size > 0) {
      try {
        const uploadedUrl = await saveUploadedImage(file)
        urls.push(uploadedUrl)
      } catch (err) {
        return { error: `Failed to upload additional image: ${(err as Error).message}` }
      }
    }
  }

  return { urls }
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

  const additionalImgs = await resolveAdditionalImages(formData, d.images)
  if (additionalImgs.error) return { fieldErrors: { images: [additionalImgs.error] } }

  try {
    await db.insert(projects).values({
      title: d.title,
      subtitle: d.subtitle ?? null,
      description: d.description,
      highlights: toList(d.highlights),
      tags: toList(d.tags),
      image: img.url,
      images: additionalImgs.urls ?? [],
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

  const additionalImgs = await resolveAdditionalImages(formData, d.images)
  if (additionalImgs.error) return { fieldErrors: { images: [additionalImgs.error] } }

  // Grab the current image so we can clean it up if the new one replaces it.
  const existing = await db
    .select({ image: projects.image, images: projects.images })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1)
  const previousImage = existing[0]?.image
  const previousImages = existing[0]?.images ?? []

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
        images: additionalImgs.urls ?? [],
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
    await deleteManagedUpload(previousImage)
  }
  
  // Clean up any deleted additional images
  const currentImages = new Set(additionalImgs.urls ?? [])
  for (const prevImg of previousImages) {
    if (!currentImages.has(prevImg)) {
      await deleteManagedUpload(prevImg)
    }
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
  await deleteManagedUpload(existing[0]?.image)
  revalidateProjectViews()
}

function revalidateProjectViews() {
  revalidatePath("/")
  revalidatePath("/projects")
  revalidatePath("/admin")
}
