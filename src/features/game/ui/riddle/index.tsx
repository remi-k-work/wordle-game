// components
import { Button } from "@base-ui/react";
import { Content, ContentSkeleton } from "./content";
import { RiddlePopover } from "./riddle-popover";

// assets
import { SparklesIcon } from "@heroicons/react/24/outline";

// types
interface RiddleProps {
  mode: "popover" | "voiceTest";
}

export function Riddle({ mode }: RiddleProps) {
  if (mode === "voiceTest") return <Content mode="voiceTest" />;
  return <RiddlePopover />;
}

export function RiddleSkeleton({ mode }: RiddleProps) {
  if (mode === "voiceTest") return <ContentSkeleton mode="voiceTest" />;

  return (
    <Button className="button flex-none p-1" disabled>
      <SparklesIcon className="size-11" />
    </Button>
  );
}
