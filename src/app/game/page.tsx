"use client";

// services, features, and other libraries
import { useAtomValue, useAtomMount, Result } from "@effect-atom/atom-react";
import { gameDataSolutionsAtom, gameLifecycleAtom } from "@/features/game/state";

// components
import { Footer, FooterSkeleton, Header, HeaderSkeleton, Main, MainSkeleton } from "@/features/game/ui/Board";

export default function Page() {
  useAtomMount(gameLifecycleAtom);
  const gameDataSolutions = useAtomValue(gameDataSolutionsAtom);

  return Result.builder(gameDataSolutions)
    .onInitialOrWaiting(() => (
      <article className="mx-auto grid w-full max-w-4xl grid-cols-1 grid-rows-[auto_1fr_auto] gap-2">
        <HeaderSkeleton />
        <MainSkeleton />
        <FooterSkeleton />
      </article>
    ))
    .onFailure(() => (
      <article className="mx-auto grid w-full max-w-4xl grid-cols-1 grid-rows-[auto_1fr_auto] gap-2">
        <HeaderSkeleton />
        <MainSkeleton />
        <FooterSkeleton />
      </article>
    ))
    .onSuccess(() => (
      <article className="mx-auto grid w-full max-w-4xl grid-cols-1 grid-rows-[auto_1fr_auto] gap-2">
        <Header />
        <Main />
        <Footer />
      </article>
    ))
    .render();
}
