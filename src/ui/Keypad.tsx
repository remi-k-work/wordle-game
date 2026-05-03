import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { gameDataAtom, keypadStatusAtom, handleKeyAction } from "@/atoms/gameAtom";
import { Result } from "@effect-atom/atom-react";

// assets
import backspace from "@/assets/backspace.svg";
import enter from "@/assets/enter.svg";

export default function Keypad() {
  const gameData = useAtomValue(gameDataAtom);
  const usedKeys = useAtomValue(keypadStatusAtom);
  const handleKey = useAtomSet(handleKeyAction);

  return Result.builder(gameData)
    .onInitial(() => <div className="text-white">Loading keypad...</div>)
    .onSuccess(({ letters }) => (
      <section className="flex h-full w-full flex-row flex-wrap justify-center gap-4" style={{ containerType: "inline-size" }}>
        {letters.map((letter) => {
          const color = usedKeys[letter.key];
          const colorClasses =
            {
              grey: "bg-[#a1a1a1] text-white",
              green: "bg-[#5ac85a] text-white",
              yellow: "bg-[#e2cc68] text-white",
            }[color as "grey" | "green" | "yellow"] || "";

          return (
            <button
              key={letter.key}
              type="button"
              className={`flex-[0_1_8cqi] text-[clamp(1em,0.8em+0.4cqi,1.25em)] transition-all duration-300 ease-in ${colorClasses}`}
              onClick={() => handleKey(letter.key)}
            >
              {letter.key}
            </button>
          );
        })}
        <button type="button" className="flex-[0_1_8cqi] text-[clamp(1em,0.8em+0.4cqi,1.25em)]" onClick={() => handleKey("Backspace")}>
          <img src={backspace} className="mx-auto w-6" alt="⌫" />
        </button>
        <button type="button" className="flex-[0_1_8cqi] text-[clamp(1em,0.8em+0.4cqi,1.25em)]" onClick={() => handleKey("Enter")}>
          <img src={enter} className="mx-auto w-6" alt="⏎" />
        </button>
      </section>
    ))
    .onFailure((failure) => <div className="text-red-500">Error: {String(failure)}</div>)
    .render();
}
