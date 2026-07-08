import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  /** Font utility for the page title, e.g. "font-display" */
  titleFont?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  titleFont,
}: PageHeaderProps) {
  return (
    <div className="mb-12">
      <Link
        href="/"
        className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-(--color-text-muted) transition-colors hover:text-(--color-text-primary)"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to home
      </Link>

      <h2 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-(--color-text-muted)">
        {eyebrow}
      </h2>
      <h1
        className={cn(
          "text-3xl font-bold text-(--color-text-primary)",
          titleFont
        )}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-2xl text-(--color-text-secondary)">
          {description}
        </p>
      )}
    </div>
  )
}
