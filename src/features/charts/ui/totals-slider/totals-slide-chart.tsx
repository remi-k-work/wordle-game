// components
import { AnyAvgStatChart } from "@/features/charts/ui/any-avg-stat";
import { AnyCounterChart } from "@/features/charts/ui/any-counter";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";
import type { TotalsSlideSpec } from "./constants";

interface TotalsSlideChartProps {
  spec: TotalsSlideSpec;
  solutionsLanguage: SolutionsLanguage;
}

// Hoisted to module scope (outside `TotalsSlider`) so its component identity is
// stable across re-renders; defining it inside `TotalsSlider` would recreate
// `TotalsSlideChart` on every render (e.g. carousel selection changes),
// remounting every slide's chart subtree — including recharts and AsyncResult
// data hooks — whenever the slider re-renders
export function TotalsSlideChart({ spec, solutionsLanguage }: TotalsSlideChartProps) {
  if (spec.kind === "counter")
    return <AnyCounterChart counterName={spec.counterName} solutionsLanguage={solutionsLanguage} title={spec.title} personalHeader={spec.personalHeader} />;

  return (
    <AnyAvgStatChart
      statColumn={spec.statColumn}
      statTable={spec.statTable}
      solutionsLanguage={solutionsLanguage}
      title={spec.title}
      personalHeader={spec.personalHeader}
    />
  );
}
