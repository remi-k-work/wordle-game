// services, features, and other libraries
import { Array, Effect, Option } from "effect";
import { Atom } from "effect/reactivity";
import { overdriveHacksCanApplyHackAtom } from "@/features/overdrive-hacks/state/can-apply";
import { runSessionMachineSendAtom } from "@/features/game/state/run-session";
import { HackInputUnavailableError } from "./errors";

// types
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";
import type { OverdriveHacks } from "./models";

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain/constants";

// Reads a required hack input from its atom: a missing value fails with
// HackInputUnavailableError instead of a bare NoSuchElementError, so the
// machine's onError branch logs a diagnosable failure
export const requireHackInput = <A>(atom: Atom.Atom<Option.Option<A>>, input: HackInputUnavailableError["input"]) =>
  Atom.get(atom).pipe(Effect.flatMap(Effect.fromOption(() => new HackInputUnavailableError({ input }))));

// The shared overdrive-hack purchase preamble: check affordability, produce the
// hack's result, and charge the run score only when a result was produced
export const withHackPurchase = <A, E, R>(hackId: OverdriveHackId, produce: Effect.Effect<Option.Option<A>, E, R>) =>
  Atom.get(overdriveHacksCanApplyHackAtom(hackId)).pipe(
    Effect.flatMap((canApplyHack) => (canApplyHack ? produce : Effect.succeedNone)),
    Effect.tap((result) =>
      Option.match(result, {
        onNone: () => Effect.void,
        onSome: () => Atom.set(runSessionMachineSendAtom, { type: "runScoreSpent", amount: OVERDRIVE_HACK_COST(hackId) }),
      })
    )
  );

// EMP-nuked keys never reach the word-challenge machine
export const shouldForwardKeyPress = (empNukedLetters: OverdriveHacks["empNukedLetters"], pressedKey: string) =>
  !Array.contains(empNukedLetters, pressedKey.toUpperCase());
