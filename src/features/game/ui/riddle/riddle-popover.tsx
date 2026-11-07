// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { wordMetaIsLoadingAtom } from "@/features/game/state/word-meta";
import { useGT } from "gt-react";

// components
import { GamePopover, PopoverTriggerSkeleton } from "@/ui/game-popover";
import { Content } from "./content";

// assets
import { SpinnerIcon } from "@/assets/icons/spinner";
import { SparklesIcon } from "@heroicons/react/24/outline";

export function RiddlePopover() {
  const gt = useGT();
  const isLoading = useAtomValue(wordMetaIsLoadingAtom);

  return (
    <GamePopover title={gt("Riddle")} trigger={isLoading ? <SpinnerIcon className="size-11" /> : <SparklesIcon className="size-11" />} wide>
      {(close) => <Content mode="popover" onGameFlowClicked={close} />}
    </GamePopover>
  );
}

// Kept beside the popover it stands in for: both render the same trigger silhouette, so one component definition covers the live and loading states
export function RiddlePopoverSkeleton() {
  return <PopoverTriggerSkeleton Icon={SparklesIcon} />;
}
