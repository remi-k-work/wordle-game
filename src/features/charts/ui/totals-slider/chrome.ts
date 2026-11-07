// services, features, and other libraries
import { cn } from "@/lib/utils";

// Carousel chrome shared by the live `TotalsSlider` and its `TotalsSliderSkeleton`
export const TOTALS_SLIDER_CLASSES = cn(
  "grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-4 bg-surface-3 [grid-template-areas:'viewport_viewport''prevnext_dots']"
);
export const TOTALS_VIEWPORT_CLASSES = cn("overflow-hidden select-none [grid-area:viewport]");
export const TOTALS_SLIDE_ROW_CLASSES = cn("-ms-4 flex touch-pan-y touch-pinch-zoom");
export const TOTALS_CONTROLS_CLASSES = cn("flex items-center gap-4 p-2 [grid-area:prevnext]");
export const TOTALS_DOTS_CLASSES = cn("flex flex-wrap items-center justify-end gap-1 p-2 [grid-area:dots]");
