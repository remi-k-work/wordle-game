// services, features, and other libraries
import { Layer, Logger } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { BrowserKeyValueStore } from "@effect/platform-browser";
import { GameData } from "@/features/game/services/game-data";
import { RpcGameClient } from "@/features/game/rpc/client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";

const MainLayer = Layer.mergeAll(Logger.pretty, BrowserKeyValueStore.layerLocalStorage, GameData.Default, RpcGameClient.Default, RpcHighScoreClient.Default);

export const RuntimeAtom = Atom.runtime(MainLayer);
