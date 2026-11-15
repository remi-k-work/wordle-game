// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomSet } from "@effect/atom-react";
import { overdriveHacksMachineSendAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// The game board owns physical keyboard input for as long as it is on screen
export function useGameKeyboardInput() {
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineSendAtom);

  useEffect(() => {
    // Single AbortController removes the keyup listener on unmount or re-run
    const controller = new AbortController();
    window.addEventListener(
      "keyup",
      (ev) => {
        const isAltGr = ev.getModifierState("AltGraph");
        if ((ev.ctrlKey && !isAltGr) || ev.metaKey) return;
        overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey: ev.key });
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, [overdriveHacksMachineEvent]);
}
