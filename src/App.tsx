import { useEffect } from "react";
import { useAtomValue, useAtomSet, useAtomMount } from "@effect-atom/atom-react";
import { gameDataAtom, isGameFinishedAtom, isWinnerAtom } from "./atoms/gameAtom";
import { isModalOpenAtom, modalTypeAtom, openModalAction } from "./atoms/modalAtom";
import { languageAtom } from "./atoms/languageAtom";
import { Result } from "@effect-atom/atom";

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
        <div className="min-h-screen flex flex-col p-4 gap-4 max-w-2xl mx-auto">
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

        <div className="max-w-2xl mx-auto p-4">
          <img
            src={logo}
            width={1734}
            height={907}
            loading="lazy"
            alt="Logo"
            className="w-full h-auto rounded-lg shadow-md"
          />

          <p className="max-w-[65ch] mx-auto my-12 text-center text-gray-300">
            Immerse yourselves in the captivating world of word puzzles with my
            Wordle Game clone, the ultimate vocabulary challenge. Each day, a new
            mystery word awaits you for deciphering, offering a fresh challenge to
            flex your linguistic muscles. With each guess, you will receive clues to
            unravel the secret word, gradually narrowing down the possibilities.
            Utilize the vibrant color-coded feedback system to guide your journey,
            savoring the satisfaction of each correct letter placement. Whether you
            are a seasoned wordsmith or a budding linguist, this game offers an
            engaging and rewarding experience for all. Unleash your creativity, hone
            your vocabulary, and relish the thrill of solving each puzzle. Let the
            word-solving adventure begin! This game can be played with either
            English or Polish vocabulary sets.
          </p>

          <a
            href="https://www.remiforge.dev"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit RemiForge Portfolio (opens in a new tab)"
            className="flex items-center flex-wrap gap-5 max-w-xl mx-auto p-4 no-underline border border-gray-700 rounded-xl bg-neutral-900 text-neutral-200 hover:border-gray-500 transition-colors"
          >
            <img
              src="https://www.remiforge.dev/opengraph-image.jpg"
              width="1200"
              height="630"
              alt=""
              loading="lazy"
              className="flex-none w-32 h-auto aspect-[1200/630] object-cover rounded-lg"
            />
            <div className="flex-1 min-w-[14rem]">
              <div className="text-neutral-400 text-sm uppercase tracking-wider mb-1">
                <span aria-hidden="true">👨‍💻</span> Built By
              </div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                RemiForge
                <span aria-hidden="true" className="text-gray-500 text-xl font-normal">
                  ↗
                </span>
              </div>
              <div className="text-neutral-400 text-sm mt-1">
                Portfolio of Projects, Experiments & Contact
              </div>
            </div>
          </a>
        </div>

        {isModalOpen && modalType === "help" && (
          <Modal title={language === "en" ? "Help" : "Pomoc"}>
            <Help />
          </Modal>
        )}

        {isModalOpen && modalType === "status" && isFinished && (
          <Modal
            title={
              isWinner
                ? language === "en"
                  ? "You Win!"
                  : "Wygrałeś!"
                : language === "en"
                ? "Nevermind"
                : "Trudno"
            }
          >
            {isWinner ? <YouWin /> : <Nevermind />}
          </Modal>
        )}
      </>
    ))
    .render();
}
