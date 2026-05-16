// services, features, and other libraries
import { useAtom, useAtomSet } from "@effect-atom/atom-react";
import { languageAtom, restartGameAction } from "@/atoms";

// components
import { Button } from "@base-ui/react";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

export default function LangChanger() {
  const [language, setLanguage] = useAtom(languageAtom);
  const restartGame = useAtomSet(restartGameAction);

  function handleLangToggled() {
    setLanguage(language === "En" ? "Pl" : "En");
    restartGame();
  }

  return (
    <Button className="button bg-secondary" title="Language" onClick={handleLangToggled}>
      {language === "En" ? <UsFlagIcon className="size-11" /> : <PlFlagIcon className="size-11" />}
    </Button>
  );
}

export function LangChangerSkeleton() {
  return (
    <Button className="button bg-secondary" title="Language" disabled>
      <UsFlagIcon className="size-11" />
    </Button>
  );
}
