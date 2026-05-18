import "./globals.css";

// next
import Image from "next/image";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

// components
import { ThemeProvider } from "next-themes";
import { RegistryProvider } from "@effect-atom/atom-react";
import { Header } from "@/ui/Header";
import { HelpModal, WinOrLoseModal } from "@/ui/Modals";

// assets
import { fontSans, fontMono } from "@/assets/fonts";

// types
import type { Metadata } from "next";

// constants
export const metadata: Metadata = {
  title: "Wordle Clone — Free Word Puzzle Game in English & Polish",
  description:
    "Play a free Wordle-inspired word puzzle game. Guess the hidden word in 6 tries using color-coded hints and challenge your vocabulary in English or Polish.",
  authors: [{ name: "Remi" }],
  robots: { index: true, follow: true },
  category: "game",
  keywords: ["wordle", "wordle clone", "word puzzle", "word guessing game", "vocabulary game", "english word game", "polish word game"],
  other: { google: "notranslate" },

  metadataBase: new URL("https://wordle-game.remiforge.dev"),
  alternates: { canonical: "/" },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" translate="no" className="antialiased" suppressHydrationWarning>
      <body className={cn(`${fontSans.variable} ${fontMono.variable}`)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RegistryProvider>
            <div className="isolate grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr]">
              <Header />
              <main className="mx-auto grid max-w-4xl p-2">{children}</main>
            </div>
            <HelpModal />
            <WinOrLoseModal />
          </RegistryProvider>
        </ThemeProvider>

        <Analytics debug={false} />

        <a
          href="https://www.remiforge.dev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit RemiForge Portfolio (opens in a new tab)"
          className="mx-auto flex max-w-xl flex-wrap items-center gap-5 rounded-xl border border-gray-700 bg-neutral-900 p-4 text-start text-neutral-200 no-underline transition-colors hover:border-gray-500"
        >
          <Image
            src="https://www.remiforge.dev/opengraph-image.jpg"
            width="1200"
            height="630"
            alt="RemiForge Portfolio"
            loading="lazy"
            className="aspect-1200/630 h-auto w-32 flex-none rounded-lg object-cover"
          />
          <div className="min-w-56 flex-1">
            <div className="mb-1 text-sm tracking-wider text-neutral-400 uppercase">
              <span aria-hidden="true">👨‍💻</span> Built By
            </div>
            <div className="flex items-center gap-2 text-2xl font-bold text-white">
              RemiForge
              <span aria-hidden="true" className="text-xl font-normal text-gray-500">
                ↗
              </span>
            </div>
            <div className="mt-1 text-sm text-neutral-400">Portfolio of Projects, Experiments & Contact</div>
          </div>
        </a>
      </body>
    </html>
  );
}
