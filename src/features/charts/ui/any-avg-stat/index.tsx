// services, features, and other libraries
import { useLocale } from "gt-tanstack-start";
import { useAtomValue } from "@effect/atom-react";
import { anyAvgStatAtom } from "@/features/charts/state/charts";
import { formatSeconds } from "@/domain/formatters";

// components
import { AnyAvgStatChartSkeleton } from "./skeleton";
import { StatPair } from "@/features/charts/ui/stat-pair";
import { StatSection } from "@/features/charts/ui/stat-section";

// constants
import { GLOBAL_HEADER } from "./copy";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";
import type { AnyAvgStatArgs } from "@/features/charts/domain/models";

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

  return (
    <StatSection result={anyAvgStat} skeleton={<AnyAvgStatChartSkeleton title={title} personalHeader={personalHeader} />}>
      {(anyAvgStat) => (
        <StatPair
          title={title}
          personalHeader={personalHeader}
          personal={formatStatValue(anyAvgStat.personal)}
          globalHeader={GLOBAL_HEADER}
          global={formatStatValue(anyAvgStat.global)}
        />
      )}
    </StatSection>
  );
}

// The skeleton lives in ./skeleton so route-level Suspense fallbacks never
// statically bundle the Effect client runtime this chart atom pulls in; imported
// here for the waiting/failure states and re-exported so the public API is
// unchanged
export { AnyAvgStatChartSkeleton };
