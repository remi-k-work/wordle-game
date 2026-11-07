// services, features, and other libraries
import { cn } from "@/lib/utils";

// assets
import { FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentType, ReactNode } from "react";

interface RunStatCellProps {
  label: ReactNode;
  surface: keyof typeof RUN_STAT_SURFACES;
  tone: RunStatTone;
  children: ReactNode;
}

// Which of the two run figures a cell reports
type RunStatTone = "score" | "streak";

// The icon and value colour each tone is drawn with
const RUN_STAT_TONES: Record<RunStatTone, { Icon: ComponentType<{ className?: string }>; valueClassName: string }> = {
  score: { Icon: TrophyIcon, valueClassName: "text-accent" },
  streak: { Icon: FireIcon, valueClassName: "text-destructive" },
};

// The two surfaces the four cells alternate between, so neighbouring cells stay distinguishable
const RUN_STAT_SURFACES = { "surface-2": cn("bg-surface-2 p-3"), "surface-3": cn("bg-surface-3 p-3") } as const;

// One titled cell of the run-score grid: heading, surfaced background, and an icon paired with the value
export function RunStatCell({ label, surface, tone, children }: RunStatCellProps) {
  const { Icon, valueClassName } = RUN_STAT_TONES[tone];

  return (
    <div className={RUN_STAT_SURFACES[surface]}>
      <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">{label}</h3>
      <span className={cn("flex items-center justify-center gap-1 text-3xl font-semibold wrap-anywhere", valueClassName)}>
        <Icon className="size-7" />
        {children}
      </span>
    </div>
  );
}
