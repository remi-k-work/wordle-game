// services, features, and other libraries
import { useAtomValue, useAtomSet, Result, useAtomMount } from "@effect-atom/atom-react";
import { keypadStatusAtom, handleKeyAction, gameDataKeypadAtom } from "@/atoms";

// components
import LoadingStatus from "@/ui/LoadingStatus";

// assets
import backspace from "@/assets/backspace.svg";
import enter from "@/assets/enter.svg";

// types
import type { Color } from "@/domain/models";

// constants
const COLOR_MAP = { grey: "#a1a1a1", green: "#5ac85a", yellow: "#e2cc68", "": "transparent" } as const satisfies Record<Color, string>;

const BASE_KEY_CLASS = "flex-[0_1_8cqi] text-[clamp(1em,0.8em+0.4cqi,1.25em)]";
const ICON_IMG_CLASS = "pointer-events-none mx-auto w-[clamp(1em,0.8em+0.4cqi,1.25em)]";

export default function Keypad() {
  useAtomMount(gameDataKeypadAtom);
  const gameDataKeypad = useAtomValue(gameDataKeypadAtom);
  const usedKeys = useAtomValue(keypadStatusAtom);
  const handleKey = useAtomSet(handleKeyAction);

  return Result.builder(gameDataKeypad)
    .onInitial(() => <LoadingStatus status="pending" />)
    .onWaiting(() => <LoadingStatus status="pending" />)
    .onFailure(() => <LoadingStatus status="rejected" />)
    .onSuccess((keys) => (
      <section className="@container flex h-full w-full flex-wrap justify-center gap-4">
        {keys.map((key) => {
          const usedKeyColor = usedKeys[key];

          return (
            <button
              key={key}
              type="button"
              className={BASE_KEY_CLASS}
              style={{ backgroundColor: usedKeyColor && COLOR_MAP[usedKeyColor] }}
              onClick={() => handleKey(key)}
            >
              {key}
            </button>
          );
        })}
        <button type="button" className={BASE_KEY_CLASS} onClick={() => handleKey("Backspace")}>
          <img src={backspace} className={ICON_IMG_CLASS} alt="⌫" />
        </button>
        <button type="button" className={BASE_KEY_CLASS} onClick={() => handleKey("Enter")}>
          <img src={enter} className={ICON_IMG_CLASS} alt="⏎" />
        </button>
      </section>
    ))
    .render();
}
