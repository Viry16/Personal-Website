import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking by disallowing iframes
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from MIME-sniffing responses away from the declared Content-Type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send a full referrer to same-origin, only the origin to cross-origin HTTPS
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features the site doesn't use
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
  // Allow the dev server to accept requests proxied through a Cloudflare
  // quick tunnel (random *.trycloudflare.com subdomain). Without this, Next 16
  // blocks cross-origin dev requests with "Unauthorized". Dev-only; ignored in
  // production.
  allowedDevOrigins: ["*.trycloudflare.com"],

  // Project images can be admin-entered as external URLs (not just local
  // /assets paths), so allow next/image to optimize any https host.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  experimental: {
    // Admin image uploads go through a Server Action; the default 1 MB body cap
    // is too small. Keep in sync with MAX_IMAGE_BYTES (4 MB) in src/lib/images.ts,
    // leaving headroom for multipart overhead.
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
