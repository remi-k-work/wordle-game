// services, features, and other libraries
import { useScoreReadings } from "@/features/high-score/hooks/use-score-readings";

// components
import { SimulatorBody } from "./simulator-body";

// types
interface ReportModeProps {
  guessedTurn: number;
  timeElapsed: number;
}

// Report mode: purely presentational, derives everything from props, no state, no interactive sliders
// The metric sections render (sliders disabled) so the turn, time, and speed multiplier stay visible
// in read-only score reports such as the win modal
export function ReportMode({ guessedTurn, timeElapsed }: ReportModeProps) {
  const { potentialScore, basePointsPerTurn, speedMultiplier, gt, locale } = useScoreReadings(guessedTurn, timeElapsed);

  return (
    <SimulatorBody
      isReportingScore={true}
      potentialScore={potentialScore}
      speedMultiplier={speedMultiplier}
      locale={locale}
      currentTurn={guessedTurn}
      basePointsPerTurn={basePointsPerTurn}
      elapsedSeconds={timeElapsed}
      ariaLabelTurn={gt("Turn Guessed")}
      ariaLabelTime={gt("Time Elapsed")}
    />
  );
}
