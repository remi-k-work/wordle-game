// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { browseChartsMachine } from "@/features/telemetry/machines/browse-charts";
import { createMachineAtom } from "@/lib/machine-atom";

// The browse charts machine is now a living actor inside the effect atom
export const browseChartsMachineAtom = createMachineAtom(browseChartsMachine);

// Specialized selectors for granular state access and optimized re-renders
export const browseChartsSlAtom = browseChartsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.sl));
