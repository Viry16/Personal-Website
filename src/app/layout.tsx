import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MotionProvider } from "@/components/MotionProvider";
import { SiteDotField } from "@/components/SiteDotField";
import { getSiteSettings } from "@/lib/data";
import { Analytics } from "@vercel/analytics/next";
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

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'));

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: site.title,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    keywords: ["Excel Viryan", "Software Developer", "AI Engineer", "IoT Builder", "Portfolio", "President University"],
    authors: [{ name: site.name }],
    creator: site.name,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "/",
      title: site.title,
      description: site.description,
      siteName: site.name,
      images: [
        {
          url: site.aboutImage,
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
      creator: "@excelviryan",
      images: [site.aboutImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: site.logo,
      apple: site.logo,
    },
  };
}

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
              MotionProvider = global Framer Motion config (reduced-motion aware).
              overflow-x-clip guards against any stray-wide child (e.g. an
              animating card) ever producing a horizontal scrollbar. It doesn't
              affect the fixed dock/background (no containing block created). */}
          <MotionProvider>
            <div className="relative z-10 flex flex-1 flex-col overflow-x-clip">
              {children}
            </div>
          </MotionProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
