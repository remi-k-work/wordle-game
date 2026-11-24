// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect, Equal, Layer, Option, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { KeyValueStore } from "effect/persistence";
import { createActorAtoms } from "@xstate/effect/atom";
import { createMachineState } from "@/lib/machine-atoms";
import { runSessionMachine } from "@/features/game/machines/run-session";
import { RunSession } from "@/features/game/machines/run-session/models";
import { GameSettings } from "@/features/settings/machines/game-settings/models";

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/machines/run-session/constants";
import { INITIAL_GAME_SETTINGS } from "@/features/settings/machines/game-settings/constants";

// types
import type { RunSession as RunSessionType } from "@/features/game/machines/run-session/models";

const KEY = "@test/runSession";

const persistedRun: RunSessionType = {
  runId: Option.some("00000000-0000-4000-8000-000000000001"),
  createdAt: Option.some(DateTime.nowUnsafe()),
  runScore: 12,
  streak: 2,
  bestRunScore: 42,
  bestStreak: 3,
};

// The machine's real action implementations write to peer machines and RPC
// services; the race under test is in the atom wiring, so every action is a no-op.
const noopActions = {
  clearFinishedRun: () => Effect.void,
  trackStartedNewRun: () => Effect.void,
  saveFinishedRun: () => Effect.void,
  trackForfeitedRun: () => Effect.void,
  onRunFinished: () => Effect.void,
  requestNextWord: () => Effect.void,
  endPuzzle: () => Effect.void,
  forfeitRun: () => Effect.void,
};

// A registry whose scheduled work is queued rather than run on a timer, so a test
// can read before hydration and then drain the queue deterministically
const makeQueueRegistry = () => {
  const tasks: Array<() => void> = [];
  const registry = AtomRegistry.make({
    scheduleTask: (task) => {
      tasks.push(task);
      return () => {};
    },
  });

  const flush = () => {
    for (let round = 0; round < 200; round++) {
      if (tasks.length === 0) return;
      for (const task of tasks.splice(0)) task();
    }
    throw new Error("The atom scheduler did not settle");
  };

  return { registry, flush };
};

// A process-local KVS behind the same runtime the machine uses, so the test can
// seed a persisted value and inspect what the app would actually store
const makeMemoryStore = () => {
  const values = new Map<string, string>();
  const store = KeyValueStore.makeStringOnly({
    get: (key) => Effect.sync(() => values.get(key)),
    set: (key, value) => Effect.sync(() => void values.set(key, value)),
    remove: (key) => Effect.sync(() => void values.delete(key)),
    clear: Effect.sync(() => values.clear()),
    size: Effect.sync(() => values.size),
    keys: Effect.sync(() => Array.from(values.keys())),
  });
  return { store, values };
};

describe("persisted machine hydration", () => {
  it.effect("builds the actor from the persisted run with a synchronous KVS", () =>
    Effect.gen(function* () {
      const { registry, flush } = makeQueueRegistry();
      const { store } = makeMemoryStore();

      // Seed the persisted run before the first read
      yield* KeyValueStore.toSchemaStore(store, RunSession).set(KEY, persistedRun);

      const runtime = Atom.context({ memoMap: Layer.makeMemoMapUnsafe() })(
        Layer.mergeAll(Layer.succeed(KeyValueStore.KeyValueStore, store), Layer.succeed(AtomRegistry.AtomRegistry, registry))
      );

      // The production wiring from `run-session.ts`: a sync KVS read feeds the
      // actor's input, and every snapshot is mirrored back into the same KVS
      const machine = runSessionMachine.provide({ actions: noopActions });
      const runSessionAtom = Atom.kvs({
        runtime,
        key: KEY,
        schema: RunSession,
        defaultValue: () => INITIAL_RUN_SESSION,
      }).pipe(Atom.keepAlive);

      const runSessionMachineBag = Atom.make((get) =>
        createActorAtoms(runtime, machine, { input: get.once(runSessionAtom) })
      ).pipe(Atom.keepAlive);

      const { snapshot } = createMachineState(machine, runSessionMachineBag, {
        onSnapshot: (get, current) => {
          if (!Equal.equals(get.once(runSessionAtom), current.context)) get.set(runSessionAtom, current.context);
        },
      });

      // A synchronous KeyValueStore hydrates during the first read: there is no
      // window where the actor can see the default. (A store that resolves in a
      // later Effect turn would expose one; see the real-runtime test below.)
      expect(registry.get(snapshot).context.runId).toEqual(persistedRun.runId);

      // Let any still-scheduled runtime work settle; the actor must stay persisted
      flush();
      expect(registry.get(snapshot).context.runId).toEqual(persistedRun.runId);

      // Reading the snapshot mirrors it back; the hydrated value must survive
      yield* Effect.sync(() => registry.get(snapshot));
      flush();
      expect(yield* KeyValueStore.toSchemaStore(store, RunSession).get(KEY)).toEqual(Option.some(persistedRun));
    })
  );

  // The minimal harness above isolates the wiring; this one uses the actual
  // RuntimeAtom and the actual `run-session.ts` atoms. `localStorage` is a
  // synchronous store, so the client's first render should already see the
  // persisted run.
  it.live("restores the persisted run through the real app runtime", () => {
    const previousLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

    return Effect.gen(function* () {
      const values = new Map<string, string>();
      const storage = {
        get length() {
          return values.size;
        },
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        key: (index: number) => Array.from(values.keys())[index] ?? null,
        removeItem: (key: string) => void values.delete(key),
        setItem: (key: string, value: string) => void values.set(key, String(value)),
      } as Storage;

      Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });

      const jsonSchema = Schema.fromJsonString(Schema.toCodecJson(RunSession));
      const encoded = yield* Schema.encodeEffect(jsonSchema)(persistedRun);
      values.set("@wordle/runSession", encoded);

      const persistedSettings = { ...INITIAL_GAME_SETTINGS, solutionsLanguage: "Pl" } as const;
      const settingsSchema = Schema.fromJsonString(Schema.toCodecJson(GameSettings));
      values.set("@wordle/gameSettings", yield* Schema.encodeEffect(settingsSchema)(persistedSettings));

      // Imports run after the storage is in place; the runtime and its KVS layer
      // are still lazy, so no read has happened yet
      const { sharedAtomRegistry } = yield* Effect.promise(() => import("@/ui/atom-registry-provider"));
      const { runSessionMachineAtom } = yield* Effect.promise(() => import("@/features/game/state/run-session"));
      const { gameSettingsSolutionsLanguageAtom } = yield* Effect.promise(() => import("@/features/settings/state/game-settings"));

      const first = sharedAtomRegistry.get(runSessionMachineAtom);
      expect(first.context.runId).toEqual(persistedRun.runId);

      // Settings hydrate from the same synchronous store, so a load that reads
      // the language on its first turn never sees the default
      expect(sharedAtomRegistry.get(gameSettingsSolutionsLanguageAtom)).toBe("Pl");

      // Give any deferred runtime work a chance to run, then read again (which
      // is also what mirrors the snapshot back into the KVS)
      yield* Effect.sleep(50);
      const second = sharedAtomRegistry.get(runSessionMachineAtom);
      expect(second.context.runId).toEqual(persistedRun.runId);
      expect(values.get("@wordle/runSession")).toBe(encoded);
      expect(sharedAtomRegistry.get(gameSettingsSolutionsLanguageAtom)).toBe("Pl");
    }).pipe(
      Effect.ensuring(
        Effect.sync(() => {
          if (previousLocalStorage) Object.defineProperty(globalThis, "localStorage", previousLocalStorage);
          else Reflect.deleteProperty(globalThis, "localStorage");
        })
      )
    );
  });
});
