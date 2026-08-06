// services, features, and other libraries
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { SolutionsLanguage, TheSecretWord } from "@/features/game/domain";
import { OverdriveHacks } from "@/features/overdrive-hacks/domain";

export class RpcOverdriveHacks extends RpcGroup.make(
  Rpc.make("fetchOverride", {
    payload: { theSecretWord: TheSecretWord, solutionsLanguage: SolutionsLanguage },
    success: OverdriveHacks.fields.theOverride,
  })
) {}
