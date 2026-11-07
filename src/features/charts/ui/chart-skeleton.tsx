// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { SectionHeaderSkeleton } from "@/ui/section-header";

// types
interface ChartSkeletonProps {
  title: string;
}

// constants
const CHART_SKELETON_CLASS = cn("h-96 w-full lg:h-192");

// The loading silhouette a chart shows while its rows resolve
export function ChartSkeleton({ title }: ChartSkeletonProps) {
  return (
    <>
      <SectionHeaderSkeleton title={title} />
      <div className={CHART_SKELETON_CLASS} />
    </>
  );
}
