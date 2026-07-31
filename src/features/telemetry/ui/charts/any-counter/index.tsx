// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { anyCounterAtom } from "@/features/telemetry/state";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";
import { StatCard, StatCardSkeleton } from "@/ui/stat-card";

// types
import type { SolutionsLanguage } from "@/features/game/domain";
import type { AnyCounterArgs } from "@/features/telemetry/services/charts-db";

interface AnyCounterChartProps {
  counterName: AnyCounterArgs["counterName"];
  solutionsLanguage: SolutionsLanguage;
  title: string;
  personalHeader: string;
}

export function AnyCounterChart({ counterName, solutionsLanguage, title, personalHeader }: AnyCounterChartProps) {
  const anyCounter = useAtomValue(anyCounterAtom({ counterName, solutionsLanguage }));

  return AsyncResult.builder(anyCounter)
    .onInitialOrWaiting(() => <AnyCounterChartSkeleton title={title} personalHeader={personalHeader} />)
    .onFailure(() => <AnyCounterChartSkeleton title={title} personalHeader={personalHeader} />)
    .onSuccess((anyCounter) =>
      anyCounter.length === 0 ? (
        <>
          <SectionHeader title={title} />
          <InfoLine message="No counter data tracked yet!" />
        </>
      ) : (
        <>
          <SectionHeader title={title} />
          <article className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[1fr_1fr] sm:gap-6">
            <StatCard Tag="header" variant="primary" title={personalHeader}>
              {anyCounter[0].personal.toLocaleString()}
            </StatCard>
            <StatCard Tag="footer" variant="secondary" title="Global Total">
              {anyCounter[0].global.toLocaleString()}
            </StatCard>
          </article>
        </>
      )
    )
    .render();
}

export function AnyCounterChartSkeleton({ title, personalHeader }: Pick<AnyCounterChartProps, "title" | "personalHeader">) {
  return (
    <>
      <SectionHeaderSkeleton title={title} />
      <article className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[1fr_1fr] sm:gap-6">
        <StatCard Tag="header" variant="primary" title={personalHeader}>
          <StatCardSkeleton />
        </StatCard>
        <StatCard Tag="footer" variant="secondary" title="Global Total">
          <StatCardSkeleton />
        </StatCard>
      </article>
    </>
  );
}
