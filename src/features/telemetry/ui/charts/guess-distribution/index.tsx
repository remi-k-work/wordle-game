// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtom } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { getGuessDistributionsAction } from "@/features/telemetry/state";
import { Bar, XAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from "recharts";

// components
import { InfoLine } from "@/ui/shared/info-line";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface GuessDistributionChartProps {
  solutionsLanguage: SolutionsLanguage;
}

export function GuessDistributionChart({ solutionsLanguage }: GuessDistributionChartProps) {
  const [getGuessDistributionsResult, getGuessDistributions] = useAtom(getGuessDistributionsAction);

  useEffect(() => {
    getGuessDistributions();
  }, [getGuessDistributions]);

  return AsyncResult.builder(getGuessDistributionsResult)
    .onInitialOrWaiting(() => null)
    .onFailure(() => null)
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

          <Line type="monotone" dataKey="globalPct" stroke="var(--color-accent)" strokeWidth={4} />
          <Bar dataKey="personalPct" stroke="var(--color-accent)" fill="var(--color-secondary)" radius={[9, 9, 0, 0]} />
        </ComposedChart>
      );
    })
    .render();
}
