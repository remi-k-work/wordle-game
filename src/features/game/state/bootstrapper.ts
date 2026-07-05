// services, features, and other libraries
import { Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { solutionsLanguageAtom } from "@/features/settings/state";
import { gameDataMachineAtom, wordChallengeTheSecretWordAtom, wordMetaMachineAtom } from ".";

export const bootstrapperAtom = Atom.make((get) => {
  const solutionsLanguage = get(solutionsLanguageAtom);
  const theSecretWord = get(wordChallengeTheSecretWordAtom);

  get.set(gameDataMachineAtom, { type: "loadRequested", solutionsLanguage });

  // Only trigger the actor if the secret word actually exists
  if (Option.isNone(theSecretWord)) return;
  get.set(wordMetaMachineAtom, { type: "loadRequested", theSecretWord: theSecretWord.value, solutionsLanguage });
}).pipe(Atom.keepAlive);
