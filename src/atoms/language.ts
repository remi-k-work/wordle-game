// services, features, and other libraries
import { Atom } from "@effect-atom/atom-react";

// types
import type { Language } from "@/domain";

export const languageAtom = Atom.make<Language>("En").pipe(Atom.keepAlive);
