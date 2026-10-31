// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAnimate } from "motion/react";

// constants
import { MOTION_TOKENS } from "@/lib/motion-tokens";

export function useSonarPing(isEnabled: boolean) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!isEnabled || !scope.current) return;

    const node = scope.current;
    let isMounted = true;
    let stopPulse: (() => void) | undefined;

    const playSequence = async () => {
      // Registered before the first await so cleanup can always interrupt the initial ping; without this, an unmount during step 1 leaves it running
      const ping = animate(
        node,
        { scale: [1, 1.15, 1], boxShadow: ["none", "0 0 24px var(--color-accent)", "none"], borderColor: ["", "var(--color-accent)", ""] },
        { duration: MOTION_TOKENS.duration.slow, ease: MOTION_TOKENS.easing.sharp }
      );
      stopPulse = () => ping.stop();

      await ping;

      if (!isMounted) return;

      // Infinite subtle pulse
      const controls = animate(
        node,
        { boxShadow: ["none", "0 0 12px var(--color-accent)", "none"] },
        { duration: MOTION_TOKENS.duration.crawl * 2, repeat: Infinity, ease: "easeInOut" }
      );
      stopPulse = () => {
        controls.stop();
        ping.stop();
      };
    };

    // motion rejects when a playback is interrupted, and an interruption is
    // expected here (unmount, or the effect re-running for a new reveal), so the
    // rejection is swallowed rather than escaping as an unhandled rejection
    void playSequence().catch(() => {});

    return () => {
      isMounted = false;
      stopPulse?.();

      // Clean up inline styles when the user types over the tile
      node.style.transform = node.style.boxShadow = node.style.borderColor = "";
    };
  }, [isEnabled, animate, scope]);

  return scope;
}
