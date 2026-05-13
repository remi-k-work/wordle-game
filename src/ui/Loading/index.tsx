"use client";

// next
import dynamic from "next/dynamic";

// components
import Spinner from "./Spinner";

export const Loading = dynamic(() => import("./Loading"), { ssr: false, loading: () => <LoadingSkeleton /> });

export function LoadingSkeleton() {
  return (
    <article className="grid place-items-center">
      <h1 className="flex flex-col items-center gap-4 text-4xl">
        <Spinner />
        Loading...
      </h1>
    </article>
  );
}
