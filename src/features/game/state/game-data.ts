// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { gameDataMachine } from "@/features/game/machines/game-data";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";

type GameDataMachineSnapshot = SnapshotFrom<typeof gameDataMachine>;
type GameDataMachineEvent = EventFromLogic<typeof gameDataMachine>;
type GameDataMachineActor = Actor<typeof gameDataMachine>;

// Creates an Atom-owned XState actor reference
const gameDataMachineActorAtom = Atom.make<GameDataMachineActor>((get) => {
  const actor = createActor(gameDataMachine);
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The game data machine is now a living actor inside the effect atom
export const gameDataMachineAtom = Atom.writable<GameDataMachineSnapshot, GameDataMachineEvent>(
  (get) => {
    const actor = get(gameDataMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(gameDataMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);

// Specialized selectors for granular state access and optimized re-renders
export const gameDataSolutionsLanguageAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.solutionsLanguage));
export const gameDataSolutionsAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.solutions));
export const gameDataDictionaryAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.dictionary));
export const gameDataKeypadAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.keypad));
export const gameDataTheSecretWordAtom = gameDataMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theSecretWord));
