import { Atom } from "@effect-atom/atom-react";
import type { Language } from "@/domain/models";

export const languageAtom = Atom.make<Language>("en");
