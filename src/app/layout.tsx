import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MotionProvider } from "@/components/MotionProvider";
import { SiteDotField } from "@/components/SiteDotField";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Single distinctive display face for every section title
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Global interactive dot background — theme-aware (glow + palette
              swap between light/dark). pointer-events-none so it never blocks
              clicks/scrolls; DotField reads the cursor from a window listener. */}
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
            <SiteDotField />
          </div>

          {/* All page content renders above the background.
              MotionProvider = global Framer Motion config (reduced-motion aware). */}
          <MotionProvider>
            <div className="relative z-10 flex flex-1 flex-col">
              {children}
            </div>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
