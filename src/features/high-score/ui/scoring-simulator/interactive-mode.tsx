// react
import { useState } from "react";

// components
import { SimulatorBody } from "./simulator-body";
import { ScoreFormulaFooter } from "./score-formula-footer";

// The time slider cannot produce anything below five seconds (see
// `TimeMetricSection`), so the live state starts on a value the control can
// actually reach — seeding 0 would show a duration no drag could ever return to
const INITIAL_ELAPSED_SECONDS = 5;

export function InteractiveMode() {
  const [interactiveTurn, setInteractiveTurn] = useState(1);
  const [interactiveElapsed, setInteractiveElapsed] = useState(INITIAL_ELAPSED_SECONDS);

  return (
    <SimulatorBody
      turn={interactiveTurn}
      elapsedSeconds={interactiveElapsed}
      isReportingScore={false}
      onTurnChange={setInteractiveTurn}
      onElapsedChange={setInteractiveElapsed}
      footer={(readings) => <ScoreFormulaFooter basePointsPerTurn={readings.basePointsPerTurn} speedMultiplier={readings.speedMultiplier} />}
    />
  );
}
