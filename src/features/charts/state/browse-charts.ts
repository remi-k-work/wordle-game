// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { browseChartsMachine } from "@/features/charts/machines/browse-charts";
import { createMachineState } from "@/lib/machine-atoms";

const browseChartsMachineBag = createActorAtoms(RuntimeAtom, browseChartsMachine);
export const { snapshot: browseChartsMachineAtom, send: browseChartsMachineSendAtom } = createMachineState(browseChartsMachine, browseChartsMachineBag);

// Specialized selectors for granular state access and optimized re-renders
export const browseChartsSolutionsLanguageAtom = browseChartsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.sl));
