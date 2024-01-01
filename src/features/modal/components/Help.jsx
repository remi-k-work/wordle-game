// component css styles
import styles from "./Help.module.css";

// redux stuff
import { useSelector } from "react-redux";

export default function Help() {
  const { language } = useSelector((store) => store.controlPanel);

  return language === "en" ? (
    <article className={styles["help"]}>
      <p>
        Welcome to Wordle, a daily word game where you have six tries to guess a five-letter word. The game is simple and addictive, but it can also be
        challenging.
      </p>
      <p>
        The objective of Wordle is to guess the secret five-letter word in as few attempts as possible. Each guess is made by typing a five-letter word into the
        provided field. Upon entering each guess, the game will provide feedback on the correctness of the letters entered, indicating whether they are in the
        correct position or not. This feedback is provided through a color-coding system:
      </p>
      <ul className={styles["legend"]}>
        <li>
          <i className={styles["legend__green-tile"]}></i>
          <span>Indicates a correct letter in the correct position.</span>
        </li>
        <li>
          <i className={styles["legend__yellow-tile"]}></i>
          <span>Indicates a correct letter in the incorrect position.</span>
        </li>
        <li>
          <i className={styles["legend__grey-tile"]}></i>
          <span>Indicates a letter that is not in the word.</span>
        </li>
      </ul>
      <p className={styles["help__tip"]}>*Tip: When using a PC, you can type your guesses right on the keyboard.</p>
    </article>
  ) : (
    <article className={styles["help"]}>
      <p>
        Witamy w Wordle, codziennej grze słownej, w której masz sześć prób odgadnięcia pięcioliterowego słowa. Gra jest prosta i wciągająca, ale może też
        stanowić wyzwanie.
      </p>
      <p>
        Celem gry Wordle jest odgadnięcie sekretnego pięcioliterowego słowa w jak najmniejszej liczbie prób. Każde odgadnięcie odbywa się poprzez wpisanie
        pięcioliterowego słowa w odpowiednim polu. Po wpisaniu każdego odgadnięcia gra wyświetli informację zwrotną na temat poprawności wpisanych liter,
        wskazując, czy znajdują się one na właściwym miejscu, czy też nie. Informacje zwrotne są przekazywane za pomocą systemu kodowania kolorami:
      </p>
      <ul className={styles["legend"]}>
        <li>
          <i className={styles["legend__green-tile"]}></i>
          <span>Wskazuje prawidłową literę na właściwym miejscu.</span>
        </li>
        <li>
          <i className={styles["legend__yellow-tile"]}></i>
          <span>Wskazuje prawidłową literę na niewłaściwym miejscu.</span>
        </li>
        <li>
          <i className={styles["legend__grey-tile"]}></i>
          <span>Wskazuje literę, której nie ma w słowie.</span>
        </li>
      </ul>
      <p className={styles["help__tip"]}>*Wskazówka: Korzystając z komputera PC, możesz wpisywać swoje odgadnięcia bezpośrednio na klawiaturze.</p>
    </article>
  );
}
