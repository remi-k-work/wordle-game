// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { useGT } from "gt-react";
import { runDeathReasonFrequencyAtom } from "@/features/telemetry/state/charts";

// components
import { ChartBody } from "./chart-body";
import { RunDeathReasonFrequencyChartSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface RunDeathReasonFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function RunDeathReasonFrequencyChart({ solutionsLanguage }: RunDeathReasonFrequencyChartProps) {
  const runDeathReasonFrequency = useAtomValue(runDeathReasonFrequencyAtom(solutionsLanguage));
  const gt = useGT();

  // No memoization needed: `ChartBody` is not wrapped in `React.memo`, so a
  // stable `tooltipFormatter` reference buys nothing; a plain render-time
  // function always sees the latest `gt` via closure and keeps the dependency
  // surface simple
  const tooltipFormatter = (value: unknown, name: unknown): readonly [string, string] => [gt("{count} times", { count: value }), String(name)] as const;

  return AsyncResult.builder(runDeathReasonFrequency)
    .onInitialOrWaiting(() => <RunDeathReasonFrequencyChartSkeleton />)
    .onFailure(() => <RunDeathReasonFrequencyChartSkeleton />)
    .onSuccess((runDeathReasonFrequency) => (
      <ChartBody
        runDeathReasonFrequency={runDeathReasonFrequency}
        title={gt("Reasons why an arcade run ended")}
        emptyMessage={gt("No frequency data tracked yet!")}
        tooltipFormatter={tooltipFormatter}
      />
    ))
    .render();
}

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; imported here for the waiting/failure states of the
// live chart and re-exported so the module's public API is unchanged
export { RunDeathReasonFrequencyChartSkeleton };
