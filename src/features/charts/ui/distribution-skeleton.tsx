// components
import { SectionHeaderSkeleton } from "@/ui/section-header";

// The recharts-free half of the distribution shell: the loading placeholder shown
// while a distribution chart's atom resolves. Split out of distribution-shell
// (whose frame embeds recharts) so route-level Suspense fallbacks never statically
// bundle recharts
export function DistributionSkeleton({ title }: { title: string }) {
  return (
    <>
      <SectionHeaderSkeleton title={title} />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
