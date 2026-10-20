// tanstack
import { createFileRoute } from "@tanstack/react-router";

// Web App Manifest for Android/Home-Screen installability. No service worker, no
// offline support: the app is intentionally always online. Only the Response is
// minted per request, because a response body is single-use
const DARK_SURFACE = "#0e0f1a";

const MANIFEST = {
  name: "Wordle Overdrive",
  short_name: "Wordle OD",
  description: "High-stakes arcade word survival game with AI-generated riddles, in English or Polish.",
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
    { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

export const Route = createFileRoute("/manifest.webmanifest")({
  server: {
    handlers: {
      GET: () => new Response(JSON.stringify(MANIFEST), { headers: { "content-type": "application/manifest+json" } }),
    },
  },
});
