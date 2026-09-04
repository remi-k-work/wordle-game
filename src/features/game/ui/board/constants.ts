// types
import type { Color } from "@/features/game/domain";

// constants
import { motionTokens } from "@/lib/motion-tokens";

export const TILE_COLOR_MAP = {
  grey: "[--_background:var(--color-tile-grey)] bg-(--_background)",
  yellow: "[--_background:var(--color-tile-yellow)] bg-(--_background)",
  green: "[--_background:var(--color-tile-green)] bg-(--_background)",
  red: "[--_background:var(--color-destructive)] bg-(--_background)",
  "": "[--_background:transparent] bg-(--_background)",
} as const satisfies Record<Color, string>;

export const KEYPAD_COLOR_MAP = {
  grey: "var(--color-tile-grey)",
  yellow: "var(--color-tile-yellow)",
  green: "var(--color-tile-green)",
  red: "var(--color-destructive)",
  "": "transparent",
} as const satisfies Record<Color, string>;

// Single source of truth for the skeleton alphabet — mirrors the keypad pool
export const ALPHABET = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
] as const;

// EMP "electrical fry" exit — jitter, flicker, glow, and burn out
export const EMP_FRY_EXIT = {
  x: [0, -8, 12, -14, 10, -7, 3, 0],
  y: [0, 2, -3, 4, -2, 3, -1, 0],
  scale: [1, 1.18, 0.96, 1.12, 0.82, 1.05, 0.35, 0],
  opacity: [1, 0.25, 1, 0.15, 0.85, 0.35, 0.5, 0],
  rotate: [0, -20, 28, -24, 18, -12, 6, 0],
  boxShadow: [
    "0 0 0px transparent",
    "0 0 18px var(--color-destructive)",
    "0 0 5px var(--color-destructive)",
    "0 0 24px var(--color-destructive)",
    "0 0 8px var(--color-destructive)",
    "0 0 18px var(--color-destructive)",
    "0 0 30px var(--color-destructive)",
    "0 0 0px transparent",
  ],
  transition: {
    duration: motionTokens.duration.crawl * 6,
    ease: motionTokens.easing.sharp,
  },
};

// CSS-only staggered flip: each tile flips 0.2s after the previous one
export const FLIP_STAGGER_CLASSES = [
  // Reset backgrounds for children before animation fully executes
  "[&>div]:bg-transparent",
  // Apply staggered animation delays
  "[&>div:nth-child(1)]:animate-flip [&>div:nth-child(1)]:[animation-delay:0s]",
  "[&>div:nth-child(2)]:animate-flip [&>div:nth-child(2)]:[animation-delay:0.2s]",
  "[&>div:nth-child(3)]:animate-flip [&>div:nth-child(3)]:[animation-delay:0.4s]",
  "[&>div:nth-child(4)]:animate-flip [&>div:nth-child(4)]:[animation-delay:0.6s]",
  "[&>div:nth-child(5)]:animate-flip [&>div:nth-child(5)]:[animation-delay:0.8s]",
] as const;
