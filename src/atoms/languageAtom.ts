import { Atom } from "@effect-atom/atom";
import type { Language } from "../domain/models";

export const languageAtom = Atom.make<Language>("en");
