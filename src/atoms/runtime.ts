// services, features, and other libraries
import { Layer, Logger } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { SolutionsService } from "@/services/SolutionsService";

const MainLayer = Layer.mergeAll(Logger.pretty, SolutionsService.Default);

export const appRuntime = Atom.runtime(MainLayer);
