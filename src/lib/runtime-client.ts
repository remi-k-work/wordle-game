// services, features, and other libraries
import { Layer, Logger } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { BrowserKeyValueStore } from "@effect/platform-browser";
import { RpcGameClient } from "@/features/game/rpc/client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";

const MainLayer = Layer.mergeAll(Logger.pretty, BrowserKeyValueStore.layerLocalStorage, RpcGameClient.Default, RpcHighScoreClient.Default);

export const RuntimeAtom = Atom.runtime(MainLayer);
