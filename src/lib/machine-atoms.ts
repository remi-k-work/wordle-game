// services, features, and other libraries
import { AsyncResult, Atom } from "effect/reactivity";

// types
import type { AnyStateMachine, EventFromLogic, SnapshotFrom } from "xstate";
import type { ActorAtoms } from "@xstate/effect/atom";

// A bag is either built eagerly (static or absent input) or as an atom that
// builds it on first read (input that only exists inside another atom read:
// KVS hydration, a persisted run, peer machine state)
type ActorAtomsSource<M extends AnyStateMachine, ER> = ActorAtoms<M, ER> | Atom.Atom<ActorAtoms<M, ER>>;

const isBagAtom = <M extends AnyStateMachine, ER>(source: ActorAtomsSource<M, ER>): source is Atom.Atom<ActorAtoms<M, ER>> => Atom.isAtom(source);

interface MachineState<M extends AnyStateMachine> {
  readonly snapshot: Atom.Atom<SnapshotFrom<M>>;
  readonly send: Atom.Writable<SnapshotFrom<M>, EventFromLogic<M>>;
}

// The one place a machine is projected into the app's atom surface: a plain
// snapshot for reads/selectors (AsyncResult unwrapped, falling back to the
// machine's initial snapshot while the actor settles or fails), and a write
// atom for events. Both are created together so a state file cannot expose one
// without the other, and every machine keeps the same shape whether its bag was
// built eagerly or lazily.
// The bag itself stays with the state file: `createActorAtoms` already carries
// the package's runtime/input typing, and building it there keeps that check at
// the call site (including the eager-vs-lazy decision)
export const createMachineState = <M extends AnyStateMachine, ER = never>(
  machine: M,
  source: ActorAtomsSource<M, ER>,
  options?: {
    // Runs synchronously beside each successful snapshot read, for KVS mirroring; the caller guards against redundant writes
    readonly onSnapshot?: (get: Atom.AtomContext, snapshot: SnapshotFrom<M>) => void;
  }
): MachineState<M> => {
  const snapshot = Atom.make((get) => {
    const bag = isBagAtom(source) ? get(source) : source;
    const result = get(bag.snapshot);
    if (!AsyncResult.isSuccess(result)) return machine.getInitialSnapshot(undefined, undefined);
    options?.onSnapshot?.(get, result.value);
    return result.value;
  }).pipe(Atom.keepAlive);

  const send = Atom.writable<SnapshotFrom<M>, EventFromLogic<M>>(
    (get) => get(snapshot),
    (ctx, event) => {
      const bag = isBagAtom(source) ? ctx.get(source) : source;
      ctx.set(bag.send, event);
    }
  ).pipe(Atom.keepAlive);

  return { snapshot, send };
};
