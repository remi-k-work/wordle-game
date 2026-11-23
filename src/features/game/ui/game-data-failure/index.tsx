// services, features, and other libraries
import { useAtomSet } from "@effect/atom-react";
import { gameDataMachineSendAtom } from "@/features/game/state/game-data";
import { T } from "gt-react";

// components
import { Button } from "@base-ui/react/button";

// assets
import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// When loading or picking the next word fails or times out, the route swaps the board for this panel
export function GameDataFailure() {
  const gameDataMachineEvent = useAtomSet(gameDataMachineSendAtom);

  return (
    <section
      className="grid min-h-full place-items-center gap-4 rounded-md bg-linear-to-b from-surface-1 via-surface-3 to-transparent text-center"
      aria-labelledby="game-data-failure-heading"
    >
      <ExclamationTriangleIcon className="size-24 text-destructive" aria-hidden="true" />

      <h2 id="game-data-failure-heading" className="text-3xl font-semibold">
        <T>Could not load the game</T>
      </h2>

      <p className="text-balance" role="alert">
        <T>Something went wrong while loading the words. Check your connection and try again.</T>
      </p>

      <Button className="button bg-destructive" onClick={() => gameDataMachineEvent({ type: "retryRequested" })}>
        <ArrowPathIcon className="size-11" aria-hidden="true" />
        <T>Retry</T>
      </Button>
    </section>
  );
}
