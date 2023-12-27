// react
import { useEffect } from "react";

// redux stuff
import { useSelector, useDispatch } from "react-redux";

// components
import WordleGrid from "./components/WordleGrid";
import Keypad from "./features/keypad/Keypad";

// game logic & slice
import { fetchSolutions } from "./features/game/gameSlice";

function App() {
  const { theSecretWord, loading } = useSelector((store) => store.game);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSolutions());
  }, []);

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
    </>
  );
}

export default App;
