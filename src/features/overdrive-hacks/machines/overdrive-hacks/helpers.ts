// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/reactivity";
import { overdriveHacksCanApplyHackAtom } from "@/features/overdrive-hacks/state/can-apply";
import { HackInputUnavailableError } from "./errors";

// types
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";

// Reads a required hack input from its atom: a missing value fails with
// HackInputUnavailableError instead of a bare NoSuchElementError, so the
// machine's onError branch logs a diagnosable failure
export const requireHackInput = <A>(atom: Atom.Atom<Option.Option<A>>, input: HackInputUnavailableError["input"]) =>
  Atom.get(atom).pipe(Effect.flatMap(Effect.fromOption(() => new HackInputUnavailableError({ input }))));

// The shared overdrive-hack purchase preamble: produce the hack's result only
// when the hack is affordable. The charge is not taken here — it is the
// machine's decision, made when a result actually comes back — so an actor is a
// pure computation that never commands the run session
export const withHackPurchase = <A, E, R>(hackId: OverdriveHackId, produce: Effect.Effect<Option.Option<A>, E, R>) =>
  Atom.get(overdriveHacksCanApplyHackAtom(hackId)).pipe(Effect.flatMap((canApplyHack) => (canApplyHack ? produce : Effect.succeedNone)));
