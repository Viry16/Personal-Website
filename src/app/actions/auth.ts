"use server"

import { redirect } from "next/navigation"
import { createSession, deleteSession } from "@/lib/auth/session"

export type LoginState = { error?: string }

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "")
  const expected = process.env.ADMIN_PASSWORD

  if (!expected) {
    return {
      error:
        "Server is missing ADMIN_PASSWORD. Set it in your environment to log in.",
    }
  }
  if (!timingSafeEqual(password, expected)) {
    return { error: "Incorrect password." }
  }

  await createSession()
  redirect("/admin")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}

/** Length-independent constant-time-ish string comparison. */
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  if (ab.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i]
  return diff === 0
}
