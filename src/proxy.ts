import { NextResponse, type NextRequest } from "next/server"
import { decryptSession, SESSION_COOKIE } from "@/lib/auth/crypto"

// Next.js 16 renamed Middleware to "Proxy". This runs an optimistic auth check
// (cookie only, no DB) to gate the admin area. The real authorization check
// still happens inside each admin page and Server Action via `verifySession`.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const session = await decryptSession(token)
  const isAuthed = Boolean(session?.admin)

  // Gate /admin/* — bounce unauthenticated visitors to the login page.
  if (pathname.startsWith("/admin") && !isAuthed) {
    const url = new URL("/login", req.nextUrl)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // Already logged in? Skip the login page.
  if (pathname === "/login" && isAuthed) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/login"],
}
