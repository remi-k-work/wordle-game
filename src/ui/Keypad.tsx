import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { gameDataAtom, keypadStatusAtom, handleKeyAction } from "../atoms/gameAtom";
import { Result } from "@effect-atom/atom";

// assets
import backspace from "../assets/backspace.svg";
import enter from "../assets/enter.svg";

export default function Keypad() {
  const gameData = useAtomValue(gameDataAtom);
  const usedKeys = useAtomValue(keypadStatusAtom);
  const handleKey = useAtomSet(handleKeyAction);

  return Result.builder(gameData)
    .onInitial(() => <div className="text-white">Loading keypad...</div>)
    .onSuccess(({ letters }) => (
      <section
        className="w-full h-full flex flex-row flex-wrap gap-4 justify-center"
        style={{ containerType: "inline-size" }}
      >
        {letters.map((letter) => {
          const color = usedKeys[letter.key];
          const colorClasses = {
            grey: "bg-[#a1a1a1] text-white",
            green: "bg-[#5ac85a] text-white",
            yellow: "bg-[#e2cc68] text-white",
          }[color as "grey" | "green" | "yellow"] || "";

          return (
            <button
              key={letter.key}
              type="button"
              className={`text-[clamp(1em,0.8em+0.4cqi,1.25em)] flex-[0_1_8cqi] transition-all duration-300 ease-in ${colorClasses}`}
              onClick={() => handleKey(letter.key)}
            >
              {letter.key}
            </button>
          );
        })}
        <button
          type="button"
          className="text-[clamp(1em,0.8em+0.4cqi,1.25em)] flex-[0_1_8cqi]"
          onClick={() => handleKey("Backspace")}
        >
          <img src={backspace} className="w-6 mx-auto" alt="⌫" />
        </button>
        <button
          type="button"
          className="text-[clamp(1em,0.8em+0.4cqi,1.25em)] flex-[0_1_8cqi]"
          onClick={() => handleKey("Enter")}
        >
          <img src={enter} className="w-6 mx-auto" alt="⏎" />
        </button>
      </section>
    ))
    .onFailure((error) => <div className="text-red-500">Error: {error.message}</div>)
    .render();
}
