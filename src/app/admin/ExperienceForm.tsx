"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import type { Experience } from "@/lib/experiences"
import type { ExperienceFormState } from "@/app/actions/experiences"

type Action = (
  prev: ExperienceFormState,
  formData: FormData
) => Promise<ExperienceFormState>

const inputClass =
  "w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-text-muted)"

export function ExperienceForm({
  action,
  experience,
  submitLabel,
}: {
  action: Action
  experience?: Experience
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<
    ExperienceFormState,
    FormData
  >(action, {})
  const errs = state.fieldErrors ?? {}

  const [logoPreview, setLogoPreview] = useState<string | undefined>(
    experience?.logo || undefined
  )

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {state.error}
        </p>
      )}

      <Field label="Role / Title" error={errs.role}>
        <input
          name="role"
          defaultValue={experience?.role}
          placeholder="AI & IoT Engineer — Bootcamp"
          className={inputClass}
        />
      </Field>

      <Field label="Company / Organization" error={errs.company}>
        <input
          name="company"
          defaultValue={experience?.company}
          placeholder="National Research and Innovation Agency (BRIN)"
          className={inputClass}
        />
      </Field>

      <Field label="Date range" error={errs.date}>
        <input
          name="date"
          defaultValue={experience?.date}
          placeholder="Feb – May 2026"
          className={inputClass}
        />
      </Field>

      <Field
        label="Logo"
        hint="Upload a file, or paste a path/URL (leave empty for monogram)"
        error={errs.logo}
      >
        <div className="flex items-start gap-4">
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoPreview}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl border border-(--color-border) bg-(--color-surface) object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-surface) font-mono text-sm font-semibold text-(--color-text-muted)">
              ?
            </div>
          )}
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
              defaultValue={experience?.logo}
              placeholder="/assets/image/logo/company.svg"
              className={inputClass}
            />
          </div>
        </div>
      </Field>

      <Field label="Description" error={errs.description}>
        <textarea
          name="description"
          rows={4}
          defaultValue={experience?.description}
          className={inputClass}
        />
      </Field>

      <Field
        label="Sort order"
        hint="Lower shows first"
        error={errs.sortOrder}
      >
        <input
          name="sortOrder"
          type="number"
          defaultValue={experience?.sortOrder ?? 0}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-3 border-t border-(--color-border) pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-(--color-text-primary) px-5 py-2.5 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/admin/experiences"
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string[]
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-(--color-text-primary)">
          {label}
        </label>
        {hint && (
          <span className="text-xs text-(--color-text-muted)">{hint}</span>
        )}
      </div>
      {children}
      {error?.[0] && (
        <p className="mt-1 text-xs text-red-500">{error[0]}</p>
      )}
    </div>
  )
}
