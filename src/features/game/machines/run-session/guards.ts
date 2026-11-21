// services, features, and other libraries
import { Option } from "effect";

// types
import type { GuardArgs } from "@/lib/machine-setup";
import type { Events, RunSession } from "./models";

type Args = GuardArgs<RunSession, Events>;

export const guards = {
  hasActiveRun: ({ context }: Args) => Option.isSome(context.runId),
};
