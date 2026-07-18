"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import type { Project } from "@/lib/projects"
import type { ProjectFormState } from "@/app/actions/projects"

type Action = (
  prev: ProjectFormState,
  formData: FormData
) => Promise<ProjectFormState>

export function ProjectForm({
  action,
  project,
  submitLabel,
}: {
  action: Action
  project?: Project
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<
    ProjectFormState,
    FormData
  >(action, {})
  const errs = state.fieldErrors ?? {}

  // Preview: the newly-picked file, or the project's existing image.
  const [preview, setPreview] = useState<string | undefined>(project?.image)
  const [additionalImages, setAdditionalImages] = useState<string[]>(project?.images ?? [])
  const [newImageUrl, setNewImageUrl] = useState("")

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  function addImageUrl() {
    if (newImageUrl.trim()) {
      setAdditionalImages([...additionalImages, newImageUrl.trim()])
      setNewImageUrl("")
    }
  }

  function removeAdditionalImage(index: number) {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index))
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {state.error}
        </p>
      )}

      <Field label="Title" error={errs.title}>
        <input
          name="title"
          defaultValue={project?.title}
          className={inputClass}
        />
      </Field>

      <Field label="Subtitle" hint="Optional" error={errs.subtitle}>
        <input
          name="subtitle"
          defaultValue={project?.subtitle}
          className={inputClass}
        />
      </Field>

      <Field label="Description" error={errs.description}>
        <textarea
          name="description"
          rows={3}
          defaultValue={project?.description}
          className={inputClass}
        />
      </Field>

      <Field
        label="Highlights"
        hint="One per line"
        error={errs.highlights}
      >
        <textarea
          name="highlights"
          rows={4}
          defaultValue={project?.highlights?.join("\n")}
          className={`${inputClass} font-mono text-xs`}
        />
      </Field>

      <Field label="Tags" hint="One per line" error={errs.tags}>
        <textarea
          name="tags"
          rows={4}
          defaultValue={project?.tags?.join("\n")}
          className={`${inputClass} font-mono text-xs`}
        />
      </Field>

      <Field
        label="Image"
        hint="Upload a file (max 4 MB), or paste a path/URL below"
        error={errs.image}
      >
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview || "/image/logo/logo.svg"}
            alt=""
            className="h-20 w-32 shrink-0 rounded-lg border border-(--color-border) bg-(--color-surface) object-cover"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <input
              type="file"
              name="imageFile"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              onChange={onFileChange}
              className="block w-full text-sm text-(--color-text-secondary) file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-(--color-border) file:bg-(--color-surface) file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-(--color-text-primary) hover:file:opacity-90"
            />
            <input
              name="image"
              defaultValue={project?.image}
              placeholder="…or /projects/example.png or https://…"
              className={inputClass}
            />
          </div>
        </div>
      </Field>

      <Field
        label="Additional Images"
        hint="Upload multiple files or add paths/URLs"
        error={errs.images}
      >
        <div className="space-y-3">
          {additionalImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {additionalImages.map((src, i) => (
                <div key={i} className="group relative h-16 w-24 overflow-hidden rounded-lg border border-(--color-border)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <input type="hidden" name="images" value={JSON.stringify(additionalImages)} />

          <div className="flex gap-2">
            <input
              type="file"
              name="additionalImageFiles"
              multiple
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              className="block w-full text-sm text-(--color-text-secondary) file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-(--color-border) file:bg-(--color-surface) file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-(--color-text-primary) hover:file:opacity-90"
            />
          </div>
          
          <div className="flex gap-2">
            <input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="…or add /projects/example.png or https://…"
              className={inputClass}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addImageUrl()
                }
              }}
            />
            <button
              type="button"
              onClick={addImageUrl}
              className="rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium transition-colors hover:bg-(--color-border) hover:text-(--color-text-primary) text-(--color-text-secondary)"
            >
              Add
            </button>
          </div>
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Type" error={errs.type}>
          <select
            name="type"
            defaultValue={project?.type ?? "Software"}
            className={inputClass}
          >
            <option value="Software">Software</option>
            <option value="Hardware">Hardware</option>
          </select>
        </Field>

        <Field label="Status" error={errs.status}>
          <select
            name="status"
            defaultValue={project?.status ?? "In Progress"}
            className={inputClass}
          >
            <option value="Live">Live</option>
            <option value="In Progress">In Progress</option>
            <option value="Archived">Archived</option>
          </select>
        </Field>

        <Field label="Period" hint="Optional" error={errs.period}>
          <input
            name="period"
            defaultValue={project?.period}
            placeholder="Feb – May 2026"
            className={inputClass}
          />
        </Field>

        <Field label="Role" hint="Optional" error={errs.role}>
          <input
            name="role"
            defaultValue={project?.role}
            placeholder="AI Engineer"
            className={inputClass}
          />
        </Field>

        <Field label="Website URL" hint="Optional" error={errs.website}>
          <input
            name="website"
            defaultValue={project?.website}
            className={inputClass}
          />
        </Field>

        <Field label="Source URL" hint="Optional" error={errs.source}>
          <input
            name="source"
            defaultValue={project?.source}
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
            defaultValue={project?.sortOrder ?? 0}
            className={inputClass}
          />
        </Field>

        <label className="flex items-center gap-3 self-end pb-2.5 text-sm text-(--color-text-primary)">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={project?.featured}
            className="h-4 w-4 rounded border-(--color-border)"
          />
          Featured on home page
        </label>
      </div>

      <div className="flex items-center gap-3 border-t border-(--color-border) pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-(--color-text-primary) px-5 py-2.5 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/admin"
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}

const inputClass =
  "w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-text-muted)"

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
