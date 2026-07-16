"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { nowItems } from "@/lib/db/schema"
import { verifySession } from "@/lib/auth/session"

export type NowItemFormState = {
  ok?: boolean
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
}

const NowItemSchema = z.object({
  icon: z.string().min(1, "Icon key is required"),
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
  sortOrder: z.coerce.number().int().optional(),
})

function parseForm(formData: FormData) {
  return NowItemSchema.safeParse({
    icon: formData.get("icon"),
    label: formData.get("label"),
    value: formData.get("value"),
    sortOrder: formData.get("sortOrder") || "0",
  })
}

export async function createNowItem(
  _prev: NowItemFormState,
  formData: FormData
): Promise<NowItemFormState> {
  if (!(await verifySession())) return { error: "Unauthorized." }
  const db = getDb()
  if (!db) return { error: "Database is not configured (DATABASE_URL missing)." }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  try {
    await db.insert(nowItems).values({
      icon: d.icon,
      label: d.label,
      value: d.value,
      sortOrder: d.sortOrder ?? 0,
    })
  } catch (err) {
    return { error: `Failed to create now item: ${(err as Error).message}` }
  }

  revalidateNowViews()
  return { ok: true }
}

export async function updateNowItem(
  id: number,
  _prev: NowItemFormState,
  formData: FormData
): Promise<NowItemFormState> {
  if (!(await verifySession())) return { error: "Unauthorized." }
  const db = getDb()
  if (!db) return { error: "Database is not configured (DATABASE_URL missing)." }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  try {
    await db
      .update(nowItems)
      .set({
        icon: d.icon,
        label: d.label,
        value: d.value,
        sortOrder: d.sortOrder ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(nowItems.id, id))
  } catch (err) {
    return { error: `Failed to update now item: ${(err as Error).message}` }
  }

  revalidateNowViews()
  return { ok: true }
}

export async function deleteNowItem(formData: FormData) {
  if (!(await verifySession())) return
  const db = getDb()
  if (!db) return

  const id = Number(formData.get("id"))
  if (!Number.isFinite(id)) return

  await db.delete(nowItems).where(eq(nowItems.id, id))
  revalidateNowViews()
}

function revalidateNowViews() {
  revalidatePath("/about")
  revalidatePath("/admin/now")
}
