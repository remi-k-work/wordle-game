// Shared motion tokens — single source of truth for every animation in the app
export const MOTION_TOKENS = {
  duration: { instant: 0.08, fast: 0.18, normal: 0.35, slow: 0.6, crawl: 1.0 },
  easing: { smooth: [0.22, 1, 0.36, 1], sharp: [0.4, 0, 0.2, 1], bounce: [0.34, 1.56, 0.64, 1], linear: [0, 0, 1, 1] },
  distance: { xs: 4, sm: 8, md: 16, lg: 24, xl: 48 },
  scale: { subtle: 0.98, press: 0.95, pop: 1.04 },
} as const;

// Spring presets — physics-based transitions for natural feel
export const SPRINGS = {
  snappy: { type: "spring", stiffness: 300, damping: 30 },
  gentle: { type: "spring", stiffness: 120, damping: 14 },
  bouncy: { type: "spring", stiffness: 400, damping: 10 },
  instant: { type: "spring", stiffness: 600, damping: 35 },
  release: { type: "spring", stiffness: 200, damping: 20, restDelta: 0.001 },
} as const;

// Choreography for a one-icon-for-another swap under `AnimatePresence mode="wait"`
// (theme toggle, website-locale toggle): the outgoing icon fades and rotates out
// one way while the incoming one fades and rotates in from the opposite side, so
// the pair reads as a single rotating control rather than a crossfade
// Stated once because both toggles restate it, and the four prop groups must stay
// identical or the two header controls animate with visibly different timing
export const ICON_SWAP_MOTION = {
  initial: { opacity: 0, rotate: -90 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 90 },
  transition: SPRINGS.snappy,
} as const;
