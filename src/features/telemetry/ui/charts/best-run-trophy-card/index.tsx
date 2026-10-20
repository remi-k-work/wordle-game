// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { msg, useMessages } from "gt-tanstack-start";
import { bestRunTrophyCardAtom } from "@/features/telemetry/state/charts";

// components
import { SectionHeader } from "@/ui/section-header";
import { BestRunCard, BestRunCardSkeleton } from "./best-run-card";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface BestRunTrophyCardChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function BestRunTrophyCardChart({ solutionsLanguage }: BestRunTrophyCardChartProps) {
  const bestRunPersonal = useAtomValue(bestRunTrophyCardAtom({ whichBestRun: "personal", solutionsLanguage }));
  const bestRunGlobal = useAtomValue(bestRunTrophyCardAtom({ whichBestRun: "global", solutionsLanguage }));
  const messages = useMessages();

  return (
    <>
      <SectionHeader title={messages(msg("The best run trophy card"))} />
      <article className="mb-8 grid grid-cols-1 grid-rows-7 gap-1 space-y-4 sm:grid-cols-2 sm:gap-2 sm:space-y-0">
        {AsyncResult.builder(bestRunPersonal)
          .onInitialOrWaiting(() => <BestRunCardSkeleton Tag="header" variant="primary" title={messages(msg("Your Personal Best"))} />)
          .onFailure(() => <BestRunCardSkeleton Tag="header" variant="primary" title={messages(msg("Your Personal Best"))} />)
          .onSuccess((bestRunPersonal) => <BestRunCard Tag="header" variant="primary" title={messages(msg("Your Personal Best"))} bestRun={bestRunPersonal} />)
          .render()}

        {AsyncResult.builder(bestRunGlobal)
          .onInitialOrWaiting(() => <BestRunCardSkeleton Tag="footer" variant="secondary" title={messages(msg("Global Best"))} />)
          .onFailure(() => <BestRunCardSkeleton Tag="footer" variant="secondary" title={messages(msg("Global Best"))} />)
          .onSuccess((bestRunGlobal) => <BestRunCard Tag="footer" variant="secondary" title={messages(msg("Global Best"))} bestRun={bestRunGlobal} />)
          .render()}
      </article>
    </>
  );
}

// The skeleton moved to ./skeleton so route-level Suspense fallbacks never bundle
// the trophy-card data graph; re-exported here so the module's public API is
// unchanged
export { BestRunTrophyCardChartSkeleton } from "./skeleton";
