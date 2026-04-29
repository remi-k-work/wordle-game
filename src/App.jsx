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
import Help from "./features/modal/components/Help";

// game logic & slice
import { fetchSolutions } from "./features/game/gameSlice";
import { doWeHaveaWinner, isGameOver } from "./features/game/gameLogic";

// control panel logic & slice
import { helpClosed } from "./features/controlPanel/controlPanelSlice";

// assets
import logo from "./assets/opengraph-image.jpg";

function App() {
  const { theSecretWord, wordleGuesses, currentTurn, loading } = useSelector(
    (store) => store.game,
  );
  const { isOpen } = useSelector((store) => store.modal);
  const { language, showHelp } = useSelector((store) => store.controlPanel);
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

      <img
        src={logo}
        width={1734}
        height={907}
        loading="lazy"
        alt="Logo"
        style={{ width: "100%", maxWidth: "1734px", margin: "0 auto" }}
      />

      <p style={{ maxWidth: "65ch", margin: "3rem auto" }}>
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
        English or Polish vocabulary sets. While working on this project, I
        employed the Redux technique.
      </p>

      <a
        href="https://www.remiforge.dev"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit RemiForge Portfolio (opens in a new tab)"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "start",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
          maxWidth: "36rem",
          width: "100%",
          margin: "2rem auto",
          padding: "1rem",
          textDecoration: "none",
          border: "1px solid #444",
          borderRadius: "0.75rem",
          backgroundColor: "#1a1a1a",
          color: "#e5e5e5",
        }}
      >
        <img
          src="https://www.remiforge.dev/opengraph-image.jpg"
          width="1200"
          height="630"
          alt=""
          loading="lazy"
          style={{
            flex: "none",
            width: "8rem",
            height: "auto",
            aspectRatio: "1200 / 630",
            objectFit: "cover",
            borderRadius: "0.5rem",
          }}
        />
        <div style={{ flex: "1", minWidth: "14rem" }}>
          <div
            style={{
              color: "#a3a3a3",
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.25rem",
            }}
          >
            <span aria-hidden="true">👨‍💻</span> Built By
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            RemiForge
            <span
              aria-hidden="true"
              style={{
                color: "#888",
                fontSize: "1.25rem",
                fontWeight: 400,
              }}
            >
              ↗
            </span>
          </div>
          <div
            style={{
              color: "#a3a3a3",
              fontSize: "0.95rem",
              marginTop: "0.25rem",
            }}
          >
            Portfolio of Projects, Experiments & Contact
          </div>
        </div>
      </a>

      {isOpen && showHelp && (
        <Modal
          title={language === "en" ? "Help" : "Pomoc"}
          content={<Help />}
          onClose={() => {
            dispatch(helpClosed());
          }}
        />
      )}

      {isOpen &&
        !showHelp &&
        isGameOver(currentTurn, theSecretWord, wordleGuesses) &&
        (doWeHaveaWinner(theSecretWord, wordleGuesses) ? (
          <Modal
            title={language === "en" ? "You Win!" : "Wygrałeś!"}
            content={<YouWin />}
          />
        ) : (
          <Modal
            title={language === "en" ? "Nevermind" : "Trudno"}
            content={<Nevermind />}
          />
        ))}
    </>
  );
}

export default App;
