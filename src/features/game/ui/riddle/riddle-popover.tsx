// react
import { useCallback, useState } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { wordMetaMachineAtom } from "@/features/game/state";
import { useGT } from "gt-next";

// components
import { GamePopover } from "@/ui/game-popover";
import { Content } from "./content";

// assets
import { SpinnerIcon } from "@/assets/icons";
import { SparklesIcon } from "@heroicons/react/24/outline";

export function RiddlePopover() {
  const wordMetaMachineSnapshot = useAtomValue(wordMetaMachineAtom);
  const isLoading = wordMetaMachineSnapshot.matches("loading");
  const gt = useGT();

  // Controls whether the popover is open or not
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <GamePopover
      open={isOpen}
      onOpenChange={setIsOpen}
      title={gt("Riddle")}
      trigger={isLoading ? <SpinnerIcon className="size-11" /> : <SparklesIcon className="size-11" />}
      wide
    >
      <Content mode="popover" onGameFlowClicked={close} />
    </GamePopover>
  );
}
