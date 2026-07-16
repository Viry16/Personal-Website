import { BookOpen, Headphones, Code2, Gamepad2, Lightbulb } from "lucide-react"
import type { NowItem } from "@/lib/now-items"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  reading: BookOpen,
  building: Code2,
  listening: Headphones,
  gaming: Gamepad2,
  learning: Lightbulb,
}

export function NowFeed({ items }: { items: NowItem[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-(--color-text-primary) flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--color-signal) opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-(--color-signal)"></span>
        </span>
        What I&apos;m doing now
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon.toLowerCase()] ?? Code2
          return (
            <div
              key={item.id ?? item.label}
              className="border border-(--color-border) bg-(--color-surface) p-4 rounded-lg flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 text-(--color-text-secondary)">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-mono uppercase tracking-wider">{item.label}</span>
              </div>
              <p className="text-sm font-medium text-(--color-text-primary)">
                {item.value}
              </p>
            </div>
          )
        })}
      </div>
      
      <p className="text-xs text-(--color-text-muted)">
        Inspired by Derek Sivers&apos; &quot;Now&quot; page concept.
      </p>
    </div>
  )
}
