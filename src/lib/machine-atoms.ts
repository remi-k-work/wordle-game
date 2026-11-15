// services, features, and other libraries
import { AsyncResult, Atom } from "effect/reactivity";

// types
import type { AnyStateMachine, EventFromLogic, SnapshotFrom } from "xstate";
import type { ActorAtoms } from "@xstate/effect/atom";

// Projects an actor bag's AsyncResult snapshot into the plain snapshot the app's state layer exposes
// before the actor settles (and on failure) this falls back to the machine's initial snapshot
export const toSnapshotAtom = <M extends AnyStateMachine, E>(
  machine: M,
  source: Atom.Atom<AsyncResult.AsyncResult<SnapshotFrom<M>, E>>
): Atom.Atom<SnapshotFrom<M>> =>
  source.pipe(
    Atom.map((result) => (AsyncResult.isSuccess(result) ? result.value : machine.getInitialSnapshot(undefined, undefined))),
    Atom.keepAlive
  );

// Wraps a lazily-built actor bag (the peer-atom-derived input case) in the same writable snapshot/event surface as an eagerly built native `bag.send`
export const toSendAtom = <M extends AnyStateMachine>(
  snapshot: Atom.Atom<SnapshotFrom<M>>,
  bag: Atom.Atom<ActorAtoms<M, never>>
): Atom.Writable<SnapshotFrom<M>, EventFromLogic<M>> =>
  Atom.writable<SnapshotFrom<M>, EventFromLogic<M>>(
    (get) => get(snapshot),
    (ctx, event) => {
      ctx.set(ctx.get(bag).send, event);
    }
  ).pipe(Atom.keepAlive);
