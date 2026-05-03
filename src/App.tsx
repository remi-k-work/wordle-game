import { useEffect } from "react";
import { useAtomValue, useAtomSet, useAtomMount } from "@effect-atom/atom-react";
import { gameDataAtom, isGameFinishedAtom, isWinnerAtom } from "./atoms/gameAtom";
import { isModalOpenAtom, modalTypeAtom, openModalAction } from "./atoms/modalAtom";
import { languageAtom } from "./atoms/languageAtom";
import { Result } from "@effect-atom/atom-react";

// components
import WordleGrid from "./ui/WordleGrid";
import Keypad from "./ui/Keypad";
import Modal from "./ui/Modal";
import YouWin from "./ui/YouWin";
import Nevermind from "./ui/Nevermind";
import ControlPanel from "./ui/ControlPanel";
import LoadingStatus from "./ui/LoadingStatus";
import Help from "./ui/Help";

// assets
import logo from "./assets/opengraph-image.jpg";

export default function App() {
  useAtomMount(gameDataAtom);
  const gameData = useAtomValue(gameDataAtom);
  const isFinished = useAtomValue(isGameFinishedAtom);
  const isWinner = useAtomValue(isWinnerAtom);
  const isModalOpen = useAtomValue(isModalOpenAtom);
  const modalType = useAtomValue(modalTypeAtom);
  const language = useAtomValue(languageAtom);
  const openModal = useAtomSet(openModalAction);

  // Automatically open status modal when game finishes
  useEffect(() => {
    if (isFinished) {
      openModal("status");
    }
  }, [isFinished, openModal]);

  return Result.builder(gameData)
    .onInitial(() => <LoadingStatus status="pending" />)
    .onWaiting(() => <LoadingStatus status="pending" />)
    .onFailure(() => <LoadingStatus status="rejected" />)
    .onSuccess(() => (
      <>
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-4">
          <header>
            <ControlPanel />
          </header>
          <main className="flex-1">
            <WordleGrid />
          </main>
          <footer>
            <Keypad />
          </footer>
        </div>

        <div className="mx-auto max-w-2xl p-4">
          <img src={logo} width={1734} height={907} loading="lazy" alt="Logo" className="h-auto w-full rounded-lg shadow-md" />

          <p className="mx-auto my-12 max-w-[65ch] text-center text-gray-300">
            Immerse yourselves in the captivating world of word puzzles with my Wordle Game clone, the ultimate vocabulary challenge. Each day, a new mystery
            word awaits you for deciphering, offering a fresh challenge to flex your linguistic muscles. With each guess, you will receive clues to unravel the
            secret word, gradually narrowing down the possibilities. Utilize the vibrant color-coded feedback system to guide your journey, savoring the
            satisfaction of each correct letter placement. Whether you are a seasoned wordsmith or a budding linguist, this game offers an engaging and
            rewarding experience for all. Unleash your creativity, hone your vocabulary, and relish the thrill of solving each puzzle. Let the word-solving
            adventure begin! This game can be played with either English or Polish vocabulary sets.
          </p>

          <a
            href="https://www.remiforge.dev"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit RemiForge Portfolio (opens in a new tab)"
            className="mx-auto flex max-w-xl flex-wrap items-center gap-5 rounded-xl border border-gray-700 bg-neutral-900 p-4 text-neutral-200 no-underline transition-colors hover:border-gray-500"
          >
            <img
              src="https://www.remiforge.dev/opengraph-image.jpg"
              width="1200"
              height="630"
              alt=""
              loading="lazy"
              className="aspect-1200/630 h-auto w-32 flex-none rounded-lg object-cover"
            />
            <div className="min-w-56 flex-1">
              <div className="mb-1 text-sm tracking-wider text-neutral-400 uppercase">
                <span aria-hidden="true">👨‍💻</span> Built By
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold text-white">
                RemiForge
                <span aria-hidden="true" className="text-xl font-normal text-gray-500">
                  ↗
                </span>
              </div>
              <div className="mt-1 text-sm text-neutral-400">Portfolio of Projects, Experiments & Contact</div>
            </div>
          </a>
        </div>

        {isModalOpen && modalType === "help" && (
          <Modal title={language === "en" ? "Help" : "Pomoc"}>
            <Help />
          </Modal>
        )}

        {isModalOpen && modalType === "status" && isFinished && (
          <Modal title={isWinner ? (language === "en" ? "You Win!" : "Wygrałeś!") : language === "en" ? "Nevermind" : "Trudno"}>
            {isWinner ? <YouWin /> : <Nevermind />}
          </Modal>
        )}
      </>
    ))
    .render();
}
