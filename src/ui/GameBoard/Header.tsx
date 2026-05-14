// services, features, and other libraries
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { currentTurnAtom, languageAtom, openModalAction, restartGameAction } from "@/atoms";

// components
import { Button } from "@base-ui/react";

// assets
import { CogIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import LangChanger from "@/ui/LangChanger";

export function Header() {
  const currentTurn = useAtomValue(currentTurnAtom);
  const language = useAtomValue(languageAtom);
  const restartGame = useAtomSet(restartGameAction);
  const openModal = useAtomSet(openModalAction);

  return (
    <header className="flex items-center justify-evenly gap-3">
      <div className="flex items-center justify-center gap-2 rounded-md border px-2 py-1 text-2xl">
        <CogIcon className="size-11" />
        {currentTurn}
      </div>
      <LangChanger />
      {language === "En" ? (
        <Button className="button py-4" onClick={() => restartGame()}>
          New Game
        </Button>
      ) : (
        <Button className="button py-4" onClick={() => restartGame()}>
          Nowa Gra
        </Button>
      )}
      <Button className="button p-1" onClick={() => openModal("help")}>
        <QuestionMarkCircleIcon className="size-11" />
      </Button>
    </header>
  );
}
