// services, features, and other libraries
import { assertEvent } from "xstate";

// types
import type { GuardArgs } from "@/lib/machine-setup";
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";
import type { Events, OverdriveHacks } from "./models";

type Args = GuardArgs<OverdriveHacks, Events>;

// The three guards differ only by the requested hack, so they share one implementation
const isHackRequested =
  (overdriveHackId: OverdriveHackId) =>
  ({ event }: Args) => {
    assertEvent(event, "hackRequested");
    return event.overdriveHackId === overdriveHackId;
  };

export const guards = {
  isEmpHackRequested: isHackRequested("emp"),
  isSonarHackRequested: isHackRequested("sonar"),
  isOverrideHackRequested: isHackRequested("override"),
};
