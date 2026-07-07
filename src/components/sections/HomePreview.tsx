import Link from "next/link"
import { FileText, Mail, ArrowRight } from "lucide-react"
import { SITE } from "@/lib/site"
import ProfileCard from "@/components/ui/ProfileCard"
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

export function HomePreview() {
  return (
    <section className="pt-16 pb-12 md:pt-24 md:pb-16 flex flex-col justify-center">
      <div className="flex flex-col-reverse md:flex-row items-start justify-between gap-8 md:gap-12 max-w-4xl">

        {/* Left Side: Text and CTAs */}
        <div className="space-y-6 flex-1">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-(--color-text-primary) mb-4">
              Hi, I&apos;m {SITE.name}
            </h1>
            <p className="text-xl text-(--color-text-secondary) font-medium">
              {SITE.description}
            </p>
          </div>

          <p className="text-lg leading-relaxed text-(--color-text-secondary) max-w-xl">
            A software developer with roots in multimedia design and a deep focus
            on AI. I build robust backends, bridge them with responsive
            frontends, and integrate ML, deep learning, and NLP models — lately
            channeling all of it into next-generation IoT solutions.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href={SITE.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-(--color-text-primary) px-4 py-2 text-sm font-semibold text-(--color-bg) transition-transform hover:scale-105 active:scale-95"
            >
              <FileText className="h-4 w-4" />
              Resume
            </a>
            <div className="flex items-center gap-1 px-1">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
              <a
                href={`mailto:${SITE.email}`}
                className="p-2.5 text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-medium text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors group"
            >
              More about me
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            </Link>
          </div>
        </div>

        {/* Right Side: Interactive glassmorphic profile card */}
        <div className="flex-shrink-0 self-center md:self-auto">
          <ProfileCard image="/assets/Profile.webp" />
        </div>

      </div>
    </section>
  )
}
