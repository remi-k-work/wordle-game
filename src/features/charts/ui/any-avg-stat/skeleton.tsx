// components
import { StatPairSkeleton } from "@/features/charts/ui/stat-pair";

// constants
import { GLOBAL_HEADER } from "./copy";

// types
interface AnyAvgStatChartSkeletonProps {
  // Already-registered gt message handles, resolved inside `StatPairSkeleton` —
  // the same one resolution point the live chart's skeleton has always used
  title: string;
  personalHeader: string;
}

// The loading placeholder for the average-stat chart; lives apart from the live
// chart — whose module resolves `anyAvgStatAtom`, and through it the Effect
// client runtime — so route-level Suspense fallbacks (e.g. the totals slider's)
// stay in the same lean, runtime-free chunk every other chart family's skeleton
// already gives them
export function AnyAvgStatChartSkeleton({ title, personalHeader }: AnyAvgStatChartSkeletonProps) {
  return <StatPairSkeleton title={title} personalHeader={personalHeader} globalHeader={GLOBAL_HEADER} />;
}
