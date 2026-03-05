import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate unique build IDs to prevent stale chunk references
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
};

export default nextConfig;
