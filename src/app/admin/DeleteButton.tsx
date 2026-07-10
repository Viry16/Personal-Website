"use client"

import { useFormStatus } from "react-dom"
import { Trash2 } from "lucide-react"

/**
 * Submit button for the delete `<form>`. Lives in a client component so it can
 * confirm before submitting and reflect the pending state. The actual delete is
 * a Server Action bound to the parent form.
 */
export function DeleteButton({ title }: { title: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
          e.preventDefault()
        }
      }}
      className="flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-red-500/40 hover:text-red-500 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {pending ? "Deleting…" : "Delete"}
    </button>
  )
}
