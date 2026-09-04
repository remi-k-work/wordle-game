// services, features, and other libraries
import { T, useLocale } from "gt-next";
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { anyAvgStatAtom } from "@/features/telemetry/state";
import { formatSeconds } from "@/lib/formatters";

// components
import { StatPair, StatPairSkeleton } from "@/features/telemetry/ui/charts/stat-pair";

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
  const locale = useLocale();
  const formatStatValue = (value: number) => (isDuration ? formatSeconds(value) : value.toLocaleString(locale));

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
      <StatPair
        title={title}
        personalHeader={personalHeader}
        personal={formatStatValue(anyAvgStat.personal)}
        globalTitle={<T>Global Average</T>}
        global={formatStatValue(anyAvgStat.global)}
      />
    ))
    .render();
}

export function AnyAvgStatChartSkeleton({ title, personalHeader }: Pick<AnyAvgStatChartProps, "title" | "personalHeader">) {
  return <StatPairSkeleton title={title} personalHeader={personalHeader} globalTitle={<T>Global Average</T>} />;
}
