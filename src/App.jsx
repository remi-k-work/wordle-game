// react
import { useEffect } from "react";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// components
import WordleGrid from "./features/game/components/WordleGrid";
import Keypad from "./features/keypad/components/Keypad";
import Modal from "./features/modal/components/Modal";
import YouWin from "./features/modal/components/YouWin";
import Nevermind from "./features/modal/components/Nevermind";
import ControlPanel from "./features/controlPanel/components/ControlPanel";
import LoadingStatus from "./components/LoadingStatus";

// game logic & slice
import { fetchSolutions } from "./features/game/gameSlice";
import { doWeHaveaWinner, isGameOver } from "./features/game/gameLogic";

function App() {
  const { theSecretWord, wordleGuesses, currentTurn, loading } = useSelector((store) => store.game);
  const { isOpen } = useSelector((store) => store.modal);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSolutions());
  }, []);

  if (loading === "pending" || loading === "rejected") {
    return <LoadingStatus loading={loading} />;
  }

  return (
    <>
      <div className="main-grid">
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
      {isOpen &&
        isGameOver(currentTurn, theSecretWord, wordleGuesses) &&
        (doWeHaveaWinner(theSecretWord, wordleGuesses) ? (
          <Modal title={"You Win!"} content={<YouWin />} />
        ) : (
          <Modal title={"Nevermind"} content={<Nevermind />} />
        ))}
    </>
  );
}

export default App;
