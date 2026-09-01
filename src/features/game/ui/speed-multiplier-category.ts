import { Option } from "effect";
import { msg } from "gt-next";
import { SPEED_MULTIPLIER_CATEGORY_MAP, SPEED_MULTIPLIER_RULES, speedMultiplierToCategory } from "@/features/game/domain";

const SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP = {
  "speed-demon": msg("🚀 Speed Demon"),
  "quick-thinker": msg("⚡ Quick Thinker"),
  "average-pacer": msg("⏱️ Average Pacer"),
  "slow-learner": msg("🐌 Slow Learner"),
} as const;

const SPEED_MULTIPLIER_CATEGORY_EMOJI_MAP = {
  "speed-demon": "🚀",
  "quick-thinker": "⚡",
  "average-pacer": "⏱️",
  "slow-learner": "🐌",
} as const;

export const speedMultiplierToCategoryMessage = (speedMultiplier: number) =>
  Option.match(Option.fromNullishOr(speedMultiplierToCategory(speedMultiplier)), {
    onNone: () => msg("Unknown"),
    onSome: (category) => SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP[category as keyof typeof SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP],
  });

export const speedMultiplierToCategoryEmoji = (speedMultiplier: number) =>
  Option.match(Option.fromNullishOr(SPEED_MULTIPLIER_CATEGORY_MAP[speedMultiplier]), {
    onNone: () => "?",
    onSome: (category) => SPEED_MULTIPLIER_CATEGORY_EMOJI_MAP[category as keyof typeof SPEED_MULTIPLIER_CATEGORY_EMOJI_MAP],
  });

export const maxSecondsToSpeedMultiplier = (maxSeconds: number | null) => SPEED_MULTIPLIER_RULES.find((rule) => rule.maxSeconds === maxSeconds)?.multiplier;
