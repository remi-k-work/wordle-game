/* eslint-disable @typescript-eslint/no-explicit-any */

// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";

// types
import type { AnyActorLogic, Actor, AnyStateMachine, ContextFrom, EventFromLogic, SnapshotFrom } from "xstate";

// Creates a keep-alive actor Atom that automatically starts and stops the actor (actor lifecycle management)
const makeActorRefAtom = <TLogic extends AnyActorLogic>(create: () => Actor<TLogic>) =>
  Atom.make<Actor<TLogic>>((get) => {
    const actor = create();
    actor.start();

    get.addFinalizer(() => {
      actor.stop();
    });

    return actor;
  }).pipe(Atom.keepAlive);

// Wraps an actor in a writable Atom that stays synchronized with actor snapshots (actor ↔ Atom synchronization)
const makeMachineAtomInternal = <TLogic extends AnyActorLogic>(
  actorRefAtom: Atom.Atom<Actor<TLogic>>,
  onSnapshot?: (get: Parameters<Parameters<typeof Atom.writable>[0]>[0], snapshot: SnapshotFrom<TLogic>) => void
) =>
  Atom.writable<SnapshotFrom<TLogic>, EventFromLogic<TLogic>>(
    (get) => {
      const actor = get(actorRefAtom);

      const subscription = actor.subscribe((snapshot) => {
        get.setSelf(snapshot);
        onSnapshot?.(get, snapshot);
      });

      get.addFinalizer(() => {
        subscription.unsubscribe();
      });

      return actor.getSnapshot();
    },
    (ctx, event) => {
      ctx.get(actorRefAtom).send(event);
    }
  ).pipe(Atom.keepAlive);

// A reusable factory for any XState machine
export const makeMachineAtom = <TLogic extends AnyActorLogic>(logic: TLogic, options?: Parameters<typeof createActor<TLogic>>[1]) => {
  const actorRefAtom = makeActorRefAtom(() => createActor(logic, options));

  return makeMachineAtomInternal(actorRefAtom);
};

// A factory for an XState machine that syncs a portion of its context to a KVS Atom
export const makePersistentMachineAtom = <TLogic extends AnyStateMachine, TKVS>(
  logic: TLogic,
  kvsAtom: Atom.Writable<TKVS, TKVS>,
  persistContext: (context: ContextFrom<TLogic>) => TKVS,
  options?: Parameters<typeof createActor<TLogic>>[1]
) => {
  const actorRefAtom = Atom.make<Actor<TLogic>>((get) => {
    // Read persisted state from storage
    const persistedState = get(kvsAtom);

    // Merge persisted data into machine input
    const actorOptions = { ...options, input: { ...((options?.input as object) ?? {}), ...(persistedState as object) } } as Parameters<
      typeof createActor<TLogic>
    >[1];

    const actor = createActor(logic, actorOptions);
    actor.start();

    get.addFinalizer(() => {
      actor.stop();
    });

    return actor;
  }).pipe(Atom.keepAlive);

  return makeMachineAtomInternal(actorRefAtom, (get, snapshot) => {
    // SnapshotFrom<TLogic> currently loses context typing in some XState cases
    const context = (snapshot as any).context as ContextFrom<TLogic>;

    get.set(kvsAtom, persistContext(context));
  });
};
