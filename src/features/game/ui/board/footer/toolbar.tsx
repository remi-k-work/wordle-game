// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { HacksMenu, HacksMenuSkeleton } from "@/features/overdrive-hacks/ui/hacks-menu";
import { RiddlePopover, RiddlePopoverSkeleton } from "@/features/game/ui/riddle/riddle-popover";
import { GameLangChanger, GameLangChangerSkeleton } from "@/features/settings/ui/lang-changer";
import { GameFlowButton, GameFlowButtonSkeleton } from "@/features/game/ui/game-flow-button";

// constants
const TOOLBAR_CLASSES = cn("grid grid-cols-[1fr_1fr_2fr_3fr] gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent");

export function Toolbar() {
  return (
    <section className={TOOLBAR_CLASSES}>
      <HacksMenu />
      <RiddlePopover />
      <GameLangChanger />
      <GameFlowButton />
    </section>
  );
}

export function ToolbarSkeleton() {
  return (
    <section className={TOOLBAR_CLASSES}>
      <HacksMenuSkeleton />
      <RiddlePopoverSkeleton />
      <GameLangChangerSkeleton />
      <GameFlowButtonSkeleton />
    </section>
  );
}
