import "./globals.css";

// next
import Image from "next/image";

// services, features, and other libraries
import { Analytics } from "@vercel/analytics/next";

// components
import { RegistryProvider } from "@effect-atom/atom-react";
import { HelpModal, WinOrLoseModal } from "@/ui/Modals";

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
    <html lang="en" translate="no" className="antialiased">
      <body>
        <RegistryProvider>
          <div className="grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr_auto] gap-4 p-4">{children}</div>
          <HelpModal />
          <WinOrLoseModal />
        </RegistryProvider>

        <Analytics debug={false} />
        <div className="mx-auto max-w-433.5 p-4">
          <Image
            src="/opengraph-image.jpg"
            width="1734"
            height="907"
            loading="lazy"
            alt="Wordle Game Clone Logo"
            className="h-auto w-full rounded-lg shadow-md"
          />

          <p className="mx-auto my-12 max-w-[65ch] text-center text-gray-300">
            Immerse yourselves in the captivating world of word puzzles with my Wordle Game clone, the ultimate vocabulary challenge. Each day, a new mystery
            word awaits you for deciphering, offering a fresh challenge to flex your linguistic muscles. With each guess, you will receive clues to unravel the
            secret word, gradually narrowing down the possibilities. Utilize the vibrant color-coded feedback system to guide your journey, savoring the
            satisfaction of each correct letter placement. Whether you are a seasoned wordsmith or a budding linguist, this game offers an engaging and
            rewarding experience for all. Unleash your creativity, hone your vocabulary, and relish the thrill of solving each puzzle. Let the word-solving
            adventure begin! This game can be played with either English or Polish vocabulary sets.
          </p>

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
        </div>
      </body>
    </html>
  );
}
