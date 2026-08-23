import "./globals.css";

// next
import Image from "next/image";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import { GTProvider, T } from "gt-next";
import { getGT, getLocale } from "gt-next/server";

// components
import { ThemeProvider } from "next-themes";
import { AtomRegistryProvider } from "@/lib/atom-registry-provider";
import { Toastify } from "@/ui/toastify";
import { Header } from "@/ui/header";
import { Modals } from "@/ui/modals";
import { Alerts } from "@/ui/alerts";

// assets
import { fontSans, fontMono } from "@/assets/fonts";

// types
import type { Metadata } from "next";

// constants
export const metadata: Metadata = {
  title: "Wordle Overdrive ► The High-Stakes Arcade Word Survival Game",
  description:
    "Take the classic word puzzle into overdrive. Survive an endless arcade run, unlock dynamic scoring multipliers, and solve AI-generated riddles in English or Polish.",
  authors: [{ name: "Remi" }],
  robots: { index: true, follow: true },
  category: "game",
  keywords: [
    "wordle overdrive",
    "arcade wordle",
    "endless wordle",
    "word survival game",
    "wordle with riddles",
    "wordle arcade run",
    "english word game",
    "polish word game",
    "word puzzle",
  ],
  other: { google: "notranslate" },

  metadataBase: new URL("https://wordle-game.remiforge.dev"),
  alternates: { canonical: "/" },

  // iOS "Add to Home Screen": launch in a standalone window without Safari's URL bar.
  // The Web App Manifest (manifest.ts) covers the equivalent for Android Chrome.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wordle Overdrive",
  },
};

export default async function Layout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const gt = await getGT();

  return (
    <html lang={locale} translate="no" className="antialiased" suppressHydrationWarning>
      <body className={cn(`${fontSans.variable} ${fontMono.variable}`)}>
        <GTProvider>
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
          </ThemeProvider>
        </GTProvider>

        <Analytics debug={false} />

        <a
          href="https://www.remiforge.dev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={gt("Visit RemiForge Portfolio (opens in a new tab)")}
          className="mx-auto mt-9 flex max-w-xl flex-wrap items-center gap-5 rounded-xl border border-gray-700 bg-neutral-900 p-4 text-start text-neutral-200 no-underline transition-colors hover:border-gray-500"
        >
          <Image
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
      </body>
    </html>
  );
}
