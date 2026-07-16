"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { siteSettings } from "@/lib/db/schema"
import { verifySession } from "@/lib/auth/session"
import {
  saveUploadedImage,
  saveUploadedDocument,
  deleteManagedUpload,
} from "@/lib/images"

export type SettingsFormState = {
  ok?: boolean
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
}

const SettingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  email: z.string().min(1, "Email is required"),
  githubUsername: z.string().min(1, "GitHub username is required"),
  github: z.string().min(1, "GitHub URL is required"),
  linkedin: z.string().min(1, "LinkedIn URL is required"),
  instagram: z.string().min(1, "Instagram URL is required"),
  // Optional here: an uploaded file (handled separately) can supply these.
  resume: z.string().optional(),
  logo: z.string().optional(),
  // New content fields
  aboutBio: z.string().min(1, "About bio is required"),
  aboutImage: z.string().optional(),
  heroTagline: z.string().min(1, "Hero tagline is required"),
  terminalUsername: z.string().min(1, "Terminal username is required"),
  terminalRole: z.string().min(1, "Terminal role is required"),
  terminalSkills: z.string().optional(),
})

/**
 * Resolves an asset value: an uploaded file wins, otherwise the text field
 * (a local `/assets` path or external URL). Returns an error if neither exists.
 */
async function resolveAsset(
  formData: FormData,
  fileField: string,
  textValue: string | undefined,
  save: (file: File) => Promise<string>
): Promise<{ url?: string; error?: string }> {
  const file = formData.get(fileField)
  if (file instanceof File && file.size > 0) {
    try {
      return { url: await save(file) }
    } catch (err) {
      return { error: (err as Error).message }
    }
  }
  if (textValue) return { url: textValue }
  return { error: "Upload a file or provide a path/URL." }
}

/** Splits a textarea into a trimmed, non-empty list (one item per line). */
function toList(v: string | undefined): string[] {
  if (!v) return []
  return v
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export async function updateSiteSettings(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  if (!(await verifySession())) return { error: "Unauthorized." }
  const db = getDb()
  if (!db) return { error: "Database is not configured (DATABASE_URL missing)." }

  const parsed = SettingsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  const logo = await resolveAsset(formData, "logoFile", d.logo, saveUploadedImage)
  if (!logo.url) return { fieldErrors: { logo: [logo.error ?? "Logo required."] } }

  const resume = await resolveAsset(
    formData,
    "resumeFile",
    d.resume,
    saveUploadedDocument
  )
  if (!resume.url) {
    return { fieldErrors: { resume: [resume.error ?? "Resume required."] } }
  }

  const aboutImage = await resolveAsset(
    formData,
    "aboutImageFile",
    d.aboutImage,
    saveUploadedImage
  )
  if (!aboutImage.url) {
    return { fieldErrors: { aboutImage: [aboutImage.error ?? "About image required."] } }
  }

  // Grab the current assets so we can clean up any DB-stored ones we replace.
  const existing = await db
    .select({
      logo: siteSettings.logo,
      resume: siteSettings.resume,
      aboutImage: siteSettings.aboutImage,
    })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1)
  const previous = existing[0]

  const values = {
    ...d,
    logo: logo.url,
    resume: resume.url,
    aboutImage: aboutImage.url,
    terminalSkills: toList(d.terminalSkills),
  }

  try {
    await db
      .insert(siteSettings)
      .values({ id: 1, ...values })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { ...values, updatedAt: new Date() },
      })
  } catch (err) {
    return { error: `Failed to save settings: ${(err as Error).message}` }
  }

  // Remove old DB-stored logo/CV/about-image if they were swapped out.
  if (previous?.logo && previous.logo !== logo.url) {
    await deleteManagedUpload(previous.logo)
  }
  if (previous?.resume && previous.resume !== resume.url) {
    await deleteManagedUpload(previous.resume)
  }
  if (previous?.aboutImage && previous.aboutImage !== aboutImage.url) {
    await deleteManagedUpload(previous.aboutImage)
  }

  // Site identity feeds every page's metadata + chrome, so revalidate the
  // whole layout tree.
  revalidatePath("/", "layout")
  return { ok: true }
}
