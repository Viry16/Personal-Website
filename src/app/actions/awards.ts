"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { awards } from "@/lib/db/schema"
import { verifySession } from "@/lib/auth/session"
import { saveUploadedImage, deleteManagedUpload } from "@/lib/images"

export type AwardFormState = {
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
}

const AwardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  issuer: z.string().min(1, "Issuer is required"),
  date: z.string().min(1, "Date is required"),
  logo: z.string().optional(),
  image: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  url: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
})

/** Normalizes empty form values to `undefined` so `.optional()` applies. */
function str(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === "string" ? v.trim() : ""
  return s.length ? s : undefined
}

function parseForm(formData: FormData) {
  return AwardSchema.safeParse({
    title: formData.get("title"),
    issuer: formData.get("issuer"),
    date: formData.get("date"),
    logo: str(formData.get("logo")),
    image: str(formData.get("image")),
    description: formData.get("description"),
    url: str(formData.get("url")),
    sortOrder: str(formData.get("sortOrder")),
  })
}

/**
 * Resolves an uploaded file field: file upload wins, otherwise text field.
 * Returns empty string when neither is provided.
 */
async function resolveUpload(
  formData: FormData,
  fileField: string,
  textValue: string | undefined
): Promise<{ url: string; error?: string }> {
  const file = formData.get(fileField)
  if (file instanceof File && file.size > 0) {
    try {
      return { url: await saveUploadedImage(file) }
    } catch (err) {
      return { url: "", error: (err as Error).message }
    }
  }
  return { url: textValue ?? "" }
}

export async function createAward(
  _prev: AwardFormState,
  formData: FormData
): Promise<AwardFormState> {
  if (!(await verifySession())) return { error: "Unauthorized." }
  const db = getDb()
  if (!db) return { error: "Database is not configured (DATABASE_URL missing)." }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  const logo = await resolveUpload(formData, "logoFile", d.logo)
  if (logo.error) return { fieldErrors: { logo: [logo.error] } }

  const image = await resolveUpload(formData, "imageFile", d.image)
  if (image.error) return { fieldErrors: { image: [image.error] } }

  try {
    await db.insert(awards).values({
      title: d.title,
      issuer: d.issuer,
      date: d.date,
      logo: logo.url,
      image: image.url,
      description: d.description,
      url: d.url ?? "",
      sortOrder: d.sortOrder ?? 0,
    })
  } catch (err) {
    return { error: `Failed to create award: ${(err as Error).message}` }
  }

  revalidateAwardViews()
  redirect("/admin/awards")
}

export async function updateAward(
  id: number,
  _prev: AwardFormState,
  formData: FormData
): Promise<AwardFormState> {
  if (!(await verifySession())) return { error: "Unauthorized." }
  const db = getDb()
  if (!db) return { error: "Database is not configured (DATABASE_URL missing)." }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  const logo = await resolveUpload(formData, "logoFile", d.logo)
  if (logo.error) return { fieldErrors: { logo: [logo.error] } }

  const image = await resolveUpload(formData, "imageFile", d.image)
  if (image.error) return { fieldErrors: { image: [image.error] } }

  // Grab current logo + image so we can clean up replaced uploads.
  const existing = await db
    .select({ logo: awards.logo, image: awards.image })
    .from(awards)
    .where(eq(awards.id, id))
    .limit(1)
  const prev = existing[0]

  try {
    await db
      .update(awards)
      .set({
        title: d.title,
        issuer: d.issuer,
        date: d.date,
        logo: logo.url,
        image: image.url,
        description: d.description,
        url: d.url ?? "",
        sortOrder: d.sortOrder ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(awards.id, id))
  } catch (err) {
    return { error: `Failed to update award: ${(err as Error).message}` }
  }

  if (prev?.logo && prev.logo !== logo.url) {
    await deleteManagedUpload(prev.logo)
  }
  if (prev?.image && prev.image !== image.url) {
    await deleteManagedUpload(prev.image)
  }

  revalidateAwardViews()
  redirect("/admin/awards")
}

export async function deleteAward(formData: FormData) {
  if (!(await verifySession())) return
  const db = getDb()
  if (!db) return

  const id = Number(formData.get("id"))
  if (!Number.isFinite(id)) return

  const existing = await db
    .select({ logo: awards.logo, image: awards.image })
    .from(awards)
    .where(eq(awards.id, id))
    .limit(1)

  await db.delete(awards).where(eq(awards.id, id))
  await deleteManagedUpload(existing[0]?.logo)
  await deleteManagedUpload(existing[0]?.image)
  revalidateAwardViews()
}

function revalidateAwardViews() {
  revalidatePath("/about")
  revalidatePath("/admin/awards")
}

