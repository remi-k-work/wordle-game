// next
import Image from "next/image";

// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { languageAtom } from "@/atoms";

// assets
import spinner from "@/assets/spinner.svg";

// types
interface LoadingProps {
  status: "pending" | "rejected";
}

export default function Loading({ status }: LoadingProps) {
  const language = useAtomValue(languageAtom);

  if (status === "pending") {
    return (
      <article className="grid place-items-center bg-white p-4 text-[#666]">
        <h1 className="flex flex-col items-center gap-4 text-4xl">
          <Image src={spinner} className="w-32" alt="Loading..." />
          {language === "En" ? "Loading..." : "Ładuję, proszę czekać..."}
        </h1>
      </article>
    );
  }

  return (
    <article className="grid place-items-center bg-white p-4 text-[#666]">
      <h1 className="text-4xl">{language === "En" ? "Oops! There was an error!" : "Uwaga! Wystąpił błąd aplikacji!"}</h1>
    </article>
  );
}
