// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { guessDistributionsAtom } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from "recharts";

// components
import { InfoLine } from "@/ui/shared/info-line";
import { SectionHeader } from "@/ui/section-header";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface GuessDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

function GuessDistributionChart({ solutionsLanguage }: GuessDistributionChartProps) {
  const guessDistributions = useAtomValue(guessDistributionsAtom);

  return AsyncResult.builder(guessDistributions)
    .onInitialOrWaiting(() => <GuessDistributionChartSkeleton />)
    .onFailure(() => <GuessDistributionChartSkeleton />)
    .onSuccess((guessDistributionsData) => {
      const guessDistributionData = guessDistributionsData[solutionsLanguage === "En" ? 0 : 1];

      return guessDistributionData.length === 0 ? (
        <InfoLine message="No Guesses yet!" />
      ) : (
        <ComposedChart data={guessDistributionData} responsive className="h-96 w-full **:outline-none **:select-none">
          <CartesianGrid stroke="var(--color-surface-3)" />

          <XAxis dataKey="turn" tickFormatter={(tick) => `Turn ${tick}`} stroke="var(--color-text-1)" />

          <Tooltip
            formatter={(value, name) => [`${value}%`, name === "personalPct" ? "Your Guesses" : "Global Average"]}
            labelFormatter={(label) => `Turn: ${label}`}
            cursor={{ fill: "var(--color-surface-2)" }}
            contentStyle={{ backgroundColor: "var(--color-surface-1)" }}
            labelStyle={{ fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" }}
            itemStyle={{ color: "var(--color-text-2)" }}
          />
          <Legend
            formatter={(value) => (value === "personalPct" ? "Your Guesses" : "Global Average")}
            labelStyle={{ fontFamily: "var(--font-sans)", color: "var(--color-text-2)" }}
          />

          <Bar dataKey="personalPct" stroke="var(--color-accent)" fill="var(--color-primary)" radius={[9, 9, 0, 0]} />
          <Line type="monotone" dataKey="globalPct" stroke="var(--color-secondary)" strokeWidth={4} />
        </ComposedChart>
      );
    })
    .render();
}

function GuessDistributionChartSkeleton() {
  return <div className="h-96 w-full animate-pulse bg-accent" />;
}

export function GuessDistributionCharts() {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Distribution of guesses needed to win a game
              <UsFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <GuessDistributionChart solutionsLanguage="En" />
      </div>
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Distribution of guesses needed to win a game
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <GuessDistributionChart solutionsLanguage="Pl" />
      </div>
    </section>
  );
}

export function GuessDistributionChartsSkeleton() {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Distribution of guesses needed to win a game
              <UsFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <GuessDistributionChartSkeleton />
      </div>
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              Distribution of guesses needed to win a game
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <GuessDistributionChartSkeleton />
      </div>
    </section>
  );
}
