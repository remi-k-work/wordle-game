// services, features, and other libraries
import { assertEvent } from "xstate";

// types
import type { GuardArgs } from "@/lib/machine-setup";
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";
import type { Events, OverdriveHacks } from "./models";

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain/constants";

type Args = GuardArgs<OverdriveHacks, Events>;

// The three guards differ only by the requested hack, so they share one implementation
const isHackRequested =
  (overdriveHackId: OverdriveHackId) =>
  ({ event }: Args) => {
    assertEvent(event, "hackRequested");
    return event.overdriveHackId === overdriveHackId;
  };

export const guards = {
  // The request carries the current run score; the machine decides whether the
  // purchase is legal, so an unaffordable hack cannot enter an applying state
  // An unknown id (only possible through an unsafe cast) has no cost and is
  // rejected here as well
  canAffordHack: ({ event }: Args) => {
    assertEvent(event, "hackRequested");
    return event.runScore >= OVERDRIVE_HACK_COST(event.overdriveHackId);
  },

  isEmpHackRequested: isHackRequested("emp"),
  isSonarHackRequested: isHackRequested("sonar"),
  isOverrideHackRequested: isHackRequested("override"),
};
