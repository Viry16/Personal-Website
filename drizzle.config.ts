import { loadEnvConfig } from "@next/env"
import { defineConfig } from "drizzle-kit"

// Load .env.local / .env the same way Next.js does, so `npm run db:*` picks up
// DATABASE_URL without any extra dotenv dependency.
loadEnvConfig(process.cwd())

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
