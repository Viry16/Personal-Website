"use client"

import { useActionState } from "react"
import { Lock } from "lucide-react"
import { login, type LoginState } from "@/app/actions/auth"

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {}
  )

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 shadow-xl shadow-black/5">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg)">
            <Lock className="h-5 w-5 text-(--color-text-secondary)" />
          </span>
          <h1 className="font-display text-xl font-bold text-(--color-text-primary)">
            Admin access
          </h1>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            Enter your password to manage projects and site settings.
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-(--color-text-primary)"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-text-muted)"
            />
          </div>

          {state.error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-(--color-text-primary) px-4 py-2.5 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  )
}
