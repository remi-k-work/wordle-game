// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomSet } from "@effect/atom-react";
import { overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// The game board owns physical keyboard input for as long as it is on screen
// The overdrive-hacks machine is the single input gate: it ignores key presses
// outside an active puzzle, so the board does not have to mirror game state
// Keeping this out of `CurrentGuess` also means the listener survives turn
// changes, while the guess row itself stays presentational
export function useGameKeyboardInput() {
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  useEffect(() => {
    // Single AbortController removes the keyup listener on unmount or re-run
    const controller = new AbortController();
    window.addEventListener(
      "keyup",
      (ev) => {
        // Ctrl/Meta combos are browser/OS shortcuts, never letter keys, so they
        // are dropped at the source instead of being forwarded for the machine
        // to ignore. Alt is the exception: AltGr (Windows' right Alt) sets
        // ctrlKey+altKey together and produces text — it is the only way to
        // type Polish diacritics (AltGr+A -> ą) on the programmers layout —
        // and macOS' Option-based input sets altKey alone. Anything produced
        // that is not a game letter is rejected downstream by `classifyKey`
        const isAltGr = ev.getModifierState("AltGraph");
        if ((ev.ctrlKey && !isAltGr) || ev.metaKey) return;
        overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey: ev.key });
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, [overdriveHacksMachineEvent]);
}
