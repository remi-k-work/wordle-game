// services, features, and other libraries
import { useAtomValue, useAtomMount, Result } from "@effect-atom/atom-react";
import { gameDataSolutionsAtom } from "./atoms";

// components
import Header from "./ui/Header";
import Main from "./ui/Main";
import Footer from "./ui/Footer";
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
          <Header />
          <Main />
          <Footer />
        </div>

        <HelpModal />
        <WinOrLoseModal />
      </>
    ))
    .render();
}
