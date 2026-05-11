// types
import type { Color } from ".";

// constants
const COLOR_PRIORITY = { grey: 0, yellow: 1, green: 2, red: 3, "": -1 } as const as Record<Color, number>;

// Pick the color with the higher priority
export const pickStrongerColor = (a?: Color, b?: Color) => {
  if (!a) return b!;
  return COLOR_PRIORITY[b!] > COLOR_PRIORITY[a] ? b! : a;
};
