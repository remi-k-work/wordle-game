// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { HorizontalBarSkeleton } from "@/features/telemetry/ui/charts/horizontal-bar-skeleton";

// The loading placeholder for the opening guesses frequency tab. Lives apart from
// the chart itself (whose module embeds recharts) so route-level Suspense fallbacks
// never statically bundle recharts
export function OpeningGuessesFrequencyChartSkeleton() {
  const gt = useGT();

  return <HorizontalBarSkeleton title={gt("First word guessed in a game")} />;
}
