import type { Metadata } from "next"
import { HeroSection } from "@/components/sections/HeroSection"

export const metadata: Metadata = {
  title: "Profile Card — Easter Egg",
}

// Hidden page: not linked from anywhere. Intended to be discovered via the
// interactive terminal on the About page.
export default function ProfileDemoPage() {
  return <HeroSection />
}
