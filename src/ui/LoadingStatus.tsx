import { useAtomValue } from "@effect-atom/atom-react";
import { languageAtom } from "@/atoms/languageAtom";
import spinner from "@/assets/spinner.svg";

interface LoadingStatusProps {
  status: "pending" | "rejected";
}

export default function LoadingStatus({ status }: LoadingStatusProps) {
  const language = useAtomValue(languageAtom);

  if (status === "pending") {
    return (
      <section className="flex h-full w-full items-center justify-center gap-4 bg-white p-4 text-[#666]">
        <img src={spinner} className="w-16" alt="Loading..." />
        <h3 className="text-xl font-bold">{language === "en" ? "Loading..." : "Ładuję, proszę czekać..."}</h3>
      </section>
    );
  }

  return (
    <section className="flex h-full w-full items-center justify-center gap-4 bg-white p-4 text-[#666]">
      <h3 className="text-xl font-bold">{language === "en" ? "Oops! There was an error!" : "Uwaga! Wystąpił błąd aplikacji!"}</h3>
    </section>
  );
}
