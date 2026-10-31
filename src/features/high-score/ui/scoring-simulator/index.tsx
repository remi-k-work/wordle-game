// components
import { InteractiveMode } from "./interactive-mode";
import { ReportMode } from "./report-mode";

// types
interface ScoringSimulatorProps {
  guessedTurn?: number;
  timeElapsed?: number;
}

// Branches between the two modes: live simulation owns state; score report is a pure read of props
export function ScoringSimulator({ guessedTurn, timeElapsed }: ScoringSimulatorProps) {
  if (guessedTurn === undefined || timeElapsed === undefined) return <InteractiveMode />;
  return <ReportMode guessedTurn={guessedTurn} timeElapsed={timeElapsed} />;
}
