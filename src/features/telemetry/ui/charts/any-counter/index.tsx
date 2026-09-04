// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { T, useLocale } from "gt-next";
import { anyCounterAtom } from "@/features/telemetry/state";

// components
import { StatPair, StatPairSkeleton } from "@/features/telemetry/ui/charts/stat-pair";

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
  const locale = useLocale();

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
      <StatPair
        title={title}
        personalHeader={personalHeader}
        personal={anyCounter.personal.toLocaleString(locale)}
        globalTitle={<T>Global Total</T>}
        global={anyCounter.global.toLocaleString(locale)}
      />
    ))
    .render();
}

export function AnyCounterChartSkeleton({ title, personalHeader }: Pick<AnyCounterChartProps, "title" | "personalHeader">) {
  return <StatPairSkeleton title={title} personalHeader={personalHeader} globalTitle={<T>Global Total</T>} />;
}
