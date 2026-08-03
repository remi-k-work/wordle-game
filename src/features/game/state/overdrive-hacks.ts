// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { overdriveHacksMachine } from "@/features/game/machines/overdrive-hacks";
import { inspect } from "@/machines/inspect";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";

type OverdriveHacksMachineSnapshot = SnapshotFrom<typeof overdriveHacksMachine>;
type OverdriveHacksMachineEvent = EventFromLogic<typeof overdriveHacksMachine>;
type OverdriveHacksMachineActor = Actor<typeof overdriveHacksMachine>;

// Creates an Atom-owned XState actor reference
const overdriveHacksMachineActorAtom = Atom.make<OverdriveHacksMachineActor>((get) => {
  const actor = createActor(overdriveHacksMachine, { inspect });
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The overdrive hacks machine is now a living actor inside the effect atom
export const overdriveHacksMachineAtom = Atom.writable<OverdriveHacksMachineSnapshot, OverdriveHacksMachineEvent>(
  (get) => {
    const actor = get(overdriveHacksMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(overdriveHacksMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);
