import type { ReactNode } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LayoutDashboard, Settings, ExternalLink, LogOut, Briefcase, Radio, Award } from "lucide-react"
import { verifySession } from "@/lib/auth/session"
import { logout } from "@/app/actions/auth"

// Admin pages read cookies and mutate data — never cache them.
export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  // Belt-and-suspenders: the proxy already gates /admin, but re-check here.
  if (!(await verifySession())) redirect("/login")

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <header className="sticky top-0 z-10 border-b border-(--color-border) bg-(--color-surface)/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-(--color-text-primary) transition-colors hover:bg-(--color-border)/50"
            >
              <LayoutDashboard className="h-4 w-4" />
              Projects
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-border)/50 hover:text-(--color-text-primary)"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link
              href="/admin/experiences"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-border)/50 hover:text-(--color-text-primary)"
            >
              <Briefcase className="h-4 w-4" />
              Experiences
            </Link>
            <Link
              href="/admin/awards"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-border)/50 hover:text-(--color-text-primary)"
            >
              <Award className="h-4 w-4" />
              Awards
            </Link>
            <Link
              href="/admin/now"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-border)/50 hover:text-(--color-text-primary)"
            >
              <Radio className="h-4 w-4" />
              Now Feed
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-border)/50 hover:text-(--color-text-primary)"
            >
              <ExternalLink className="h-4 w-4" />
              View site
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-border)/50 hover:text-(--color-text-primary)"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  )
}
