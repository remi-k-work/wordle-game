// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/reactivity";
import { HackInputUnavailableError } from "./errors";

// Reads a required hack input from its atom: a missing value fails with
// HackInputUnavailableError instead of a bare NoSuchElementError, so the
// machine's onError branch logs a diagnosable failure
export const requireHackInput = <A>(atom: Atom.Atom<Option.Option<A>>, input: HackInputUnavailableError["input"]) =>
  Atom.get(atom).pipe(Effect.flatMap(Effect.fromOption(() => new HackInputUnavailableError({ input }))));
