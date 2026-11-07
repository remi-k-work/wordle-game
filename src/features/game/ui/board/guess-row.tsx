// react
import { memo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { GuessTile, GuessTileSkeleton } from "./guess-tile";

// types
import type { BoardTile } from "@/features/game/domain/models";

// constants
import { WORD_LENGTH } from "@/features/game/domain/constants";
import { FLIP_STAGGER_CLASSES, ROW_CLASSES } from "./constants";

// The row's two states: the bare grid track every row renders, and the same track
// plus the CSS flip stagger the just-submitted row runs. Resolved once so a row
// render is a lookup rather than another trip through twMerge (the same stance
// `CurrentGuess` and `KeypadActionKey` take for their own chrome) — the row
// renders once per board update, and only `memo(GuessTile)` below can bail out
// on an unchanged letter, so this class is rebuilt often enough to be worth
// stating statically
const GUESS_ROW_CLASSES = {
  still: cn(ROW_CLASSES),
  flipping: cn(ROW_CLASSES, FLIP_STAGGER_CLASSES),
} as const;

// One blank tile per position in a row. Hoisted because a row's tile count never
// changes, and built from the same constant `CurrentGuess` sizes its own row
// with, so the skeleton cannot grow a stray tile the live grid does not have
const SKELETON_ROW_TILES = Array.from({ length: WORD_LENGTH }, (_, index) => <GuessTileSkeleton key={index} />);

interface GuessRowProps {
  tiles: ReadonlyArray<BoardTile>;
  isFlipping: boolean;
}

// Memoized row: the row object itself is handed down freshly allocated by the
// grid atom, so this boundary guards the row's structure when only the tiles'
// values change; the bail-out that actually saves work is one level down, in
// `memo(GuessTile)` — which is why the row passes `tileKey`/`color` as
// primitives rather than the tile object
// The row renders what it is handed: each tile already states whether it is a
// sonar reveal (see `overdriveHacksWordleGridAtom`), so this component neither
// diffs two grids nor decides what a reveal looks like
export const GuessRow = memo(function GuessRow({ tiles, isFlipping }: GuessRowProps) {
  return (
    <div className={GUESS_ROW_CLASSES[isFlipping ? "flipping" : "still"]}>
      {tiles.map((tile, tileIndex) => {
        // Stable per-position keys: useSonarPing already starts/stops the glow
        // from the `isSonarReveal` prop (effect + cleanup), so keying on it too
        // only remounted the tile DOM on every reveal flip
        return <GuessTile key={tileIndex} tileKey={tile.tileKey} color={tile.color} isSonarReveal={tile.isSonarReveal} />;
      })}
    </div>
  );
});

export function GuessRowSkeleton() {
  return <div className={ROW_CLASSES}>{SKELETON_ROW_TILES}</div>;
}
