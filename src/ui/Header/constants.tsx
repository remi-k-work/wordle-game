// assets
import { HomeModernIcon, PuzzlePieceIcon } from "@heroicons/react/24/outline";

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
] as const;
