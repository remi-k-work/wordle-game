// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet } from "@effect-atom/atom-react";
import { openModalAction } from "@/atoms";

// components
import { Button, Popover } from "@base-ui/react";
import { LangChanger } from "@/ui/Game/LangChanger";
import { GameFlowButton } from "@/ui/Game/FlowButton";

// assets
import { Bars3Icon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export function GameMenu() {
  const openModal = useAtomSet(openModalAction);

  return (
    <Popover.Root>
      <Popover.Trigger className="button p-1 data-popup-open:bg-accent md:hidden">
        <Bars3Icon className="size-11" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup
            className={cn(
              "grid gap-3 bg-surface-2 p-3",
              "transition duration-300 ease-in-out",
              "origin-(--transform-origin)",
              "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0"
            )}
          >
            <LangChanger />
            <GameFlowButton />
            <Button className="button" title="Help" onClick={() => openModal("help")}>
              <QuestionMarkCircleIcon className="size-11" />
            </Button>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
