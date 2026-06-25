// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";

// types
import type { AnyActorLogic, Actor, SnapshotFrom, EventFromLogic } from "xstate";

// A reusable factory for any XState machine
export const makeMachineAtom = <TLogic extends AnyActorLogic>(logic: TLogic, options?: Parameters<typeof createActor<TLogic>>[1]) => {
  // Internal Lifecycle Manager
  const actorRefAtom = Atom.make<Actor<TLogic>>((get) => {
    const actor = createActor(logic, options);
    actor.start();

    get.addFinalizer(() => {
      actor.stop();
    });

    return actor;
  }).pipe(Atom.keepAlive);

  // Public Reactive Interface
  const machineAtom = Atom.writable<SnapshotFrom<TLogic>, EventFromLogic<TLogic>>(
    (get) => {
      const actor = get(actorRefAtom);
      const subscription = actor.subscribe((snapshot) => {
        get.setSelf(snapshot);
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

  return machineAtom;
};
