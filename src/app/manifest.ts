// Web App Manifest for Android/Home-Screen installability.
// No service worker, no offline support: the app is intentionally always online.
// Next.js auto-serves this at /manifest.webmanifest and injects
// <link rel="manifest"> into <head>.

// types
import type { MetadataRoute } from "next";

const DARK_SURFACE = "#0e0f1a";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wordle Overdrive",
    short_name: "Wordle OD",
    description:
      "High-stakes arcade word survival game with AI-generated riddles, in English or Polish.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: DARK_SURFACE,
    theme_color: DARK_SURFACE,
    lang: "en",
    categories: ["games", "entertainment"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
