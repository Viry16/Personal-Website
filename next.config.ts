import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to accept requests proxied through a Cloudflare
  // quick tunnel (random *.trycloudflare.com subdomain). Without this, Next 16
  // blocks cross-origin dev requests with "Unauthorized". Dev-only; ignored in
  // production.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
