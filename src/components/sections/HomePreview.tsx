"use client"

import Link from "next/link"
import { motion, type Variants } from "motion/react"
import { FileText, Mail, ArrowRight } from "lucide-react"
import { SITE, type SiteSettings } from "@/lib/site"
import ProfileCard from "@/components/ui/ProfileCard"
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
} from "@/components/ui/SocialIcons"

// Staggered entrance: each hero block fades in from below with a blur that
// sharpens as it lands — one springy, coordinated sequence on page load.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

// Variant for the profile photo (the LCP element). Same slide-up + blur-sharpen
// entrance, but WITHOUT fading opacity from 0 — Chrome disqualifies opacity:0
// elements from Largest Contentful Paint, so gating the photo behind the fade
// pushed LCP out to when the animation finished. Keeping opacity:1 lets the
// image count as painted immediately while still animating into place.
const media: Variants = {
  hidden: { y: 24, filter: "blur(6px)" },
  show: {
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

export function HomePreview({ site = SITE }: { site?: SiteSettings }) {
  const socialLinks = [
    { href: site.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: site.github, label: "GitHub", Icon: GitHubIcon },
    { href: site.instagram, label: "Instagram", Icon: InstagramIcon },
  ]

  return (
    <section className="pt-16 pb-12 md:pt-24 md:pb-16 flex flex-col justify-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12 max-w-4xl mx-auto w-full"
      >
        {/* Left Side: Text and CTAs */}
        <div className="space-y-6 flex-1 w-full">
          <motion.div variants={item}>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-(--color-text-primary) mb-4">
              Hi, I&apos;m {site.name}
            </h1>
            <p className="text-xl text-(--color-text-secondary) font-medium">
              {site.description}
            </p>
          </motion.div>

          <motion.p
            variants={item}
            className="text-lg leading-relaxed text-(--color-text-secondary) max-w-xl"
          >
            {site.heroTagline}
          </motion.p>


          <motion.div variants={item} className="flex flex-wrap items-center gap-4 pt-2">
            <motion.a
              href={site.resume}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              className="flex items-center gap-2 rounded-lg bg-(--color-text-primary) px-4 py-2 text-sm font-semibold text-(--color-bg)"
            >
              <FileText className="h-4 w-4" />
              Resume
            </motion.a>
            <div className="flex items-center gap-1 px-1">
              {socialLinks.map(({ href, label, Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 420, damping: 16 }}
                  className="p-2.5 text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
              <motion.a
                href={`mailto:${site.email}`}
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 420, damping: 16 }}
                className="p-2.5 text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </motion.a>
            </div>
          </motion.div>

          <motion.div variants={item} className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-medium text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors group"
            >
              More about me
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile only: profile card sits below the CTAs */}
        <motion.div variants={media} className="flex justify-center pt-6 md:hidden">
          <ProfileCard scale={0.7} />
        </motion.div>

        {/* Desktop only: interactive profile card on the right */}
        <motion.div
          variants={media}
          className="hidden md:block flex-shrink-0 origin-top"
        >
          <ProfileCard scale={0.7} />
        </motion.div>
      </motion.div>
    </section>
  )
}
