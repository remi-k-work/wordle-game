// services, features, and other libraries
import { Array, Option, pipe } from "effect";

// types
import type { Color } from ".";

// constants
import { SPEED_MULTIPLIER_RULES } from ".";

const COLOR_PRIORITY = { grey: 0, yellow: 1, green: 2, red: 3, "": -1 } as const as Record<Color, number>;

// Pick the color with the higher priority
export const pickStrongerColor = (a?: Color, b?: Color) => {
  if (!a) return b!;
  return COLOR_PRIORITY[b!] > COLOR_PRIORITY[a] ? b! : a;
};

// Establish the speed multiplier based on the time it took
export const getSpeedMultiplier = (seconds: number) =>
  pipe(
    SPEED_MULTIPLIER_RULES,
    Array.findFirst(({ maxSeconds }) => seconds < maxSeconds),
    Option.map(({ multiplier }) => multiplier),
    Option.getOrElse(() => 0.8)
  );
