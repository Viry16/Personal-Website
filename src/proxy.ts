import { NextResponse, type NextRequest } from "next/server"
import { decryptSession, SESSION_COOKIE } from "@/lib/auth/crypto"

// ---------------------------------------------------------------------------
// Login rate limiter (in-memory, per-IP)
// ---------------------------------------------------------------------------
// Edge middleware runs in a single isolate per region, so this Map persists
// across requests on the same instance. It won't survive a cold-start or scale
// across regions — for a personal portfolio that's fine. If you need distributed
// limits, swap this for @vercel/kv or Upstash Redis.
const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const entry = loginAttempts.get(ip)

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, retryAfterSec: 0 }
  }

  entry.count++
  if (entry.count > MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfterSec }
  }

  return { allowed: true, retryAfterSec: 0 }
}

// Clean up stale entries periodically (every ~100 requests) to avoid memory leak
let cleanupCounter = 0
function maybeCleanup() {
  if (++cleanupCounter % 100 !== 0) return
  const now = Date.now()
  for (const [ip, entry] of loginAttempts) {
    if (now > entry.resetAt) loginAttempts.delete(ip)
  }
}

// ---------------------------------------------------------------------------
// Safe redirect helper — guards against open-redirect via ?from= param
// ---------------------------------------------------------------------------
function safeRedirectTarget(from: string | null, fallback: string): string {
  if (!from) return fallback
  // Must be a relative path, not a protocol-relative URL (e.g. //evil.com)
  if (from.startsWith("/") && !from.startsWith("//")) return from
  return fallback
}

// ---------------------------------------------------------------------------
// Proxy (middleware)
// ---------------------------------------------------------------------------
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const session = await decryptSession(token)
  const isAuthed = Boolean(session?.admin)

  // Rate-limit POST requests to the login action
  if (req.method === "POST" && pathname === "/login") {
    maybeCleanup()
    const ip = getClientIp(req)
    const { allowed, retryAfterSec } = checkRateLimit(ip)
    if (!allowed) {
      return new NextResponse(
        `Too many login attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "Content-Type": "text/plain",
          },
        }
      )
    }
  }

  // Gate /admin/* — bounce unauthenticated visitors to the login page.
  if (pathname.startsWith("/admin") && !isAuthed) {
    const url = new URL("/login", req.nextUrl)
    // Store the destination so we can redirect back after login.
    // safeRedirectTarget is applied when the login action reads this param.
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // Already logged in? Skip the login page.
  if (pathname === "/login" && isAuthed) {
    const from = req.nextUrl.searchParams.get("from")
    return NextResponse.redirect(
      new URL(safeRedirectTarget(from, "/admin"), req.nextUrl)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/login"],
}
