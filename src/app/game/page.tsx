"use client";

// services, features, and other libraries
import { useAtomValue, useAtomMount } from "@effect/atom-react";
import { playerSessionAtom } from "@/features/player/state";
import { gameDataIsLoadingOrFailedAtom } from "@/features/game/state";

// components
import { Footer, FooterSkeleton, Header, HeaderSkeleton, Main, MainSkeleton } from "@/features/game/ui/board";

export default function Page() {
  useAtomMount(playerSessionAtom);
  const isLoadingOrFailed = useAtomValue(gameDataIsLoadingOrFailedAtom);

  // If the game data machine is loading or failed, render the skeleton
  if (isLoadingOrFailed) {
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
