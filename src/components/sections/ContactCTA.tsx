import { Mail, ArrowUpRight } from "lucide-react"
import { SITE } from "@/lib/site"
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
} from "@/components/ui/SocialIcons"

const SOCIAL_LINKS = [
  { href: SITE.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: SITE.github, label: "GitHub", Icon: GitHubIcon },
  { href: SITE.instagram, label: "Instagram", Icon: InstagramIcon },
]

export function ContactCTA() {
  return (
    <section id="contact" className="py-16 md:py-24 border-t border-(--color-border)">
      <div className="relative overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) px-6 py-12 text-center md:px-16 md:py-16">
        {/* Soft accent glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-(--color-signal)/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg) px-3 py-1 font-mono text-xs text-(--color-text-secondary)">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--color-signal) opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-(--color-signal)" />
            </span>
            Available for new opportunities
          </span>

          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-(--color-text-primary) md:text-4xl">
            Let&apos;s build something together
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-(--color-text-secondary)">
            Open to internships, collaborations, and interesting problems in AI,
            full-stack, and IoT. My inbox is always open.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <a
              href={`mailto:${SITE.email}`}
              className="group flex items-center gap-2 rounded-lg bg-(--color-text-primary) px-5 py-3 text-sm font-semibold text-(--color-bg) transition-transform hover:scale-105 active:scale-95"
            >
              <Mail className="h-4 w-4" />
              Get in touch
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--color-text-muted) transition-colors hover:text-(--color-text-primary)"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
