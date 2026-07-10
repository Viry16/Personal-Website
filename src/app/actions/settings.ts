"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { siteSettings } from "@/lib/db/schema"
import { verifySession } from "@/lib/auth/session"

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
  resume: z.string().min(1, "Resume path is required"),
  logo: z.string().min(1, "Logo path is required"),
})

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

  try {
    await db
      .insert(siteSettings)
      .values({ id: 1, ...d })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { ...d, updatedAt: new Date() },
      })
  } catch (err) {
    return { error: `Failed to save settings: ${(err as Error).message}` }
  }

  // Site identity feeds every page's metadata + chrome, so revalidate the
  // whole layout tree.
  revalidatePath("/", "layout")
  return { ok: true }
}
