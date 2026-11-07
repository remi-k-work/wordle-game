// services, features, and other libraries
import { Option } from "effect";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import {
  overdriveHacksIsApplyingOverrideAtom,
  overdriveHacksMachineAtom,
  overdriveHacksTheOverrideAtom,
} from "@/features/overdrive-hacks/state/overdrive-hacks";
import { overdriveHacksCanApplyHackAtom } from "@/features/overdrive-hacks/state/can-apply";
import { modalMachineAtom } from "@/state/modal";
import { T } from "gt-react";

// components
import { HackAction } from "./hack-action";
import { HackBadge } from "./hack-badge";
import { HackCost } from "./hack-cost";

// assets
import { SpinnerIcon } from "@/assets/icons/spinner";
import { SparklesIcon } from "@heroicons/react/24/outline";

// types
interface OverrideHackActionProps {
  // The hacks menu owns its own visibility, so the row only reports back that it
  // has taken an action and lets the popover dismiss itself
  onClicked?: () => void;
}

// Both override modes render the same row, so the one thing they share is stated
// once instead of being repeated in each branch below
const OVERRIDE_LABEL = <T>AI Override</T>;

// The AI Override is the only hack that is generated asynchronously, so its row
// has two modes of its own: claim an override that is already waiting (which opens
// the override modal), or buy one. The emp/sonar rows are unconditional, which is
// why they stay in `HacksMenu` and this one does not
// Keeping the row here also means the three override states are subscribed to by
// the row alone: the rest of the hacks menu no longer re-renders every time an
// override is requested, generated, or claimed
export function OverrideHackAction({ onClicked }: OverrideHackActionProps) {
  const canApplyHackOverride = useAtomValue(overdriveHacksCanApplyHackAtom("override"));
  const theOverride = useAtomValue(overdriveHacksTheOverrideAtom);
  const isApplyingOverride = useAtomValue(overdriveHacksIsApplyingOverrideAtom);

  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  if (Option.isSome(theOverride)) {
    return (
      <HackAction
        Icon={SparklesIcon}
        label={OVERRIDE_LABEL}
        badge={
          <HackBadge tone="ready">
            <T>Ready ↗</T>
          </HackBadge>
        }
        onClicked={() => {
          modalMachineEvent({ type: "opened", modalType: "override-hack" });
          onClicked?.();
        }}
      />
    );
  }

  return (
    <HackAction
      Icon={isApplyingOverride ? SpinnerIcon : SparklesIcon}
      label={OVERRIDE_LABEL}
      badge={<HackCost hackId="override" />}
      disabled={!canApplyHackOverride || isApplyingOverride}
      onClicked={() => overdriveHacksMachineEvent({ type: "hack.useRequested", overdriveHackId: "override" })}
    />
  );
}
