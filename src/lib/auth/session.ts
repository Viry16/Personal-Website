import { cookies } from "next/headers"
import { cache } from "react"
import { encryptSession, decryptSession, SESSION_COOKIE } from "./crypto"

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

/** Sets the signed admin session cookie. Call after a successful login. */
export async function createSession() {
  const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS)
  const token = await encryptSession({
    admin: true,
    expiresAt: expiresAt.toISOString(),
  })
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/**
 * Reads and verifies the session cookie. Returns `{ isAuth: true }` for a valid
 * admin session, otherwise `null`. Memoized per-request with React `cache`.
 * This is the "secure check" — call it in every page/action that needs auth,
 * not just the proxy (which only does an optimistic check).
 */
export const verifySession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const session = await decryptSession(token)
  return session?.admin ? ({ isAuth: true } as const) : null
})
