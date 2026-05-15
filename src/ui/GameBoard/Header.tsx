// services, features, and other libraries
import { motion } from "motion/react";
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { currentStreakAtom, openModalAction, potentialScoreAtom, restartGameAction, sessionTotalScoreAtom } from "@/atoms";

// components
import { Button } from "@base-ui/react";
import LangChanger from "@/ui/LangChanger";

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
      {/* Run Scoreboard */}
      <section className="grid place-items-center rounded-md border bg-secondary px-3 py-1">
        <h2 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Run</h2>
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <div className="flex items-center gap-1">
            <TrophyIcon className="size-7 text-accent" />
            {totalScore}
          </div>
          <div className="flex items-center gap-1 text-destructive">
            <FireIcon className="size-7" />
            {currentStreak}
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center gap-4">
        <LangChanger />
        <Button className="button py-4" onClick={() => restartGame()}>
          New Game
        </Button>
      </section>

      {/* This Word Potential */}
      <section className="grid place-items-center rounded-md border border-accent bg-surface-2 px-3 py-1">
        <h2 className="font-sans text-sm font-semibold tracking-widest text-accent uppercase">Potential</h2>
        <motion.div key={potentialScore} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-2xl font-semibold tabular-nums">
          {potentialScore}
        </motion.div>
      </section>

      <Button className="button p-1" onClick={() => openModal("help")}>
        <QuestionMarkCircleIcon className="size-11" />
      </Button>
    </header>
  );
}
