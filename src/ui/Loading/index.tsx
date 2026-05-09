"use client";

// next
import dynamic from "next/dynamic";
import Image from "next/image";

// assets
import spinner from "@/assets/spinner.svg";

export const Loading = dynamic(() => import("./Loading"), { ssr: false, loading: () => <LoadingSkeleton /> });

export function LoadingSkeleton() {
  return (
    <article className="grid place-items-center bg-white p-4 text-[#666]">
      <h1 className="flex flex-col items-center gap-4 text-4xl">
        <Image src={spinner} className="w-32" alt="Loading..." />
        Loading...
      </h1>
    </article>
  );
}
