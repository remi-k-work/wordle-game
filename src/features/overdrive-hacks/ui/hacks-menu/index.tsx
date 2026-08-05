// react
import { useState } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { overdriveHacksCanApplyHackAtom, overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state";

// components
import { Button, Popover } from "@base-ui/react";

// assets
import { LifebuoyIcon } from "@heroicons/react/24/outline";

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain";

export function HacksMenu() {
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  const canApplyHackEmp = useAtomValue(overdriveHacksCanApplyHackAtom("emp"));
  const canApplyHackSonar = useAtomValue(overdriveHacksCanApplyHackAtom("sonar"));

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
