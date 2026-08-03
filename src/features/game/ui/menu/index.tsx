// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet } from "@effect/atom-react";
import { modalMachineAtom } from "@/state";

// components
import { Button, Popover } from "@base-ui/react";

// assets
import { Bars3Icon, QuestionMarkCircleIcon, SpeakerWaveIcon, TrophyIcon } from "@heroicons/react/24/outline";

export function GameMenu() {
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  return (
    <Popover.Root>
      <Popover.Trigger openOnHover title="Menu" className="button flex-none p-1 data-popup-open:bg-accent">
        <Bars3Icon className="size-11" />
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
            <Button className="button" onClick={() => modalMachineEvent({ type: "opened", modalType: "voice-settings" })}>
              <SpeakerWaveIcon className="size-11" />
              Voice Settings
            </Button>
            <Button className="button" onClick={() => modalMachineEvent({ type: "opened", modalType: "high-score" })}>
              <TrophyIcon className="size-11" />
              High Score
            </Button>
            <Button className="button" onClick={() => modalMachineEvent({ type: "opened", modalType: "help" })}>
              <QuestionMarkCircleIcon className="size-11" />
              Help
            </Button>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function GameMenuSkeleton() {
  return (
    <Button className="button flex-none p-1" disabled>
      <Bars3Icon className="size-11" />
    </Button>
  );
}
