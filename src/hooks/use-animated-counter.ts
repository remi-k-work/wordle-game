// react
import { useEffect, useRef } from "react";

// services, features, and other libraries
import { animate } from "motion";

// constants
import { motionTokens } from "@/lib/motion-tokens";

// Animated number counter. Always animates from the previous value to the
// new one. Writes to a ref via the `motion` `animate()` helper — no React
// re-renders per frame
export function useAnimatedCounter(value: number, locale: string) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const previousRef = useRef<number>(value);
  const animatedValueRef = useRef(value);
  const localeRef = useRef(locale);

  useEffect(() => {
    localeRef.current = locale;

    const node = nodeRef.current;
    if (node) node.textContent = Math.round(animatedValueRef.current).toLocaleString(locale);
  }, [locale]);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(previousRef.current, value, {
      duration: motionTokens.duration.crawl,
      ease: motionTokens.easing.smooth,
      onUpdate: (v) => {
        animatedValueRef.current = v;
        node.textContent = Math.round(v).toLocaleString(localeRef.current);
      },
    });

    return () => {
      previousRef.current = value;
      controls.stop();
    };
    // The animation only restarts when its numeric target changes; locale changes reformat the current frame through localeRef instead
  }, [value]);

  return nodeRef;
}
