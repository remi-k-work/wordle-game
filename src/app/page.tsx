"use client";

// services, features, and other libraries
import { useAtomValue, useAtomMount, Result } from "@effect-atom/atom-react";
import { gameDataSolutionsAtom } from "@/atoms";

// components
import Header from "@/ui/Header";
import Main from "@/ui/Main";
import Footer from "@/ui/Footer";
import { Loading } from "@/ui/Loading";

export default function Page() {
  useAtomMount(gameDataSolutionsAtom);
  const gameDataSolutions = useAtomValue(gameDataSolutionsAtom);

  return Result.builder(gameDataSolutions)
    .onInitial(() => (
      <>
        <Header />
        <Loading status="pending" />
        <Footer />
      </>
    ))
    .onWaiting(() => (
      <>
        <Header />
        <Loading status="pending" />
        <Footer />
      </>
    ))
    .onFailure(() => (
      <>
        <Header />
        <Loading status="rejected" />
        <Footer />
      </>
    ))
    .onSuccess(() => (
      <>
        <Header />
        <Main />
        <Footer />
      </>
    ))
    .render();
}
