// services, features, and other libraries
import { Duration } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { anyAvgStatAtom } from "@/features/telemetry/state";
import { formatDuration } from "@/features/game/domain";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader } from "@/ui/section-header";
import { StatCard, StatCardSkeleton } from "@/ui/stat-card";

// types
import type { SolutionsLanguage } from "@/features/game/domain";
import type { AnyAvgStatArgs } from "@/features/telemetry/services/charts-db";

interface AnyAvgStatChartProps {
  statColumn: AnyAvgStatArgs["statColumn"];
  statTable: AnyAvgStatArgs["statTable"];
  solutionsLanguage: SolutionsLanguage;
  title: string;
  personalHeader: string;
}

export function AnyAvgStatChart({ statColumn, statTable, solutionsLanguage, title, personalHeader }: AnyAvgStatChartProps) {
  const anyAvgStat = useAtomValue(anyAvgStatAtom({ statColumn, statTable, solutionsLanguage }));
  const isDuration = statColumn === "timeSeconds" || statColumn === "durationSeconds";
  const formatStatValue = (value: number) => (isDuration ? formatDuration(Duration.seconds(value)) : value.toLocaleString());

  return AsyncResult.builder(anyAvgStat)
    .onInitialOrWaiting(() => <AnyAvgStatChartSkeleton title={title} personalHeader={personalHeader} />)
    .onFailure(() => <AnyAvgStatChartSkeleton title={title} personalHeader={personalHeader} />)
    .onSuccess((anyAvgStat) =>
      anyAvgStat.length === 0 ? (
        <>
          <SectionHeader title={title} />
          <InfoLine message="No stats data tracked yet!" />
        </>
      ) : (
        <>
          <SectionHeader title={title} />
          <article className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[1fr_1fr] sm:gap-6">
            <StatCard Tag="header" variant="primary" title={personalHeader}>
              {formatStatValue(anyAvgStat[0].personal)}
            </StatCard>
            <StatCard Tag="footer" variant="secondary" title="Global Average">
              {formatStatValue(anyAvgStat[0].global)}
            </StatCard>
          </article>
        </>
      )
    )
    .render();
}

export function AnyAvgStatChartSkeleton({ title, personalHeader }: Pick<AnyAvgStatChartProps, "title" | "personalHeader">) {
  return (
    <>
      <SectionHeader title={title} />
      <article className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[1fr_1fr] sm:gap-6">
        <StatCard Tag="header" variant="primary" title={personalHeader}>
          <StatCardSkeleton />
        </StatCard>
        <StatCard Tag="footer" variant="secondary" title="Global Average">
          <StatCardSkeleton />
        </StatCard>
      </article>
    </>
  );
}
