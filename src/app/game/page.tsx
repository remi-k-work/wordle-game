"use client";

// services, features, and other libraries
import { useAtomValue, useAtomMount } from "@effect/atom-react";
import { playerSessionAtom } from "@/features/player/state/player";
import { gameDataIsLoadingOrFailedAtom } from "@/features/game/state/game-data";

// components
import { Header, HeaderSkeleton } from "@/features/game/ui/board/header";
import { Main, MainSkeleton } from "@/features/game/ui/board/main";
import { Footer, FooterSkeleton } from "@/features/game/ui/board/footer";

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
