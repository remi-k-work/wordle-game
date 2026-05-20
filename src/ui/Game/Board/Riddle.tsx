"use client";

// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { riddleAtom } from "@/atoms";

// assets
import { SparklesIcon } from "@heroicons/react/24/outline";

export function Riddle() {
  const riddle = useAtomValue(riddleAtom);

  return (
    <section className="flex items-start gap-2 rounded-md border border-accent/60 bg-surface-2 px-3 py-2 text-text-1 shadow-sm">
      <SparklesIcon className="mt-0.5 size-5 shrink-0 text-accent" />
      <p className="text-sm leading-6 font-medium text-balance">{riddle}</p>
    </section>
  );
}
