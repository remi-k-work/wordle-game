// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet } from "@effect-atom/atom-react";
import { openModalAction } from "@/features/game/state";

// components
import { Button, Popover } from "@base-ui/react";
import { LangChanger } from "@/features/settings/ui/LangChanger";
import { GameFlowButton } from "@/features/game/ui/FlowButton";

// assets
import { Bars3Icon, QuestionMarkCircleIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";

export function GameMenu() {
  const openModal = useAtomSet(openModalAction);

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
            <LangChanger />
            <GameFlowButton />
            <Button className="button" onClick={() => openModal("voice-settings")}>
              <SpeakerWaveIcon className="size-11" />
              Voice Settings
            </Button>
            <Button className="button" onClick={() => openModal("help")}>
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
