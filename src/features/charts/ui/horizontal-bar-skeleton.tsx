// components
import { SectionHeaderSkeleton } from "@/ui/section-header";

// The recharts-free half of the horizontal-bar shell: the loading placeholder shown
// while a frequency/leaderboard chart's atom resolves. Split out of
// horizontal-bar-shell (whose frame embeds recharts) so route-level Suspense
// fallbacks never statically bundle recharts
export function HorizontalBarSkeleton({ title }: { title: string }) {
  return (
    <>
      <SectionHeaderSkeleton title={title} />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
