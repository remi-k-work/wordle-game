// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet } from "@effect/atom-react";
import { overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state";

// components
import { Button, Popover } from "@base-ui/react";

// assets
import { LifebuoyIcon } from "@heroicons/react/24/outline";

// constants
import { EMP_COST, SONAR_COST } from "@/features/overdrive-hacks/domain";

export function HacksMenu() {
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  return (
    <Popover.Root>
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
            <Button className="button" onClick={() => overdriveHacksMachineEvent({ type: "hack.useRequested", hackId: "emp" })}>
              <LifebuoyIcon className="size-11" />
              Use EMP (-{EMP_COST.toLocaleString()})
            </Button>
            <Button className="button" onClick={() => overdriveHacksMachineEvent({ type: "hack.useRequested", hackId: "sonar" })}>
              <LifebuoyIcon className="size-11" />
              Use Sonar (-{SONAR_COST.toLocaleString()})
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
