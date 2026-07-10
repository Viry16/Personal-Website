import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
