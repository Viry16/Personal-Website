"use client"

import { useActionState, useState } from "react"
import type { SiteSettings } from "@/lib/site"
import {
  updateSiteSettings,
  type SettingsFormState,
} from "@/app/actions/settings"

// Plain text fields. Logo and resume are handled separately (file uploads).
const FIELDS: { name: keyof SiteSettings; label: string; hint?: string }[] = [
  { name: "name", label: "Name" },
  { name: "title", label: "Browser / SEO title" },
  { name: "description", label: "Meta description" },
  { name: "email", label: "Email" },
  { name: "githubUsername", label: "GitHub username", hint: "Drives the contribution graph" },
  { name: "github", label: "GitHub URL" },
  { name: "linkedin", label: "LinkedIn URL" },
  { name: "instagram", label: "Instagram URL" },
]

const inputClass =
  "w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-text-muted)"

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(
    updateSiteSettings,
    {}
  )
  const errs = state.fieldErrors ?? {}

  const [logoPreview, setLogoPreview] = useState<string | undefined>(
    settings.logo
  )
  const [resumeName, setResumeName] = useState<string | undefined>()

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
            className={inputClass}
          />
          {errs[f.name]?.[0] && (
            <p className="mt-1 text-xs text-red-500">{errs[f.name]?.[0]}</p>
          )}
        </div>
      ))}

      {/* Logo — image upload with preview, plus a path/URL fallback */}
      <div className="border-t border-(--color-border) pt-6">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label className="text-sm font-medium text-(--color-text-primary)">
            Logo
          </label>
          <span className="text-xs text-(--color-text-muted)">
            Upload an image, or paste a path/URL
          </span>
        </div>
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoPreview || "/assets/image/logo/logo.svg"}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg border border-(--color-border) bg-zinc-900 object-contain p-2"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <input
              type="file"
              name="logoFile"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setLogoPreview(URL.createObjectURL(file))
              }}
              className="block w-full text-sm text-(--color-text-secondary) file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-(--color-border) file:bg-(--color-surface) file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-(--color-text-primary) hover:file:opacity-90"
            />
            <input
              name="logo"
              defaultValue={settings.logo}
              placeholder="/assets/image/logo/logo.svg"
              className={inputClass}
            />
          </div>
        </div>
        {errs.logo?.[0] && (
          <p className="mt-1 text-xs text-red-500">{errs.logo[0]}</p>
        )}
      </div>

      {/* Resume — PDF upload, plus a path/URL fallback */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label className="text-sm font-medium text-(--color-text-primary)">
            Resume (PDF)
          </label>
          <a
            href={settings.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-(--color-text-muted) underline hover:text-(--color-text-primary)"
          >
            View current
          </a>
        </div>
        <input
          type="file"
          name="resumeFile"
          accept="application/pdf"
          onChange={(e) => setResumeName(e.target.files?.[0]?.name)}
          className="block w-full text-sm text-(--color-text-secondary) file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-(--color-border) file:bg-(--color-surface) file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-(--color-text-primary) hover:file:opacity-90"
        />
        {resumeName && (
          <p className="mt-1 text-xs text-(--color-text-muted)">
            Selected: {resumeName}
          </p>
        )}
        <input
          name="resume"
          defaultValue={settings.resume}
          placeholder="/assets/cv/CV.pdf or https://…"
          className={`${inputClass} mt-2`}
        />
        {errs.resume?.[0] && (
          <p className="mt-1 text-xs text-red-500">{errs.resume[0]}</p>
        )}
      </div>

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
