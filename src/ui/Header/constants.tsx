// assets
import { HomeModernIcon, PuzzlePieceIcon, TrophyIcon } from "@heroicons/react/24/outline";

// constants
export const NAV_ITEMS = [
  {
    href: "/",
    match: "^/(/.*)?$",
    title: "Home",
    icon: <HomeModernIcon />,
  },
  {
    href: "/game",
    match: "^/game(/.*)?$",
    title: "Game",
    icon: <PuzzlePieceIcon />,
  },
  {
    href: "/highScore",
    match: "^/highScore(/.*)?$",
    title: "High Score",
    icon: <TrophyIcon />,
  },
] as const;
