// assets
import { HomeModernIcon, PuzzlePieceIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { msg } from "gt-next";

// constants
export const NAV_ITEMS = [
  {
    href: "/",
    match: "^/(/.*)?$",
    title: msg("Home"),
    icon: <HomeModernIcon />,
  },
  {
    href: "/game",
    match: "^/game(/.*)?$",
    title: msg("Game"),
    icon: <PuzzlePieceIcon />,
  },
  {
    href: "/high-score",
    match: "^/high-score(/.*)?$",
    title: msg("High Score"),
    icon: <TrophyIcon />,
  },
] as const;
