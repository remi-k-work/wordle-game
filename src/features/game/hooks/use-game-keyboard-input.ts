// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomSet } from "@effect/atom-react";
import { overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// The game board owns physical keyboard input for as long as it is on screen.
// The overdrive-hacks machine is the single input gate: it ignores key presses
// outside an active puzzle, so the board does not have to mirror game state.
// Keeping this out of `CurrentGuess` also means the listener survives turn
// changes, while the guess row itself stays presentational.
export function useGameKeyboardInput() {
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  useEffect(() => {
    // Single AbortController removes the keyup listener on unmount or re-run
    const controller = new AbortController();
    window.addEventListener("keyup", (ev) => overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey: ev.key }), { signal: controller.signal });

    return () => controller.abort();
  }, [overdriveHacksMachineEvent]);
}
