// react
import { useState } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet } from "@effect/atom-react";
import { modalMachineAtom } from "@/state";

// components
import { Button, Popover } from "@base-ui/react";
import { T, useGT } from "gt-next";
import { LangChanger } from "@/features/settings/ui/lang-changer";
import { GameFlowButton } from "@/features/game/ui/flow-button";

// assets
import { Bars3Icon, QuestionMarkCircleIcon, SpeakerWaveIcon, TrophyIcon } from "@heroicons/react/24/outline";

export function GameMenu() {
  const modalMachineEvent = useAtomSet(modalMachineAtom);
  const gt = useGT();

  // Controls whether the popover is open or not
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger openOnHover title={gt("Menu")} className="button flex-none p-1 data-popup-open:bg-accent">
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
            <LangChanger keepText onClicked={() => setIsOpen(false)} />
            <GameFlowButton keepText onClicked={() => setIsOpen(false)} />
            <Button
              className="button"
              onClick={() => {
                modalMachineEvent({ type: "opened", modalType: "voice-settings" });
                setIsOpen(false);
              }}
            >
              <SpeakerWaveIcon className="size-11" />
              <T>Voice Settings</T>
            </Button>
            <Button
              className="button"
              onClick={() => {
                modalMachineEvent({ type: "opened", modalType: "high-score" });
                setIsOpen(false);
              }}
            >
              <TrophyIcon className="size-11" />
              <T>High Score</T>
            </Button>
            <Button
              className="button"
              onClick={() => {
                modalMachineEvent({ type: "opened", modalType: "help" });
                setIsOpen(false);
              }}
            >
              <QuestionMarkCircleIcon className="size-11" />
              <T>Help</T>
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
