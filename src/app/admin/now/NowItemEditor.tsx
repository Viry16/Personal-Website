"use client"

import { useActionState, useState } from "react"
import { Pencil, X } from "lucide-react"
import {
  createNowItem,
  updateNowItem,
  type NowItemFormState,
} from "@/app/actions/now-items"

interface NowItemEditorProps {
  item?: {
    id: number
    icon: string
    label: string
    value: string
    sortOrder: number
  }
}

const inputClass =
  "w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-text-muted)"

/**
 * For new items: renders the form directly.
 * For existing items: renders an "Edit" button that expands into the form.
 */
export function NowItemEditor({ item }: NowItemEditorProps) {
  const [editing, setEditing] = useState(false)

  // New item — always show the form
  if (!item) return <NowItemForm onDone={() => {}} />

  // Existing item — toggle between button and form
  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
    )
  }

  return <NowItemForm item={item} onDone={() => setEditing(false)} />
}

function NowItemForm({
  item,
  onDone,
}: {
  item?: NowItemEditorProps["item"]
  onDone: () => void
}) {
  const action = item ? updateNowItem.bind(null, item.id) : createNowItem

  const [state, formAction, pending] = useActionState<NowItemFormState, FormData>(
    action,
    {}
  )
  const errs = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="w-full space-y-3">
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-muted)">
            Icon key
          </label>
          <input
            name="icon"
            defaultValue={item?.icon}
            placeholder="reading"
            className={inputClass}
          />
          {errs.icon?.[0] && (
            <p className="mt-0.5 text-xs text-red-500">{errs.icon[0]}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-muted)">
            Label
          </label>
          <input
            name="label"
            defaultValue={item?.label}
            placeholder="Reading"
            className={inputClass}
          />
          {errs.label?.[0] && (
            <p className="mt-0.5 text-xs text-red-500">{errs.label[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_80px]">
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-muted)">
            Value
          </label>
          <input
            name="value"
            defaultValue={item?.value}
            placeholder="Designing Data-Intensive Applications"
            className={inputClass}
          />
          {errs.value?.[0] && (
            <p className="mt-0.5 text-xs text-red-500">{errs.value[0]}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--color-text-muted)">
            Order
          </label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={item?.sortOrder ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-(--color-text-primary) px-4 py-2 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : item ? "Update" : "Add item"}
        </button>
        {item && (
          <button
            type="button"
            onClick={onDone}
            className="flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-2 text-sm font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
