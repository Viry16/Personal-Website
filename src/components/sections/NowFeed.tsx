import { BookOpen, Headphones, Code2 } from "lucide-react"

export function NowFeed() {
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
        <div className="border border-(--color-border) bg-(--color-surface) p-4 rounded-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 text-(--color-text-secondary)">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-mono uppercase tracking-wider">Reading</span>
          </div>
          <p className="text-sm font-medium text-(--color-text-primary)">
            Designing Data-Intensive Applications
          </p>
        </div>
        
        <div className="border border-(--color-border) bg-(--color-surface) p-4 rounded-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 text-(--color-text-secondary)">
            <Code2 className="h-4 w-4" />
            <span className="text-xs font-mono uppercase tracking-wider">Building</span>
          </div>
          <p className="text-sm font-medium text-(--color-text-primary)">
            Portfolio v4 & Edge AI pipelines
          </p>
        </div>
        
        <div className="border border-(--color-border) bg-(--color-surface) p-4 rounded-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 text-(--color-text-secondary)">
            <Headphones className="h-4 w-4" />
            <span className="text-xs font-mono uppercase tracking-wider">Listening</span>
          </div>
          <p className="text-sm font-medium text-(--color-text-primary)">
            Lofi Girl Synthwave
          </p>
        </div>
      </div>
      
      <p className="text-xs text-(--color-text-muted)">
        This is a &quot;Now&quot; page (mocked data). Inspired by Derek Sivers.
      </p>
    </div>
  )
}
