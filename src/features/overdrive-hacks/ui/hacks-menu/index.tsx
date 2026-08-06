// react
import { useState } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Option } from "effect";
import { useAtom, useAtomSet, useAtomValue } from "@effect/atom-react";
import { overdriveHacksCanApplyHackAtom, overdriveHacksMachineAtom, overdriveHacksTheOverrideAtom } from "@/features/overdrive-hacks/state";
import { modalMachineAtom } from "@/state";

// components
import { Button, Popover } from "@base-ui/react";

// assets
import { SpinnerIcon } from "@/assets/icons";
import { LifebuoyIcon, SparklesIcon } from "@heroicons/react/24/outline";

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain";

export function HacksMenu() {
  const [overdriveHacksMachineSnapshot, overdriveHacksMachineEvent] = useAtom(overdriveHacksMachineAtom);

  const canApplyHackEmp = useAtomValue(overdriveHacksCanApplyHackAtom("emp"));
  const canApplyHackSonar = useAtomValue(overdriveHacksCanApplyHackAtom("sonar"));
  const canApplyHackOverride = useAtomValue(overdriveHacksCanApplyHackAtom("override"));

  const theOverride = useAtomValue(overdriveHacksTheOverrideAtom);
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  const isOverrideHackLoading = overdriveHacksMachineSnapshot.matches("applyingOverrideHack");
  const isOverrideHackReady = Option.isSome(theOverride);

  // Controls whether the popover is open or not
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger openOnHover title="Lifeline" className="button flex-none p-1 data-popup-open:bg-accent">
        <LifebuoyIcon className="size-11" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup
            className={cn(
              "grid gap-3 rounded-md bg-surface-2 p-3 shadow-sm",
              "transition duration-300 ease-in-out",
              "origin-(--transform-origin)",
              "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0"
            )}
          >
            <Button
              className="button grid grid-cols-[auto_1fr_1fr]"
              disabled={!canApplyHackEmp}
              onClick={() => {
                overdriveHacksMachineEvent({ type: "hack.useRequested", overdriveHackId: "emp" });
                setIsOpen(false);
              }}
            >
              <LifebuoyIcon className="size-11" />
              <span className="justify-self-start">EMP</span>
              <span className="rounded-md bg-destructive px-3 py-2 font-sans text-text-2">-{OVERDRIVE_HACK_COST("emp").toLocaleString()} pts</span>
            </Button>
            <Button
              className="button grid grid-cols-[auto_1fr_1fr]"
              disabled={!canApplyHackSonar}
              onClick={() => {
                overdriveHacksMachineEvent({ type: "hack.useRequested", overdriveHackId: "sonar" });
                setIsOpen(false);
              }}
            >
              <LifebuoyIcon className="size-11" />
              <span className="justify-self-start">Sonar</span>
              <span className="rounded-md bg-destructive px-3 py-2 font-sans text-text-2">-{OVERDRIVE_HACK_COST("sonar").toLocaleString()} pts</span>
            </Button>
            {isOverrideHackReady ? (
              <Button
                className="button grid grid-cols-[auto_1fr_1fr]"
                onClick={() => {
                  modalMachineEvent({ type: "opened", modalType: "override-hack" });
                  setIsOpen(false);
                }}
              >
                <SparklesIcon className="size-11" />
                <span className="justify-self-start">Override</span>
                <span className="rounded-md bg-tile-green px-3 py-2 font-sans text-text-2">Ready ↗</span>
              </Button>
            ) : (
              <Button
                className="button grid grid-cols-[auto_1fr_1fr]"
                disabled={!canApplyHackOverride || isOverrideHackLoading}
                onClick={() => {
                  overdriveHacksMachineEvent({ type: "hack.useRequested", overdriveHackId: "override" });
                }}
              >
                {isOverrideHackLoading ? <SpinnerIcon className="size-11" /> : <SparklesIcon className="size-11" />}
                <span className="justify-self-start">Override</span>
                <span className="rounded-md bg-destructive px-3 py-2 font-sans text-text-2">-{OVERDRIVE_HACK_COST("override").toLocaleString()} pts</span>
              </Button>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function HacksMenuSkeleton() {
  return (
    <Button className="button flex-none p-1" disabled>
      <LifebuoyIcon className="size-11" />
    </Button>
  );
}
