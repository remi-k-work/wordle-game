// services, features, and other libraries
import { useAtomValue, useAtomMount, Result } from "@effect-atom/atom-react";
import { gameDataSolutionsAtom } from "./atoms";

// components
import WordleGrid from "./ui/WordleGrid";
import Keypad from "./ui/Keypad";
import ControlPanel from "./ui/ControlPanel";
import LoadingStatus from "./ui/LoadingStatus";
import HelpModal from "./ui/HelpModal";
import WinOrLoseModal from "./ui/WinOrLoseModal";

export default function App() {
  useAtomMount(gameDataSolutionsAtom);
  const gameDataSolutions = useAtomValue(gameDataSolutionsAtom);

  return Result.builder(gameDataSolutions)
    .onInitial(() => <LoadingStatus status="pending" />)
    .onWaiting(() => <LoadingStatus status="pending" />)
    .onFailure(() => <LoadingStatus status="rejected" />)
    .onSuccess(() => (
      <>
        <div className="grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr_auto] gap-4 p-4">
          <header>
            <ControlPanel />
          </header>
          <main>
            <WordleGrid />
          </main>
          <footer>
            <Keypad />
          </footer>
        </div>

        <HelpModal />
        <WinOrLoseModal />
      </>
    ))
    .render();
}
