import type { NextConfig } from "next";

// NOTE: Do NOT load dotenv in next.config — it can shadow Vercel's runtime env vars.
// Vercel injects DATABASE_URL etc at runtime automatically.
// Locally, our db.ts already loads dotenv when DATABASE_URL is missing.

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // DO NOT use `env:` here — it hardcodes build-time values into the bundle.
  // Let Vercel's runtime inject env vars automatically.
};

export default nextConfig;
