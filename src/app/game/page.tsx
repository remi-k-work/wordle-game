"use client";

// services, features, and other libraries
import { useAtomValue, useAtomMount } from "@effect/atom-react";
import { playerSessionAtom } from "@/features/player/state";
import { gameDataMachineAtom, loaderBootstrapperAtom, wordChallengeMachineAtom } from "@/features/game/state";

// components
import { Footer, FooterSkeleton, Header, HeaderSkeleton, Main, MainSkeleton } from "@/features/game/ui/board";

export default function Page() {
  useAtomMount(playerSessionAtom);
  useAtomMount(loaderBootstrapperAtom);
  useAtomMount(wordChallengeMachineAtom);
  const gameDataMachineSnapshot = useAtomValue(gameDataMachineAtom);

  // If the game data machine is idle, loading, or failed, render the skeleton
  if (gameDataMachineSnapshot.matches("idle") || gameDataMachineSnapshot.matches("loading") || gameDataMachineSnapshot.matches("failure")) {
    return (
      <article className="mx-auto grid w-full max-w-4xl grid-cols-1 grid-rows-[auto_1fr_auto] gap-2">
        <HeaderSkeleton />
        <MainSkeleton />
        <FooterSkeleton />
      </article>
    );
  }

  return (
    <article className="mx-auto grid w-full max-w-4xl grid-cols-1 grid-rows-[auto_1fr_auto] gap-2">
      <Header />
      <Main />
      <Footer />
    </article>
  );
}
