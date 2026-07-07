import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Space_Grotesk,
  Playfair_Display,
} from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import DotField from "@/components/ui/DotField";
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

// Geometric display face for tech/code section titles
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// Elegant serif for experience/about section titles
const playfair = Playfair_Display({
  variable: "--font-playfair",
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Global interactive dot background — fixed behind every page.
              pointer-events-none guarantees it never blocks clicks/scrolls;
              DotField reads the cursor from a window-level listener, so it
              stays interactive regardless. */}
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
            <DotField
              gradientFrom="rgba(22, 163, 74, 0.35)"
              gradientTo="rgba(16, 185, 129, 0.22)"
              glowColor="#16A34A"
            />
          </div>

          {/* All page content renders above the background */}
          <div className="relative z-10 flex flex-1 flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
