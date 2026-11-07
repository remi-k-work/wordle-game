// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { useMessages } from "gt-react";
import { bestRunTrophyCardAtom } from "@/features/charts/state/charts";

// components
import { SectionHeader } from "@/ui/section-header";
import { BestRunSlot } from "./best-run-slot";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface BestRunTrophyCardChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
import { GLOBAL_TITLE, PERSONAL_TITLE, SECTION_TITLE } from "./copy";
import { TROPHY_GRID_CLASSES } from "./chrome";

export function BestRunTrophyCardChart({ solutionsLanguage }: BestRunTrophyCardChartProps) {
  const bestRunPersonal = useAtomValue(bestRunTrophyCardAtom({ whichBestRun: "personal", solutionsLanguage }));
  const bestRunGlobal = useAtomValue(bestRunTrophyCardAtom({ whichBestRun: "global", solutionsLanguage }));

  const messages = useMessages();
  const personalTitle = messages(PERSONAL_TITLE);
  const globalTitle = messages(GLOBAL_TITLE);

  return (
    <>
      <SectionHeader title={messages(SECTION_TITLE)} />
      <article className={TROPHY_GRID_CLASSES}>
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
