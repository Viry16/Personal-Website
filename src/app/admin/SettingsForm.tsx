"use client"

import { useActionState, useState } from "react"
import type { SiteSettings } from "@/lib/site"
import {
  updateSiteSettings,
  type SettingsFormState,
} from "@/app/actions/settings"

// Plain text fields. Logo, resume, and about image are handled separately (file uploads).
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
  const [aboutImgPreview, setAboutImgPreview] = useState<string | undefined>(
    settings.aboutImage
  )

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

      {/* ── Identity & Links ──────────────────────────────── */}
      <div className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
        Identity &amp; Links
      </div>

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
            defaultValue={settings[f.name] as string}
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
            src={logoPreview || "/image/logo/logo.svg"}
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
              placeholder="/image/logo/logo.svg"
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
          placeholder="/cv/CV.pdf or https://…"
          className={`${inputClass} mt-2`}
        />
        {errs.resume?.[0] && (
          <p className="mt-1 text-xs text-red-500">{errs.resume[0]}</p>
        )}
      </div>

      {/* ── Page Content ──────────────────────────────────── */}
      <div className="border-t border-(--color-border) pt-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted) mb-6">
          Page Content
        </div>

        {/* Hero Tagline */}
        <div className="mb-6">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <label htmlFor="heroTagline" className="text-sm font-medium text-(--color-text-primary)">
              Hero tagline
            </label>
            <span className="text-xs text-(--color-text-muted)">
              Long paragraph below your name on the home page
            </span>
          </div>
          <textarea
            id="heroTagline"
            name="heroTagline"
            rows={3}
            defaultValue={settings.heroTagline}
            className={inputClass}
          />
          {errs.heroTagline?.[0] && (
            <p className="mt-1 text-xs text-red-500">{errs.heroTagline[0]}</p>
          )}
        </div>

        {/* About Bio */}
        <div className="mb-6">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <label htmlFor="aboutBio" className="text-sm font-medium text-(--color-text-primary)">
              About bio
            </label>
            <span className="text-xs text-(--color-text-muted)">
              Use blank lines for paragraph breaks
            </span>
          </div>
          <textarea
            id="aboutBio"
            name="aboutBio"
            rows={6}
            defaultValue={settings.aboutBio}
            className={inputClass}
          />
          {errs.aboutBio?.[0] && (
            <p className="mt-1 text-xs text-red-500">{errs.aboutBio[0]}</p>
          )}
        </div>

        {/* About Image */}
        <div className="mb-6">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <label className="text-sm font-medium text-(--color-text-primary)">
              About page photo
            </label>
            <span className="text-xs text-(--color-text-muted)">
              Upload or paste a path/URL
            </span>
          </div>
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={aboutImgPreview || "/image/profile_image/excel.webp"}
              alt=""
              className="h-20 w-20 shrink-0 rounded-xl border border-(--color-border) object-cover"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <input
                type="file"
                name="aboutImageFile"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setAboutImgPreview(URL.createObjectURL(file))
                }}
                className="block w-full text-sm text-(--color-text-secondary) file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-(--color-border) file:bg-(--color-surface) file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-(--color-text-primary) hover:file:opacity-90"
              />
              <input
                name="aboutImage"
                defaultValue={settings.aboutImage}
                placeholder="/image/profile_image/photo.webp"
                className={inputClass}
              />
            </div>
          </div>
          {errs.aboutImage?.[0] && (
            <p className="mt-1 text-xs text-red-500">{errs.aboutImage[0]}</p>
          )}
        </div>
      </div>

      {/* ── Terminal Config ───────────────────────────────── */}
      <div className="border-t border-(--color-border) pt-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted) mb-6">
          Terminal Identity
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="terminalUsername" className="mb-1.5 block text-sm font-medium text-(--color-text-primary)">
              Username
            </label>
            <input
              id="terminalUsername"
              name="terminalUsername"
              defaultValue={settings.terminalUsername}
              placeholder="excel_viryan"
              className={inputClass}
            />
            {errs.terminalUsername?.[0] && (
              <p className="mt-1 text-xs text-red-500">{errs.terminalUsername[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="terminalRole" className="mb-1.5 block text-sm font-medium text-(--color-text-primary)">
              Role / title
            </label>
            <input
              id="terminalRole"
              name="terminalRole"
              defaultValue={settings.terminalRole}
              placeholder="AI/ML Engineer & IoT Builder"
              className={inputClass}
            />
            {errs.terminalRole?.[0] && (
              <p className="mt-1 text-xs text-red-500">{errs.terminalRole[0]}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <label htmlFor="terminalSkills" className="text-sm font-medium text-(--color-text-primary)">
              Skills
            </label>
            <span className="text-xs text-(--color-text-muted)">
              One per line — shown by &quot;cat skills.txt&quot;
            </span>
          </div>
          <textarea
            id="terminalSkills"
            name="terminalSkills"
            rows={4}
            defaultValue={settings.terminalSkills.join("\n")}
            className={`${inputClass} font-mono text-xs`}
          />
          {errs.terminalSkills?.[0] && (
            <p className="mt-1 text-xs text-red-500">{errs.terminalSkills[0]}</p>
          )}
        </div>
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
