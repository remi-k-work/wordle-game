// react
import { useEffect, useRef } from "react";

// services, features, and other libraries
import { useAnimate } from "motion/react";

// constants
import { MOTION_TOKENS } from "@/lib/motion-tokens";

export function useSonarPing(isEnabled: boolean) {
  const [scope, animate] = useAnimate();

  // The running animation's stop handle lives in a ref rather than a closure
  // `let`: the async sequence below reassigns it from an async function, which is
  // exactly the capture-and-reassign pattern react(immutability) rejects. The ref
  // keeps the same "newest stop handle wins" semantics the cleanup depends on
  const stopPulseRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!isEnabled || !scope.current) return;

    const node = scope.current;
    stopPulseRef.current = undefined;

    // An AbortController is the React-idiomatic cancellation primitive: it
    // replaces the classic `isMounted` closure flag, which the immutability rule
    // rejects when the cleanup reassigns it after render has completed. The
    // signal is the one place that records "this effect run is over"
    const cancelled = new AbortController();

    const playSequence = async () => {
      // Registered before the first await so cleanup can always interrupt the initial ping; without this, an unmount during step 1 leaves it running
      const ping = animate(
        node,
        { scale: [1, 1.15, 1], boxShadow: ["none", "0 0 24px var(--color-accent)", "none"], borderColor: ["", "var(--color-accent)", ""] },
        { duration: MOTION_TOKENS.duration.slow, ease: MOTION_TOKENS.easing.sharp }
      );
      stopPulseRef.current = () => ping.stop();

      await ping;

      if (cancelled.signal.aborted) return;

      // Infinite subtle pulse
      const controls = animate(
        node,
        { boxShadow: ["none", "0 0 12px var(--color-accent)", "none"] },
        { duration: MOTION_TOKENS.duration.crawl * 2, repeat: Infinity, ease: "easeInOut" }
      );
      stopPulseRef.current = () => {
        controls.stop();
        ping.stop();
      };
    };

    // motion rejects when a playback is interrupted, and an interruption is
    // expected here (unmount, or the effect re-running for a new reveal), so the
    // rejection is swallowed rather than escaping as an unhandled rejection
    void playSequence().catch(() => {});

    return () => {
      cancelled.abort();
      stopPulseRef.current?.();
      stopPulseRef.current = undefined;

      // Clean up inline styles when the user types over the tile
      node.style.transform = "";
      node.style.boxShadow = "";
      node.style.borderColor = "";
    };
  }, [isEnabled, animate, scope]);

  return scope;
}
