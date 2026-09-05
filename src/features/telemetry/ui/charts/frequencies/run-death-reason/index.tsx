// react
import { useCallback } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { useGT } from "gt-next";
import { runDeathReasonFrequencyAtom } from "@/features/telemetry/state";

// components
import { SectionHeaderSkeleton } from "@/ui/section-header";
import { ChartBody } from "./chart-body";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface RunDeathReasonFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function RunDeathReasonFrequencyChart({ solutionsLanguage }: RunDeathReasonFrequencyChartProps) {
  const runDeathReasonFrequency = useAtomValue(runDeathReasonFrequencyAtom(solutionsLanguage));
  const gt = useGT();

  const tooltipFormatter = useCallback(
    (value: unknown, name: unknown): readonly [string, string] => [gt("{count} times", { count: value }), String(name)] as const,
    [gt]
  );

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

export function RunDeathReasonFrequencyChartSkeleton() {
  const gt = useGT();

  return (
    <>
      <SectionHeaderSkeleton title={gt("Reasons why an arcade run ended")} />
      <div className="mx-auto size-86 w-full lg:size-172" />
    </>
  );
}
