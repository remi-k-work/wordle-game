// services, features, and other libraries
import { makeRpcClient } from "@/domain/helpers";
import { RpcGame } from "./requests";

// constants
import { RPC_GAME_PATH } from "@/domain/constants";

export class RpcGameClient extends makeRpcClient("RpcGameClient", RpcGame, RPC_GAME_PATH) {}
