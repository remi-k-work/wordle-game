// react
import { useEffect, useRef } from "react";

// services, features, and other libraries
import { animate } from "motion";

// constants
import { motionTokens } from "@/lib/motion-tokens";

// Animated number counter. On first mount, animates from 0 up to the
// current value. On subsequent value changes, animates from the previous
// value to the new one. Writes to a ref via the `motion` `animate()`
// helper — no React re-renders per frame
interface UseAnimatedCounterOptions {
  /** Animation duration in seconds. Defaults to `crawl` for satisfying count-ups. */
  duration?: number;
  /** Initial value the counter should animate from on first mount. Defaults to 0. */
  initialFrom?: number;
  /** Optional formatting applied to the rounded integer before writing to the DOM. */
  format?: (n: number) => string;
}

export function useAnimatedCounter(value: number, { duration = motionTokens.duration.crawl, initialFrom = 0, format }: UseAnimatedCounterOptions = {}) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const previousRef = useRef<number>(initialFrom);
  const isFirstRunRef = useRef<boolean>(true);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const from = isFirstRunRef.current ? initialFrom : previousRef.current;
    const controls = animate(from, value, {
      duration,
      ease: motionTokens.easing.smooth,
      onUpdate: (v) => {
        node.textContent = format ? format(v) : Math.round(v).toString();
      },
      onComplete: () => {
        previousRef.current = value;
        isFirstRunRef.current = false;
      },
    });

    return () => {
      controls.stop();

      // Persist current progress so we do not snap-back on next render
      previousRef.current = value;
      isFirstRunRef.current = false;
    };
  }, [value, duration, initialFrom, format]);

  return nodeRef;
}
