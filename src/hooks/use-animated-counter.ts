// react
import { useEffect, useRef } from "react";

// services, features, and other libraries
import { animate } from "motion";

// constants
import { motionTokens } from "@/lib/motion-tokens";

// Animated number counter. Always animates from the previous value to the
// new one. Writes to a ref via the `motion` `animate()` helper — no React
// re-renders per frame.
export function useAnimatedCounter(value: number, format?: (value: number) => string) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const previousRef = useRef<number>(value);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(previousRef.current, value, {
      duration: motionTokens.duration.crawl,
      ease: motionTokens.easing.smooth,
      onUpdate: (v) => {
        node.textContent = format ? format(v) : Math.round(v).toLocaleString();
      },
    });

    return () => {
      previousRef.current = value;
      controls.stop();
    };
  }, [value, format]);

  return nodeRef;
}
