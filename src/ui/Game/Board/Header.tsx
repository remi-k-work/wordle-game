// services, features, and other libraries
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { currentStreakAtom, openModalAction, potentialScoreAtom, restartGameAction, sessionTotalScoreAtom } from "@/atoms";

// components
import { Button } from "@base-ui/react";
import LangChanger from "@/ui/Game/LangChanger";
import { GameMenu } from "@/ui/Game/Menu";

// assets
import { FireIcon, TrophyIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export function Header() {
  const totalScore = useAtomValue(sessionTotalScoreAtom);
  const currentStreak = useAtomValue(currentStreakAtom);
  const potentialScore = useAtomValue(potentialScoreAtom);
  const restartGame = useAtomSet(restartGameAction);
  const openModal = useAtomSet(openModalAction);

  return (
    <header className="flex items-center justify-between gap-3">
      <section className="grid place-items-center rounded-md border bg-secondary px-3 py-1">
        <h2 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Run</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <TrophyIcon className="size-7 text-accent" />
            <span className="text-2xl font-semibold tabular-nums">{totalScore}</span>
          </div>
          <div className="flex items-center gap-1 text-destructive">
            <FireIcon className="size-7" />
            <span className="text-2xl font-semibold tabular-nums">{currentStreak}</span>
          </div>
        </div>
      </section>

      <section className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-3">
        <LangChanger />
        <Button className="button py-4" onClick={() => restartGame()}>
          New Game
        </Button>
      </section>

      <section className="grid place-items-center rounded-md border border-accent bg-surface-2 px-3 py-1">
        <h2 className="font-sans text-sm font-semibold tracking-widest text-accent uppercase">Potential</h2>
        <span className="text-2xl font-semibold tabular-nums">{potentialScore}</span>
      </section>

      <Button className="button hidden md:block" title="Help" onClick={() => openModal("help")}>
        <QuestionMarkCircleIcon className="size-11" />
      </Button>
      <GameMenu />
    </header>
  );
}
