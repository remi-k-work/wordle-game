// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { browseChartsMachine } from "@/features/telemetry/machines/browse-charts";
import { inspect } from "@/machines/inspect";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";

type BrowseChartsMachineSnapshot = SnapshotFrom<typeof browseChartsMachine>;
type BrowseChartsMachineEvent = EventFromLogic<typeof browseChartsMachine>;
type BrowseChartsMachineActor = Actor<typeof browseChartsMachine>;

// Creates an Atom-owned XState actor reference
const browseChartsMachineActorAtom = Atom.make<BrowseChartsMachineActor>((get) => {
  const actor = createActor(browseChartsMachine, { inspect });
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The browse charts machine is now a living actor inside the effect atom
export const browseChartsMachineAtom = Atom.writable<BrowseChartsMachineSnapshot, BrowseChartsMachineEvent>(
  (get) => {
    const actor = get(browseChartsMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(browseChartsMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);

// Specialized selectors for granular state access and optimized re-renders
export const browseChartsSlAtom = browseChartsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.sl));
