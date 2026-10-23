// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { SectionHeaderSkeleton } from "@/ui/section-header";

// The loading placeholder for the run death reason frequency tab. Lives apart from
// the chart itself (whose module embeds recharts) so route-level Suspense fallbacks
// never statically bundle recharts
export function RunDeathReasonFrequencyChartSkeleton() {
  const gt = useGT();

  return (
    <>
      <SectionHeaderSkeleton title={gt("Reasons why an arcade run ended")} />
      <div className="mx-auto size-86 w-full lg:size-172" />
    </>
  );
}
