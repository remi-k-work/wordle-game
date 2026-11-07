// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { useLocale } from "gt-tanstack-start";
import { anyCounterAtom } from "@/features/charts/state/charts";

// components
import { AnyCounterChartSkeleton } from "./skeleton";
import { StatPair } from "@/features/charts/ui/stat-pair";
import { StatSection } from "@/features/charts/ui/stat-section";

// constants
import { GLOBAL_HEADER } from "./copy";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";
import type { AnyCounterArgs } from "@/features/charts/domain/models";

interface AnyCounterChartProps {
  counterName: AnyCounterArgs["counterName"];
  solutionsLanguage: SolutionsLanguage;
  title: string;
  personalHeader: string;
}

export function AnyCounterChart({ counterName, solutionsLanguage, title, personalHeader }: AnyCounterChartProps) {
  const anyCounter = useAtomValue(anyCounterAtom({ counterName, solutionsLanguage }));
  const locale = useLocale();

  return (
    <StatSection result={anyCounter} skeleton={<AnyCounterChartSkeleton title={title} personalHeader={personalHeader} />}>
      {(counter) => (
        <StatPair
          title={title}
          personalHeader={personalHeader}
          personal={counter.personal.toLocaleString(locale)}
          globalHeader={GLOBAL_HEADER}
          global={counter.global.toLocaleString(locale)}
        />
      )}
    </StatSection>
  );
}

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle the Effect client runtime this chart atom pulls in; imported
// here for the waiting/failure states and re-exported so the public API is
// unchanged
export { AnyCounterChartSkeleton };
