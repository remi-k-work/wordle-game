// services, features, and other libraries
import { Duration } from "effect";
import { useAtomValue } from "@effect-atom/atom-react";
import { currentTurnAtom, languageAtom, theSecretWordAtom, scoreAtom } from "@/atoms";
import { formatDuration, speedMultiplierToCategory } from "@/domain";

export function YouWin() {
  const theSecretWord = useAtomValue(theSecretWordAtom);
  const currentTurn = useAtomValue(currentTurnAtom);
  const language = useAtomValue(languageAtom);
  const score = useAtomValue(scoreAtom);

  const formattedTime = score ? formatDuration(Duration.seconds(score.timeSeconds)) : "00:00";

  return (
    <article className="space-y-4">
      <div>
        <p className="text-4xl text-destructive uppercase">{theSecretWord}</p>
        {language === "En" ? (
          <p>You found the solution in {currentTurn} guesses 😄</p>
        ) : (
          <p>Udało Ci się znaleźć rozwiązanie w {currentTurn} odgadnięciach 😄</p>
        )}
      </div>
      {score && (
        <>
          <div>
            <p className="font-bold">{language === "En" ? "BASE POINTS FOR CURRENT TURN" : "PUNKTY BAZOWE DLA BIEŻĄCEJ TURY"}</p>
            <p>
              {currentTurn} = {score.basePointsPerTurn}
            </p>
          </div>
          <div>
            <p className="font-bold">{language === "En" ? "SPEED MULTIPLIER" : "MNOŻNIK PRĘDKOŚCI"}</p>
            <p>
              {score.speedMultiplier}x = {speedMultiplierToCategory(language, score.speedMultiplier)}
            </p>
          </div>
          <div>
            <p className="font-bold">{language === "En" ? "TIME" : "CZAS"}</p>
            <p>{formattedTime}</p>
          </div>
          <div>
            <p className="font-bold tracking-widest">{language === "En" ? "FINAL SCORE" : "WYNIK FINALNY"}</p>
            <p className="text-4xl text-accent">{score.totalScore}</p>
          </div>
        </>
      )}
    </article>
  );
}
