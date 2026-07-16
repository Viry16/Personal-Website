"use client"

import { useActionState } from "react"
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
  "w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-text-muted)"

export function NowItemEditor({ item }: NowItemEditorProps) {
  const action = item
    ? updateNowItem.bind(null, item.id)
    : createNowItem

  const [state, formAction, pending] = useActionState<NowItemFormState, FormData>(
    action,
    {}
  )
  const errs = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="w-full">
      {state.error && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="mb-3 rounded-lg border border-(--color-signal)/30 bg-(--color-signal)/10 px-3 py-2 text-sm text-(--color-signal)">
          Saved.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
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
        <div>
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
        <div className="flex items-start gap-2">
          <input
            name="sortOrder"
            type="number"
            defaultValue={item?.sortOrder ?? 0}
            className={`${inputClass} w-16`}
            title="Sort order"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-lg bg-(--color-text-primary) px-4 py-2 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "…" : item ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </form>
  )
}
