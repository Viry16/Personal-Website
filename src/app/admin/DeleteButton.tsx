"use client"

import { useState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { Trash2, X } from "lucide-react"

/**
 * Two-step inline delete button. First click reveals a "Confirm?" prompt with
 * a countdown; second click actually submits the form. No `window.confirm()`,
 * so it works reliably everywhere (edge runtimes, mobile PWAs, SSR hydration).
 *
 * The confirm state auto-resets after 4 seconds of inactivity, preventing
 * accidental deletions if the user walks away mid-click.
 */
export function DeleteButton({ title }: { title: string }) {
  const { pending } = useFormStatus()
  const [confirming, setConfirming] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-reset after 4 seconds
  useEffect(() => {
    if (confirming) {
      timer.current = setTimeout(() => setConfirming(false), 4000)
    }
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [confirming])

  if (pending) {
    return (
      <span className="flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text-muted) opacity-60">
        <Trash2 className="h-3.5 w-3.5 animate-pulse" />
        Deleting…
      </span>
    )
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Confirm
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="flex items-center justify-center rounded-lg border border-(--color-border) p-1.5 text-(--color-text-muted) transition-colors hover:text-(--color-text-primary)"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-red-500/40 hover:text-red-500"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  )
}
