// services, features, and other libraries
import { getScoreReadings } from "@/features/high-score/domain/helpers";

// components
import { ScoreHeader } from "./score-header";
import { TurnMetricSection } from "./turn-metric-section";
import { TimeMetricSection } from "./time-metric-section";

// types
import type { ReactNode } from "react";
import type { ScoreReadings } from "@/features/high-score/domain/helpers";

interface SimulatorBodyProps {
  // The two inputs everything else is derived from: the turn the word was guessed
  // on and the seconds it took; the readings are derived here, so both modes hand
  // over the numbers they actually own; the sections resolve the locale and
  // translations they display themselves, so neither is threaded down
  turn: number;
  elapsedSeconds: number;
  // Read-only score reports (the win modal) disable the sliders and omit the
  // change handlers; the interactive simulator listens on both
  isReportingScore: boolean;
  onTurnChange?: (turn: number) => void;
  onElapsedChange?: (seconds: number) => void;
  // Rendered below the two metric sections, and only by the interactive mode,
  // which is the one that needs the score formula spelled out; given the
  // readings this shell already derived rather than the raw inputs, so the
  // footer shows the same numbers as the sections above it without computing
  // them a second time
  footer?: (readings: ScoreReadings) => ReactNode;
}

// Shared shell for both scoring simulator modes
export function SimulatorBody({ turn, elapsedSeconds, isReportingScore, onTurnChange, onElapsedChange, footer }: SimulatorBodyProps) {
  const readings = getScoreReadings(turn, elapsedSeconds);
  const { potentialScore, basePointsPerTurn, speedMultiplier } = readings;

  return (
    <article className="mx-auto grid max-w-4xl gap-6 bg-surface-2 p-3">
      <ScoreHeader isReportingScore={isReportingScore} potentialScore={potentialScore} speedMultiplier={speedMultiplier} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TurnMetricSection currentTurn={turn} basePointsPerTurn={basePointsPerTurn} isReportingScore={isReportingScore} onTurnChange={onTurnChange} />
        <TimeMetricSection
          elapsedSeconds={elapsedSeconds}
          speedMultiplier={speedMultiplier}
          isReportingScore={isReportingScore}
          onElapsedChange={onElapsedChange}
        />
      </div>
      {footer?.(readings)}
    </article>
  );
}
