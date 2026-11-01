// services, features, and other libraries
import { msg, useMessages } from "gt-react";

// components
import { SectionHeaderSkeleton } from "@/ui/section-header";
import { BestRunCardSkeleton } from "./best-run-card";

// The loading placeholder for the best run trophy card section. Lives apart from
// the live card (whose module resolves the trophy atom) so route-level Suspense
// fallbacks never bundle the data-graph
export function BestRunTrophyCardChartSkeleton() {
  const messages = useMessages();

  return (
    <>
      <SectionHeaderSkeleton title={messages(msg("The best run trophy card"))} />
      <article className="mb-8 grid grid-cols-1 grid-rows-7 gap-1 space-y-4 sm:grid-cols-2 sm:gap-2 sm:space-y-0">
        <BestRunCardSkeleton Tag="header" variant="primary" title={messages(msg("Your Personal Best"))} />
        <BestRunCardSkeleton Tag="footer" variant="secondary" title={messages(msg("Global Best"))} />
      </article>
    </>
  );
}
