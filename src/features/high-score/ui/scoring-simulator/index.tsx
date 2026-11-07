// components
import { InteractiveMode } from "./interactive-mode";
import { ReportMode } from "./report-mode";

// The live simulation and the read-only score report are two different UI concepts
type ScoringSimulatorProps = { mode: "interactive" } | { mode: "report"; guessedTurn: number; timeElapsed: number };

export function ScoringSimulator(props: ScoringSimulatorProps) {
  if (props.mode === "interactive") return <InteractiveMode />;
  return <ReportMode guessedTurn={props.guessedTurn} timeElapsed={props.timeElapsed} />;
}
