import type { NextConfig } from "next";
import { execSync } from "child_process";

// Generate a unique build ID from the git commit hash + timestamp.
// Changing this every deploy ensures /_next/static/<BUILD_ID>/ paths change,
// so any stale CDN-cached HTML that references old (deleted) chunk paths will
// immediately show up as mismatched build IDs — caught by the client-side
// stale-chunk recovery script in layout.tsx.
function getBuildId(): string {
  try {
    const hash = execSync("git rev-parse --short HEAD", { stdio: ["pipe", "pipe", "ignore"] })
      .toString()
      .trim();
    return `${hash}-${Date.now()}`;
  } catch {
    return Date.now().toString();
  }
}

const BUILD_ID = getBuildId();

// Make the build ID available to client-side code for stale-chunk detection
process.env.NEXT_PUBLIC_BUILD_ID = BUILD_ID;

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),

  // Force a new Build ID on every deploy.
  // This changes the /_next/static/<BUILD_ID>/ prefix in ALL chunk URLs,
  // making it impossible for a stale CDN-cached HTML shell to load chunks
  // from an old deploy (those paths no longer exist → immediate 404 signal).
  generateBuildId: async () => BUILD_ID,

  async headers() {
    return [
      {
        // Prevent browsers/CDN from caching HTML pages (avoids stale chunk 404s after deploy)
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          // These Netlify-specific headers tell the Durable Cache to never
          // store HTML pages. Must be set at the app level AND netlify.toml.
          { key: 'CDN-Cache-Control', value: 'no-store' },
          { key: 'Netlify-CDN-Cache-Control', value: 'no-store' },
          { key: 'Surrogate-Control', value: 'no-store' },
          // Embed the current build ID in every HTML response so the client
          // can compare against window.__NEXT_DATA__.buildId and detect stale shells.
          { key: 'x-build-id', value: BUILD_ID },
        ],
      },
    ]
  },
};

export default nextConfig;
