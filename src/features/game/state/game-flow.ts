// services, features, and other libraries
import { gameFlowMachine } from "@/features/game/machines/game-flow";
import { runSessionMachineAtom } from "@/features/game/state/run-session";
import { createMachineAtom } from "@/domain/machine-atom";

// The game flow machine is now a living actor inside the effect atom
export const gameFlowMachineAtom = createMachineAtom(gameFlowMachine, {
  input: (get) => ({ hasActiveRun: get.once(runSessionMachineAtom).matches("active") }),
});
