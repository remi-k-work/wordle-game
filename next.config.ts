import type { NextConfig } from "next";
import { withGTConfig } from "gt-next/config";

const nextConfig: NextConfig = {
  devIndicators: false,
  typedRoutes: true,

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
