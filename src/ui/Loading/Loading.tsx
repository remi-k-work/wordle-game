// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { languageAtom } from "@/atoms";

// assets
import { SpinnerIcon } from "@/assets/icons";

// types
interface LoadingProps {
  status: "pending" | "rejected";
}

export default function Loading({ status }: LoadingProps) {
  const language = useAtomValue(languageAtom);

  if (status === "pending") {
    return (
      <article className="grid place-items-center">
        <h1 className="flex flex-col items-center gap-4 text-center text-4xl">
          <SpinnerIcon className="w-32" />
          {language === "En" ? "Loading..." : "Ładuję, proszę czekać..."}
        </h1>
      </article>
    );
  }

  return (
    <article className="grid place-items-center">
      <h1 className="text-center text-4xl">{language === "En" ? "Oops! There was an error!" : "Uwaga! Wystąpił błąd aplikacji!"}</h1>
    </article>
  );
}
