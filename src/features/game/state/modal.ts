// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { modalMachine } from "@/features/game/machines/modal";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";

type ModalMachineSnapshot = SnapshotFrom<typeof modalMachine>;
type ModalMachineEvent = EventFromLogic<typeof modalMachine>;
type ModalMachineActor = Actor<typeof modalMachine>;

// Creates an Atom-owned XState actor reference
const modalMachineActorAtom = Atom.make<ModalMachineActor>((get) => {
  const actor = createActor(modalMachine);
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The modal machine is now a living actor inside the effect atom
export const modalMachineAtom = Atom.writable<ModalMachineSnapshot, ModalMachineEvent>(
  (get) => {
    const actor = get(modalMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(modalMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);
