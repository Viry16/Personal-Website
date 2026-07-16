import { SignJWT, jwtVerify } from "jose"

// Pure JWT sign/verify with no `next/headers` dependency, so this module is
// safe to import from `proxy.ts` (which runs before the request completes).

export const SESSION_COOKIE = "admin_session"

export type SessionPayload = {
  admin: true
  expiresAt: string
}

const secret = process.env.SESSION_SECRET
if (!secret && process.env.NODE_ENV === "production") {
  throw new Error(
    "[auth] SESSION_SECRET environment variable is not set. " +
    "Set a strong random secret (e.g. `openssl rand -hex 32`) to prevent session forgery."
  )
}
const encodedKey = new TextEncoder().encode(
  secret || "insecure-dev-secret-change-me"
)

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

export async function decryptSession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
