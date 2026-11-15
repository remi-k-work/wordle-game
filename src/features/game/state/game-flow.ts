// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { gameFlowMachine } from "@/features/game/machines/game-flow";
import { runSessionMachineAtom } from "@/features/game/state/run-session";
import { RuntimeAtom } from "@/lib/runtime-client";
import { createMachineState } from "@/lib/machine-atoms";

const gameFlowMachineBag = Atom.make((get) =>
  createActorAtoms(RuntimeAtom, gameFlowMachine, { input: { hasActiveRun: get.once(runSessionMachineAtom).matches("active") } })
).pipe(Atom.keepAlive);
export const { snapshot: gameFlowMachineAtom, send: gameFlowMachineSendAtom } = createMachineState(gameFlowMachine, gameFlowMachineBag);
