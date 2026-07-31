// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { bestRunTrophyCardAtom } from "@/features/telemetry/state";

// components
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";
import { BestRunCard, BestRunCardSkeleton } from "./best-run-card";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface BestRunTrophyCardChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function BestRunTrophyCardChart({ solutionsLanguage }: BestRunTrophyCardChartProps) {
  const bestRunPersonal = useAtomValue(bestRunTrophyCardAtom({ whichBestRun: "personal", solutionsLanguage }));
  const bestRunGlobal = useAtomValue(bestRunTrophyCardAtom({ whichBestRun: "global", solutionsLanguage }));

  return (
    <>
      <SectionHeader title="The best run trophy card" />
      <article className="mb-8 grid grid-cols-1 grid-rows-7 gap-1 space-y-4 sm:grid-cols-2 sm:gap-2 sm:space-y-0">
        {AsyncResult.builder(bestRunPersonal)
          .onInitialOrWaiting(() => <BestRunCardSkeleton Tag="header" variant="primary" title="Your Personal Best" />)
          .onFailure(() => <BestRunCardSkeleton Tag="header" variant="primary" title="Your Personal Best" />)
          .onSuccess((bestRunPersonal) => <BestRunCard Tag="header" variant="primary" title="Your Personal Best" bestRun={bestRunPersonal} />)
          .render()}

        {AsyncResult.builder(bestRunGlobal)
          .onInitialOrWaiting(() => <BestRunCardSkeleton Tag="footer" variant="secondary" title="Global Best" />)
          .onFailure(() => <BestRunCardSkeleton Tag="footer" variant="secondary" title="Global Best" />)
          .onSuccess((bestRunGlobal) => <BestRunCard Tag="footer" variant="secondary" title="Global Best" bestRun={bestRunGlobal} />)
          .render()}
      </article>
    </>
  );
}

export function BestRunTrophyCardChartSkeleton() {
  return (
    <>
      <SectionHeaderSkeleton title="The best run trophy card" />
      <article className="mb-8 grid grid-cols-1 grid-rows-7 gap-1 space-y-4 sm:grid-cols-2 sm:gap-2 sm:space-y-0">
        <BestRunCardSkeleton Tag="header" variant="primary" title="Your Personal Best" />
        <BestRunCardSkeleton Tag="footer" variant="secondary" title="Global Best" />
      </article>
    </>
  );
}
