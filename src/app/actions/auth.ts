"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createSession, deleteSession } from "@/lib/auth/session"

export type LoginState = { error?: string }

/** Guard against open-redirect: only allow relative paths, not protocol-relative URLs. */
function safeFrom(from: string | null): string {
  if (from && from.startsWith("/") && !from.startsWith("//")) return from
  return "/admin"
}

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

  // Read the ?from= param from the Referer header so we can redirect back after login.
  const requestHeaders = await headers()
  const referer = requestHeaders.get("referer") ?? ""
  let from: string | null = null
  try {
    from = new URL(referer).searchParams.get("from")
  } catch {
    // Invalid referer — ignore
  }

  await createSession()
  redirect(safeFrom(from))
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
