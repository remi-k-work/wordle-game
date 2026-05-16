// assets
import { SpinnerIcon } from "@/assets/icons";

// types
interface LoadingProps {
  status: "pending" | "rejected";
}

export default function Loading({ status }: LoadingProps) {
  if (status === "pending") {
    return (
      <article className="grid place-items-center">
        <h1 className="flex flex-col items-center gap-4 text-center text-4xl">
          <SpinnerIcon className="w-32" />
          Loading...
        </h1>
      </article>
    );
  }

  return (
    <article className="grid place-items-center">
      <h1 className="text-center text-4xl">Oops! There was an error!</h1>
    </article>
  );
}
