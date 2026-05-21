"use client";

// services, features, and other libraries
import { useAtomValue, useAtomMount, Result } from "@effect-atom/atom-react";
import { gameDataSolutionsAtom, gameLifecycleAtom } from "@/atoms";

// components
import { Footer, FooterSkeleton, Header, HeaderSkeleton, Main, MainSkeleton } from "@/ui/Game/Board";

export default function Page() {
  useAtomMount(gameLifecycleAtom);
  const gameDataSolutions = useAtomValue(gameDataSolutionsAtom);

  return Result.builder(gameDataSolutions)
    .onInitialOrWaiting(() => (
      <article className="grid grid-cols-1 grid-rows-[auto_1fr_auto] gap-2">
        <HeaderSkeleton />
        <MainSkeleton />
        <FooterSkeleton />
      </article>
    ))
    .onFailure(() => (
      <article className="grid grid-cols-1 grid-rows-[auto_1fr_auto] gap-2">
        <HeaderSkeleton />
        <MainSkeleton />
        <FooterSkeleton />
      </article>
    ))
    .onSuccess(() => (
      <article className="grid grid-cols-1 grid-rows-[auto_1fr_auto] gap-2">
        <Header />
        <Main />
        <Footer />
      </article>
    ))
    .render();
}
