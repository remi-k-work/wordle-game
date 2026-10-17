import type { NextConfig } from "next";
import { withGTConfig } from "gt-next/config";

const nextConfig: NextConfig = {
  devIndicators: false,
  typedRoutes: true,
  agentRules: false,

  // Trim third-party barrels (see bundle-barrel-imports): only these packages
  // are rewritten to per-component imports; the rest stay as written
  experimental: {
    optimizePackageImports: ["@base-ui/react", "motion", "gt-next"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.remiforge.dev",
      },
    ],
  },
};

export default withGTConfig(nextConfig, {
  runtimeUrl: null,
  cacheUrl: null,
  loadTranslationsPath: "./src/loadTranslations.ts",
});
