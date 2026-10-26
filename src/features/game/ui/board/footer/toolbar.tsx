// components
import { HacksMenu, HacksMenuSkeleton } from "@/features/overdrive-hacks/ui/hacks-menu";
import { Riddle, RiddleSkeleton } from "@/features/game/ui/riddle";
import { GameLangChanger, GameLangChangerSkeleton } from "@/features/settings/ui/lang-changer";
import { GameFlowButton, GameFlowButtonSkeleton } from "@/features/game/ui/flow-button";

export function Toolbar() {
  return (
    <section className="grid grid-cols-[1fr_1fr_2fr_3fr] gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent">
      <HacksMenu />
      <Riddle mode="popover" />
      <GameLangChanger />
      <GameFlowButton />
    </section>
  );
}

export function ToolbarSkeleton() {
  return (
    <section className="grid grid-cols-[1fr_1fr_2fr_3fr] gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent">
      <HacksMenuSkeleton />
      <RiddleSkeleton mode="popover" />
      <GameLangChangerSkeleton />
      <GameFlowButtonSkeleton />
    </section>
  );
}
