// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { useGT } from "gt-react";
import { runDeathReasonFrequencyAtom } from "@/features/charts/state/charts";

// components
import { ChartSection } from "@/features/charts/ui/chart-section";
import { ChartBody } from "@/features/charts/ui/run-death-reason-frequency/chart-body";
import { RunDeathReasonFrequencyChartSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface RunDeathReasonFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function RunDeathReasonFrequencyChart({ solutionsLanguage }: RunDeathReasonFrequencyChartProps) {
  const runDeathReasonFrequency = useAtomValue(runDeathReasonFrequencyAtom(solutionsLanguage));
  const gt = useGT();

  // Both the empty state and the chart carry the same heading, so it is resolved once here instead of being re-translated in each branch
  const title = gt("Reasons why an arcade run ended");

  const tooltipFormatter = (value: unknown, name: unknown): readonly [string, string] => [gt("{count} times", { count: value }), String(name)] as const;

  return (
    <ChartSection
      title={title}
      result={runDeathReasonFrequency}
      skeleton={<RunDeathReasonFrequencyChartSkeleton />}
      emptyMessage={gt("No frequency data tracked yet!")}
    >
      {(rows) => <ChartBody runDeathReasonFrequency={rows} title={title} tooltipFormatter={tooltipFormatter} />}
    </ChartSection>
  );
}

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; imported here for the waiting/failure states of the
// live chart and re-exported so the module's public API is unchanged
export { RunDeathReasonFrequencyChartSkeleton };
