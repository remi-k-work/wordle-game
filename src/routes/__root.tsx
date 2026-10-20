import "@/assets/styles/globals.css";

// tanstack
import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

// services, features, and other libraries
import { GTProvider, getLocale, getTranslationsSnapshot, useGT } from "gt-tanstack-start";

// components
import { T } from "gt-react";
import { ThemeProvider } from "next-themes";
import { AtomRegistryProvider } from "@/ui/atom-registry-provider";
import { Toastify } from "@/ui/toastify";
import { Header } from "@/ui/header";
import { Modals } from "@/ui/modals";
import { Alerts } from "@/ui/alerts";

// assets
// Both fonts are variable (wght axis) with the latin-ext subset the Polish copy
// needs; the full barrel would emit @font-face rules for the unused axes/styles
import "@fontsource-variable/roboto/wght.css";
import "@fontsource-variable/roboto-slab/wght.css";

// types
import type { ReactNode } from "react";

// constants
const SITE_DESCRIPTION =
  "Take the classic word puzzle into overdrive. Survive an endless arcade run, unlock dynamic scoring multipliers, and solve AI-generated riddles in English or Polish.";
const ORIGIN = "https://wordle-game.remiforge.dev";
const TITLE = "Wordle Overdrive ► The High-Stakes Arcade Word Survival Game";

const KEYWORDS = [
  "wordle overdrive",
  "arcade wordle",
  "endless wordle",
  "word survival game",
  "wordle with riddles",
  "wordle arcade run",
  "english word game",
  "polish word game",
  "word puzzle",
].join(", ");

// Site-wide tags only. Meta dedupes by name/property keeping the leaf value, so
// routes that declare their own title (e.g. /high-score) override the one here.
// The root canonical "/" replaces the "every page canonicalizes to /" behavior
// the Next.js root metadata used to produce
export const ROOT_HEAD = {
  meta: [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: TITLE },
    { name: "description", content: SITE_DESCRIPTION },
    { name: "author", content: "Remi" },
    { name: "robots", content: "index, follow" },
    { name: "category", content: "game" },
    { name: "keywords", content: KEYWORDS },
    { name: "google", content: "notranslate" },

    // iOS "Add to Home Screen": launch in a standalone window without Safari's URL bar.
    // The Web App Manifest (routes/manifest[.]webmanifest) covers Android Chrome.
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "apple-mobile-web-app-title", content: "Wordle Overdrive" },

    // open graph
    { property: "og:title", content: TITLE },
    { property: "og:description", content: SITE_DESCRIPTION },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${ORIGIN}/` },
    { property: "og:image", content: `${ORIGIN}/opengraph-image.jpg` },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: SITE_DESCRIPTION },

    // twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: TITLE },
    { name: "twitter:description", content: SITE_DESCRIPTION },
    { name: "twitter:image", content: `${ORIGIN}/twitter-image.jpg` },
    { name: "twitter:image:alt", content: SITE_DESCRIPTION },
  ],
  links: [
    { rel: "canonical", href: ORIGIN },
    { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", href: "/apple-icon.png" },
    { rel: "manifest", href: "/manifest.webmanifest" },
  ],
};

export const Route = createRootRoute({
  head: () => ROOT_HEAD,
  loader: async () => {
    const locale = getLocale();
    return { locale, translations: await getTranslationsSnapshot(locale) } as const;
  },
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return <Outlet />;
}

// The html document shell; the router streams the route components into it.
// next-themes keeps working: it only needs the suppressHydrationWarning marker
// and the `class` attribute mode (no React-specific framework hooks)
function RootDocument({ children }: { children: ReactNode }) {
  const { locale, translations } = Route.useLoaderData();

  return (
    <html lang={locale} translate="no" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {/* GTProvider fronts the whole document: the standalone FooterLink also calls
            useGT, so it renders inside the provider (unlike the Next.js layout, where
            the server-side getGT() worked without any context) */}
        <GTProvider locale={locale} translations={translations}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AtomRegistryProvider>
              <Toastify>
                <div className="isolate grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr]">
                  <Header />
                  <main className="grid p-1">{children}</main>
                </div>
                <Modals />
                <Alerts />
              </Toastify>
            </AtomRegistryProvider>

            <FooterLink />
          </ThemeProvider>
        </GTProvider>

        <Scripts />
      </body>
    </html>
  );
}

function FooterLink() {
  const gt = useGT();

  return (
    <a
      href="https://www.remiforge.dev"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={gt("Visit RemiForge Portfolio (opens in a new tab)")}
      className="mx-auto mt-9 flex max-w-xl flex-wrap items-center gap-5 rounded-xl border border-gray-700 bg-neutral-900 p-4 text-start text-neutral-200 no-underline transition-colors hover:border-gray-500"
    >
      <img
        src="https://www.remiforge.dev/opengraph-image.jpg"
        width="1200"
        height="630"
        alt={gt("RemiForge Portfolio")}
        loading="lazy"
        className="aspect-1200/630 h-auto w-32 flex-none rounded-lg object-cover"
      />
      <div className="min-w-56 flex-1">
        <div className="mb-1 text-sm tracking-wider text-neutral-400 uppercase">
          <span aria-hidden="true">👨‍💻</span> <T>Built By</T>
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold text-white">
          RemiForge
          <span aria-hidden="true" className="text-xl font-normal text-gray-500">
            ↗
          </span>
        </div>
        <div className="mt-1 text-sm text-neutral-400">
          <T>Portfolio of Projects, Experiments & Contact</T>
        </div>
      </div>
    </a>
  );
}
