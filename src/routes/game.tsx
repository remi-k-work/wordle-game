// tanstack
import { createFileRoute } from "@tanstack/react-router";

// services, features, and other libraries
import { useAtomValue, useAtomMount } from "@effect/atom-react";
import { playerSessionAtom } from "@/features/player/state/player";
import { gameDataIsLoadingOrFailedAtom } from "@/features/game/state/game-data";
import { useGameKeyboardInput } from "@/features/game/hooks/use-game-keyboard-input";

// components
import { Header, HeaderSkeleton } from "@/features/game/ui/board/header";
import { Main, MainSkeleton } from "@/features/game/ui/board/main";
import { Footer, FooterSkeleton } from "@/features/game/ui/board/footer";

export const Route = createFileRoute("/game")({ component: Game });

function Game() {
  useAtomMount(playerSessionAtom);

  // The game board owns physical keyboard input for as long as it is on screen
  // The listener lives at the route shell (not inside `Main`) so `Main` stays
  // purely presentational — it only renders the board grid
  useGameKeyboardInput();

  const isLoadingOrFailed = useAtomValue(gameDataIsLoadingOrFailedAtom);

  // The shell is identical for loading and loaded states; only the board
  // sections swap between their real and skeleton variants
  const HeaderEl = isLoadingOrFailed ? HeaderSkeleton : Header;
  const MainEl = isLoadingOrFailed ? MainSkeleton : Main;
  const FooterEl = isLoadingOrFailed ? FooterSkeleton : Footer;

  return (
    <article className="mx-auto grid w-full max-w-4xl grid-cols-1 grid-rows-[auto_1fr_auto] gap-2">
      <HeaderEl />
      <MainEl />
      <FooterEl />
    </article>
  );
}
