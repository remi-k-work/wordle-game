// react
import { useState } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaMachineAtom } from "@/features/game/state";
import { useGT } from "gt-next";

// components
import { Button, Popover } from "@base-ui/react";
import { Content, ContentSkeleton } from "./content";

// assets
import { SpinnerIcon } from "@/assets/icons";
import { SparklesIcon } from "@heroicons/react/24/outline";

// types
interface RiddleProps {
  mode: "popover" | "voiceTest";
}

export function Riddle({ mode }: RiddleProps) {
  const wordMetaMachineSnapshot = useAtomValue(wordMetaMachineAtom);
  const isLoading = wordMetaMachineSnapshot.matches("loading");
  const gt = useGT();

  // Controls whether the popover is open or not
  const [isOpen, setIsOpen] = useState(false);

  if (mode === "voiceTest") return <Content mode="voiceTest" />;

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger openOnHover title={gt("Riddle")} className="button flex-none p-1 data-popup-open:bg-accent">
        {isLoading ? <SpinnerIcon className="size-11" /> : <SparklesIcon className="size-11" />}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup
            className={cn(
              "grid max-w-[90dvw] gap-3 rounded-md bg-surface-2 p-3 shadow-sm",
              "transition duration-300 ease-in-out",
              "origin-(--transform-origin)",
              "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0"
            )}
          >
            <Content mode="popover" onGameFlowClicked={() => setIsOpen(false)} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function RiddleSkeleton({ mode }: RiddleProps) {
  if (mode === "voiceTest") return <ContentSkeleton mode="voiceTest" />;

  return (
    <Button className="button flex-none p-1" disabled>
      <SparklesIcon className="size-11" />
    </Button>
  );
}
