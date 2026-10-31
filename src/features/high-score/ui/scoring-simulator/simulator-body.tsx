// components
import { ScoreHeader } from "./score-header";
import { TurnMetricSection } from "./turn-metric-section";
import { TimeMetricSection } from "./time-metric-section";

// types
interface SimulatorBodyProps {
  isReportingScore: boolean;
  potentialScore: number;
  speedMultiplier: number;
  locale: string;
  currentTurn: number;
  basePointsPerTurn: number;
  elapsedSeconds: number;
  ariaLabelTurn: string;
  ariaLabelTime: string;
  onTurnChange?: (turn: number) => void;
  onElapsedChange?: (seconds: number) => void;
  children?: React.ReactNode;
}

// Shared shell for both scoring simulator modes: the article wrapper, score header,
// and the two metric sections; interactive mode passes change handlers and renders
// the formula footer as children; report mode is read-only and omits both
export function SimulatorBody({
  isReportingScore,
  potentialScore,
  speedMultiplier,
  locale,
  currentTurn,
  basePointsPerTurn,
  elapsedSeconds,
  ariaLabelTurn,
  ariaLabelTime,
  onTurnChange,
  onElapsedChange,
  children,
}: SimulatorBodyProps) {
  return (
    <article className="mx-auto grid max-w-4xl gap-6 bg-surface-2 p-3">
      <ScoreHeader isReportingScore={isReportingScore} potentialScore={potentialScore} speedMultiplier={speedMultiplier} locale={locale} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TurnMetricSection
          currentTurn={currentTurn}
          basePointsPerTurn={basePointsPerTurn}
          isReportingScore={isReportingScore}
          locale={locale}
          ariaLabel={ariaLabelTurn}
          onTurnChange={onTurnChange}
        />
        <TimeMetricSection
          elapsedSeconds={elapsedSeconds}
          speedMultiplier={speedMultiplier}
          isReportingScore={isReportingScore}
          ariaLabel={ariaLabelTime}
          onElapsedChange={onElapsedChange}
        />
      </div>
      {children}
    </article>
  );
}
