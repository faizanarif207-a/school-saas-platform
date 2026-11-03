import type { NextConfig } from "next";
import { config } from "dotenv";

// Force .env to be loaded before Next.js reads any env vars.
// This is critical when the shell environment has a stale DATABASE_URL
// (e.g., from an earlier init script that set file: based URL).
config({ override: true });

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
