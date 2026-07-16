// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { alertMachine } from "@/machines/alert";
import { inspect } from "@/machines/inspect";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";

type AlertMachineSnapshot = SnapshotFrom<typeof alertMachine>;
type AlertMachineEvent = EventFromLogic<typeof alertMachine>;
type AlertMachineActor = Actor<typeof alertMachine>;

// Creates an Atom-owned XState actor reference
const alertMachineActorAtom = Atom.make<AlertMachineActor>((get) => {
  const actor = createActor(alertMachine, { inspect });
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The alert machine is now a living actor inside the effect atom
export const alertMachineAtom = Atom.writable<AlertMachineSnapshot, AlertMachineEvent>(
  (get) => {
    const actor = get(alertMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(alertMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);
