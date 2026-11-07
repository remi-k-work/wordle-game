// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Progress } from "@base-ui/react/progress";

// types
interface ScoreProgressBarProps {
  // `null` is the indeterminate state the skeletons use — base-ui renders the
  // track unfilled rather than dropping the bar out of the layout
  value: number | null;
  // `lg` for the score report's tall bar, `sm` (default) for the game header's thin one
  size?: keyof typeof TRACK_CLASSES;
}

// constants
const TRACK_RAMP_CLASSES = cn("overflow-hidden rounded-sm border bg-linear-to-r from-destructive via-tile-yellow to-tile-green");
const TRACK_CLASSES = { sm: cn(TRACK_RAMP_CLASSES, "h-2"), lg: cn(TRACK_RAMP_CLASSES, "h-9") } as const;
const INDICATOR_CLASSES = cn("bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 opacity-75 transition-[width] duration-1000 ease-in-out");

export function ScoreProgressBar({ value, size = "sm" }: ScoreProgressBarProps) {
  return (
    <Progress.Root className="grid w-full" value={value}>
      <Progress.Track className={TRACK_CLASSES[size]}>
        <Progress.Indicator className={INDICATOR_CLASSES} />
      </Progress.Track>
    </Progress.Root>
  );
}
