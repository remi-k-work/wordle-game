// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { Atom, AsyncResult } from "effect/reactivity";
import { msg, useMessages } from "gt-react";
import { bestRunTrophyCardAtom } from "@/features/telemetry/state/charts";

// components
import { SectionHeader } from "@/ui/section-header";
import { BestRunCard, BestRunCardSkeleton } from "./best-run-card";

// types
import type { ComponentProps } from "react";
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface BestRunTrophyCardChartProps {
  solutionsLanguage: SolutionsLanguage;
}

type BestRunResult = Atom.Type<ReturnType<typeof bestRunTrophyCardAtom>>;
type BestRunSlotProps = Pick<ComponentProps<typeof BestRunCard>, "Tag" | "variant" | "title"> & { result: BestRunResult };

function BestRunSlot({ result, ...cardProps }: BestRunSlotProps) {
  return AsyncResult.builder(result)
    .onInitialOrWaiting(() => <BestRunCardSkeleton {...cardProps} />)
    .onFailure(() => <BestRunCardSkeleton {...cardProps} />)
    .onSuccess((bestRun) => <BestRunCard {...cardProps} bestRun={bestRun} />)
    .render();
}

export function BestRunTrophyCardChart({ solutionsLanguage }: BestRunTrophyCardChartProps) {
  const bestRunPersonal = useAtomValue(bestRunTrophyCardAtom({ whichBestRun: "personal", solutionsLanguage }));
  const bestRunGlobal = useAtomValue(bestRunTrophyCardAtom({ whichBestRun: "global", solutionsLanguage }));
  const messages = useMessages();
  const personalTitle = messages(msg("Your Personal Best"));
  const globalTitle = messages(msg("Global Best"));

  return (
    <>
      <SectionHeader title={messages(msg("The best run trophy card"))} />
      <article className="mb-8 grid grid-cols-1 grid-rows-7 gap-1 space-y-4 sm:grid-cols-2 sm:gap-2 sm:space-y-0">
        <BestRunSlot result={bestRunPersonal} Tag="header" variant="primary" title={personalTitle} />
        <BestRunSlot result={bestRunGlobal} Tag="footer" variant="secondary" title={globalTitle} />
      </article>
    </>
  );
}

// The skeleton moved to ./skeleton so route-level Suspense fallbacks never bundle
// the trophy-card data graph; re-exported here so the module's public API is
// unchanged
export { BestRunTrophyCardChartSkeleton } from "./skeleton";
