// services, features, and other libraries
import { T, useMessages } from "gt-react";
import { potentialScoreAsPercentage } from "@/features/game/domain/helpers";
import { speedMultiplierToCategoryMessage } from "@/features/game/domain/formatters";

// components
import { Progress } from "@base-ui/react/progress";

// types
interface ScoreHeaderProps {
  isReportingScore: boolean;
  potentialScore: number;
  speedMultiplier: number;
  locale: string;
}

export function ScoreHeader({ isReportingScore, potentialScore, speedMultiplier, locale }: ScoreHeaderProps) {
  const messages = useMessages();

  return (
    <header className="grid place-items-center gap-3 rounded-md border border-accent bg-surface-1 p-3">
      <h3 className="font-sans text-2xl font-semibold tracking-widest text-accent uppercase">
        {isReportingScore ? <T>Final Word Score</T> : <T>Live Potential</T>}
      </h3>
      <span className="text-3xl font-semibold tabular-nums sm:text-4xl">{potentialScore.toLocaleString(locale)}</span>
      <span className="text-xl font-semibold text-text-2 sm:text-2xl">{messages(speedMultiplierToCategoryMessage(speedMultiplier))}</span>
      <Progress.Root className="grid w-full" value={potentialScoreAsPercentage(potentialScore)}>
        <Progress.Track className="h-9 overflow-hidden rounded-sm border bg-linear-to-r from-destructive via-tile-yellow to-tile-green">
          <Progress.Indicator className="bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 opacity-75 transition-[width] duration-1000 ease-in-out" />
        </Progress.Track>
      </Progress.Root>
    </header>
  );
}
