// services, features, and other libraries
import { Duration } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { anyAvgStatAtom } from "@/features/telemetry/state";
import { formatDuration } from "@/lib/formatters";

// components
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";
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
    .onSuccess((anyAvgStat) => (
      // B5: scalar shape — RPC returns a single { personal, global } object,
      // not a 1-element array. The prior `length === 0` empty-state branch is
      // dead: COALESCE in the SQL always materialises a row (averages as 0/0
      // when no source rows match), and SqlSchema.findOne would fail the whole
      // Effect if a row were ever missing — chart-rendering falls back to the
      // onFailure skeleton in that (impossible) case.
      <>
        <SectionHeader title={title} />
        <article className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[1fr_1fr] sm:gap-6">
          <StatCard Tag="header" variant="primary" title={personalHeader}>
            {formatStatValue(anyAvgStat.personal)}
          </StatCard>
          <StatCard Tag="footer" variant="secondary" title="Global Average">
            {formatStatValue(anyAvgStat.global)}
          </StatCard>
        </article>
      </>
    ))
    .render();
}

export function AnyAvgStatChartSkeleton({ title, personalHeader }: Pick<AnyAvgStatChartProps, "title" | "personalHeader">) {
  return (
    <>
      <SectionHeaderSkeleton title={title} />
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
