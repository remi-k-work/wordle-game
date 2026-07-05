// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcGameClient } from "@/features/game/rpc/client";
import { solutionsLanguageAtom } from "@/features/settings/state";
import { wordChallengeTheSecretWordAtom } from ".";
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

// This reactive atom purely exists to bridge the language selection to the loader machine
export const loaderBootstrapperAtom = Atom.make((get) => {
  const solutionsLanguage = get(solutionsLanguageAtom);
  get.set(gameDataMachineAtom, { type: "loadRequested", solutionsLanguage });
}).pipe(Atom.keepAlive);

// Effectful atom that reactively fetches a riddle whenever the secret word or language changes
export const riddleAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    yield* Effect.sleep("3 seconds");

    const theSecretWord = get(wordChallengeTheSecretWordAtom);
    const solutionsLanguage = get(solutionsLanguageAtom);

    const { fetchRiddle } = yield* RpcGameClient;
    return yield* fetchRiddle({ theSecretWord, solutionsLanguage });
  })
).pipe(Atom.keepAlive);

// Effectful atom that reactively fetches the secret word definition
export const wordDefinitionAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* () {
    const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
    const theSecretWord = yield* Atom.get(wordChallengeTheSecretWordAtom);

    const { wordDefinition } = yield* RpcGameClient;
    return yield* wordDefinition({ solutionsLanguage, theSecretWord });
  })
);
