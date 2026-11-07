// services, features, and other libraries
import { T, useMessages } from "gt-react";
import { useLocale } from "gt-tanstack-start";
import { potentialScoreAsPercentage } from "@/features/game/domain/helpers";
import { speedMultiplierToCategoryMessage } from "@/features/game/domain/formatters";

// components
import { ScoreProgressBar } from "@/ui/score-progress-bar";

// types
interface ScoreHeaderProps {
  isReportingScore: boolean;
  potentialScore: number;
  speedMultiplier: number;
}

// Formats the one number it shows, so the locale is read here rather than threaded down from the shared body that renders it
export function ScoreHeader({ isReportingScore, potentialScore, speedMultiplier }: ScoreHeaderProps) {
  const messages = useMessages();
  const locale = useLocale();

  return (
    <header className="grid place-items-center gap-3 rounded-md border border-accent bg-surface-1 p-3">
      <h3 className="font-sans text-2xl font-semibold tracking-widest text-accent uppercase">
        {isReportingScore ? <T>Final Word Score</T> : <T>Live Potential</T>}
      </h3>
      <span className="text-3xl font-semibold tabular-nums sm:text-4xl">{potentialScore.toLocaleString(locale)}</span>
      <span className="text-xl font-semibold text-text-2 sm:text-2xl">{messages(speedMultiplierToCategoryMessage(speedMultiplier))}</span>
      <ScoreProgressBar value={potentialScoreAsPercentage(potentialScore)} size="lg" />
    </header>
  );
}
