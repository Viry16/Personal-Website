import DotField from "@/components/ui/DotField"
import ProfileCard from "@/components/ui/ProfileCard"

/**
 * Full-screen hero: interactive DotField canvas behind a centered
 * glassmorphic ProfileCard. Kept as the /profile-demo easter egg
 * (reachable from the terminal later on).
 *
 * Layering: the canvas sits at z-0; the card wrapper at z-10. DotField
 * tracks the cursor through a window-level mousemove listener, so the dots
 * keep reacting even while the pointer is over the card — no pointer-events
 * tricks needed, and the card's own hover effects work untouched.
 */
export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-zinc-950">
      {/* Background — fills the screen behind everything */}
      <div className="absolute inset-0 z-0">
        <DotField />
      </div>

      {/* Soft vignette so the card pops against the dots */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(9,9,11,0.8)_100%)]" />

      {/* Foreground — perfectly centered card */}
      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-6 py-16">
        <ProfileCard />
      </div>
    </section>
  )
}
