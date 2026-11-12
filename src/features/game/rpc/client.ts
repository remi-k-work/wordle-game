// services, features, and other libraries
import { makeRpcClient } from "@/domain/rpc-client";
import { RpcGame } from "./requests";

// constants
import { RPC_GAME_PATH } from "./requests";

export class RpcGameClient extends makeRpcClient("RpcGameClient", RpcGame, RPC_GAME_PATH) {}
