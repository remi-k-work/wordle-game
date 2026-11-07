// components
import { StatPairSkeleton } from "@/features/charts/ui/stat-pair";

// constants
import { GLOBAL_HEADER } from "./copy";

// types
interface AnyCounterChartSkeletonProps {
  // Already-registered gt message handles, resolved inside `StatPairSkeleton` —
  // the same one resolution point the live chart's skeleton has always used
  title: string;
  personalHeader: string;
}

// The loading placeholder for the counter chart; lives apart from the live
// chart — whose module resolves `anyCounterAtom`, and through it the Effect
// client runtime — so route-level Suspense fallbacks (e.g. the totals slider's)
// stay in the same lean, runtime-free chunk every other chart family's skeleton
// already gives them
export function AnyCounterChartSkeleton({ title, personalHeader }: AnyCounterChartSkeletonProps) {
  return <StatPairSkeleton title={title} personalHeader={personalHeader} globalHeader={GLOBAL_HEADER} />;
}
