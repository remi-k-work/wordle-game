// services, features, and other libraries
import { Layer, Logger } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { GameData } from "@/services";

const MainLayer = Layer.mergeAll(Logger.pretty, GameData.Default);

export const Runtime = Atom.runtime(MainLayer);
