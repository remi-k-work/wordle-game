// react
import { useCallback, useState } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { wordMetaMachineAtom } from "@/features/game/state";
import { useGT } from "gt-next";

// components
import { Button } from "@base-ui/react";
import { GamePopover } from "@/ui/game-popover";
import { Content, ContentSkeleton } from "./content";

// assets
import { SpinnerIcon } from "@/assets/icons";
import { SparklesIcon } from "@heroicons/react/24/outline";

// types
interface RiddleProps {
  mode: "popover" | "voiceTest";
}

export function Riddle({ mode }: RiddleProps) {
  if (mode === "voiceTest") return <Content mode="voiceTest" />;
  return <RiddlePopover />;
}

function RiddlePopover() {
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

export function RiddleSkeleton({ mode }: RiddleProps) {
  if (mode === "voiceTest") return <ContentSkeleton mode="voiceTest" />;

  return (
    <Button className="button flex-none p-1" disabled>
      <SparklesIcon className="size-11" />
    </Button>
  );
}
