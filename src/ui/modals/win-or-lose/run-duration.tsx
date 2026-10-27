// react
import { useEffect, useState } from "react";

// services, features, and other libraries
import { DateTime, Option } from "effect";
import { T } from "gt-react";
import { formatDuration } from "@/domain/formatters";

// assets
import { ClockIcon } from "@heroicons/react/24/outline";

// types
interface RunDurationSectionProps {
  createdAt: Option.Option<DateTime.DateTime>;
  finishedAt: Option.Option<DateTime.DateTime>;
  isLive: boolean;
}

// A live run ends "now" (ticking every second); a finished run freezes at its
// recorded end. The 1 Hz clock is isolated here so a live run re-renders only
// this section, not the whole stat grid
export function RunDurationSection({ createdAt, finishedAt, isLive }: RunDurationSectionProps) {
  const [now, setNow] = useState(DateTime.nowUnsafe);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setNow(DateTime.nowUnsafe());
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  const runFinishedAt = isLive ? now : Option.getOrElse(finishedAt, () => now);
  const runStartedAt = Option.getOrElse(createdAt, () => runFinishedAt);
  const runDuration = DateTime.distance(runStartedAt, runFinishedAt);

  return (
    <div className="col-span-2 p-3">
      <h3 className="max-w-none font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
        <T>Run Duration</T>
      </h3>
      <div className="flex items-center justify-center gap-1">
        <ClockIcon className="size-9" />
        <span className="font-sans text-4xl font-semibold wrap-anywhere tabular-nums">{formatDuration(runDuration)}</span>
      </div>
    </div>
  );
}
