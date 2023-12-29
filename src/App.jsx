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

// game logic & slice
import { fetchSolutions } from "./features/game/gameSlice";
import { doWeHaveaWinner, isGameOver } from "./features/game/gameLogic";

// keypad logic & slice
import { visualClueHasChanged } from "./features/keypad/keypadSlice";

// modal logic & slice
import { openModal } from "./features/modal/modalSlice";

function App() {
  const { theSecretWord, currentGuessWord, wordleGuesses, currentTurn, loading } = useSelector((store) => store.game);
  const { isOpen } = useSelector((store) => store.modal);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSolutions());
  }, []);

  useEffect(() => {
    // Because of the new guess submission, the visual clue on the keypad has changed
    dispatch(visualClueHasChanged(theSecretWord, wordleGuesses));

    // Is the game already over, or is it still going on?
    if (isGameOver(currentTurn, theSecretWord, currentGuessWord)) {
      dispatch(openModal());
    }
    console.log(theSecretWord, wordleGuesses, currentGuessWord);
    console.log(isGameOver(currentTurn, theSecretWord, currentGuessWord));
  }, [currentTurn]);

  if (loading === "pending") {
    return (
      <section className={""}>
        <h3>Loading...</h3>
      </section>
    );
  }

  if (loading === "rejected") {
    return (
      <section className={""}>
        <h3>Oops! There was an error!</h3>
      </section>
    );
  }

  return (
    <>
      <div className="main-grid">
        <header>{theSecretWord}</header>
        <main>
          <WordleGrid />
        </main>
        <footer>
          <Keypad />
        </footer>
      </div>
      {isOpen &&
        isGameOver(currentTurn, theSecretWord, currentGuessWord) &&
        (doWeHaveaWinner(theSecretWord, currentGuessWord) ? (
          <Modal title={"You Win!"} content={<YouWin />} />
        ) : (
          <Modal title={"Nevermind"} content={<Nevermind />} />
        ))}
    </>
  );
}

export default App;
