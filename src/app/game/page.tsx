"use client";

// services, features, and other libraries
import { useAtomValue, useAtomMount, Result } from "@effect-atom/atom-react";
import { gameDataSolutionsAtom, gameLifecycleAtom } from "@/atoms";

// components
import { Footer, Header, Main, Riddle } from "@/ui/Game/Board";
import { Loading } from "@/ui/Loading";

export default function Page() {
  useAtomMount(gameLifecycleAtom);
  useAtomMount(gameDataSolutionsAtom);
  const gameDataSolutions = useAtomValue(gameDataSolutionsAtom);

  return Result.builder(gameDataSolutions)
    .onInitial(() => (
      <article className="grid grid-cols-1 grid-rows-[auto_1fr_auto] gap-3">
        <Header />
        <Loading status="pending" />
        <Footer />
      </article>
    ))
    .onWaiting(() => (
      <article className="grid grid-cols-1 grid-rows-[auto_1fr_auto] gap-3">
        <Header />
        <Loading status="pending" />
        <Footer />
      </article>
    ))
    .onFailure(() => (
      <article className="grid grid-cols-1 grid-rows-[auto_1fr_auto] gap-3">
        <Header />
        <Loading status="rejected" />
        <Footer />
      </article>
    ))
    .onSuccess(() => (
      <article className="grid grid-cols-1 grid-rows-[auto_auto_1fr_auto] gap-3">
        <Header />
        <Riddle />
        <Main />
        <Footer />
      </article>
    ))
    .render();
}
