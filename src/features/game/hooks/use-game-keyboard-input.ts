// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomSet } from "@effect/atom-react";
import { keyboardMachineSendAtom } from "@/features/game/state/keyboard";

// The game board owns physical keyboard input for as long as it is on screen
export function useGameKeyboardInput() {
  const keyboardMachineEvent = useAtomSet(keyboardMachineSendAtom);

  useEffect(() => {
    // Single AbortController removes the keyup listener on unmount or re-run
    const controller = new AbortController();
    window.addEventListener(
      "keyup",
      (ev) => {
        const isAltGr = ev.getModifierState("AltGraph");
        if ((ev.ctrlKey && !isAltGr) || ev.metaKey) return;
        keyboardMachineEvent({ type: "keyPressed", pressedKey: ev.key });
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, [keyboardMachineEvent]);
}
