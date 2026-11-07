// components
import { SimulatorBody } from "./simulator-body";

// types
interface ReportModeProps {
  guessedTurn: number;
  timeElapsed: number;
}

export function ReportMode({ guessedTurn, timeElapsed }: ReportModeProps) {
  return <SimulatorBody turn={guessedTurn} elapsedSeconds={timeElapsed} isReportingScore />;
}
