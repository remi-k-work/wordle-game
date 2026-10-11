// services, features, and other libraries
import { makeRpcClient } from "@/domain";
import { RpcGame } from "./requests";

export class RpcGameClient extends makeRpcClient("RpcGameClient", RpcGame, "/api/rpc/game") {}
