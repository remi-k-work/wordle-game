// services, features, and other libraries
import { AsyncResult } from "effect/unstable/reactivity";

// assets
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// types
import type { RpcClientError } from "effect/unstable/rpc/RpcClientError";

interface FailureProps {
  addHighScoreResult: AsyncResult.AsyncResult<void, RpcClientError>;
}

export function Failure({ addHighScoreResult }: FailureProps) {
  return AsyncResult.match(addHighScoreResult, {
    onInitial: () => null,
    onSuccess: () => null,
    onFailure: (failure) => (
      <div className="flex items-center gap-2 rounded-md border border-destructive px-2 py-1 text-start text-destructive">
        <ExclamationTriangleIcon className="size-11" />
        <p>
          Failed to save your score.
          <br />
          {failure.waiting ? <span className="animate-pulse">Retrying...</span> : "Please try again."}
        </p>
      </div>
    ),
  });
}
