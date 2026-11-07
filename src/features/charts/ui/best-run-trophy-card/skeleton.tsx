// services, features, and other libraries
import { useMessages } from "gt-react";

// components
import { SectionHeaderSkeleton } from "@/ui/section-header";
import { BestRunCardSkeleton } from "./best-run-card";

// constants
import { GLOBAL_TITLE, PERSONAL_TITLE, SECTION_TITLE } from "./copy";
import { TROPHY_GRID_CLASSES } from "./chrome";

// The loading placeholder for the best run trophy card section; lives apart from
// the live card (whose module resolves the trophy atom) so route-level Suspense
// fallbacks never bundle the data-graph
export function BestRunTrophyCardChartSkeleton() {
  const messages = useMessages();

  return (
    <>
      <SectionHeaderSkeleton title={messages(SECTION_TITLE)} />
      <article className={TROPHY_GRID_CLASSES}>
        <BestRunCardSkeleton Tag="header" variant="primary" title={messages(PERSONAL_TITLE)} />
        <BestRunCardSkeleton Tag="footer" variant="secondary" title={messages(GLOBAL_TITLE)} />
      </article>
    </>
  );
}
