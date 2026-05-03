// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "@effect-atom/atom-react";

export const isModalOpenAtom = Atom.make(false);
export const modalTypeAtom = Atom.make<"help" | "status" | null>(null);

export const openModalAction = Atom.fn((type: "help" | "status", get) =>
  Effect.gen(function* () {
    yield* Atom.set(isModalOpenAtom, true);
    yield* Atom.set(modalTypeAtom, type);
  })
);

export const closeModalAction = Atom.fn((_, get) =>
  Effect.gen(function* () {
    yield* Atom.set(isModalOpenAtom, false);
    yield* Atom.set(modalTypeAtom, null);
  })
);
