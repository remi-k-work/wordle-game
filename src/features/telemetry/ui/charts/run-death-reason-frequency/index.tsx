// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { runDeathReasonFrequencyAtom } from "@/features/telemetry/state";
import { Tooltip, Legend, PieChart, Pie, Sector } from "recharts";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader } from "@/ui/section-header";

// types
import type { SolutionsLanguage } from "@/features/game/domain";
import type { PieSectorShapeProps } from "recharts";
import type { RunDeathReasonFrequencyData } from "@/features/telemetry/services/charts-db";

interface RunDeathReasonFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
const COLORS_PERSONAL = { Forfeit: "var(--color-primary)", Guesses: "var(--color-accent)" } as const;
const COLORS_GLOBAL = { Forfeit: "var(--color-secondary)", Guesses: "var(--color-accent)" } as const;

const PieSlicePersonal = (props: PieSectorShapeProps) => <Sector {...props} fill={COLORS_PERSONAL[(props.payload as RunDeathReasonFrequencyData).reason]} />;
const PieSliceGlobal = (props: PieSectorShapeProps) => <Sector {...props} fill={COLORS_GLOBAL[(props.payload as RunDeathReasonFrequencyData).reason]} />;

const CustomLegend = () => (
  <div className="flex flex-col items-center font-sans text-text-2">
    <div className="flex items-center gap-2">
      <div className="size-4 bg-(--color-primary)" />
      Your Runs (Inner)
    </div>
    <div className="flex items-center gap-2">
      <div className="size-4 bg-(--color-secondary)" />
      Global Base (Outer)
    </div>
  </div>
);

export function RunDeathReasonFrequencyChart({ solutionsLanguage }: RunDeathReasonFrequencyChartProps) {
  const runDeathReasonFrequency = useAtomValue(runDeathReasonFrequencyAtom(solutionsLanguage));

  return (
    <>
      <SectionHeader title="Reasons why an arcade run ended" />
      {AsyncResult.builder(runDeathReasonFrequency)
        .onInitialOrWaiting(() => <RunDeathReasonFrequencyChartSkeleton />)
        .onFailure(() => <RunDeathReasonFrequencyChartSkeleton />)
        .onSuccess((runDeathReasonFrequency) => {
          return runDeathReasonFrequency.length === 0 ? (
            <InfoLine message="No frequency data tracked yet!" />
          ) : (
            <PieChart data={runDeathReasonFrequency} responsive className="mx-auto size-96 **:outline-none **:select-none">
              <Tooltip
                formatter={(value, name) => [`${value} times`, name]}
                cursor={{ fill: "var(--color-surface-2)" }}
                contentStyle={{ backgroundColor: "var(--color-surface-1)" }}
                labelStyle={{ fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" }}
                itemStyle={{ color: "var(--color-text-2)" }}
              />
              <Legend content={<CustomLegend />} />

              <Pie dataKey="personal" nameKey="reason" cx="50%" cy="50%" outerRadius="50%" stroke="var(--color-accent)" shape={PieSlicePersonal} label />
              <Pie
                dataKey="global"
                nameKey="reason"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                stroke="var(--color-accent)"
                shape={PieSliceGlobal}
                label
              />
            </PieChart>
          );
        })
        .render()}
    </>
  );
}

export function RunDeathReasonFrequencyChartSkeleton() {
  return (
    <>
      <SectionHeader title="Reasons why an arcade run ended" />
      <div className="mx-auto size-96 animate-pulse bg-accent" />;
    </>
  );
}
