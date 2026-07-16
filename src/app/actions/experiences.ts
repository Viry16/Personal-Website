"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { experiences } from "@/lib/db/schema"
import { verifySession } from "@/lib/auth/session"
import { saveUploadedImage, deleteManagedUpload } from "@/lib/images"

export type ExperienceFormState = {
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
}

const ExperienceSchema = z.object({
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
  date: z.string().min(1, "Date is required"),
  logo: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  sortOrder: z.coerce.number().int().optional(),
})

/** Normalizes empty form values to `undefined` so `.optional()` applies. */
function str(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === "string" ? v.trim() : ""
  return s.length ? s : undefined
}

function parseForm(formData: FormData) {
  return ExperienceSchema.safeParse({
    role: formData.get("role"),
    company: formData.get("company"),
    date: formData.get("date"),
    logo: str(formData.get("logo")),
    description: formData.get("description"),
    sortOrder: str(formData.get("sortOrder")),
  })
}

/**
 * Resolves the logo: an uploaded file wins, otherwise the text field.
 * Unlike projects, the logo is optional — empty string = show monogram.
 */
async function resolveLogo(
  formData: FormData,
  textLogo: string | undefined
): Promise<{ url: string; error?: string }> {
  const file = formData.get("logoFile")
  if (file instanceof File && file.size > 0) {
    try {
      return { url: await saveUploadedImage(file) }
    } catch (err) {
      return { url: "", error: (err as Error).message }
    }
  }
  return { url: textLogo ?? "" }
}

export async function createExperience(
  _prev: ExperienceFormState,
  formData: FormData
): Promise<ExperienceFormState> {
  if (!(await verifySession())) return { error: "Unauthorized." }
  const db = getDb()
  if (!db) return { error: "Database is not configured (DATABASE_URL missing)." }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  const logo = await resolveLogo(formData, d.logo)
  if (logo.error) return { fieldErrors: { logo: [logo.error] } }

  try {
    await db.insert(experiences).values({
      role: d.role,
      company: d.company,
      date: d.date,
      logo: logo.url,
      description: d.description,
      sortOrder: d.sortOrder ?? 0,
    })
  } catch (err) {
    return { error: `Failed to create experience: ${(err as Error).message}` }
  }

  revalidateExperienceViews()
  redirect("/admin/experiences")
}

export async function updateExperience(
  id: number,
  _prev: ExperienceFormState,
  formData: FormData
): Promise<ExperienceFormState> {
  if (!(await verifySession())) return { error: "Unauthorized." }
  const db = getDb()
  if (!db) return { error: "Database is not configured (DATABASE_URL missing)." }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  const logo = await resolveLogo(formData, d.logo)
  if (logo.error) return { fieldErrors: { logo: [logo.error] } }

  // Grab the current logo so we can clean it up if replaced.
  const existing = await db
    .select({ logo: experiences.logo })
    .from(experiences)
    .where(eq(experiences.id, id))
    .limit(1)
  const previousLogo = existing[0]?.logo

  try {
    await db
      .update(experiences)
      .set({
        role: d.role,
        company: d.company,
        date: d.date,
        logo: logo.url,
        description: d.description,
        sortOrder: d.sortOrder ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(experiences.id, id))
  } catch (err) {
    return { error: `Failed to update experience: ${(err as Error).message}` }
  }

  if (previousLogo && previousLogo !== logo.url) {
    await deleteManagedUpload(previousLogo)
  }

  revalidateExperienceViews()
  redirect("/admin/experiences")
}

export async function deleteExperience(formData: FormData) {
  if (!(await verifySession())) return
  const db = getDb()
  if (!db) return

  const id = Number(formData.get("id"))
  if (!Number.isFinite(id)) return

  const existing = await db
    .select({ logo: experiences.logo })
    .from(experiences)
    .where(eq(experiences.id, id))
    .limit(1)

  await db.delete(experiences).where(eq(experiences.id, id))
  await deleteManagedUpload(existing[0]?.logo)
  revalidateExperienceViews()
}

function revalidateExperienceViews() {
  revalidatePath("/")
  revalidatePath("/admin/experiences")
}
