// services, features, and other libraries
import { gameFlowMachine } from "@/features/game/machines/game-flow";
import { runSessionMachineAtom } from "@/features/game/state";
import { createMachineAtom } from "@/lib/machine-atom";

// The game flow machine is now a living actor inside the effect atom
export const gameFlowMachineAtom = createMachineAtom(gameFlowMachine, {
  input: (get) => ({ hasActiveRun: get.once(runSessionMachineAtom).matches("active") }),
});
