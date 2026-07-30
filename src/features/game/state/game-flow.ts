// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { gameFlowMachine } from "@/features/game/machines/game-flow";
import { runSessionMachineAtom } from "@/features/game/state";
import { inspect } from "@/machines/inspect";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";

type GameFlowMachineSnapshot = SnapshotFrom<typeof gameFlowMachine>;
type GameFlowMachineEvent = EventFromLogic<typeof gameFlowMachine>;
type GameFlowMachineActor = Actor<typeof gameFlowMachine>;

// Creates an Atom-owned XState actor reference
const gameFlowMachineActorAtom = Atom.make<GameFlowMachineActor>((get) => {
  const runSessionSnapshot = get.once(runSessionMachineAtom);
  const actor = createActor(gameFlowMachine, { input: { hasActiveRun: runSessionSnapshot.matches("active") }, inspect });
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The game flow machine is now a living actor inside the effect atom
export const gameFlowMachineAtom = Atom.writable<GameFlowMachineSnapshot, GameFlowMachineEvent>(
  (get) => {
    const actor = get(gameFlowMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(gameFlowMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);
