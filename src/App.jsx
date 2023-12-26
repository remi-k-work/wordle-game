// redux stuff
import { useSelector } from "react-redux";

// components
import WordleGrid from "./components/WordleGrid";

function App() {
  const { theSecretWord } = useSelector((store) => store.game);

  return (
    <>
      <div className="main-grid">
        <header>{theSecretWord}</header>
        <main>
          <WordleGrid />
        </main>
        <footer>footer</footer>
      </div>
    </>
  );
}

export default App;
