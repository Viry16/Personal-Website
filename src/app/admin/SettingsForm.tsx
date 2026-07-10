"use client"

import { useActionState } from "react"
import type { SiteSettings } from "@/lib/site"
import {
  updateSiteSettings,
  type SettingsFormState,
} from "@/app/actions/settings"

const FIELDS: { name: keyof SiteSettings; label: string; hint?: string }[] = [
  { name: "name", label: "Name" },
  { name: "title", label: "Browser / SEO title" },
  { name: "description", label: "Meta description" },
  { name: "email", label: "Email" },
  { name: "githubUsername", label: "GitHub username", hint: "Drives the contribution graph" },
  { name: "github", label: "GitHub URL" },
  { name: "linkedin", label: "LinkedIn URL" },
  { name: "instagram", label: "Instagram URL" },
  { name: "resume", label: "Resume path", hint: "URL-encode spaces as %20" },
  { name: "logo", label: "Logo path" },
]

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(
    updateSiteSettings,
    {}
  )
  const errs = state.fieldErrors ?? {}

  return (
    <form action={action} className="max-w-2xl space-y-6">
      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg border border-(--color-signal)/30 bg-(--color-signal)/10 px-3 py-2 text-sm text-(--color-signal)">
          Saved.
        </p>
      )}

      {FIELDS.map((f) => (
        <div key={f.name}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <label
              htmlFor={f.name}
              className="text-sm font-medium text-(--color-text-primary)"
            >
              {f.label}
            </label>
            {f.hint && (
              <span className="text-xs text-(--color-text-muted)">
                {f.hint}
              </span>
            )}
          </div>
          <input
            id={f.name}
            name={f.name}
            defaultValue={settings[f.name]}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-text-muted)"
          />
          {errs[f.name]?.[0] && (
            <p className="mt-1 text-xs text-red-500">{errs[f.name]?.[0]}</p>
          )}
        </div>
      ))}

      <div className="border-t border-(--color-border) pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-(--color-text-primary) px-5 py-2.5 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  )
}
