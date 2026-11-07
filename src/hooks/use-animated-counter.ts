// react
import { useLayoutEffect, useRef } from "react";

// services, features, and other libraries
import { animate } from "motion";

// constants
import { MOTION_TOKENS } from "@/lib/motion-tokens";

// Animated number counter. Always animates from the previous value to the
// new one. Writes to a ref via the `motion` `animate()` helper — no React
// re-renders per frame
//
// Call sites render the number as this node's children, so the node already
// holds its final value once React has committed the update. Both writes below
// therefore run in `useLayoutEffect`: they must land before the browser paints,
// otherwise the user sees the new value for a frame and then watches it
// rewind and count up to the value they were already shown.
export function useAnimatedCounter(value: number, locale: string) {
  const nodeRef = useRef<HTMLElement | null>(null);
  // The value the node currently displays — one source of truth for "where the
  // count is", read back as the next animation's start point below
  const displayedValueRef = useRef(value);
  const localeRef = useRef(locale);

  // Keep the text in sync with the locale without restarting the animation:
  // `localeRef` lets the running animation read the latest locale, and this
  // effect re-formats whatever value is currently displayed
  useLayoutEffect(() => {
    localeRef.current = locale;

    const node = nodeRef.current;
    if (node) node.textContent = Math.round(displayedValueRef.current).toLocaleString(locale);
  }, [locale]);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    // Start from the frame the node actually shows: the last value `animate()`
    // wrote, or the settled one once it finished. Starting from "the previous
    // target" instead would make the counter visibly jump whenever a new target
    // interrupts a running animation — the node would rewind to a number the
    // player never saw, then count forward from there
    const previous = displayedValueRef.current;

    // Rewind the text React already committed back to the animation's start
    // value, so the count-up runs from `previous` rather than from the target
    node.textContent = Math.round(previous).toLocaleString(localeRef.current);

    const controls = animate(previous, value, {
      duration: MOTION_TOKENS.duration.crawl,
      ease: MOTION_TOKENS.easing.smooth,
      onUpdate: (v) => {
        displayedValueRef.current = v;
        node.textContent = Math.round(v).toLocaleString(localeRef.current);
      },
    });

    return () => {
      controls.stop();
    };
    // The animation only restarts when its numeric target changes; locale changes reformat the current frame through localeRef instead
  }, [value]);

  return nodeRef;
}
