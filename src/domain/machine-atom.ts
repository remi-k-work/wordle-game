// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { createActor } from "xstate";

// types
import type { Actor, ActorOptions, AnyStateMachine, EventFromLogic, InputFrom, SnapshotFrom } from "xstate";

// Options controlling how a machine is bootstrapped into an atom
export type MachineAtomOptions<M extends AnyStateMachine> = {
  // Resolves the machine's createActor input. Runs once, in the actor atom's read function,
  // so it may read from peer atoms (persisted state, sibling snapshots, etc.).
  readonly input?: (get: Atom.AtomContext) => InputFrom<M>;
  // Extra side effect on every snapshot, after the writable atom is updated (e.g. persisting
  // the machine context back to durable storage). Receives the writable atom's read context.
  readonly onSnapshot?: (get: Atom.AtomContext, snapshot: SnapshotFrom<M>) => void;
};

// Bridges an XState v5 machine into an Effect writable atom: it owns the actor lifecycle, feeds
// snapshots into the atom's read side, and forwards writes as `send(event)`. This is the single
// canonical implementation of the previously repeated "machine actor atom" pattern
export const createMachineAtom = <M extends AnyStateMachine>(
  machine: M,
  options: MachineAtomOptions<M> = {}
): Atom.Writable<SnapshotFrom<M>, EventFromLogic<M>> => {
  // Creates an Atom-owned XState actor reference
  const actorAtom = Atom.make<Actor<M>>((get) => {
    // The generic machine type makes createActor's conditional `input`
    // requirement undecidable, so only that field is cast (the concrete call
    // site still enforces the input shape via the returned atom's typed
    // surface). No `inspect` option: XState's browser inspector is a dev-only
    // manual switch onto @statelyai/inspect, whose transitive graph (ws,
    // partysocket, superjson) must never reach the client bundle
    const actorOptions: ActorOptions<M> =
      // Resolve the input lazily here (inside the read function), so it may read from peer atoms
      options.input === undefined ? {} : { input: options.input(get) as InputFrom<M> };

    const actor = createActor(machine, actorOptions);

    actor.start();

    get.addFinalizer(() => {
      actor.stop();
    });

    return actor;
  }).pipe(Atom.keepAlive);

  // The machine is now a living actor inside the effect atom
  return Atom.writable<SnapshotFrom<M>, EventFromLogic<M>>(
    (get) => {
      const actor = get(actorAtom);
      const subscription = actor.subscribe((snapshot) => {
        get.setSelf(snapshot);
        options.onSnapshot?.(get, snapshot);
      });

      get.addFinalizer(() => {
        subscription.unsubscribe();
      });

      return actor.getSnapshot();
    },
    (ctx, event) => {
      ctx.get(actorAtom).send(event);
    }
  ).pipe(Atom.keepAlive);
};
