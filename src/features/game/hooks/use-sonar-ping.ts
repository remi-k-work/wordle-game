// react
import { useEffect, useRef } from "react";

// services, features, and other libraries
import { Effect } from "effect";
import { useAnimate } from "motion/react";
import { RuntimeClient } from "@/lib/runtime-client";

// constants
import { MOTION_TOKENS } from "@/lib/motion-tokens";

// Log through the shared client runtime instead of a bare console call, so
// browser warnings share the app's logging sink (same policy as
// use-play-audio-buffer / use-speak-text). runFork (not `void runPromise`) —
// returns a Fiber, never a dangling Promise
const logWarning = (message: string, error?: unknown) => RuntimeClient.runFork(Effect.logWarning(message, error));

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

    // motion rejects when a playback is interrupted, and an interruption caused
    // by this effect's own cleanup is expected (unmount, or the effect
    // re-running for a new reveal), so that rejection is swallowed rather than
    // escaping as an unhandled rejection. Any other rejection is unexpected and
    // is logged through the shared client runtime instead of being silently
    // dropped — the abort signal is what tells the two apart
    void playSequence().catch((error: unknown) => {
      if (!cancelled.signal.aborted) logWarning("Sonar ping animation failed.", error);
    });

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
