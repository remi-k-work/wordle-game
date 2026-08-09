// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { anyCounterAtom } from "@/features/telemetry/state";

// components
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
    .onSuccess((anyCounter) => (
      // B5: scalar shape — RPC returns a single { personal, global } object,
      // not a 1-element array. The prior `length === 0` empty-state branch is
      // dead: COALESCE in the SQL always materialises a row (counts 0/0 when
      // no source rows match), and SqlSchema.findOne would fail the whole
      // Effect if a row were ever missing — chart-rendering falls back to the
      // onFailure skeleton in that (impossible) case.
      <>
        <SectionHeader title={title} />
        <article className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[1fr_1fr] sm:gap-6">
          <StatCard Tag="header" variant="primary" title={personalHeader}>
            {anyCounter.personal.toLocaleString()}
          </StatCard>
          <StatCard Tag="footer" variant="secondary" title="Global Total">
            {anyCounter.global.toLocaleString()}
          </StatCard>
        </article>
      </>
    ))
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
